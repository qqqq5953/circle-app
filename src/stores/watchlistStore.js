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
