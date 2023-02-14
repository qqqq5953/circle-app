const express = require('express')
const numberWithCommas = require('../tools/getNumberWithComma')
const router = express.Router()
const axios = require('axios')
const yahooFinance = require('yahoo-finance')
const firebaseDb = require('../firebase/index.js')

const historyRef = firebaseDb.ref('/history/')
const testRef = firebaseDb.ref('/test/')
const fxToTWDRef = firebaseDb.ref('/fxToTWD/')
const closeCacheRef = firebaseDb.ref('/closeCache/')
const holdingsTickersRef = firebaseDb.ref('/holdingsTickers/')
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
    holdingsTickersRef.remove(),
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
    const readTickers = await holdingsTickersRef.child(tempTicker).once('value')
    if (!readTickers.val()) holdingsTickersRef.child(tempTicker).set(ticker)

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

// HISTORY PAGE
router.get('/history', async (req, res) => {
  try {
    const resPromise = await Promise.allSettled([
      testRef.once('value'),
      historyRef.once('value'),
      holdingsTickersRef.once('value'),
      fxToTWDRef.once('value'),
      closeCacheRef.once('value')
    ])
    const [
      testSnapshot,
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
      fetchStockPrices(tempTickerSnapshot),
      getFxRates(fxToTWDSnapshot)
    ])

    const [closePriceMap, fxRates] = pricesAndFxRates.map((item) => item.value)

    // console.log('closePriceMap', closePriceMap)
    // console.log('fxRates', fxRates)

    const { totalValueMap, historyMap } = calculateTotalValue(
      historySnapshot,
      closePriceMap,
      fxRates
    )
    console.log('totalValueMap', totalValueMap)
    console.log('historyMap', historyMap)

    // const { totalValueMap1, historyMap1 } = calculateTotalValue1(
    //   testSnapshot,
    //   closePriceMap,
    //   fxRates
    // )
    // console.log('totalValueMap1', totalValueMap1)
    // console.log('historyMap1', historyMap1)

    const totalValue = Array.from(totalValueMap).reduce(
      (obj, [date, values]) => {
        const { non_acc, acc } = values
        obj.date.push(date)
        obj.assetValue.push(acc)
        return obj
      },
      { date: [], assetValue: [] }
    )
    const historyDetails = Object.fromEntries(historyMap)
    // console.log('totalValue', totalValue)
    // console.log('historyDetails', historyDetails)

    const msg = {
      success: true,
      content: '成功獲得所有標的',
      errorMessage: null,
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

  async function fetchStockPrices(tempTickerSnapshot) {
    const dateRes = await Promise.allSettled([
      historyRef.orderByKey().limitToFirst(1).once('child_added'),
      historyRef.orderByKey().limitToLast(1).once('child_added')
    ])

    const [startDate, endDate] = dateRes.map((item) => {
      return item.value.key
    })
    // console.log('startDate', startDate)
    // console.log('endDate', endDate)

    // 取得每日每標的收盤價
    const tickers = Object.values(tempTickerSnapshot.value.val())
    const adjustedEndDate = adjustDate(endDate, 'plus')
    const quoteOptions = {
      symbols: tickers,
      from: startDate,
      to: adjustedEndDate,
      period: 'd'
    }
    const isEndDateYesterday =
      adjustedEndDate === new Date().toJSON().split('T')[0]
    const isOnlyYesterdayTrade = startDate === endDate && isEndDateYesterday
    console.log('isOnlyYesterdayTrade', isOnlyYesterdayTrade)

    // 如果只有前一日有交易，抓資料就多抓兩天(避開假日)，避免回傳空陣列
    if (isOnlyYesterdayTrade) {
      quoteOptions.from = adjustDate(endDate, 'minus', 2)
      console.log('adjustedStartDate', quoteOptions.from)
    }

    const missingData = []
    const closePriceMap = new Map()
    const rawData = await yahooFinance.historical(quoteOptions)
    // console.log('rawData', rawData)

    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i]
      const dataset = rawData[ticker]

      for (let j = 0; j < dataset.length; j++) {
        const { date, close } = dataset[j]
        const dateString = date.toJSON().split('T')[0]
        console.log('dateString', dateString, ticker)

        if (!close) {
          missingData.push({ dateString, ticker })
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
          closePriceMap.set(`${dateString}_${ticker}`, close)
        }
      }
    }

    if (missingData.length === 0) return closePriceMap

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

      const { dateString, ticker } = missingData[i]
      console.log('rawQuotes dateString', dateString)
      console.log('rawQuotes ticker', ticker)

      const nowDate = new Date().toJSON().split('T')[0]
      const marketOpenDate = regularMarketTime.toJSON().split('T')[0]
      const hasMarketOpened = nowDate === marketOpenDate
      console.log('hasMarketOpened', hasMarketOpened)

      const closePrice = hasMarketOpened
        ? regularMarketPreviousClose // 今日已開盤
        : regularMarketPrice // 今日尚未開盤

      closePriceMap.set(`${dateString}_${ticker}`, closePrice)
    }

    return closePriceMap
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

  function calculateTotalValue(historySnapshot, closePriceMap, fxRates) {
    const totalValueMap = new Map()
    const historyMap = new Map()
    const history = historySnapshot.value.val()

    let totalValuePortfolio = 0

    for (const date in history) {
      const trades = history[date]
      const innerObj = {}
      let totalValuePerDate = 0

      // 計算單日 total value
      for (const id in trades) {
        const trade = trades[id]
        const { shares, ticker, code, cost } = trades[id]
        const close = closePriceMap.get(`${date}_${ticker}`)
        const exchangeRate = fxRates[code]
        const marketValueTWD = shares * close * exchangeRate
        const profitOrLossValue = parseFloatByDecimal(close - cost, 2)
        const profitOrLossPercentage = parseFloatByDecimal(
          ((close - cost) * 100) / cost,
          2
        )

        totalValuePerDate += marketValueTWD

        innerObj[id] = {
          ...trade,
          profitOrLossValue,
          profitOrLossPercentage,
          marketValueTWD: parseFloatByDecimal(marketValueTWD, 2)
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
      }

      totalValuePortfolio += totalValuePerDate
      // console.log('=====totalValuePortfolio=====', date, totalValuePortfolio)
      totalValueMap.set(date, {
        non_acc: parseFloatByDecimal(totalValuePerDate, 2),
        acc: parseFloatByDecimal(totalValuePortfolio, 2)
      })

      historyMap.set(date, innerObj)
    }

    return { totalValueMap, historyMap }
  }

  async function checkUpdateTime() {
    const now = new Date()
    const snapshot = await closeCacheRef.child('nextUpdate').once('value')
    const nextUpdate = snapshot.val()
    const fourAM = nextUpdate?.unix
      ? new Date(nextUpdate.unix)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0)

    const isInitUpdate = now.getTime() > fourAM.getTime()

    console.log('nextUpdate', nextUpdate)
    console.log('before fourAM', fourAM.toLocaleDateString())

    if (isInitUpdate) {
      // 重設下一日的早上四點
      fourAM.setDate(fourAM.getDate() + 1)

      closeCacheRef.child('nextUpdate').set({
        unix: fourAM.getTime()
      })

      console.log('isInitUpdate')
      console.log('after fourAM', fourAM.toLocaleDateString())
    }

    return isInitUpdate
  }

  async function getFxRates(fxToTWDSnapshot) {
    if (fxToTWDSnapshot.value.val()) {
      const { fxRates, nextUpdateTime } = fxToTWDSnapshot.value.val()
      return await checkFxUpdate(fxRates, nextUpdateTime)
    } else {
      return await checkFxUpdate()
    }
  }

  async function checkFxUpdate(ratesFromDB, nextUpdateTime) {
    const hasPassedNextUpdateTime =
      !nextUpdateTime || Date.now() >= nextUpdateTime

    if (!hasPassedNextUpdateTime) {
      console.log(
        '等待下一個更新',
        new Date(nextUpdateTime).toLocaleString(),
        '現在用資料庫資料'
      )
      return ratesFromDB
    }

    if (!nextUpdateTime) {
      console.log('第一次載入，準備更新')
    } else {
      console.log('尚未更新，準備更新')
    }

    const fxRates = await fecthFxRates()
    const newNextUpdateTime = scheduleNextUpdate()
    updateFxToDB(fxRates, newNextUpdateTime)
    console.log('更新完成')

    return fxRates
  }

  async function fecthFxRates() {
    const currencyToCodeMap = {
      USD: 'us',
      GBP: 'uk',
      HKD: 'hk',
      KRW: 'ks'
    }
    const currencies = ['USD', 'GBP', 'HKD', 'KRW']
    const fxRateApi = 'https://api.coinbase.com/v2/exchange-rates'
    const fetchPromise = currencies.map((currency) => {
      return axios.get(`${fxRateApi}?currency=${currency}`)
    })

    const currencyRes = await Promise.allSettled(fetchPromise)
    const fxRates = currencyRes.reduce(
      (obj, item) => {
        const { currency, rates } = item.value.data.data
        const code = currencyToCodeMap[currency]
        if (currency !== 'USD') {
          obj[code] = rates.TWD
        } else {
          obj['us'] = rates.TWD
          obj['mf'] = rates.TWD
        }

        return obj
      },
      { tw: '1' }
    )

    return fxRates
  }

  function scheduleNextUpdate() {
    const now = new Date()
    const nextUpdate = new Date(now)
    nextUpdate.setMinutes(0)
    nextUpdate.setSeconds(0)
    nextUpdate.setMilliseconds(0)
    nextUpdate.setHours(nextUpdate.getHours() + 1)

    // Check if it's a weekend day
    // let requireUpdate = updateOnWeekend
    const dayOfWeek = nextUpdate.getDay()

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('現在是假日')
      nextUpdate.setDate(nextUpdate.getDate() + ((7 - dayOfWeek + 1) % 7))
      nextUpdate.setHours(4)
    } else {
      console.log('現在是平日')
    }

    const nextUpdateTime = nextUpdate.getTime()
    console.log('nextUpdateTime', new Date(nextUpdateTime).toLocaleString())
    return nextUpdateTime
  }

  function updateFxToDB(fxRates, nextUpdateTime) {
    fxToTWDRef.set({ fxRates, nextUpdateTime })
  }

  async function updateCache({
    tickers,
    tempTickers,
    tickerToTempTickerMap,
    startDate,
    endDate
  }) {
    // historicalData 順序為按日期由新到舊
    // 如剛好前一日有紀錄，今日盤中會抓不到前一日交易資料，因此要用 quote 模組
    const newRequest = await Promise.allSettled([
      getQuotes(tickers, tickerToTempTickerMap),
      getHistoricalData({
        tickers,
        tickerToTempTickerMap,
        startDate,
        endDate
      })
    ])
    const [quotes, historicalData] = newRequest.map((item) => item.value)
    // // 不存資料庫直接打 yahoo api
    return { quotes, historicalData }

    // tempTickers.forEach((tempTicker) => {
    //   const quoteset = quotes[tempTicker]
    //   const dataset = historicalData[tempTicker]
    //   closeCacheRef.child('quotes').child(tempTicker).set(quoteset)
    //   closeCacheRef.child('historicalData').child(tempTicker).set(dataset)
    // })
    // console.log('extraQuotes', quotes)
    // console.log('extraData', historicalData)

    const newCloseCacheSnapshot = await closeCacheRef.once('value')
    return newCloseCacheSnapshot.val()
  }

  async function getHistoricalData({
    tickers,
    tickerToTempTickerMap,
    startDate,
    endDate
  }) {
    const rawData = await yahooFinance.historical({
      symbols: tickers,
      from: startDate,
      to: adjustDate(endDate, 'plus'),
      period: 'd'
    })

    // rename keys to tempTicker and replace date obj with yyyy-mm-dd
    const dataEntries = Object.entries(rawData).map(([ticker, dataset]) => {
      const tempTicker = tickerToTempTickerMap[ticker]
      const newDataset = dataset.map((item) => {
        const dateString = convertDate2(item.date)
        return { ...item, date: dateString }
      })
      return [tempTicker, newDataset]
    })

    return Object.fromEntries(dataEntries)
  }

  async function getQuotes(tickers, tickerToTempTickerMap) {
    const quotePromise = tickers.map((ticker) => {
      return yahooFinance.quote({
        symbol: ticker,
        modules: ['price']
      })
    })
    const quoteRes = await Promise.allSettled(quotePromise)
    const quotes = quoteRes.reduce((obj, quote) => {
      const { symbol, regularMarketTime, regularMarketPreviousClose } =
        quote.value.price
      const tempTicker = tickerToTempTickerMap[symbol]
      obj[tempTicker] = {
        regularMarketTime,
        previousClose: regularMarketPreviousClose
      }
      return obj
    }, {})

    return quotes
  }

  function convertDate2(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()

    console.log('convertDate2', yyyy + '-' + mm + '-' + dd)

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
    console.log('adjustDate', yyyy + '-' + mm + '-' + dd)

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
