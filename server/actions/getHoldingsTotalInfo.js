const parseFloatByDecimal = require('../tools/parseFloatByDecimal')

const getHoldingsTotalInfo = (tickers, historicalData, holdingsTradeInfo) => {
  const holdingsTotalInfo = {}

  tickers.forEach((ticker) => {
    const stockHistoricalData = historicalData[ticker][0]
    const stockTradeInfo = holdingsTradeInfo[ticker]

    const { close } = stockHistoricalData
    const { averageCost, totalShares } = stockTradeInfo

    const profitOrLossPercentage = parseFloatByDecimal(
      ((close - averageCost) * 100) / close,
      2
    )
    const profitOrLossValue = parseFloatByDecimal(
      (close - averageCost) * totalShares,
      2
    )

    stockHistoricalData.close = parseFloatByDecimal(close, 2)

    holdingsTotalInfo[ticker] = {
      ...stockHistoricalData,
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
