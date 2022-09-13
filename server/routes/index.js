const express = require('express')
const numberWithCommas = require('../tools/getNumberWithComma')
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
      longName: name,
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
      ticker,
      regularMarketTime,
      price,
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

router.get('/historicalHolding/:period/:from/:to', async (req, res) => {
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

  const list = currentTab.toLowerCase() === 'watchlist' ? 'default' : currentTab

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
      currentTab.toLowerCase() === 'watchlist' ? 'default' : currentTab

    await watchlistRef.child(list).child(ticker).remove()

    const message = {
      success: true,
      content: '刪除成功',
      errorMessage: null,
      result: { ticker }
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

// watchlist

router.get('/getWatchlist/:tab', async (req, res) => {
  const currentTab = req.params.tab

  const list = currentTab.toLowerCase() === 'watchlist' ? 'default' : currentTab

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

router.get('/getAllWatchlists', async (req, res) => {
  try {
    const watchlistsRef = await watchlistRef.once('value')
    const watchlists = watchlistsRef.val()

    const msg = {
      success: true,
      content: '獲得 watchlist',
      errorMessage: null,
      result: watchlists
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

router.post('/createWatchlist', async (req, res) => {
  const { listName } = req.body
  const DEFAULT_TAB = 'Watchlist'

  const initTabs = await tabsRef.once('value')
  const hasSameTab = initTabs.val().includes(listName)

  if (initTabs.val() == null) {
    setTabs(DEFAULT_TAB)
    return
  }

  if (hasSameTab) {
    const message = {
      success: false,
      content: '新增失敗',
      errorMessage: '已存在相同頁籤',
      result: null
    }
    res.send(message)
    return
  }
  setTabs(listName)

  async function setTabs(tab) {
    const tabs =
      initTabs.val() == null
        ? [DEFAULT_TAB, listName]
        : [...initTabs.val(), listName]

    try {
      await tabsRef.set(tabs)
      const message = {
        success: true,
        content: '新增成功',
        errorMessage: null,
        result: tab
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

router.post('/deleteWatchlist', async (req, res) => {
  try {
    const { currentTab } = req.body
    const tabs = await tabsRef.once('value')
    const newTabs = tabs.val().filter((tab) => tab !== currentTab)

    await tabsRef.set(newTabs)
    await watchlistRef.child(currentTab).remove()

    const message = {
      success: true,
      content: '刪除成功',
      errorMessage: null,
      result: newTabs
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

router.get('/getTabs', async (req, res) => {
  try {
    let refreshTabs
    const DEFAULT_TAB = 'Watchlist'
    const initTabs = await tabsRef.once('value')

    if (initTabs.val() == null) {
      await tabsRef.set([DEFAULT_TAB])
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

router.post('/editTab', async (req, res) => {
  try {
    const { oldTab, newTab } = req.body
    const tabs = await tabsRef.once('value')
    const allTabs = tabs.val()
    const idx = allTabs.indexOf(oldTab)
    allTabs.splice(idx, 1, newTab)

    const targetList = await watchlistRef.child(oldTab).once('value')

    if (targetList.val() !== null) {
      await watchlistRef.child(oldTab).remove()
      await watchlistRef.child(newTab).set(targetList.val())
    }
    await tabsRef.set(allTabs)

    const message = {
      success: true,
      content: '編輯成功',
      errorMessage: null,
      result: { newTab, allTabs }
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

// stockInfo
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
            Beta: beta.toFixed(2) || '---',
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
  const ticker = req.params.ticker
  const window_5Y = { to: getFormattedDate(0), from: getFormattedDate(1825) }
  const quoteOptions = {
    symbols: [ticker],
    ...window_5Y,
    period: 'd'
  }

  try {
    const response = await yahooFinance.historical(quoteOptions)
    // console.log('response', response)
    const quotes = response[ticker]
    const priceTrend = quotes.map((item) => {
      const year = item.date.getFullYear()
      const month = item.date.getMonth() + 1
      const date = item.date.getDate()
      const fullDate = `${year}/${month}/${date}`

      return { date: fullDate, close: parseFloat(item.close.toFixed(2)) }
    })

    const message = {
      success: true,
      content: '取得成功',
      errorMessage: null,
      result: priceTrend
    }

    res.send(message)
  } catch (error) {
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
