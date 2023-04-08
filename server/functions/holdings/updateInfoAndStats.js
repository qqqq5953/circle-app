const firebaseDb = require('../../firebase/index.js')
const holdingsStatsRef = firebaseDb.ref('/holdingsStats/')
const holdingsLatestInfoRef = firebaseDb.ref('/holdingsLatestInfo/')
const calculateStats = require('../holdings/calculateStats')
const updateDb = require('../holdings/updateDb')

async function updateInfoAndStats(tempTickers, quoteResult, holdingsStats) {
  const updateArr = []

  for (let i = 0; i < quoteResult.length; i++) {
    const resItem = quoteResult[i]
    const tempTicker = tempTickers[i]
    const {
      regularMarketTime,
      marketState,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketPrice: newClose
    } = resItem.value.price

    // calculate new close change
    const { previousCloseChange, previousCloseChangePercent } =
      calculateCloseChange(change, changePercent)

    // calculate new stats
    const { averageCost, totalShares } = holdingsStats[tempTicker]
    const { profitOrLossPercentage, profitOrLossValue } = calculateStats(
      newClose,
      averageCost,
      totalShares
    )

    // update latestInfo
    updateArr.push(
      updateDb(holdingsLatestInfoRef, tempTicker, {
        close: parseFloat(newClose.toFixed(2)),
        marketState,
        regularMarketTime,
        previousCloseChange,
        previousCloseChangePercent
      })
    )

    // update stats
    updateArr.push(
      updateDb(holdingsStatsRef, tempTicker, {
        profitOrLossPercentage,
        profitOrLossValue
      })
    )
  }

  await Promise.allSettled(updateArr)
}

module.exports = updateInfoAndStats

function calculateCloseChange(change, changePercent) {
  const roundedChange = Math.round(change * 100) / 100
  const previousCloseChange =
    roundedChange > 0
      ? '+' + roundedChange.toFixed(2)
      : roundedChange.toFixed(2)
  const previousCloseChangePercent = Math.round(changePercent * 10000) / 100

  return { previousCloseChange, previousCloseChangePercent }
}
