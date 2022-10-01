import { defineStore } from 'pinia'
import { ref } from 'vue'

const useWatchlistStore = defineStore('watchlist', () => {
  const currentTab = ref(null)
  const DEFAULT_TAB = ref('Watchlist')
  const tabs = ref([])
  const cachedList = ref({})
  const deleteCount = ref(0)
  const intervalQueue = ref([])

  const setTabsInfo = (tab, listLength) => {
    // console.log('tabs.value', tabs.value)
    // console.log('tab', tab)
    console.log(
      `%c listLength ${listLength}`,
      'background:green; color:#efefef'
    )

    const tabIndex = tabs.value.findIndex((item) => item.name === tab)

    console.log('currentTabInfo before', tabs.value[tabIndex])

    // if (tabs.value[tabIndex].listLength === listLength) return
    tabs.value[tabIndex].listLength = listLength
    console.log('currentTabInfo after', tabs.value[tabIndex])
    // const currentTabInfo = tabs.value.find((item) => item.name === tab)

    // console.log('currentTabInfo before', currentTabInfo)
    // // if (currentTabInfo.listLength === listLength) return
    // // console.log('不一樣')

    // currentTabInfo.listLength = listLength
    // console.log('currentTabInfo after', currentTabInfo)
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
    deleteCount,
    intervalQueue,
    showCurrentTab,
    setTabs,
    setTabsInfo
  }
})

export default useWatchlistStore
