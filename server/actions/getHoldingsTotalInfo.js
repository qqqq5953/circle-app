// const parseFloatByDecimal = require('../tools/parseFloatByDecimal')

const getHoldingsTotalInfo = (holdingsTradeInfo, latestQuotes, tempTickers) => {
  const holdingsTotalInfo = {}

  for (let i = 0; i < tempTickers.length; i++) {
    const tempTicker = tempTickers[i]
    const latestQuote = latestQuotes[i]
    const stockTradeInfo = holdingsTradeInfo[tempTicker]

    const { close } = latestQuote
    const { averageCost, totalShares } = stockTradeInfo

    const profitOrLossPercentage = parseFloat(
      (((close - averageCost) * 100) / close).toFixed(2)
    )
    const profitOrLossValue = parseFloat(
      ((close - averageCost) * totalShares).toFixed(2)
    )

    holdingsTotalInfo[tempTicker] = {
      ...latestQuote,
      ...stockTradeInfo,
      profitOrLossPercentage,
      profitOrLossValue
    }
  }
  // for (let i = 0; i < tempTickers.length; i++) {
  //   const ticker = tickers[i]
  //   const tempTicker = tempTickers[i]
  //   const stockYesterdayQuote = yesterdayQuote[ticker][0]
  //   const stockTradeInfo = holdingsTradeInfo[tempTicker]
  //   console.log('stockYesterdayQuote', stockYesterdayQuote)
  //   console.log('stockTradeInfo', stockTradeInfo)

  //   const { close } = stockYesterdayQuote
  //   const { averageCost, totalShares } = stockTradeInfo

  //   const profitOrLossPercentage = parseFloat(
  //     (((close - averageCost) * 100) / close).toFixed(2)
  //   )

  //   const profitOrLossValue = parseFloat(
  //     ((close - averageCost) * totalShares).toFixed(2)
  //   )

  //   stockYesterdayQuote.close = parseFloat(close.toFixed(2))

  //   holdingsTotalInfo[tempTicker] = {
  //     ...stockYesterdayQuote,
  //     ...stockTradeInfo,
  //     profitOrLossPercentage,
  //     profitOrLossValue
  //   }
  // }

  // tickers.forEach((ticker) => {
  //   const stockYesterdayQuote = yesterdayQuote[ticker][0]
  //   const stockTradeInfo = holdingsTradeInfo[ticker]

  //   const { close } = stockYesterdayQuote
  //   const { averageCost, totalShares } = stockTradeInfo

  //   const profitOrLossPercentage = parseFloatByDecimal(
  //     ((close - averageCost) * 100) / close,
  //     2
  //   )
  //   const profitOrLossValue = parseFloatByDecimal(
  //     (close - averageCost) * totalShares,
  //     2
  //   )

  //   stockYesterdayQuote.close = parseFloatByDecimal(close, 2)

  //   holdingsTotalInfo[ticker] = {
  //     ...stockYesterdayQuote,
  //     ...stockTradeInfo,
  //     profitOrLossPercentage,
  //     profitOrLossValue
  //   }

  //   // console.log('stockHistoricalData', stockHistoricalData)
  //   // console.log('stockTradeInfo', stockTradeInfo)
  //   // console.log('close', typeof close)
  //   // console.log('averageCost', typeof averageCost)
  //   // console.log('totalShares', typeof totalShares)
  //   // console.log('holdingsTotalInfo', holdingsTotalInfo)
  // })

  return holdingsTotalInfo
}

module.exports = getHoldingsTotalInfo
