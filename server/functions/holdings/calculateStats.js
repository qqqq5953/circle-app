const parseFloatByDecimal = require('../../tools/parseFloatByDecimal')

function calculateStats(close, averageCost, totalShares) {
  const profitOrLossPercentage = parseFloatByDecimal(
    ((close - averageCost) * 100) / averageCost,
    2
  )
  const profitOrLossValue = parseFloatByDecimal(
    (close - averageCost) * totalShares,
    2
  )

  return { profitOrLossPercentage, profitOrLossValue }
}

module.exports = calculateStats
