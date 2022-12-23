import { defineStore } from 'pinia'
import { ref, onBeforeUnmount } from 'vue'

const useSearchStore = defineStore('search', () => {
  onBeforeUnmount(() => {
    console.log('useSearchStore onBeforeUnmount')
    searchList.value = null
  })

  const searchList = ref([])
  const isSearchListLoading = ref(null)
  const isFocus = ref(false)

  const toggleSearchListSkeleton = (isLoading) => {
    isSearchListLoading.value = isLoading
  }

  const toggleSearchList = (focus) => {
    isFocus.value = focus
  }

  const passDataToSearchList = (tickerObject) => {
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

  return {
    searchList,
    isSearchListLoading,
    isFocus,
    toggleSearchListSkeleton,
    toggleSearchList,
    passDataToSearchList
  }
})

export default useSearchStore
