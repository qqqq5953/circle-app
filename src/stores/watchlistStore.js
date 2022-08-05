import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useWatchlistStore = defineStore('watchlist', () => {
  const currentTab = ref(null)
  const DEFAULT_TAB = ref('Watchlist')
  const tabs = ref([])

  const setTabs = (tab) => {
    console.log('setTabs', typeof tab)

    if (typeof tab === 'object') {
      tabs.value.length = 0
      tabs.value.push(...tab)
    }

    if (typeof tab === 'string') {
      tabs.value.push(tab)
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
    setTabs
  }
})
