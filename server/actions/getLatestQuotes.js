const getLatestQuotes = async (holdingsArray, holdingRef, yahooFinance) => {
  const updateMarketInfo = (tempTicker, marketInfo) => {
    holdingRef.child(tempTicker).child('latestInfo').update(marketInfo)
  }

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
      regularMarketPrice: close
    } = item.value.price

    const tempTicker = tempTickers[i]
    const marketInfo = { close, marketState, regularMarketTime }
    updateMarketInfo(tempTicker, marketInfo)

    return { regularMarketTime, marketState, close }
  })

  return latestQuotes
}

module.exports = getLatestQuotes
