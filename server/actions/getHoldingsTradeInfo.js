// const parseFloatByDecimal = require('../tools/parseFloatByDecimal')

const getHoldingsTradeInfo = (holdings) => {
  let holdingsTradeInfo = {}

  const holdingsArray = Object.entries(holdings)
  for (let i = 0; i < holdingsArray.length; i++) {
    const stock = holdingsArray[i]
    const [ticker, tradeDetails] = stock
    let totalCost = 0
    let totalShares = 0

    for (let uid in tradeDetails) {
      const trade = tradeDetails[uid]
      totalCost += parseFloat(trade.cost) * parseFloat(trade.shares)
      totalShares += parseFloat(trade.shares)
    }

    holdingsTradeInfo[ticker] = {
      totalCost,
      totalShares,
      averageCost: parseFloat((totalCost / totalShares).toFixed(2))
    }
  }

  // Object.entries(holdings).forEach((stock) => {
  //   const [ticker, tradeDetails] = stock
  //   let totalCost = 0
  //   let totalShares = 0

  //   for (let uid in tradeDetails) {
  //     const trade = tradeDetails[uid]
  //     totalCost += parseFloat(trade.cost) * parseFloat(trade.shares)
  //     totalShares += parseFloat(trade.shares)
  //   }

  //   holdingsTradeInfo[ticker] = {
  //     totalCost,
  //     totalShares,
  //     averageCost: parseFloatByDecimal(totalCost / totalShares, 2)
  //   }
  // })
  return holdingsTradeInfo
}

module.exports = getHoldingsTradeInfo
