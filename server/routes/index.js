const express = require('express')
const numberWithCommas = require('../tools/getNumberWithComma')
const router = express.Router()
const axios = require('axios')
const yahooFinance = require('yahoo-finance')
const firebaseDb = require('../firebase/index.js')

const holidaysRef = firebaseDb.ref('/holidays/')
const historyRef = firebaseDb.ref('/history/')
const testRef = firebaseDb.ref('/test/')
const fxToTWDRef = firebaseDb.ref('/fxToTWD/')
const closeCacheRef = firebaseDb.ref('/closeCache/')
const newAddingTempRef = firebaseDb.ref('/newAddingTemp/')
const holdingsTemptickersRef = firebaseDb.ref('/holdingsTickers/')
const holdingsTradeRef = firebaseDb.ref('/holdingsTrade/')
const holdingsStatsRef = firebaseDb.ref('/holdingsStats/')
const holdingsLatestInfoRef = firebaseDb.ref('/holdingsLatestInfo/')
const watchlistRef = firebaseDb.ref('/watchlist/')
const tabsRef = firebaseDb.ref('/tabs/')

const fetchNewQuotes = require('../functions/holdings/fetchNewQuotes')
const checkUpdate = require('../functions/holdings/checkUpdate')
const calculateStats = require('../functions/holdings/calculateStats')
const updateDb = require('../functions/holdings/updateDb')

const getFormattedDate = require('../tools/getFormattedDate')
const parseFloatByDecimal = require('../tools/parseFloatByDecimal')
const formatNumber = require('../tools/formatNumber')
const getFxRates = require('../tools/getFxRates')

// HOLDINNGS PAGE
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/quote/:ticker', async (req, res) => {
  const quoteOptions = {
    symbol: req.params.ticker,
    modules: ['price']
  }

  try {
    const { price: priceObj } = await yahooFinance.quote(quoteOptions)

    const {
      longName: name,
      regularMarketPrice: price,
      symbol: ticker,
      regularMarketTime,
      marketState,
      regularMarketChange,
      regularMarketChangePercent
    } = priceObj

    const roundedChange = Math.round(regularMarketChange * 100) / 100

    const previousCloseChange =
      roundedChange > 0
        ? '+' + roundedChange.toFixed(2)
        : roundedChange.toFixed(2)

    const previousCloseChangePercent =
      Math.round(regularMarketChangePercent * 10000) / 100

    const obj = {
      price: parseFloat(price.toFixed(2)),
      previousCloseChange,
      previousCloseChangePercent,
      name,
      ticker,
      regularMarketTime,
      marketState
    }

    const msg = {
      success: true,
      content: '成功獲得標的',
      errorMessage: null,
      result: obj
    }

    res.send(msg)
  } catch (err) {
    console.log('err', err.message)
    const msg = {
      success: false,
      content: '獲得標的失敗',
      errorMessage: err.message,
      result: null
    }
    res.send(msg)
  }
})

router.get('/holdings', async (req, res) => {
  try {
    let latestInfoSnapshot = await holdingsLatestInfoRef.once('value')
    let latestInfoObj = latestInfoSnapshot.val()
    if (!latestInfoObj) {
      return res.send({
        success: true,
        content: '無標的',
        errorMessage: null,
        result: null
      })
    }

    // fetch new quotes
    const { tempTickers, quotePromises } = await fetchNewQuotes(latestInfoObj)
    const quoteResult = await Promise.allSettled(quotePromises)

    // checkUpdate
    let holdingsStatsSnapshot = await holdingsStatsRef.once('value')
    let holdingsStats = holdingsStatsSnapshot.val()

    const hasUpdate = await checkUpdate(
      tempTickers,
      quoteResult,
      latestInfoObj,
      holdingsStats
    )

    // get updated info and stats
    if (hasUpdate) {
      const result = await Promise.allSettled([
        holdingsLatestInfoRef.once('value'),
        holdingsStatsRef.once('value')
      ])

      latestInfoObj = result[0].value.val()
      holdingsStats = result[1].value.val()
      console.log('hasUpdate:', hasUpdate)
    }

    // 計算個別股票總市值
    holdingsStats = Object.entries(holdingsStats).reduce(
      (obj, entries, index) => {
        const [tempTicker, stat] = entries
        const { totalShares } = stat
        const { regularMarketPrice } = quoteResult[index].value.price

        obj[tempTicker] = {
          ...stat,
          totalValue: parseFloatByDecimal(regularMarketPrice * totalShares, 2)
        }
        return obj
      },
      {}
    )

    // organize
    const holdings = {}
    for (const tempTicker in latestInfoObj) {
      const info = latestInfoObj[tempTicker]
      const stats = holdingsStats[tempTicker]

      holdings[tempTicker] = {
        latestInfo: info,
        totalStats: stats
      }
    }

    const msg = {
      success: true,
      content: '成功獲得所有標的',
      errorMessage: null,
      result: holdings
    }

    res.send(msg)
  } catch (error) {
    const msg = {
      success: false,
      content: '獲得標的失敗',
      errorMessage: error.message,
      result: null
    }

    res.send(msg)
  }
})

router.post('/deleteAll', async (req, res) => {
  Promise.all([
    closeCacheRef.remove(),
    historyRef.remove(),
    holdingsTemptickersRef.remove(),
    holdingsTradeRef.remove(),
    holdingsStatsRef.remove(),
    holdingsLatestInfoRef.remove()
  ])
    .then((resp) => {
      console.log('delete success', resp)
      res.send('delete success')
    })
    .catch((err) => {
      console.log('delete failed', err)
      res.send('delete failed')
    })
})

