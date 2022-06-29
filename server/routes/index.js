const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance')
const firebaseDb = require('../firebase/index.js')

const holdingRef = firebaseDb.ref('/holding/')
const getHoldingsTradeInfo = require('../actions/getHoldingsTradeInfo')
const getHoldingsTotalInfo = require('../actions/getHoldingsTotalInfo')
const getFormattedDate = require('../tools/getFormattedDate')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/quote', async (req, res) => {
  const quoteOptions = {
    symbol: 'AAPL',
    modules: ['price']
  }

  try {
    const { price } = await yahooFinance.quote(quoteOptions)
    const obj = {
      price: price.regularMarketPrice,
      symbol: price.symbol,
      regularMarketTime: price.regularMarketTime,
      currency: price.currency,
      currencySymbol: price.currencySymbol
    }
    res.send(obj)
  } catch (err) {
    console.log('err', err.message)
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

module.exports = router
