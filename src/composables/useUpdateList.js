import http from '@/api/index'
export default function useUpdateList() {
  async function updateList(watchlist, tabName) {
    const newMarketData = await fetchMarketData(watchlist)
    const [allPromises, newList] = checkUpdate(
      newMarketData,
      watchlist,
      tabName
    )

    if (allPromises.length !== 0) await updateMarketData(allPromises)
    // await updateMarketData(allPromises)
    return newList
  }

  async function fetchMarketData(watchlist) {
    const listPromises = watchlist.map((item) =>
      http.get(`/api/latestMarketData/${item.ticker}`)
    )

    try {
      const res = await Promise.allSettled(listPromises)
      const newMarketData = res
        .filter((item) => item.value)
        .map((item) => {
          return item.value.data.result
        })

      return newMarketData
    } catch (error) {
      console.log('error', error)
    }
  }

  function checkUpdate(newMarketData, watchlist, tabName) {
    const newList = [...watchlist]
    const allPromises = []

    for (let i = 0; i < watchlist.length; i++) {
      const { price, tempTicker } = watchlist[i]

      if (price === newMarketData[i].price) continue

      newList[i] = { ...watchlist[i], ...newMarketData[i] }

      if (isUpdateError(newList[i], newMarketData[i])) continue

      const url = `/api/ticker/${tabName}/${tempTicker}`
      console.log('checkUpdate url', url)
      const updatePromise = http.put(url, {
        newItem: newMarketData[i]
      })

      allPromises.push(updatePromise)
    }

    console.log('checkUpdate 更新至資料庫')

    return [allPromises, newList]
  }

  async function updateMarketData(allPromises) {
    const updatedTickers = await Promise.allSettled(allPromises)

    return updatedTickers
  }

  function checkMarketState(watchlist) {
    if (!watchlist) return

    const marketStateIdx = watchlist.findIndex(
      (item) => item.marketState === 'REGULAR'
    )
    const isAllMarketClose = marketStateIdx === -1
    return isAllMarketClose
  }

  function isUpdateError(listA, listB) {
    return JSON.stringify(listA) === JSON.stringify(listB)
  }

  return {
    updateList,
    fetchMarketData,
    checkMarketState,
    updateMarketData,
    isUpdateError
  }
}
