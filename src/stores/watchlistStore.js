import { defineStore } from 'pinia'
import { ref } from 'vue'

const useWatchlistStore = defineStore('watchlist', () => {
  const currentTab = ref(null)
  const DEFAULT_TAB = ref('Watchlist')
  const tabs = ref([])
  const cachedList = ref({})

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
    // console.log('showCurrentTab in store')
    currentTab.value = tab
  }

  showCurrentTab(DEFAULT_TAB.value)

  // ---------------------
  // searchList section
  const watchlistTableSkeletonContent = ref({
    tableHead: {
      hasTableHead: true,
      th: 'Stocks',
      td: ['Price', 'Change %', 'Change']
    },
    tableBody: {
      hasTableBody: true,
      tr: 0,
      th: 1,
      td: 3
    }
  })
  const searchList = ref([])
  const isSearchListLoading = ref(null)
  const isFocus = ref(null)

  const toggleSearchListSkeleton = (isLoading) => {
    isSearchListLoading.value = isLoading
  }

  const toggleSearchList = (focus) => {
    isFocus.value = focus
  }

  const getSearchList = (tickerObject) => {
    switch (tickerObject) {
      case undefined:
        searchList.value = undefined // 無搜尋結果
        break
      case null:
        searchList.value = null // 輸入不符格式
        break
      default:
        const { code, ticker } = tickerObject
        const tempTicker =
          code !== 'us' || code !== 'mf' ? ticker.split('.')[0] : ticker

        searchList.value = [{ ...tickerObject, tempTicker }]
    }
  }

  // watchlist section
  const isWatchlistLoading = ref(false)
  const isAddingProcess = ref(false)

  const toggleWatchlistSkeleton = (isLoading) => {
    isWatchlistLoading.value = isLoading
  }

  const toggleAddButtonSpinner = (isLoading) => {
    isAddingProcess.value = isLoading
  }

  const setSkeletonTableRow = ({ list, rows }) => {
    if (!list) {
      watchlistTableSkeletonContent.value.tableBody.tr = rows
    } else {
      watchlistTableSkeletonContent.value.tableBody.tr = list.length
    }
  }

  const toggleLoadingEffect = (isActivate) => {
    toggleAddButtonSpinner(isActivate)
    toggleWatchlistSkeleton(isActivate)
  }

  return {
    DEFAULT_TAB,
    currentTab,
    tabs,
    cachedList,
    showCurrentTab,
    setTabs,
    setTabsInfo
  }
})

export default useWatchlistStore
