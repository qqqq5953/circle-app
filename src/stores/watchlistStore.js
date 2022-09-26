import { defineStore } from 'pinia'
import { ref } from 'vue'

const useWatchlistStore = defineStore('watchlist', () => {
  const currentTab = ref(null)
  const DEFAULT_TAB = ref('Watchlist')
  const tabs = ref([])

  const setTabsInfo = (tab, listLength) => {
    const idx = tabs.value.findIndex((item) => item.name === tab)
    tabs.value[idx].listLength = listLength
  }

  const setTabs = (tab) => {
    console.log('setTabs', tab)
    if (typeof tab === 'object') {
      tabs.value.length = 0
      tabs.value.push(...tab)
      return
    }
  }

  const showCurrentTab = (tab) => {
    console.log('showCurrentTab in store')
    currentTab.value = tab
  }

  showCurrentTab(DEFAULT_TAB.value)

  return {
    DEFAULT_TAB,
    currentTab,
    tabs,
    showCurrentTab,
    setTabs,
    setTabsInfo
  }
})

export default useWatchlistStore
