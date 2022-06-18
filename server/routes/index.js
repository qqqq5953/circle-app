const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance')
const firebaseDb = require('../firebase/index.js')

const holdingRef = firebaseDb.ref('/holding/')
const getHoldingsTradeInfo = require('../actions/getHoldingsTradeInfo')
const getHoldingsTotalInfo = require('../actions/getHoldingsTotalInfo')

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

router.get('/historical', async (req, res) => {
  const quoteOptions = {
    symbols: ['AAPL', 'TSLA'],
    from: '2022-06-13',
    to: '2022-06-14',
    period: 'd'
  }

  try {
    const quote = await yahooFinance.historical(quoteOptions)
    // console.log('quote', quote)
    res.send(quote)
  } catch (err) {
    console.log('err', err.message)
  }
})

router.get('/getHoldings', async (req, res) => {
  const tickerRef = await holdingRef.once('value')
  const holdings = tickerRef.val()
  if (!holdings) return res.send('invalid ticker name')

  const tickers = Object.keys(holdings)
  const quoteOptions = {
    symbols: tickers,
    from: '2022-06-13',
    to: '2022-06-14',
    period: 'd'
  }
  const historicalData = await yahooFinance.historical(quoteOptions)
  const holdingsTradeInfo = getHoldingsTradeInfo(holdings)

  const holdingsTotalInfo = getHoldingsTotalInfo(
    tickers,
    historicalData,
    holdingsTradeInfo
  )
  res.send(holdingsTotalInfo)

  // if (!holdings) {
  //   res.send('invalid ticker name')
  // } else {
  //   res.send(holdingsTotalInfo)
  // }
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
router.post('/setHoldings', async (req, res) => {
  const { ticker, cost, shares, date } = req.body
  const stockInfo = holdingRef.child(ticker).push()
  stockInfo.set({ cost, shares, date })

  res.send(ticker)
})

module.exports = router
