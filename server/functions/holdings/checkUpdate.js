const calculateStats = require('../holdings/calculateStats')
const updateDb = require('../holdings/updateDb')
const firebaseDb = require('../../firebase/index.js')
const holdingsStatsRef = firebaseDb.ref('/holdingsStats/')
const holdingsLatestInfoRef = firebaseDb.ref('/holdingsLatestInfo/')

async function checkUpdate(
  tempTickers,
  quoteResult,
  latestInfoObj,
  holdingsStats
) {
  try {
    let hasUpdate = false

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

      // 收盤價如果相等表示是最新的，不用更新
      if (newClose === latestInfoObj[tempTicker].close) continue

      // calculate new close change
      const { previousCloseChange, previousCloseChangePercent } =
        calculateCloseChange(change, changePercent)

      // update latestInfo
      updateDb(holdingsLatestInfoRef, tempTicker, {
        close: parseFloat(newClose.toFixed(2)),
        marketState,
        regularMarketTime,
        previousCloseChange,
        previousCloseChangePercent
      })

      // calculate new stats
      const { averageCost, totalShares } = holdingsStats[tempTicker]
      const { profitOrLossPercentage, profitOrLossValue } = calculateStats(
        newClose,
        averageCost,
        totalShares
      )

      // update stats
      updateDb(holdingsStatsRef, tempTicker, {
        profitOrLossPercentage,
        profitOrLossValue
      })

      hasUpdate = true
    }

    return hasUpdate
  } catch (error) {
    console.log('error', error)
  }
}

module.exports = checkUpdate

function calculateCloseChange(change, changePercent) {
  const roundedChange = Math.round(change * 100) / 100
  const previousCloseChange =
    roundedChange > 0
      ? '+' + roundedChange.toFixed(2)
      : roundedChange.toFixed(2)
  const previousCloseChangePercent = Math.round(changePercent * 10000) / 100

  return { previousCloseChange, previousCloseChangePercent }
}
