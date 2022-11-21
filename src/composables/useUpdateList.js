import http from '@/api/index'
import useWatchlistStore from '@/stores/watchlistStore.js'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

export default function useUpdateList() {
  const $store = useWatchlistStore()
  const { currentTab } = storeToRefs($store)

  watch(currentTab, (newTab) => {
    console.log('newTab', newTab)
  })

  async function updateList(watchlist) {
    const currentList = currentTab.value
    const newMarketData = await fetchMarketData(watchlist)
    const [allPromises, currentWatchlist] = checkUpdate(
      newMarketData,
      watchlist,
      currentList
    )

    // if (allPromises.length !== 0) await updateMarketData(allPromises)
    await updateMarketData(allPromises)
    return currentWatchlist
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

  function checkUpdate(newMarketData, watchlist, currentList) {
    console.log('checkUpdate')

    const newList = [...watchlist]
    const allPromises = []

    for (let i = 0; i < watchlist.length; i++) {
      const { price, tempTicker } = watchlist[i]
      // if (price === newMarketData[i].price) continue

      newList[i] = { ...watchlist[i], ...newMarketData[i] }
      const url = `/api/ticker/${currentList}/${tempTicker}`
      console.log('checkUpdate url', url)

      allPromises.push(
        http.put(url, {
          newItem: newMarketData[i]
        })
      )
    }

    return [allPromises, newList]
  }

  async function updateMarketData(allPromises) {
    await Promise.allSettled(allPromises)
  }

  function checkMarketState(watchlist) {
    if (!watchlist) return

    const marketStateIdx = watchlist.findIndex(
      (item) => item.marketState === 'REGULAR'
    )
    const isAllMarketClose = marketStateIdx === -1
    return isAllMarketClose
  }

  return {
    updateList,
    fetchMarketData,
    checkUpdate,
    checkMarketState,
    currentTab
  }
}
