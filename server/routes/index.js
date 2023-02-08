const express = require('express')
const numberWithCommas = require('../tools/getNumberWithComma')
const router = express.Router()
const fetch = require('node-fetch')
const yahooFinance = require('yahoo-finance')
const firebaseDb = require('../firebase/index.js')

const historyRef = firebaseDb.ref('/history/')
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

router.post('/addStock', async (req, res) => {
  const {
    previousCloseChange,
    previousCloseChangePercent,
    price: close,
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
    historyRef.child(tradeInfo.tradeDate).child(id).set(trade)

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
    const errorMsg = []
    const hasFetch = {}
    const resPromise = await Promise.allSettled([
      historyRef.once('value'),
      holdingsTickersRef.once('value'),
      closeCacheRef.once('value')
    ])
    const [historySnapshot, tickersSnapshot, closeCacheSnapshot] = resPromise

    if (!historySnapshot.value.val()) {
      return res.send({
        success: true,
        content: '尚未有紀錄',
        errorMessage: null,
        result: null
      })
    }

    const dates = Object.keys(historySnapshot.value.val())
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]
    // console.log('startDate', startDate)
    // console.log('endDate', endDate)

    const tickers = []
    const tempTickers = []
    const tempTickerToTickerMap = tickersSnapshot.value.val()
    const tickerEntries = Object.entries(tempTickerToTickerMap).map(
      ([tempTicker, ticker]) => {
        tickers.push(ticker)
        tempTickers.push(tempTicker)
        return [ticker, tempTicker]
      }
    )
    const tickerToTempTickerMap = Object.fromEntries(tickerEntries)

    let historicalData
    let quotes

    // // 不存資料庫直接打 yahoo api
    // const cacheSnapshot = await updateCache({
    //   tickers,
    //   tempTickers,
    //   tickerToTempTickerMap,
    //   startDate,
    //   endDate
    // })
    // historicalData = cacheSnapshot.historicalData
    // quotes = cacheSnapshot.quotes

    const isInitUpdate = checkUpdateTime()
    const weekDay = new Date().getDay()
    const isWeekend = weekDay === '6' || weekDay === '0'
    if (isInitUpdate && !isWeekend) {
      cacheSnapshot = await updateCache({
        tickers,
        tempTickers,
        tickerToTempTickerMap,
        startDate,
        endDate
      })
      historicalData = cacheSnapshot.historicalData
      quotes = cacheSnapshot.quotes
    }

    if (!closeCacheSnapshot.value.val()) {
      console.log('準備第一次新增')

      cacheSnapshot = await updateCache({
        tickers,
        tempTickers,
        tickerToTempTickerMap,
        startDate,
        endDate
      })
      historicalData = cacheSnapshot.historicalData
      quotes = cacheSnapshot.quotes
    }

    if (closeCacheSnapshot.value.val()) {
      let cacheSnapshot = closeCacheSnapshot.value.val()
      historicalData = cacheSnapshot.historicalData
      quotes = cacheSnapshot.quotes

      const newTemptickers = tempTickers.filter((tempTicker) => {
        const dataset = closeCacheSnapshot.value
          .child('quotes')
          .child(tempTicker)
          .val()
        return !dataset
      })

      // 新加入標的後要取得'該標的'資料
      if (newTemptickers.length) {
        console.log('有新增資料')
        const newTickers = newTemptickers.map(
          (tempTicker) => tempTickerToTickerMap[tempTicker]
        )

        cacheSnapshot = await updateCache({
          tickers: newTickers,
          tempTickers: newTemptickers,
          tickerToTempTickerMap,
          startDate,
          endDate
        })
      }

      console.log('用資料庫資料')
      historicalData = cacheSnapshot.historicalData
      quotes = cacheSnapshot.quotes
    }
    // console.log('historicalData', historicalData)
    console.log('quotes', quotes)

    // 匯率
    const codeToCurrencyMap = {
      tw: 'TWD',
      us: 'USDTWD',
      mf: 'USDTWD',
      uk: 'GBPTWD',
      hk: 'HKDTWD',
      ks: 'KRWTWD'
    }
    const currencies = ['TWD', 'USD', 'GBP', 'HKD', 'KRW']
    const fxRates = await fecthFxRates(currencies)
    console.log('fxRates', fxRates)

    // console.log('historySnapshot', historySnapshot.value.val())

    // 計算每日 asset
    const history_NonAcc = []
    let currentIdx = 0

    const newHistorySnapshot = await historyRef.once('value')
    newHistorySnapshot.forEach((childSnapshot) => {
      // trades 按日期由舊到新
      const trades = childSnapshot.val()
      const tradesArr = Object.values(trades)
      // console.log('trades', trades)

      const totalStats = {
        date: '',
        totalCost: 0,
        totalMarketValue: 0,
        totalShares: 0,
        trades: []
      }

      for (let i = 0; i < tradesArr.length; i++) {
        const trade = tradesArr[i]
        const { cost, shares, ticker, tempTicker, tradeDate, code } = trade
        const fetchKey = `${ticker}_${tradeDate}`
        // const tempTicker = ticker.includes('.')?

        console.log('=====ticker====', ticker, tradeDate, cost, shares)

        if (!totalStats.date) totalStats.date = tradeDate

        // 同日同標的只會抓一次市場資料
        if (!hasFetch[fetchKey]) {
          // 用對比 tradeDate 來找交易當天的市場資料
          const foundIdx = historicalData[tempTicker].findIndex(
            (item) => item.date === tradeDate
          )

          /*
            紀錄當前 index，如果 foundIdx 存在（不為 -1）才紀錄，
            如果 foundIdx 為 -1，則不紀錄，currentIdx 為前一次迴圈的 idx，
            使得沒有開盤的日子的資料會沿用前一個開盤日的資料
            */
          if (foundIdx !== -1) currentIdx = foundIdx

          // console.log('foundIdx', foundIdx)
          // console.log('currentIdx', currentIdx)
          // console.log(
          //   'historicalData[ticker][currentIdx]',
          //   historicalData[ticker][currentIdx]
          // )

          const data = historicalData[tempTicker][currentIdx]
          if (data) {
            // 紀錄交易日要採用哪天的市場資料
            hasFetch[fetchKey] = {
              hasInfoDate: data.date,
              close: data.close
            }
          } else {
            console.log('日期超出歷史資料範圍')
            errorMsg.push('日期超出歷史資料範圍')
            continue
          }
        }

        // historical 模組找不到 close，用 quote 模組代替
        if (!hasFetch[fetchKey].close) {
          hasFetch[fetchKey].close = quotes[tempTicker].previousClose
        }

        // console.log('hasFetch', hasFetch)
        const { hasInfoDate, close } = hasFetch[fetchKey]
        const currency = codeToCurrencyMap[code]
        const exchangeRate = fxRates[currency]
        // console.log('currency:', currency)
        // console.log('exchangeRate:', exchangeRate)

        totalStats.totalMarketValue += parseFloatByDecimal(
          exchangeRate * close * shares,
          2
        )
        totalStats.totalCost += parseFloatByDecimal(
          exchangeRate * cost * shares,
          2
        )
        totalStats.totalShares += parseFloat(shares)
        totalStats.trades.push({
          ...trade,
          closeDate: hasInfoDate,
          close: parseFloatByDecimal(close, 2),
          value: parseFloatByDecimal(exchangeRate * close * shares, 2),
          profitOrLossChange: parseFloatByDecimal(close - cost, 2),
          profitOrLossPercentage: parseFloatByDecimal(
            ((close - cost) * 100) / cost,
            2
          )
        })

        // console.log('totalStats.totalMarketValue', totalStats.totalMarketValue)
      }

      history_NonAcc.push(totalStats)
    })

    const msg = {
      success: true,
      content: '成功獲得所有標的',
      errorMessage: null,
      result: null
    }

    if (errorMsg.length === 0) {
      // 計算累積 asset
      const accObj = { date: '', totalCost: 0, totalMarketValue: 0 }
      const history_Acc = history_NonAcc.reduce((arr, data) => {
        const { date, totalCost, totalMarketValue } = data
        accObj.date = date
        accObj.totalCost += totalCost
        accObj.totalMarketValue += totalMarketValue
        arr.push({ ...accObj })

        return arr
      }, [])

      msg.result = { nonAccData: history_NonAcc, accData: history_Acc }
    } else {
      msg.success = false
      msg.content = '獲得標的失敗'
      msg.errorMessage = errorMsg
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

  async function fecthFxRates(currencies) {
    const fxRateApi = 'https://api.coinbase.com/v2/exchange-rates'
    const fetchPromise = currencies.map((currency) => {
      return fetch(`${fxRateApi}?currency=${currency}`)
    })
    const fetchRes = await Promise.allSettled(fetchPromise)
    const jsonPromise = fetchRes.map((item) => item.value.json())
    const currencyRes = await Promise.allSettled(jsonPromise)
    const fxRates = currencyRes.reduce((obj, item) => {
      const { currency, rates } = item.value.data
      if (currency !== 'TWD') {
        obj[`${currency}TWD`] = rates.TWD
      } else {
        obj[`TWD`] = rates.TWD
      }

      return obj
    }, {})

    return fxRates
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
    // return { quotes, historicalData }

    tempTickers.forEach((tempTicker) => {
      const quoteset = quotes[tempTicker]
      const dataset = historicalData[tempTicker]
      closeCacheRef.child('quotes').child(tempTicker).set(quoteset)
      closeCacheRef.child('historicalData').child(tempTicker).set(dataset)
    })
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
      to: convertDate1(endDate),
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
  function convertDate1(yyyymmdd) {
    const unix = Date.parse(yyyymmdd)
    // 加一天（84600000）才能要得到當天資料，例如結束日期為 1/27，實際上 fetch 的資料範圍結束日為 1/26
    const dateObj = new Date(unix + 84600000)
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    console.log('convertDate1', yyyy + '-' + mm + '-' + dd)

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