router.post('/addStock', async (req, res) => {
  const invalidInput = Object.keys(req.body).filter((key) => !req.body[key])

  if (invalidInput.length !== 0) {
    const reservedKey = ['ticker', 'cost', 'shares', 'tradeDate']
    const errorMessage =
      'Invalid input field: ' +
      invalidInput.filter((key) => reservedKey.includes(key)).join(', ')
    const message = {
      success: false,
      content: '標的新增失敗',
      errorMessage,
      result: req.body
    }

    res.send(message)
    return
  }

  const {
    previousCloseChange,
    previousCloseChangePercent,
    price: close,
    // 以上為了 buy 直接帶入不用再打 api
    ...rest
  } = req.body

  const {
    style,
    name,
    marketState,
    code,
    regularMarketTime,
    tempTicker,
    ticker,
    ...tradeInfo
  } = rest

  try {
    // set tickers
    holdingsTemptickersRef.child(tempTicker).set(ticker)
    newAddingTempRef.child(tempTicker).set(ticker)

    // set latestInfo
    const latestInfoSnapshot = await holdingsLatestInfoRef
      .child(tempTicker)
      .once('value')

    if (!latestInfoSnapshot.val()) {
      updateDb(holdingsLatestInfoRef, tempTicker, {
        close,
        previousCloseChange,
        previousCloseChangePercent,
        style,
        name,
        marketState,
        code,
        regularMarketTime,
        tempTicker,
        ticker
      })
    } else {
      updateDb(holdingsLatestInfoRef, tempTicker, {
        close,
        previousCloseChange,
        previousCloseChangePercent,
        marketState,
        regularMarketTime
      })
    }

    // set trade
    const stockInfo = holdingsTradeRef.child(tempTicker).push()
    const id = stockInfo.key
    const tradeUnix = Math.floor(Date.parse(tradeInfo.tradeDate) / 1000)
    const trade = {
      ...tradeInfo,
      id,
      tradeUnix,
      ticker,
      tempTicker,
      code,
      status: 'buy'
    }
    stockInfo.set(trade)

    // set history
    historyRef.child(tradeInfo.tradeDate).child(id).set({
      code,
      ticker,
      tempTicker,
      shares: tradeInfo.shares,
      cost: tradeInfo.cost
    })
    testRef.child(`${tradeInfo.tradeDate}_${id}_${tempTicker}`).set({
      id,
      code,
      ticker,
      tempTicker,
      shares: tradeInfo.shares,
      cost: tradeInfo.cost
    })

    // 計算 stats
    const holdingsSnapshot = await holdingsTradeRef
      .child(tempTicker)
      .once('value')
    const holdingsObj = holdingsSnapshot.val()

    let totalCost = 0
    let totalShares = 0

    for (const id in holdingsObj) {
      const trade = holdingsObj[id]
      const { cost, shares } = trade
      totalCost += parseFloat(cost) * parseFloat(shares)
      totalShares += parseFloat(shares)
    }

    const averageCost = parseFloatByDecimal(totalCost / totalShares, 2)
    const { profitOrLossPercentage, profitOrLossValue } = calculateStats(
      close,
      averageCost,
      totalShares
    )

    updateDb(holdingsStatsRef, tempTicker, {
      totalCost,
      totalShares,
      averageCost,
      profitOrLossPercentage,
      profitOrLossValue
    })

    const message = {
      success: true,
      content: '標的新增成功',
      errorMessage: null,
      result: { ticker, ...tradeInfo }
    }

    console.log('message', message)
    res.send(message)
  } catch (error) {
    const message = {
      success: true,
      content: '標的新增失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(message)
  }
})

router.get('/tradeDetails/:tempTicker', async (req, res) => {
  try {
    const tempTicker = req.params.tempTicker
    const tickerRef = await holdingsTradeRef.child(tempTicker).once('value')
    const tradeDetails = tickerRef.val()
    console.log('tradeDetails', tradeDetails)

    if (!tradeDetails) {
      return res.send({
        success: false,
        content: '無標的',
        errorMessage: 'no ticker found in the holdings',
        result: null
      })
    }

    const tradeArray = [...Object.values(tradeDetails)].sort((a, b) => {
      return b.tradeUnix - a.tradeUnix
    })

    res.send({
      success: true,
      content: '成功獲得交易紀錄',
      errorMessage: null,
      result: tradeArray
    })
  } catch (error) {}
})

router.get('/holidays', async (req, res) => {
  try {
    const snapshot = await holidaysRef.once('value')
    const holidays = snapshot.val()

    const message = {
      success: true,
      content: 'holidays fetched',
      errorMessage: null,
      result: holidays
    }

    res.send(message)
  } catch (error) {
    const message = {
      success: false,
      content: 'failed to get holidays',
      errorMessage: error.message,
      result: null
    }

    res.send(message)
  }
})

router.get('/fxRates', async (req, res) => {
  const fxToTWDSnapshot = await fxToTWDRef.once('value')
  const fxRates = await getFxRates(fxToTWDSnapshot)

  return res.send({
    success: true,
    content: 'get exchange rate',
    errorMessage: null,
    result: fxRates
  })
})

// HISTORY PAGE
router.get('/history', async (req, res) => {
  try {
    const resPromise = await Promise.allSettled([
      testRef.once('value'),
      holdingsLatestInfoRef.once('value'),
      historyRef.once('value'),
      holdingsTemptickersRef.once('value'),
      fxToTWDRef.once('value'),
      closeCacheRef.once('value')
    ])
    const [
      testSnapshot,
      latestInfoSnapshot,
      historySnapshot,
      tempTickerSnapshot,
      fxToTWDSnapshot,
      closeCacheSnapshot
    ] = resPromise

    if (!historySnapshot.value.val()) {
      return res.send({
        success: true,
        content: '尚未有紀錄',
        errorMessage: null,
        result: null
      })
    }

    const pricesAndFxRates = await Promise.allSettled([
      getHistoricalClosePrices(
        tempTickerSnapshot.value.val(),
        closeCacheSnapshot.value.val()
      ),
      getFxRates(fxToTWDSnapshot.value)
    ])

    const [closePricesMap, fxRates] = pricesAndFxRates.map((item) => item.value)

    console.log('closePricesMap', closePricesMap)
    // // console.log('fxRates', fxRates)

    const { totalValueMap, historyMap } = calculateTotalValue(
      latestInfoSnapshot,
      historySnapshot,
      closePricesMap,
      fxRates
    )
    // console.log('totalValueMap', totalValueMap)
    // console.log('historyMap', historyMap)

    // const { totalValueMap1, historyMap1 } = calculateTotalValue1(
    //   testSnapshot,
    //   closePriceMap,
    //   fxRates
    // )
    // console.log('totalValueMap1', totalValueMap1)
    // console.log('historyMap1', historyMap1)

    const totalValue = Array.from(totalValueMap).reduce(
      (obj, [date, values]) => {
        obj.date.push(date)
        obj['Asset Value'].push(values.acc)
        return obj
      },
      { date: [], 'Asset Value': [] }
    )
    const historyDetails = Object.fromEntries(Array.from(historyMap).reverse())
    // console.log('totalValue', totalValue)
    // console.log('historyDetails', historyDetails)

    // const quoteOptions = {
    //   symbols: ['C'],
    //   from: '2023-02-24',
    //   to: '2023-02-25',
    //   period: 'd'
    // }
    // yahooFinance.historical(quoteOptions).then((res) => {
    //   console.log('res', res)
    // })

    const msg = {
      success: true,
      content: '成功獲得所有標的',
      errorMessage: null,
      // result: holidays
      result: { totalValue, historyDetails }
    }

    res.send(msg)
  } catch (error) {
    console.log('error', error)
    const msg = {
      success: false,
      content: '獲得標的失敗',
      errorMessage: error.message,
      result: null
    }

    res.send(msg)
  }

  async function scheduleNextUpdateStock() {
    const holidaySnapshot = await holidaysRef.once('value')
    const holiday = holidaySnapshot.val()

    const now = new Date()
    const nextUpdate = new Date(now)
    nextUpdate.setSeconds(0)
    nextUpdate.setMilliseconds(0)

    const dayOfWeek = now.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      nextUpdate.setDate(nextUpdate.getDate() + ((7 - dayOfWeek + 1) % 7))
      nextUpdate.setHours(13)
      nextUpdate.setMinutes(30)
      console.log('今天是假日，下次更新為', nextUpdate.toLocaleString())

      // 檢查下週一是否為假日
      const nextUpdateISODate = getISODate(nextUpdate)
      const isNextUpdateTWHoliday = holiday['TW'][nextUpdateISODate]
      const isNextUpdateUSHoliday = holiday['US'][nextUpdateISODate]

      if (isNextUpdateTWHoliday && isNextUpdateUSHoliday) {
        // 重設為星期二 13:30
        nextUpdate.setDate(nextUpdate.getDate() + 1)
        nextUpdate.setHours(13)
        nextUpdate.setMinutes(30)
        console.log('下週一台美股皆休市，重設為', nextUpdate.toLocaleString())
      }
      if (isNextUpdateTWHoliday) {
        // 重設為最近的美股更新時間
        nextUpdate.setDate(nextUpdate.getDate() + 1)
        nextUpdate.setHours(5)
        nextUpdate.setMinutes(0)
        console.log('下週一台股休市，重設為', nextUpdate.toLocaleString())
      }
      if (isNextUpdateUSHoliday) {
        // 重設為最近的台股更新時間(為13:30所以不用重設)
        console.log('下週一美股休市，最近的台股更新時間為 13:30 所以不用重設')
      }

      return nextUpdate.getTime()
    }

    console.log('今天是平日')

    const year = now.getFullYear()
    const month = now.getMonth()
    const date = now.getDate()
    const usUpdateThreshold = new Date(year, month, date, 5, 0, 0)
    const twUpdateThreshold = new Date(year, month, date, 13, 30, 0)
    const startOfDay = new Date(year, month, date, 0, 0, 0)
    const endOfDay = new Date(year, month, date, 23, 59, 59)
    const ISODate = getISODate(now)

    const isTodayTWHoliday = holiday['TW'][ISODate]
    const isTodayUSHoliday = holiday['US'][ISODate]
    console.log('isTodayTWHoliday', isTodayTWHoliday)
    console.log('isTodayUSHoliday', isTodayUSHoliday)

    // 現在介於 00:00 到 5:00，設為今日 5:00
    if (
      now.getTime() >= startOfDay.getTime() &&
      now.getTime() <= usUpdateThreshold.getTime()
    ) {
      nextUpdate.setDate(nextUpdate.getDate())
      nextUpdate.setHours(5)
      nextUpdate.setMinutes(0)
      console.log('下次更新設為今日清晨5點')
    }

    // 現在介於 5:00 到 13:30，設為今日 13:30
    if (
      now.getTime() >= usUpdateThreshold.getTime() &&
      now.getTime() <= twUpdateThreshold.getTime()
    ) {
      nextUpdate.setDate(nextUpdate.getDate())
      nextUpdate.setHours(13)
      nextUpdate.setMinutes(30)
      console.log('下次更新設為今日下午一點半')

      if (isTodayTWHoliday) {
        nextUpdate.setDate(nextUpdate.getDate() + 1)
        nextUpdate.setHours(5)
        nextUpdate.setMinutes(0)
        console.log('但是因今日台股休市，改設隔日清晨5點')
      }
    }

    // 現在介於 13:30 到 24:00，設為明日 5:00
    if (
      now.getTime() >= twUpdateThreshold.getTime() &&
      now.getTime() <= endOfDay.getTime()
    ) {
      nextUpdate.setDate(nextUpdate.getDate() + 1)
      nextUpdate.setHours(5)
      nextUpdate.setMinutes(0)
      console.log('下次更新設為隔日凌晨5點')

      if (isTodayUSHoliday) {
        nextUpdate.setDate(nextUpdate.getDate() + 1)
        nextUpdate.setHours(13)
        nextUpdate.setMinutes(30)
        console.log('但是因今日美股休市，改設隔日 13:30')

        if (nextUpdate.getDay() === 0 || nextUpdate.getDay() === 6) {
          console.log('但隔日是，下次更新為下週一 13:30')
          nextUpdate.setDate(nextUpdate.getDate() + ((7 - dayOfWeek + 1) % 7))
          nextUpdate.setHours(13)
          nextUpdate.setMinutes(30)
          console.log(
            'nextUpdateTime',
            new Date(nextUpdate.getTime()).toLocaleString()
          )
        }
      }
    }

    console.log('now', now.toLocaleString())
    console.log('nextUpdate', nextUpdate.toLocaleString())
    return nextUpdate.getTime()

    // // Check if it's a weekend day
    // const dayOfWeek = nextUpdate.getDay()
    // const isNextUpdateWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // const holiday = holidaySnapshot.val()
    // if (dayOfWeek === 0 || dayOfWeek === 6) {
    //   console.log('下次更新是假日，重設為下週一')
    //   nextUpdate.setDate(nextUpdate.getDate() + ((7 - dayOfWeek + 1) % 7))
    // } else {
    //   console.log('下次更新是平日')
    // }

    // const nextUpdateTime = nextUpdate.getTime()
    // console.log('nextUpdateTime', new Date(nextUpdateTime).toLocaleString())
  }

  function convertObjectToMap(object) {
    const map = new Map()
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        map.set(key, object[key])
      }
    }
    return map
  }

  async function getHistoricalClosePrices(tempTickerObj, closeCache) {
    // 沒 cache
    if (!closeCache) {
      console.log('========沒 cache========')
      await createPriceCache()
      return await getPriceCache()
    }

    const { closePrice, nextUpdateTime, latestUpdateTime } = closeCache

    // 檢查新增標的
    console.log('========檢查新增標的========')
    const newAddingSnapshot = await newAddingTempRef.once('value')
    const newAddingTemptickers = newAddingSnapshot.val()
    if (newAddingTemptickers) {
      const newClosePriceMap = await getClosePrices({
        tempTickerObj: newAddingTemptickers,
        customEndDate: new Date(latestUpdateTime)
          .toLocaleDateString()
          .replace(/\//g, '-')
      })
      newAddingTempRef.remove()
      console.log('只有新增的標的 newClosePriceMap', newClosePriceMap)

      await updatePriceCache(newClosePriceMap)
    }

    // 檢查更新日
    console.log('========檢查更新日========')
    console.log('下個更新日為：', new Date(nextUpdateTime).toLocaleString())
    const now = Date.now()

    // 還沒到更新時間
    if (now < nextUpdateTime) {
      console.log('========還沒到更新時間========')

      if (newAddingTemptickers) {
        console.log('========也有新增標的========')
        return await getPriceCache()
      }

      console.log('========也沒有新增標的========')
      return convertObjectToMap(closePrice)
    }

    // 超過更新時間
    console.log('========超過更新時間========')
    let startDate = new Date(latestUpdateTime)

    if (startDate.getDay() === 6) {
      startDate = new Date(latestUpdateTime - 86400000)
    }
    if (startDate.getDay() === 0) {
      startDate = new Date(latestUpdateTime - 86400000 * 2)
    }

    const endDate = new Date(now)
    const newClosePriceMap = await getClosePrices({
      tempTickerObj,
      customStartDate: startDate,
      customEndDate: endDate
    })
    console.log('超過更新時間，更新後 closePriceMap', newClosePriceMap)

    const newNextUpdateTime = await scheduleNextUpdateStock()
    const newCurrentUpdateTime = Date.now()
    closeCacheRef.update({
      nextUpdateTime: newNextUpdateTime,
      latestUpdateTime: newCurrentUpdateTime
    })

    try {
      await updatePriceCache(newClosePriceMap)
      console.log('========超過更新時間，資料庫新增完成========')
      return await getPriceCache()
    } catch (error) {
      console.log('update failed', error)
    }

    /*
    狀況：
    1. 有新增，沒過更新時間 
    2. 沒新增，沒過更新時間 
    3. 有新增，過更新時間 
    4. 沒新增，過更新時間 

    if(沒資料){
      // getClosePrices
      // 取得下次更新時間 nextUpdateTime
      // 取得當下更新日期 latestUpdateTime
      // price, latestUpdateTime 及 nextUpdateTime 存進資料庫 closeCacheRef

      return
    }

    newAddingTempRef === 上次新增後沒有更新及儲存股價的部分
    (要實現此判斷前 addStock 要判斷新加入的是否已存在 holdingsTickers，如果沒有才存進 newAddingTemp)
    
    if(有新增標的 newAddingTemp){
      1. 判斷最早日期是否有變動
      2. const closePriceMap = getClosePrices(newAddingTempRef)
      3. 清空 newAddingTempRef
      4. 儲存股價
    }

    if(現在時間超過下次更新日){
      // 檢查要新增幾日資料
        1.latestUpdateTime 跟今天差距
        2.getClosePrices(tickerRef)
        3.取得下次更新時間 nextUpdateTime
        4.取得當下更新日期 latestUpdateTime
        5.price, latestUpdateTime 及 nextUpdateTime 存進資料庫 closeCacheRef
    } else {
      // 直接從資料庫 closeCacheRef 讀取資料
    }
    */
  }

  async function getEarliestTradeDate(tempTicker) {
    const tradesRef = holdingsTradeRef.child(tempTicker)
    return tradesRef
      .orderByChild('tradeDate')
      .limitToFirst(1)
      .once('value')
      .then((snapshot) => {
        let code = null
        let ticker = null
        let earliestDate = null
        snapshot.forEach((tradeSnapshot) => {
          const trade = tradeSnapshot.val()
          code = trade.code
          ticker = trade.ticker
          earliestDate = trade.tradeDate
        })
        return { code, ticker, startDate: earliestDate }
      })
  }

  async function createPriceCache() {
    const tempTickerSnapshot = await holdingsTemptickersRef.once('value')
    const closePriceMap = await getClosePrices({
      tempTickerObj: tempTickerSnapshot.val()
    })
    const closePrice = Object.fromEntries(closePriceMap)
    const nextUpdateTime = await scheduleNextUpdateStock()
    const currentUpdateTime = Date.now()
    closeCacheRef.set({
      closePrice,
      nextUpdateTime,
      latestUpdateTime: currentUpdateTime
    })

    return closePriceMap
  }

  async function getPriceCache() {
    const snapshot = await closeCacheRef.child('closePrice').once('value')
    return convertObjectToMap(snapshot.val())
  }

  async function updatePriceCache(closePriceMap) {
    const updatePromises = []
    for (const [date_tempticker, price] of closePriceMap.entries()) {
      const updatePromise = closeCacheRef
        .child('closePrice')
        .child(date_tempticker)
        .set(price)
      updatePromises.push(updatePromise)
    }

    await Promise.allSettled(updatePromises)
    console.log('========只有新增的標的 資料庫新增完成========')
  }

  async function getClosePrices({
    tempTickerObj,
    customStartDate,
    customEndDate
  }) {
    // 取得每日每標的收盤價
    const tempTickers = Object.keys(tempTickerObj)
    const tradeDatePromise = tempTickers.map((tempTicker) => {
      return getEarliestTradeDate(tempTicker)
    })

    const tradeDates = await Promise.allSettled(tradeDatePromise)
    const earliestTradeDateInfo = tradeDates.map((result) => result.value)
    console.log('earliestDates', earliestTradeDateInfo)

    const rawData = await fetchHistoricalTradeRawData(
      earliestTradeDateInfo,
      customStartDate,
      customEndDate
    )

    const closePricesMap = await geClosePricesMap(
      earliestTradeDateInfo,
      tempTickers,
      tempTickerObj,
      rawData
    )

    return closePricesMap
  }

  async function geClosePricesMap(
    earliestTradeDateInfo,
    tempTickers,
    tempTickerObj,
    rawData
  ) {
    const holidaySnapshot = await holidaysRef.once('value')
    const holiday = holidaySnapshot.val()

    const missingData = []
    const holidayRecord = { us: [], tw: [] }
    const closePriceMap = new Map()
    const prevOpenDateMap = new Map() // 紀錄各市場的前一開盤日
    let prevDate = ''

    for (let i = 0; i < earliestTradeDateInfo.length; i++) {
      const { ticker, startDate, code } = earliestTradeDateInfo[i]
      const tempTicker = tempTickers[i]
      const dataset = rawData[i].value[ticker].reverse()
      console.log('dataset', dataset)

      if (dataset.length === 0) {
        console.log(`${tempTicker} 在 startDate 為 ${startDate} 沒有資料`)
        missingData.push({ dateString: startDate, ticker, tempTicker })
        continue
      }

      for (let j = 0; j < dataset.length; j++) {
        const { date, close } = dataset[j]
        const dateString = date.toJSON().split('T')[0]
        console.log('close', close)
        console.log('startDate', startDate)
        console.log('dateString', dateString)

        // 紀錄各市場的前一開盤日
        prevOpenDateMap.set(`${dateString}_${code}`, prevDate)
        prevDate = dateString

        if (!close) {
          console.log(`${tempTicker} 在 ${dateString} 沒有close`)
          missingData.push({ dateString, ticker, tempTicker })
          continue
        }

        const startUnix = Date.parse(startDate)
        const datasetDateUnix = Date.parse(dateString)
        const isActualTradeDate = startUnix <= datasetDateUnix
        console.log('isActualTradeDate', isActualTradeDate)
        if (!isActualTradeDate) continue

        // 如果資料有多抓兩天，只有實際交易日需要寫入 closePriceMap
        closePriceMap.set(`${dateString}_${tempTicker}`, close)

        // 紀錄休市日
        if (
          holiday['US'][dateString] &&
          holidayRecord['us'].indexOf(dateString) === -1
        ) {
          console.log(`${dateString} 美股休市`)
          holidayRecord['us'].push(dateString)
        }

        if (
          holiday['TW'][dateString] &&
          holidayRecord['tw'].indexOf(dateString) === -1
        ) {
          console.log(`${dateString} 台股休市`)
          holidayRecord['tw'].push(dateString)
        }
      }
    }
    console.log('prevOpenDateMap', prevOpenDateMap)
    console.log('holidayRecord', holidayRecord)

    // 如果前一日的資料，historical 模組會找不到 close，用 quote 模組代替
    if (missingData.length !== 0) {
      console.log('==用 quote 模組==, missingData:', missingData)
      await fetchClosePriceForMissingData(missingData, closePriceMap)
    }

    // 找國定假日的股價
    const convertedDate = []
    if (holidayRecord['tw'].length !== 0) {
      const result = findHolidayMissingData(
        'tw',
        holidayRecord,
        prevOpenDateMap,
        tempTickers,
        tempTickerObj
      )
      convertedDate.push(...result)
    }

    if (holidayRecord['us'].length !== 0) {
      const result = findHolidayMissingData(
        'us',
        holidayRecord,
        prevOpenDateMap,
        tempTickers,
        tempTickerObj
      )
      convertedDate.push(...result)
    }

    convertedDate.forEach((item) => {
      const { nominal, actual } = item
      const actualClose = closePriceMap.get(actual)
      if (actualClose) closePriceMap.set(nominal, actualClose)
    })

    return closePriceMap
  }

  function findHolidayMissingData(
    code,
    holidayRecord,
    prevOpenDateMap,
    tempTickers,
    tempTickerObj
  ) {
    const marketDataToUse = {
      us: 'tw', // us 休市要用 tw 前一開盤日資料
      tw: 'us'
    }
    let temp = ''
    let multiplier = 1

    // 連假開始日期
    const holidayStart = holidayRecord[code].reduce((obj, date) => {
      const isLongWeekend =
        Date.parse(temp) + 86400000 * multiplier === Date.parse(date)

      if (temp && isLongWeekend) {
        obj[date] = temp
        multiplier++
      } else {
        multiplier = 1
        temp = date
      }

      return obj
    }, {})

    console.log(code, 'holidayStart', holidayStart)

    const convertedDate = holidayRecord[code]
      .map((date) => {
        const actualStartDate = holidayStart[date] ? holidayStart[date] : date
        const actualPrevOpenDate = prevOpenDateMap.get(
          `${actualStartDate}_${marketDataToUse[code]}`
        )

        return tempTickers
          .filter((tempTicker) => {
            const ticker = tempTickerObj[tempTicker]
            return code === 'tw'
              ? ticker.endsWith('.TW')
              : !ticker.endsWith('.TW')
          })
          .map((tempTicker) => {
            return {
              nominal: `${date}_${tempTicker}`,
              actual: `${actualPrevOpenDate}_${tempTicker}`
            }
          })
      })
      .reduce((acc, item) => acc.concat(item), [])

    console.log(code, '有假日', convertedDate)

    return convertedDate
  }

  function getQuoteOptionByDate(earliestDates, customStartDate, customEndDate) {
    const { code, ticker, startDate } = earliestDates
    const quoteOptions = {
      symbols: [ticker],
      from: null,
      to: null,
      period: 'd'
    }

    if (customStartDate) {
      quoteOptions.from =
        code === 'us'
          ? adjustDate(customStartDate, 'plus')
          : adjustDate(customStartDate, 'plus', 0)
    } else {
      console.log('沒有 customStartDate')
      // us 會往前多抓一天所以要調整
      quoteOptions.from =
        code === 'us' ? adjustDate(startDate, 'plus') : startDate
    }

    const today = new Date()
    const yesterday = adjustDate(
      today.toLocaleDateString().replace(/\//g, '-'),
      'minus'
    )
    const days = today.getDay()
    const hours = today.getHours()
    const mins = today.getMinutes()
    const isTodayWeekDay = days !== 0 && days !== 6
    const twMarketOpen =
      isTodayWeekDay &&
      // code === 'tw' &&
      hours >= 9 &&
      (hours < 13 || (hours === 13 && mins <= 30))

    console.log('customEndDate', customEndDate)
    if (customEndDate) {
      if (twMarketOpen) {
        // 開盤時抓的價格不包含今天，所以區間不用調整
        quoteOptions.to = adjustDate(customEndDate, 'plus', 0)
      } else {
        quoteOptions.to = adjustDate(customEndDate, 'plus')
      }
    } else {
      console.log('沒有 customEndDate')
      quoteOptions.to = adjustDate(
        today.toLocaleDateString().replace(/\//g, '-'),
        'plus'
      )
    }

    console.log('startDate', startDate)
    console.log('yesterday', yesterday)

    const isYesterdayTrade = startDate === yesterday && isTodayWeekDay
    console.log('isYesterdayTrade', isYesterdayTrade)

    // 如果交易起始日為前一日，抓資料就多抓兩天(避開假日)，避免回傳空陣列
    if (isYesterdayTrade && code === 'tw') {
      quoteOptions.from = adjustDate(quoteOptions.from, 'minus', 2)
      console.log(ticker, '交易起始日為前一日')
      console.log('adjustedStartDate', quoteOptions.from)
    }

    if (isYesterdayTrade && code === 'us') {
      quoteOptions.from = adjustDate(quoteOptions.from, 'plus', 0)
      console.log(ticker, '交易起始日為前一日')
      console.log('adjustedStartDate', quoteOptions.from)
    }

    console.log('quoteOptions', quoteOptions)

    return quoteOptions
  }

  async function fetchHistoricalTradeRawData(
    earliestTradeDateInfo,
    customStartDate,
    customEndDate
  ) {
    const historicalPromises = []
    for (let i = 0; i < earliestTradeDateInfo.length; i++) {
      const quoteOptions = getQuoteOptionByDate(
        earliestTradeDateInfo[i],
        customStartDate,
        customEndDate
      )
      historicalPromises.push(yahooFinance.historical(quoteOptions))
    }

    const rawData = await Promise.allSettled(historicalPromises)
    return rawData
  }

  async function fetchClosePriceForMissingData(missingData, closePriceMap) {
    const quotePromises = missingData.map((data) => {
      return yahooFinance.quote({
        symbol: data.ticker,
        modules: ['price']
      })
    })
    const rawQuotes = await Promise.allSettled(quotePromises)

    for (let i = 0; i < rawQuotes.length; i++) {
      const {
        regularMarketTime,
        regularMarketPrice,
        regularMarketPreviousClose
      } = rawQuotes[i].value.price

      const { dateString, ticker, tempTicker } = missingData[i]
      console.log('rawQuotes dateString', dateString)
      console.log('rawQuotes ticker', ticker)

      const nowDate = new Date().toJSON().split('T')[0]
      const marketOpenDate = regularMarketTime.toJSON().split('T')[0]
      const hasMarketOpened = nowDate === marketOpenDate
      console.log('hasMarketOpened', hasMarketOpened)

      const closePrice = hasMarketOpened
        ? regularMarketPreviousClose // 今日已開盤
        : regularMarketPrice // 今日尚未開盤

      closePriceMap.set(`${dateString}_${tempTicker}`, closePrice)
    }
  }

  function calculateTotalValue1(testSnapshot, closePriceMap, fxRates) {
    const totalValueMap = new Map()
    const history = testSnapshot.value.val()
    const historyObj = {}
    const historyMap = new Map()
    let accumulatedPrice = 0

    for (let key in history) {
      const trade = history[key]
      const { shares, code, ticker, cost, id } = trade
      const date = key.split('_')[0]
      const close = closePriceMap.get(`${date}_${ticker}`)
      const exchangeRate = fxRates[code]
      const marketValueTWD = close * shares * exchangeRate
      const profitOrLossValue = parseFloatByDecimal(close - cost, 2)
      const profitOrLossPercentage = parseFloatByDecimal(
        ((close - cost) * 100) / cost,
        2
      )

      if (!totalValueMap.has(date)) {
        totalValueMap.set(date, { non_acc: 0, acc: 0 })
      }
      totalValueMap.get(date).non_acc += parseFloatByDecimal(marketValueTWD, 2)
      accumulatedPrice += parseFloatByDecimal(marketValueTWD, 2)
      totalValueMap.get(date).acc = accumulatedPrice

      historyMap.set(key, {
        ...history[key],
        profitOrLossValue,
        profitOrLossPercentage
      })
    }

    // console.log('historyMap', historyMap)

    return { totalValueMap1: totalValueMap, historyMap1: historyMap }
  }

  function calculateTotalValue(
    latestInfoSnapshot,
    historySnapshot,
    closePricesMap,
    fxRates
  ) {
    const tradeDateTempMap = new Map() // 紀錄個股於交易日累積股數
    const historyMap = new Map()
    const historyEntries = Object.entries(historySnapshot.value.val())

    for (let i = 0; i < historyEntries.length; i++) {
      const [date, trades] = historyEntries[i]
      console.log('date', date)
      const tradesEntries = Object.entries(trades)
      const innerObj = {}

      // 計算單日 total value
      for (let j = 0; j < tradesEntries.length; j++) {
        const [id, trade] = tradesEntries[j]
        const { shares, tempTicker, code, cost } = trade
        const key = `${date}_${tempTicker}`
        const close = closePricesMap.get(key)
        console.log('tempTicker', tempTicker, close, shares)
        const exchangeRate = fxRates[code]
        const marketValueTWD = shares * close * exchangeRate
        const profitOrLossValue = formatNumber({ number: close - cost })
        const profitOrLossPercentage = (((close - cost) * 100) / cost)
          .toFixed(2)
          .padStart(2, '0')
        const { name, style } = latestInfoSnapshot.value.val()[tempTicker]

        innerObj[id] = {
          ...trade,
          name,
          style,
          profitOrLossValue,
          profitOrLossPercentage,
          cost: formatNumber({ number: cost }),
          close: formatNumber({ number: close }),
          marketValueTWD: formatNumber({ number: marketValueTWD })
        }

        historyRef
          .child(date)
          .child(id)
          .update({
            ...trade,
            close,
            profitOrLossValue,
            profitOrLossPercentage
          })

        if (!tradeDateTempMap.has(key)) {
          tradeDateTempMap.set(key, {
            shares: 0,
            code
          })
        }

        tradeDateTempMap.set(key, {
          shares: tradeDateTempMap.get(key).shares + parseFloat(shares),
          code
        })
      }

      historyMap.set(date, innerObj)
    }

    console.log('tradeDateTempMap', tradeDateTempMap)

    const closePricesEntries = Array.from(closePricesMap)
    const totalValueMap = new Map()
    const prevTemp = new Map() // 紀錄個股每日累積股數

    let totalTradeValue = 0
    let totalNonTradeValue = 0
    let sharesPerDate = {} // 紀錄所有個股當日的累積股數
    let prevDate = '' // 紀錄前一開盤日

    for (let i = 0; i < closePricesEntries.length; i++) {
      const [key, close] = closePricesEntries[i]
      const [date, tempticker] = key.split('_')

      if (prevDate === date) {
        console.log('沒歸零')
      } else {
        console.log('歸零')
        totalTradeValue = 0
        totalNonTradeValue = 0
      }

      if (tradeDateTempMap.has(key)) {
        // 當天有交易
        const { shares, code } = tradeDateTempMap.get(key)

        if (!sharesPerDate[tempticker]) {
          sharesPerDate[tempticker] = 0
        }
        sharesPerDate[tempticker] += shares
        const sharesAsOfToday = sharesPerDate[tempticker]

        const exchangeRate = fxRates[code]
        const marketValueTWD = sharesAsOfToday * close * exchangeRate
        totalTradeValue += marketValueTWD

        prevTemp.set(tempticker, { shares: sharesAsOfToday, code })
        console.log('if', key, sharesAsOfToday, totalTradeValue)
      } else {
        // 當天沒交易，用前一次的累績股數
        const { shares, code } = prevTemp.get(tempticker)
        const exchangeRate = fxRates[code]
        const marketValueTWD = shares * close * exchangeRate
        totalNonTradeValue += marketValueTWD
        console.log('else', key, shares, totalNonTradeValue)
      }

      console.log('prevTemp', prevTemp)

      // 紀錄當日尚未開盤之個股總市值
      let notYetOpenTotal = 0
      if (date === getISODate(new Date())) {
        prevTemp.forEach((value, tradeDayTempTicker) => {
          if (tempticker !== tradeDayTempTicker) {
            const prevClose = closePricesMap.get(
              `${prevDate}_${tradeDayTempTicker}`
            )
            const exchangeRate = fxRates[value.code]
            notYetOpenTotal += value.shares * prevClose * exchangeRate
          }
        })
      }

      prevDate = date

      totalValueMap.set(date, {
        acc: parseFloatByDecimal(
          totalTradeValue + totalNonTradeValue + notYetOpenTotal,
          2
        )
      })
    }

    return { totalValueMap, historyMap }
  }

  async function getClosePricesBackup(tempTickerObj, dateRange) {
    // console.log('startDate', startDate)
    // console.log('endDate', endDate)

    // 取得每日每標的收盤價
    const { tempTickers, tickers } = Object.entries(tempTickerObj).reduce(
      (obj, [tempTicker, ticker]) => {
        obj.tempTickers.push(tempTicker)
        obj.tickers.push(ticker)
        return obj
      },
      { tempTickers: [], tickers: [] }
    )

    let startDate = dateRange?.startDate
    let endDate = dateRange?.endDate

    if (!dateRange) {
      const dateRes = await Promise.allSettled([
        historyRef.orderByKey().limitToFirst(1).once('child_added')
        // historyRef.orderByKey().limitToLast(1).once('child_added')
      ])
      startDate = dateRes[0].value.key
      endDate = new Date().toLocaleDateString().replace(/\//g, '-')
      // const [start, end] = dateRes.map((item) => item.value.key)
    }

    const adjustedEndDate = adjustDate(endDate, 'plus')

    const quoteOptions = {
      symbols: tickers,
      from: startDate,
      to: adjustedEndDate,
      period: 'd'
    }
    const isEndDateYesterday =
      adjustedEndDate === new Date().toLocaleDateString().replace(/\//g, '-')
    const isYesterdayTrade = startDate === endDate && isEndDateYesterday
    console.log('isYesterdayTrade', isYesterdayTrade)

    // 如果只有前一日有交易，抓資料就多抓兩天(避開假日)，避免回傳空陣列
    if (isYesterdayTrade) {
      quoteOptions.from = adjustDate(endDate, 'minus', 2)
      console.log('adjustedStartDate', quoteOptions.from)
    }

    const missingData = []
    const closePriceMap = new Map()
    const rawData = await yahooFinance.historical(quoteOptions)
    // console.log('rawData', rawData)

    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i]
      const tempTicker = tempTickers[i]
      const dataset = rawData[ticker]

      for (let j = 0; j < dataset.length; j++) {
        const { date, close } = dataset[j]
        const dateString = date.toJSON().split('T')[0]
        console.log('tempTicker', tempTicker, close)
        console.log('startDate', startDate)
        console.log('dateString', dateString)
        console.log('endDate', endDate)

        if (!close) {
          missingData.push({ dateString, ticker, tempTicker })
          continue
        }

        const startUnix = Date.parse(startDate)
        const endUnix = Date.parse(endDate)
        const datasetDateUnix = Date.parse(dateString)
        const isActualTradeDate =
          startUnix <= datasetDateUnix && datasetDateUnix <= endUnix

        console.log('isActualTradeDate', isActualTradeDate)

        // 如果資料有多抓兩天，只有實際交易日需要寫入 closePriceMap
        if (isActualTradeDate) {
          closePriceMap.set(`${dateString}_${tempTicker}`, close)
        }
      }
    }

    if (missingData.length === 0) return closePriceMap
    console.log('用 quote 模組代替')

    // 如果前一日剛好新增標的，historical 模組會找不到 close，用 quote 模組代替
    const quotePromises = missingData.map((data) => {
      return yahooFinance.quote({
        symbol: data.ticker,
        modules: ['price']
      })
    })

    const rawQuotes = await Promise.allSettled(quotePromises)

    for (let i = 0; i < rawQuotes.length; i++) {
      const {
        regularMarketTime,
        regularMarketPrice,
        regularMarketPreviousClose
      } = rawQuotes[i].value.price

      const { dateString, ticker, tempTicker } = missingData[i]
      console.log('rawQuotes dateString', dateString)
      console.log('rawQuotes ticker', ticker)

      const nowDate = new Date().toJSON().split('T')[0]
      const marketOpenDate = regularMarketTime.toJSON().split('T')[0]
      const hasMarketOpened = nowDate === marketOpenDate
      console.log('hasMarketOpened', hasMarketOpened)

      const closePrice = hasMarketOpened
        ? regularMarketPreviousClose // 今日已開盤
        : regularMarketPrice // 今日尚未開盤

      closePriceMap.set(`${dateString}_${tempTicker}`, closePrice)
    }

    return closePriceMap
  }

  async function fetchHolidays() {
    const holidayCountryCode = ['US', 'TW']
    const holidayPromise = holidayCountryCode.map((code) => {
      return axios.get(
        `https://calendarific.com/api/v2/holidays?api_key=5957df4e7e6c4c7a2c3761fd4fd56b5e6cd55afb&country=${code}&year=2023&type=national`
      )
    })

    const result = await Promise.allSettled(holidayPromise)
    const holidays = result.reduce((obj, item, index) => {
      const code = holidayCountryCode[index]
      const holidays = item.value.data.response.holidays.reduce(
        (innerObj, holiday) => {
          const { name, date } = holiday
          innerObj[date.iso] = name
          return innerObj
        },
        {}
      )

      obj[code] = holidays
      return obj
    }, {})

    holidaysRef.set(holidays)
  }

  function getISODate(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    return yyyy + '-' + mm + '-' + dd
  }

  function adjustDate(yyyymmdd, sign, multiplier = 1) {
    const unix = Date.parse(yyyymmdd)
    // 加一天（84600000）才能要得到當天資料，例如結束日期為 1/27，實際上 fetch 的資料範圍結束日為 1/26
    let dateObj

    if (sign === 'plus') {
      dateObj = new Date(unix + 84600000 * multiplier)
    } else if (sign === 'minus') {
      dateObj = new Date(unix - 84600000 * multiplier)
    }

    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    // console.log('adjustDate', yyyy + '-' + mm + '-' + dd)

    return yyyy + '-' + mm + '-' + dd
  }
})

router.get('/historicalHolding/:period/:from/:to', async (req, res) => {
  const tickerRef = await holdingsTradeRef.once('value')
  const currentHoldings = tickerRef.val()
  if (!currentHoldings) return res.send('invalid ticker name')

  const tickers = Object.keys(currentHoldings)
  const from = req.params.from
  const to = req.params.to
  const period = req.params.period

  const quoteOptions = {
    symbols: tickers,
    from: getFormattedDate(from),
    to: getFormattedDate(to),
    period
  }

  try {
    const historicalQuote = await yahooFinance.historical(quoteOptions)
    // console.log('historicalQuote', historicalQuote)

    // const obj = {}
    // Object.entries(historicalQuote).forEach((item) => {
    //   const [ticker, quote] = item
    //   console.log('ticker', ticker)
    //   console.log('quote', quote)

    //   obj[ticker] = {
    //     ticker,
    //     date: quote[0].date,
    //     close: quote[0].close
    //   }
    // })
    res.send(historicalQuote)
  } catch (err) {
    console.log('err', err.message)
  }
})

router.post('/checkTicker', (req, res) => {
  const { ticker } = req.body
  const checkTickerValid = yahooFinance.quote(ticker, ['summaryProfile'])

  checkTickerValid
    .then((response) => {
      console.log('Ticker exists')
      res.send({
        success: true,
        content: 'Ticker exists',
        errorMessage: null,
        ticker
      })
    })
    .catch((error) => {
      console.log('Ticker does not exists')

      console.log('error', error)
      res.send({
        success: false,
        content: 'Ticker does not exists',
        errorMessage: error.message,
        ticker
      })
    })
})

// WATCHLIST PAGE
// add ticker to watchlist
router.post('/ticker/:listName', async (req, res) => {
  const { listName } = req.params
  const { tickerItem } = req.body
  const list = listName.toLowerCase() === 'watchlist' ? 'default' : listName

  try {
    await watchlistRef.child(list).child(tickerItem.tempTicker).set(tickerItem)

    const message = {
      success: true,
      content: '標的新增成功',
      errorMessage: null,
      result: tickerItem
    }
    res.send(message)
  } catch (error) {
    const message = {
      success: true,
      content: '標的新增失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(message)
  }
})

// delete ticker from watchlist
router.delete('/ticker/:listName/:deleteInfoArr', async (req, res) => {
  try {
    const listName = req.params.listName
    const deleteInfoArr = JSON.parse(req.params.deleteInfoArr)

    if (deleteInfoArr.length === 0) return

    const list = listName.toLowerCase() === 'watchlist' ? 'default' : listName

    for (let i = 0; i < deleteInfoArr.length; i++) {
      const ticker = deleteInfoArr[i]
      await watchlistRef.child(list).child(ticker).remove()
    }

    const message = {
      success: true,
      content: '刪除成功',
      errorMessage: null,
      result: deleteInfoArr
    }
    res.send(message)
  } catch (error) {
    console.log('error', error)
    const message = {
      success: false,
      content: '刪除失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(message)
  }
})

// update ticker info from watchlist
router.put('/ticker/:listName/:ticker', async (req, res) => {
  const { listName, ticker } = req.params
  const { newItem } = req.body
  const {
    price,
    previousCloseChange,
    previousCloseChangePercent,
    marketState
  } = newItem

  const list = listName.toLowerCase() === 'watchlist' ? 'default' : listName

  const tickerRef = watchlistRef.child(list).child(ticker)
  const priceRef = tickerRef.child('price').set(price)
  const previousCloseChangeRef = tickerRef
    .child('previousCloseChange')
    .set(previousCloseChange)
  const previousCloseChangePercentRef = tickerRef
    .child('previousCloseChangePercent')
    .set(previousCloseChangePercent)
  const previousMarketStateRef = tickerRef.child('marketState').set(marketState)

  try {
    await Promise.allSettled([
      priceRef,
      previousCloseChangeRef,
      previousCloseChangePercentRef,
      previousMarketStateRef
    ])

    const msg = {
      success: true,
      content: '更新 watchlist 成功',
      errorMessage: null,
      result: ticker
    }
    res.send(msg)
  } catch (error) {
    const msg = {
      success: true,
      content: '更新 watchlist 失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(msg)
  }
})

// get all tickers in current watchlist
router.get('/tickers/:listName', async (req, res) => {
  const listName = req.params.listName
  const list = listName.toLowerCase() === 'watchlist' ? 'default' : listName

  try {
    const watchlistChildRef = await watchlistRef.child(list).once('value')
    const watchlist = Object.values(watchlistChildRef.val())

    const msg = {
      success: true,
      content: '獲得 watchlist',
      errorMessage: null,
      result: watchlist
    }

    res.send(msg)
  } catch (error) {
    console.log('error', error.message)
    const msg = {
      success: false,
      content: '獲得標的失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(msg)
  }
})

// create watchlist
router.post('/watchlist/:listName', async (req, res) => {
  const { listName } = req.params
  const omitName = ['null', 'undefined', '']
  const DEFAULT_TAB = 'Watchlist'

  const initTabs = await tabsRef.once('value')
  const hasTabsArray = initTabs.val()?.length
  const hasSameTab = initTabs.val()?.includes(listName)
  const isOmitName = omitName.includes(listName)

  if (listName && hasTabsArray && !hasSameTab && !isOmitName) {
    return setTabs(listName)
  }

  if (!hasTabsArray) return setTabs(DEFAULT_TAB)

  const message = {
    success: false,
    content: '新增失敗',
    errorMessage: null,
    result: null
  }

  if (isOmitName) {
    message.errorMessage = 'Input must not be empty'
  } else if (hasSameTab) {
    message.errorMessage = 'Watchlist already exists'
  }

  res.send(message)

  async function setTabs(newTab) {
    const tabs =
      initTabs.val() == null
        ? [DEFAULT_TAB, listName]
        : [...initTabs.val(), listName]
    const tabsInfo = await getTabsInfo(tabs)
    let message = null

    try {
      await tabsRef.set(tabs)
      message = {
        success: true,
        content: '新增成功',
        errorMessage: null,
        result: { newTab, tabsInfo }
      }
    } catch (error) {
      message = {
        success: false,
        content: '新增失敗',
        errorMessage: error.message,
        result: null
      }
    }

    res.send(message)
  }
})

// delete watchlist
router.delete('/watchlist/:listName', async (req, res) => {
  try {
    const { listName } = req.params
    const tabs = await tabsRef.once('value')
    const newTabs = tabs.val().filter((tab) => tab !== listName)
    const tabsInfo = await getTabsInfo(newTabs)

    await tabsRef.set(newTabs)
    await watchlistRef.child(listName).remove()

    const message = {
      success: true,
      content: '刪除成功',
      errorMessage: null,
      result: tabsInfo
    }

    res.send(message)
  } catch (error) {
    const message = {
      success: false,
      content: '刪除失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(message)
  }
})

// get all watchlist names
router.get('/watchlist', async (req, res) => {
  try {
    const DEFAULT_TAB = 'Watchlist'
    const initTabs = await tabsRef.once('value')

    let tabsInfo = await getTabsInfo(initTabs.val())

    if (initTabs.val() == null) {
      await tabsRef.set([DEFAULT_TAB])
      tabsInfo = { name: DEFAULT_TAB, listLength: 0 }
    }

    const message = {
      success: true,
      content: '成功獲得所有頁籤',
      errorMessage: null,
      result: tabsInfo
    }
    res.send(message)
  } catch (error) {
    const message = {
      success: false,
      content: '獲得頁籤失敗',
      errorMessage: error.message,
      result: null
    }
    console.log('error.message', error.message)
    res.send(message)
  }
})

// rename watchlist
router.put('/watchlist/:oldName/:newName', async (req, res) => {
  const { oldName, newName } = req.params
  const emptyInput = !newName || newName.length === 0

  let message = {
    success: false,
    content: '編輯失敗',
    errorMessage: null,
    result: null
  }

  if (oldName === newName) {
    message.errorMessage = 'Please rename watchlist'
    res.send(message)
    return
  }
  if (emptyInput) {
    message.errorMessage = 'Input must not be empty'
    res.send(message)
    return
  }

  try {
    const tabs = await tabsRef.once('value')
    const allTabs = tabs.val()
    const isTabRepeated = allTabs.includes(newName)

    if (isTabRepeated) {
      message.errorMessage = 'Watchlist already exists'
      res.send(message)
      return
    }

    const idx = allTabs.indexOf(oldName)
    allTabs.splice(idx, 1, newName)
    await tabsRef.set(allTabs)

    const targetList = await watchlistRef.child(oldName).once('value')
    const isTargetListEmpty = targetList.val() == null

    if (!isTargetListEmpty) {
      await watchlistRef.child(oldName).remove()
      await watchlistRef.child(newName).set(targetList.val())
    }

    const tabsInfo = await getTabsInfo(allTabs)
    message = {
      success: true,
      content: '編輯成功',
      errorMessage: null,
      result: { newName, tabsInfo }
    }

    res.send(message)
  } catch (error) {
    const message = {
      success: false,
      content: '編輯失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(message)
  }
})

async function getTabsInfo(tabs) {
  const DEFAULT_TAB = 'Watchlist'
  const watchlistsRef = await watchlistRef.once('value')

  const tabsInfo = tabs.map((tab) => {
    const list =
      tab !== DEFAULT_TAB
        ? watchlistsRef.val()?.[tab]
        : watchlistsRef.val()?.['default']
    const listLength = list ? Object.keys(list).length : 0

    return {
      name: tab,
      listLength
    }
  })

  return tabsInfo
}

// STOCKINFO PAGE
router.get('/financialData/:ticker', async (req, res) => {
  const quoteOptions = {
    symbol: req.params.ticker,
    modules: ['earnings', 'financialData']
  }

  try {
    const { earnings, financialData } = await yahooFinance.quote(quoteOptions)

    const {
      quickRatio,
      currentRatio,
      freeCashflow,
      operatingCashflow,
      returnOnAssets,
      returnOnEquity,
      revenueGrowth,
      totalRevenue,
      grossProfits,
      grossMargins,
      operatingMargins,
      ebitda,
      ebitdaMargins,
      profitMargins
    } = financialData

    const stock = {
      Profitability: {
        ROA: returnOnAssets,
        ROE: returnOnEquity
      },
      Liquidity: {
        'Quick Ratio': quickRatio,
        'Current Ratio': currentRatio
      },
      'Cash Flow': {
        'Free Cash Flow': freeCashflow,
        'Operating Cash Flow': operatingCashflow
      },
      IncomeStatement: {
        'Total Revenue': totalRevenue,
        'Gross Profit': grossProfits,
        'Operating Income': operatingMargins * totalRevenue,
        EBITDA: ebitda,
        'Net Profit': profitMargins * totalRevenue
      },
      IncomeStatementMargin: {
        'Revenue Growth': revenueGrowth,
        'Gross Margin': grossMargins,
        'Operating Margin': operatingMargins,
        'EBITDA Margin': ebitdaMargins,
        'Profit Margin': profitMargins
      },
      earnings
    }

    const message = {
      success: true,
      content: '取得成功',
      errorMessage: null,
      result: stock
    }

    res.send(message)
  } catch (error) {
    console.log('getFinancialData error', error)
    const message = {
      success: false,
      content: '取得失敗',
      errorMessage: error.message,
      result: null
    }

    res.send(message)
  }
})

router.get('/tickerSummary/:ticker', async (req, res) => {
  const quoteOptions = {
    symbol: req.params.ticker,
    modules: ['summaryProfile', 'summaryDetail', 'price']
  }

  try {
    const { summaryProfile, summaryDetail, price } = await yahooFinance.quote(
      quoteOptions
    )

    let ticker = null
    const { exchangeName, quoteType, marketState } = price

    if (quoteType === 'ETF') {
      const { longBusinessSummary } = summaryProfile
      const {
        yield,
        fiftyTwoWeekLow,
        fiftyTwoWeekHigh,
        dayLow,
        dayHigh,
        averageVolume,
        totalAssets,
        trailingPE,
        navPrice
      } = summaryDetail

      ticker = {
        profile: {
          longBusinessSummary
        },
        price: {
          exchangeName,
          quoteType,
          marketState
        },
        detail: {
          range: {
            'Day Range': {
              low: dayLow.toFixed(2),
              high: dayHigh.toFixed(2)
            },
            '52 Week Range': {
              low: fiftyTwoWeekLow.toFixed(2),
              high: fiftyTwoWeekHigh.toFixed(2)
            }
          },
          fixed: {
            'Total Assets': numberWithCommas(totalAssets),
            'Avg. Volume': numberWithCommas(averageVolume),
            'Nav Price': navPrice?.toFixed(2) || '---',
            'Trailing PE': trailingPE?.toFixed(2) || '---',
            Yield: `${parseFloat((yield * 100).toFixed(2))}%`
          }
        }
      }
    }

    if (quoteType === 'EQUITY') {
      const {
        longBusinessSummary,
        fullTimeEmployees,
        sector,
        website,
        city,
        state,
        country
      } = summaryProfile

      const {
        dividendYield,
        exDividendDate,
        beta,
        trailingPE,
        forwardPE,
        fiftyTwoWeekLow,
        fiftyTwoWeekHigh,
        dayLow,
        dayHigh,
        marketCap,
        averageVolume
      } = summaryDetail

      ticker = {
        profile: {
          longBusinessSummary,
          website,
          address: `${city}, ${state}, ${country}`,
          fullTimeEmployees: numberWithCommas(fullTimeEmployees),
          sector,
          country
        },
        price: {
          exchangeName,
          marketState,
          quoteType: quoteType === 'EQUITY' ? 'Equity' : quoteType
        },
        detail: {
          range: {
            'Day Range': {
              low: dayLow.toFixed(2),
              high: dayHigh.toFixed(2)
            },
            '52 Week Range': {
              low: fiftyTwoWeekLow.toFixed(2),
              high: fiftyTwoWeekHigh.toFixed(2)
            }
          },
          fixed: {
            'Market Cap': numberWithCommas(marketCap),
            'Avg. Volume': numberWithCommas(averageVolume),
            'Trailing PE': trailingPE?.toFixed(2) || '---',
            'Forward PE': forwardPE?.toFixed(2) || '---',
            Beta: beta?.toFixed(2) || '---',
            'Dividend Yield': dividendYield
              ? `${parseFloat((dividendYield * 100).toFixed(2))}%`
              : '---',
            'Ex-dividend Date': exDividendDate
              ? `${exDividendDate.getFullYear()}-${
                  exDividendDate.getMonth() + 1
                }-${exDividendDate.getDate()}`
              : '---'
          }
        }
      }
    }

    const message = {
      success: true,
      content: '取得成功',
      errorMessage: null,
      result: ticker
    }

    res.send(message)
  } catch (error) {
    console.log('getTickerSummary error', error)
    const message = {
      success: false,
      content: '取得失敗',
      errorMessage: error.message,
      result: null
    }

    res.send(message)
  }
})

router.get('/historicalPrice/:ticker', async (req, res) => {
  const timespan = req.query.timespan

  switch (timespan) {
    case '1Y':
      await getPriceByTimespan(365)
      break
    case '5Y':
      await getPriceByTimespan(1825)
      break
  }

  async function getPriceByTimespan(totalTimespan) {
    const ticker = req.params.ticker

    const window = {
      to: getFormattedDate(0),
      from: getFormattedDate(totalTimespan)
    }

    try {
      const quotePromise = yahooFinance.quote({
        symbol: ticker,
        modules: ['price']
      })
      const historicalPromise = yahooFinance.historical({
        symbols: [ticker],
        ...window,
        period: 'd'
      })

      const [quoteResult, historicalResult] = await Promise.allSettled([
        quotePromise,
        historicalPromise
      ])
      const { regularMarketPrice, regularMarketTime } = quoteResult.value.price
      const historicalData = historicalResult.value[ticker]
      const priceMap = new Map()

      // 因各市場時間差， historical 模組沒提供當日收盤後資料，要另外用 quote 模組取得
      // 例如：台灣時間 11/2 收盤後，historical 模組只提供到 11/1 的資料，但同一時間美國還在 11/1，所以台股資料會少一天，美股則是完整的
      const hasLatestPrice =
        regularMarketPrice.toFixed(2) === historicalData[0].close?.toFixed(2)

      if (!hasLatestPrice) {
        priceMap.set(
          regularMarketTime.toLocaleDateString(),
          parseFloat(regularMarketPrice.toFixed(2))
        )
      }

      for (let i = 0; i < historicalData.length; i++) {
        const dayData = historicalData[i]
        if (!dayData.close) continue
        const year = dayData.date.getFullYear()
        const month = dayData.date.getMonth() + 1
        const date = dayData.date.getDate()
        const fullDate = `${year}/${month}/${date}`
        priceMap.set(fullDate, parseFloat(dayData.close.toFixed(2)))
      }

      const message = {
        success: true,
        content: '取得成功',
        errorMessage: null,
        result: {
          close: [...priceMap]
        }
      }

      res.send(message)
    } catch (error) {
      console.log('error', error)
      const message = {
        success: false,
        content: '取得失敗',
        errorMessage: error.message,
        result: null
      }

      res.send(message)
    }
  }
})

router.get('/latestMarketData/:ticker', async (req, res) => {
  const quoteOptions = {
    symbol: req.params.ticker,
    modules: ['price']
  }

  try {
    const { price } = await yahooFinance.quote(quoteOptions)

    const {
      regularMarketPrice: currentPrice,
      regularMarketPreviousClose: previousClose,
      marketState
    } = price

    const previousCloseChange =
      parseFloat(currentPrice - previousClose) > 0
        ? '+' + parseFloat(currentPrice - previousClose).toFixed(2)
        : parseFloat(currentPrice - previousClose).toFixed(2)

    const previousCloseChangePercent = parseFloat(
      ((currentPrice - previousClose) / previousClose) * 100
    ).toFixed(2)

    const obj = {
      price: parseFloat(currentPrice.toFixed(2)),
      previousCloseChange,
      previousCloseChangePercent,
      marketState
    }

    const message = {
      success: true,
      content: '取得最新價成功',
      errorMessage: null,
      result: obj
    }

    res.send(message)
  } catch (error) {
    console.log('error', error)
    const message = {
      success: false,
      content: '取得失敗',
      errorMessage: error.message,
      result: null
    }

    res.send(message)
  }
})

module.exports = router
