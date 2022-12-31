const parseFloatByDecimal = require('../tools/parseFloatByDecimal')

const getHoldingsTradeInfo = (holdingsArray, latestQuotes) => {
  const holdingsTradeInfo = {}

  for (let i = 0; i < holdingsArray.length; i++) {
    const { latestInfo, trade: tickerTradeInfo } = holdingsArray[i]
    const tempTicker = latestInfo.tempTicker
    const close = latestQuotes[i].close

    const { totalCost, totalShares } = Object.values(tickerTradeInfo).reduce(
      (obj, trade) => {
        obj.totalCost += parseFloat(trade.cost) * parseFloat(trade.shares)
        obj.totalShares += parseFloat(trade.shares)

        return obj
      },
      { totalCost: 0, totalShares: 0 }
    )

    const averageCost = parseFloatByDecimal(totalCost / totalShares, 2)
    const profitOrLossPercentage = parseFloatByDecimal(
      ((close - averageCost) * 100) / close,
      2
    )
    const profitOrLossValue = parseFloatByDecimal(
      (close - averageCost) * totalShares,
      2
    )

    holdingsTradeInfo[tempTicker] = {
      latestInfo,
      trade: {
        close,
        totalCost,
        totalShares,
        averageCost,
        profitOrLossPercentage,
        profitOrLossValue
      }
    }
  }

  return holdingsTradeInfo
}

module.exports = getHoldingsTradeInfo
