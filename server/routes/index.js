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
  const tickerRef = await holdingRef.once('value')
  const holdings = tickerRef.val()
  if (!holdings) return res.send('invalid ticker name')

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

    yesterdayQuote = await yahooFinance.historical(quoteOptions)

    isMarketOpen = Object.values(yesterdayQuote).every(
      (quote) => quote.length !== 0
    )

    backward++
  }

  const holdingsTradeInfo = getHoldingsTradeInfo(holdings)
  const holdingsTotalInfo = getHoldingsTotalInfo(
    tickers,
    yesterdayQuote,
    holdingsTradeInfo
  )

  res.send(holdingsTotalInfo)
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
router.post('/addStock', async (req, res) => {
  let message = {}
  const { ticker, cost, shares, date } = req.body
  const checkTickerValid = yahooFinance.quote(ticker, ['summaryProfile'])

  checkTickerValid
    .then(() => {
      const stockInfo = holdingRef.child(ticker).push()
      stockInfo.set({ cost, shares, date })
      message = {
        success: true,
        content: '標的新增成功',
        errorMessage: null
      }
      res.send(message)
    })
    .catch((error) => {
      console.log('error', error)
      message = {
        success: false,
        content: '無此標的',
        errorMessage: error.message
      }
      res.send(message)
    })
})

module.exports = router
