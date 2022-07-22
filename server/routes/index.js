const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance')
const firebaseDb = require('../firebase/index.js')

const holdingRef = firebaseDb.ref('/holding/')
const watchlistRef = firebaseDb.ref('/watchlist/')
const tabsRef = firebaseDb.ref('/tabs/')

const getHoldingsTradeInfo = require('../actions/getHoldingsTradeInfo')
const getHoldingsTotalInfo = require('../actions/getHoldingsTotalInfo')
const getFormattedDate = require('../tools/getFormattedDate')

/* GET home page. */
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
      shortName: name,
      regularMarketPrice: price,
      symbol: ticker,
      regularMarketPreviousClose: previousClose,
      regularMarketTime
    } = priceObj

    const previousCloseChange =
      parseFloat(price - previousClose).toFixed(2) > 0
        ? '+' + parseFloat(price - previousClose).toFixed(2)
        : parseFloat(price - previousClose).toFixed(2)

    const previousCloseChangePercent = parseFloat(
      ((price - previousClose) / previousClose) * 100
    ).toFixed(2)

    const obj = {
      name,
      price,
      ticker,
      regularMarketTime,
      previousCloseChange,
      previousCloseChangePercent
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
      success: true,
      content: '獲得標的失敗',
      errorMessage: err.message,
      result: null
    }
    res.send(msg)
  }
})

router.get('/historical/:period/:from/:to', async (req, res) => {
  const tickerRef = await holdingRef.once('value')
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

router.get('/getHoldings', async (req, res) => {
  console.log(req.protocol + '://' + req.get('host') + req.originalUrl)

  const tickerRef = await holdingRef.once('value')
  const holdings = tickerRef.val()
  // console.log('holdings', holdings)
  if (!holdings) return res.send('no holdings in DB')

  const tickers = Object.keys(holdings)
  let yesterdayQuote = null
  let isMarketOpen = false
  let backward = 0
  while (!isMarketOpen) {
    const quoteOptions = {
      symbols: tickers,
      from: getFormattedDate(backward + 1),
      to: getFormattedDate(backward),
      period: 'd'
    }

    try {
      yesterdayQuote = await yahooFinance.historical(quoteOptions)
      console.log('yesterdayQuote', yesterdayQuote)

      isMarketOpen = Object.values(yesterdayQuote).some(
        (quote) => quote.length !== 0
      )
    } catch (error) {
      res.send({
        content: '資料庫含有無效標的',
        success: false,
        errorMessage: error.message
      })
    }

    backward++
  }

  const holdingsTradeInfo = getHoldingsTradeInfo(holdings)
  const holdingsTotalInfo = getHoldingsTotalInfo(
    tickers,
    yesterdayQuote,
    holdingsTradeInfo
  )

  const msg = {
    success: true,
    content: '成功獲得所有標的',
    errorMessage: null,
    result: holdingsTotalInfo || {}
  }

  res.send(msg)
})

router.get('/getHolding/:ticker', async (req, res) => {
  const ticker = req.params.ticker
  const tickerRef = await holdingRef.child(ticker).once('value')
  const tickerInfo = tickerRef.val()
  // console.log('tickerInfo', tickerInfo)
  if (!tickerInfo) {
    res.send('invalid ticker name')
  } else {
    res.send(tickerInfo)
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

router.post('/addStock', async (req, res) => {
  let message = {}
  const { ticker, cost, shares, date } = req.body

  const stockInfo = holdingRef.child(ticker).push()
  stockInfo.set({ cost, shares, date })
  message = {
    success: true,
    content: '標的新增成功',
    errorMessage: null,
    result: { ticker, cost, shares }
  }
  res.send(message)

  // const checkTickerValid = yahooFinance.quote(ticker, ['summaryProfile'])

  // checkTickerValid
  //   .then(() => {
  //     const stockInfo = holdingRef.child(ticker).push()
  //     stockInfo.set({ cost, shares, date })
  //     message = {
  //       success: true,
  //       content: '標的新增成功',
  //       errorMessage: null
  //     }
  //     res.send(message)
  //   })
  //   .catch((error) => {
  //     console.log('error', error)
  //     message = {
  //       success: false,
  //       content: '無此標的',
  //       errorMessage: error.message
  //     }
  //     res.send(message)
  //   })
})

router.post('/addToWatchlist', async (req, res) => {
  const { ticker, name, currentTab } = req.body

  const list =
    currentTab.toLowerCase() === 'watchlist'
      ? 'default'
      : currentTab.toLowerCase()

  await watchlistRef.child(list).child(ticker).set(name)

  message = {
    success: true,
    content: '標的新增成功',
    errorMessage: null,
    result: { [ticker]: name }
  }
  res.send(message)
})

router.post('/deleteFromWatchlist', async (req, res) => {
  try {
    const { ticker, currentTab } = req.body

    const list =
      currentTab.toLowerCase() === 'watchlist'
        ? 'default'
        : currentTab.toLowerCase()

    await watchlistRef.child(list).child(ticker).remove()

    message = {
      success: true,
      content: '刪除成功',
      errorMessage: null,
      result: { ticker }
    }
    res.send(message)
  } catch (error) {
    message = {
      success: false,
      content: '刪除失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(message)
  }
})

router.get('/getWatchlist/:tab', async (req, res) => {
  const currentTab = req.params.tab

  const list =
    currentTab.toLowerCase() === 'watchlist'
      ? 'default'
      : currentTab.toLowerCase()

  try {
    const watchlistChildRef = await watchlistRef.child(list).once('value')
    const watchlist = watchlistChildRef.val()

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

router.post('/createTab', async (req, res) => {
  const { inputTab } = req.body
  const defaultTab = 'watchlist'

  const response = await tabsRef.once('value')

  const tabs =
    response.val() == null
      ? [defaultTab, inputTab]
      : [...response.val(), inputTab]

  if (response.val() == null) {
    console.log('第一次')
    setTabs()
  } else {
    console.log('非第一次')

    const hasSameTab = response.val().includes(inputTab)
    if (hasSameTab) {
      console.log('hasSameTab')
      const message = {
        success: false,
        content: '新增失敗',
        errorMessage: '已存在相同頁籤',
        result: null
      }
      res.send(message)
      return
    }
    setTabs()
  }

  async function setTabs() {
    console.log('setTabs')

    try {
      await tabsRef.set(tabs)
      const message = {
        success: true,
        content: '新增成功',
        errorMessage: null,
        result: tabs
      }
      res.send(message)
    } catch (error) {
      const message = {
        success: false,
        content: '新增失敗',
        errorMessage: error.message,
        result: null
      }
      res.send(message)
    }
  }
})

router.get('/getTabs', async (req, res) => {
  try {
    let refreshTabs
    const defaultTab = 'watchlist'
    const initTabs = await tabsRef.once('value')

    if (initTabs.val() == null) {
      await tabsRef.set([defaultTab])
      refreshTabs = await tabsRef.once('value')
    }

    const message = {
      success: true,
      content: '成功獲得所有頁籤',
      errorMessage: null,
      result: initTabs.val() || refreshTabs.val()
    }
    res.send(message)
  } catch (error) {
    const message = {
      success: false,
      content: '獲得頁籤失敗',
      errorMessage: error.message,
      result: null
    }
    res.send(message)
  }
})

module.exports = router
