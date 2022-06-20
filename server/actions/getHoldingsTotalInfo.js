const parseFloatByDecimal = require('../tools/parseFloatByDecimal')

const getHoldingsTotalInfo = (tickers, yesterdayQuote, holdingsTradeInfo) => {
  const holdingsTotalInfo = {}

  tickers.forEach((ticker) => {
    const stockYesterdayQuote = yesterdayQuote[ticker][0]
    const stockTradeInfo = holdingsTradeInfo[ticker]

    const { close } = stockYesterdayQuote
    const { averageCost, totalShares } = stockTradeInfo

    const profitOrLossPercentage = parseFloatByDecimal(
      ((close - averageCost) * 100) / close,
      2
    )
    const profitOrLossValue = parseFloatByDecimal(
      (close - averageCost) * totalShares,
      2
    )

    stockYesterdayQuote.close = parseFloatByDecimal(close, 2)

    holdingsTotalInfo[ticker] = {
      ...stockYesterdayQuote,
      ...stockTradeInfo,
      profitOrLossPercentage,
      profitOrLossValue
    }

    // console.log('stockHistoricalData', stockHistoricalData)
    // console.log('stockTradeInfo', stockTradeInfo)
    // console.log('close', typeof close)
    // console.log('averageCost', typeof averageCost)
    // console.log('totalShares', typeof totalShares)
    // console.log('holdingsTotalInfo', holdingsTotalInfo)
  })

  return holdingsTotalInfo
}

module.exports = getHoldingsTotalInfo
