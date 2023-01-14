const express = require('express')
const numberWithCommas = require('../tools/getNumberWithComma')
const router = express.Router()
const yahooFinance = require('yahoo-finance')
const firebaseDb = require('../firebase/index.js')

const holdingRef = firebaseDb.ref('/holding/')
const watchlistRef = firebaseDb.ref('/watchlist/')
const tabsRef = firebaseDb.ref('/tabs/')

const getHoldingsTradeInfo = require('../actions/getHoldingsTradeInfo')
const getLatestQuotes = require('../actions/getLatestQuotes')
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
      regularMarketTime,
      marketState
    } = priceObj

    const previousCloseChange =
      parseFloat(price - previousClose) > 0
        ? '+' + parseFloat(price - previousClose).toFixed(2)
        : parseFloat(price - previousClose).toFixed(2)

    const previousCloseChangePercent = parseFloat(
      ((price - previousClose) / previousClose) * 100
    ).toFixed(2)

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

router.get('/getHoldings', async (req, res) => {
  try {
    const holdingSnapshot = await holdingRef.once('value')
    const holdingsObj = holdingSnapshot.val()
    if (!holdingsObj) {
      return res.send({
        success: true,
        content: '無標的',
        errorMessage: null,
        result: null
      })
    }

    const holdingsArray = Object.values(holdingsObj)

    const latestQuotes = await getLatestQuotes(
      holdingsArray,
      holdingRef,
      yahooFinance
    )

    const holdingsTradeInfo = getHoldingsTradeInfo(holdingsArray, latestQuotes)

    const msg = {
      success: true,
      content: '成功獲得所有標的',
      errorMessage: null,
      result: holdingsTradeInfo || null
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
  console.log('req.body', req.body)
  const { previousCloseChange, previousCloseChangePercent, price, ...rest } =
    req.body

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
    const stockInfo = holdingRef.child(tempTicker).child('trade').push()
    const id = stockInfo.key
    const tradeUnix = Math.floor(Date.parse(tradeInfo.tradeDate) / 1000)

    const latestInfo = {
      close: price,
      style,
      name,
      marketState,
      code,
      regularMarketTime,
      tempTicker,
      ticker
    }

    stockInfo.set({ ...tradeInfo, id, tradeUnix })
    holdingRef.child(tempTicker).child('latestInfo').set(latestInfo)

    const message = {
      success: true,
      content: '標的新增成功',
      errorMessage: null,
      result: { latestInfo, tradeInfo }
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

router.get('/tradeDetails/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker
    const tickerRef = await holdingRef.child(ticker).once('value')
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

    const tradeObj = tradeDetails.trade
    const tradeArray = [...Object.values(tradeObj)].sort((a, b) => {
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
