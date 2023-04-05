const yahooFinance = require('yahoo-finance')

async function fetchNewQuotes(latestInfoObj) {
  try {
    const tempTickers = []
    const quotePromises = []

    Object.keys(latestInfoObj).forEach((tempTicker) => {
      const ticker = latestInfoObj[tempTicker].ticker
      const quoteOptions = { symbol: ticker, modules: ['price'] }
      const quotePromise = yahooFinance.quote(quoteOptions)

      tempTickers.push(tempTicker)
      quotePromises.push(quotePromise)
    })

    return { tempTickers, quotePromises }
  } catch (error) {
    console.log('error', error)
  }
}

module.exports = fetchNewQuotes
