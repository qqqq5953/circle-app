import http from '@/api/index'
import useWatchlistStore from '@/stores/watchlistStore.js'
import { storeToRefs } from 'pinia'

export default function useUpdateList() {
  const $store = useWatchlistStore()
  const { currentTab } = storeToRefs($store)

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
      const newMarketData = res.map((item) => item.value.data.result)
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
      // if (price === newMarketData[i].price) continue

      newList[i] = { ...watchlist[i], ...newMarketData[i] }
      const url = `/api/ticker/${tabName}/${tempTicker}`
      console.log('checkUpdate url', url)

      allPromises.push(
        http.put(url, {
          newItem: newMarketData[i]
        })
      )
    }

    console.log('checkUpdate 更新至資料庫')

    return [allPromises, newList]
  }

  async function updateMarketData(allPromises) {
    const updatedTickers = await Promise.allSettled(allPromises)

    return updatedTickers
  }

  function checkMarketState(watchlist) {
    // console.log('checkMarketState watchlist', watchlist)
    if (!watchlist) return

    const marketStateIdx = watchlist.findIndex(
      (item) => item.marketState === 'REGULAR'
    )

    console.log('checkMarketState marketStateIdx', marketStateIdx)

    const isAllMarketClose = marketStateIdx === -1
    return isAllMarketClose
  }

  return {
    updateList,
    fetchMarketData,
    checkMarketState,
    updateMarketData,
    currentTab
  }
}
