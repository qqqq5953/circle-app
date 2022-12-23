import { defineStore } from 'pinia'
import { ref, onBeforeUnmount } from 'vue'
import useUpdateList from '@/composables/useUpdateList.js'
import useSort from '@/composables/useSort.js'
import http from '../api/index'

const useWatchlistStore = defineStore('watchlist', () => {
  const currentTab = ref(null)
  const DEFAULT_TAB = ref('Watchlist')
  const tabs = ref([])
  const cachedList = ref({})

  onBeforeUnmount(() => {
    console.log('useWatchlistStore onBeforeUnmount')
    clearTimeout(timeoutId.value)

    // reset to true so that searchBar will focus()
    isWatchlistLoading.value = true
  })

  const setTabsInfo = (tab, listLength) => {
    const currentTabInfo = tabs.value.find((item) => item.name === tab)

    if (currentTabInfo.listLength === listLength) return

    currentTabInfo.listLength = listLength
  }

  const setTabs = (tab) => {
    // console.log('setTabs', tab)
    if (typeof tab === 'object') {
      tabs.value.length = 0
      tabs.value.push(...tab)
      return
    }
  }

  const showCurrentTab = (tab) => {
    currentTab.value = tab
  }

  showCurrentTab(DEFAULT_TAB.value)

  // watchlist section
  const watchlistTableSkeletonContent = ref({
    tableBody: {
      tr: 0,
      th: 1,
      td: 3
    }
  })
  const isWatchlistLoading = ref(true)
  const isAddingProcess = ref(false)

  const toggleWatchlistSkeleton = (isLoading) => {
    isWatchlistLoading.value = isLoading
  }

  const toggleAddButtonSpinner = (isLoading) => {
    isAddingProcess.value = isLoading
  }

  const setSkeletonTableRow = ({ rows }) => {
    watchlistTableSkeletonContent.value.tableBody.tr = rows
  }

  const toggleLoadingEffect = (isActivate) => {
    toggleAddButtonSpinner(isActivate)
    toggleWatchlistSkeleton(isActivate)
  }

  // sort
  const {
    sortMenu,
    sortDirection,
    selectedDisplayName,
    selectedSortCategory,
    selectedDirection,
    isSortMenuOpen,
    latestSortRules,
    sortList,
    toggleSortMenu,
    onClickSort
  } = useSort()

  // loading
  const watchlistArr = ref([])
  const timeoutId = ref(null)
  const currentStatus = ref(null)
  const changeCount = ref(0)
  const {
    updateList,
    fetchMarketData,
    checkMarketState,
    updateMarketData,
    isUpdateError
  } = useUpdateList()

  function showListOnTickersChanged(params, status) {
    const cacheList = getCacheList(currentTab.value)
    let unorderedList = null

    switch (status) {
      case 'addTicker': {
        console.log(`%c addTicker`, 'background:green; color:#efefef')
        unorderedList = [...cacheList, params]
        break
      }
      case 'deleteTicker': {
        console.log(`%c deleteTicker`, 'background:green; color:#efefef')
        unorderedList = [...cacheList].filter(
          (item) => params.indexOf(item.tempTicker) === -1
        )
        break
      }
      default: {
        console.log(`%c 意外發生`, 'background:green; color:#efefef')
        break
      }
    }
    return unorderedList
  }

  // 用於更新價格時能判別不同 status
  function getStatusChanged(status) {
    let statusChanged = ''

    if (status === 'addTicker' || status === 'deleteTicker') {
      changeCount.value++
      statusChanged = status + changeCount.value
    } else {
      statusChanged = status
    }

    console.log(
      `%c statusChanged:${statusChanged}`,
      'background:pink;color:black'
    )

    return statusChanged
  }

  async function useCacheData(params, tabName, status, statusChanged) {
    let isUseCache = false

    switch (status) {
      case 'init': {
        break
      }
      case 'switch': {
        const cachedTabs = Object.keys(cachedList.value)
        const isInCachedTabs = cachedTabs.includes(tabName)
        if (!isInCachedTabs) break

        isUseCache = true

        const cacheList = getCacheList(tabName)
        console.log('第二次 switch cacheList', cacheList)

        displayWatchlist(cacheList, tabName)
        isAllMarketClose.value = checkMarketState(cacheList)

        if (!isAllMarketClose.value) {
          await checkResumeFlow(cacheList, tabName, statusChanged)
        }

        // await checkResumeFlow(cacheList, tabName, statusChanged);

        break
      }
      default: {
        isUseCache = true

        const unorderedList = showListOnTickersChanged(params, status)
        displayWatchlist(unorderedList, tabName)
        toggleLoadingEffect(false)

        if (unorderedList.length === 0) break

        isAllMarketClose.value = checkMarketState(unorderedList)

        if (!isAllMarketClose.value) {
          await checkResumeFlow(unorderedList, tabName, statusChanged)
        }

        // await checkResumeFlow(unorderedList, tabName, statusChanged);

        break
      }
    }

    return isUseCache
  }

  // status: init, switch, deleteTicker, addTicker
  async function loadWatchlist({ status, params }) {
    const statusChanged = getStatusChanged(status)
    const tabName = currentTab.value

    setCurrentStatus(statusChanged)
    clearTimeout(timeoutId.value)

    // 檢查 list 為空時停止往下執行
    if (status === 'init' || status === 'switch') {
      const currentTabInfo = tabs.value.find((tab) => tab.name === tabName)

      if (currentTabInfo.listLength === 0) {
        watchlistArr.value.length = 0
        cachedList.value[tabName] = setCacheList([])
        toggleLoadingEffect(false)
        return
      }
    }

    // 用 cache
    const isUseCache = await useCacheData(
      params,
      tabName,
      status,
      statusChanged
    )
    if (isUseCache) return

    try {
      toggleLoadingEffect(true)

      const watchlistRes = await http.get(`/api/tickers/${tabName}`)
      const watchlist = watchlistRes.data.result

      setSkeletonTableRow({ rows: watchlist.length })

      const newList = await updateList(watchlist, tabName)
      displayWatchlist(newList, tabName)
      toggleLoadingEffect(false)

      await checkResumeFlow(newList, tabName, statusChanged)
    } catch (error) {
      console.log('error', error)
    }
  }

  function displayWatchlist(watchlist = watchlistArr.value, tabName) {
    if (tabName !== currentTab.value) {
      console.log('displayWatchlist tab 有衝突')
      return
    }

    const orderedList = sortList(latestSortRules.value, watchlist)

    watchlistArr.value = orderedList
    cachedList.value[tabName] = setCacheList(watchlist)

    return orderedList
  }

  const isAllMarketClose = ref(true)

  async function checkResumeFlow(watchlist, tabName, status) {
    console.log('---------checkResumeFlow---------')

    isAllMarketClose.value = checkMarketState(watchlist)
    console.log('isAllMarketClose', isAllMarketClose.value)
    if (!isAllMarketClose.value) await startTimer(watchlist, tabName, status)

    // await startTimer(watchlist, tabName, status);
  }

  // 自動倒數計時更新
  function startTimer(watchlist, tabName, status) {
    console.log(`%c startTimer ${tabName}`, 'background:blue; color:#efefef')
    return new Promise((resolve, reject) => {
      timeoutId.value = setTimeout(async () => {
        await resumeFlow(watchlist, tabName, status)
        resolve()
      }, 5000)

      // console.log("timeoutId after", timeoutId.value);
    })
  }

  const updatedTickers = ref([])

  async function resumeFlow(watchlist, tabName, status) {
    updatedTickers.value.length = 0

    console.log(
      `%c resumeFlow ${currentStatus.value}`,
      'background:red; color:#efefef'
    )

    const newMarketData = await fetchMarketData(watchlist)
    if (!newMarketData.length) return

    const hasLostData = newMarketData.indexOf(null) !== -1
    if (hasLostData) {
      console.log('遺失資料了！！！')
      await checkResumeFlow(newList, currentTab.value, currentStatus.value)
      return
    }

    const [toUpdateTickers, newList] = resumeFlowCheckUpdate(
      newMarketData,
      watchlist
    )

    const hasUpdateData = toUpdateTickers.length !== 0
    const isCurrentTab = tabName === currentTab.value
    const isCurrentStatus = status === currentStatus.value

    console.log(`status:${status}, currentStatus:${currentStatus.value}`)
    console.log(`tabName:${tabName}, currentTab:${currentTab.value}`)

    // 重新倒數更新 tab 有衝突
    if (!hasUpdateData && !isCurrentTab) {
      console.log(`重新倒數更新 tab 有衝突`)
      return
    }

    if (!hasUpdateData && !isCurrentStatus) {
      console.log(`重新倒數更新 status 有衝突`)
      return
    }

    // 盤中價格尚未改變，重新倒數更新
    if (!hasUpdateData) {
      console.log('盤中價格尚未改變，重新倒數更新')
      // setCurrentStatus(null);
      await checkResumeFlow(newList, tabName, status)
      return
    }

    // resumeFlow tab 有衝突
    if (!isCurrentTab) {
      console.log(`resumeFlow tab 有衝突`)
      return
    }

    if (!isCurrentStatus) {
      console.log(`resumeFlow status 有衝突`)
      return
    }

    console.log('！！！！！全過！！！！！')

    const allPromises = toUpdateTickers.map((obj) => {
      const url = `/api/ticker/${currentTab.value}/${obj.tempTicker}`
      return http.put(url, { newItem: obj.newItem })
    })

    console.log('更新至資料庫')

    const updatedTickersArr = await updateMarketData(allPromises)
    console.log('resumeFlow updatedTickersArr', updatedTickersArr)

    showUpdatedTickers(updatedTickersArr)
    displayWatchlist(newList, currentTab.value)
    await checkResumeFlow(newList, currentTab.value, currentStatus.value)
  }

  function resumeFlowCheckUpdate(newMarketData, watchlist) {
    const newList = [...watchlist]
    const toUpdateTickers = []

    for (let i = 0; i < watchlist.length; i++) {
      const { price, tempTicker } = watchlist[i]

      if (price === newMarketData[i].price) continue

      newList[i] = { ...watchlist[i], ...newMarketData[i] }

      if (isUpdateError(newList[i], newMarketData[i])) continue

      console.log('都沒錯')

      toUpdateTickers.push({ tempTicker, newItem: newMarketData[i] })
    }

    console.log('R toUpdateTickers', toUpdateTickers)

    return [toUpdateTickers, newList]
  }

  function showUpdatedTickers(resolvedPromise) {
    updatedTickers.value = resolvedPromise.map((item) => item.value.data.result)
  }

  function getCacheList(currentTab) {
    const cacheList = Object.values({
      ...cachedList.value[currentTab]?.currentWatchlist
    })

    return cacheList
  }

  function setCacheList(currentWatchlist) {
    const cacheList = {
      isEmpty: !!currentWatchlist,
      currentWatchlist
    }

    return cacheList
  }

  function setCurrentStatus(status) {
    currentStatus.value = status
  }

  function renameCacheList({ oldName, newName }) {
    if (oldName !== newName && newName) {
      console.log('renameCacheList')

      Object.defineProperty(
        cachedList.value,
        newName,
        Object.getOwnPropertyDescriptor(cachedList.value, oldName)
      )
      delete cachedList.value[oldName]
    }
  }

  return {
    DEFAULT_TAB,
    currentTab,
    tabs,
    cachedList,
    showCurrentTab,
    setTabs,
    setTabsInfo,
    // watchlist section
    watchlistTableSkeletonContent,
    isWatchlistLoading,
    isAddingProcess,
    toggleLoadingEffect,
    setSkeletonTableRow,
    // sort
    latestSortRules,
    sortMenu,
    sortDirection,
    selectedDisplayName,
    selectedSortCategory,
    selectedDirection,
    isSortMenuOpen,
    toggleSortMenu,
    onClickSort,
    // loading
    watchlistArr,
    changeCount,
    timeoutId,
    loadWatchlist,
    displayWatchlist,
    updatedTickers,
    renameCacheList
  }
})

export default useWatchlistStore
