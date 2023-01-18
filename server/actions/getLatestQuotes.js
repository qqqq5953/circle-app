const getLatestQuotes = async (holdingsArray, holdingRef, yahooFinance) => {
  const { tempTickers, quotePromises } = holdingsArray.reduce(
    (obj, holding) => {
      const { ticker, tempTicker } = holding.latestInfo
      const quoteOptions = { symbol: ticker, modules: ['price'] }
      const quotePromises = yahooFinance.quote(quoteOptions)

      obj.tempTickers.push(tempTicker)
      obj.quotePromises.push(quotePromises)
      return obj
    },
    { tempTickers: [], quotePromises: [] }
  )

  const quoteResult = await Promise.allSettled(quotePromises)
  const latestQuotes = quoteResult.map((item, i) => {
    const {
      regularMarketTime,
      marketState,
      regularMarketChange,
      regularMarketChangePercent,
      regularMarketPrice: close
    } = item.value.price

    const roundedChange = Math.round(regularMarketChange * 100) / 100
    const previousCloseChange =
      roundedChange > 0
        ? '+' + roundedChange.toFixed(2)
        : roundedChange.toFixed(2)
    const previousCloseChangePercent =
      Math.round(regularMarketChangePercent * 10000) / 100

    const tempTicker = tempTickers[i]
    const latestInfo = {
      close,
      marketState,
      regularMarketTime,
      previousCloseChange,
      previousCloseChangePercent
    }
    updateMarketInfo(tempTicker, latestInfo)

    function updateMarketInfo(tempTicker, latestInfo) {
      holdingRef.child(tempTicker).child('latestInfo').update(latestInfo)
    }

    return latestInfo
  })

  return latestQuotes
}

module.exports = getLatestQuotes
