import { defineStore } from 'pinia'
import { ref, onBeforeUnmount } from 'vue'

const useSearchStore = defineStore('search', () => {
  onBeforeUnmount(() => {
    console.log('useSearchStore onBeforeUnmount')
    searchList.value = null
  })

  const countries = ref([
    {
      code: 'us',
      name: 'US Stocks',
      placeholder: 'Ex: AAPL',
      maxLength: '5',
      style: 'bg-sky-500',
      rule: /^[a-z\-?]{1,5}$/i
    },
    {
      code: 'tw',
      name: 'TW Stocks',
      placeholder: 'Ex: 0050.TW',
      maxLength: '9',
      style: 'bg-slate-700',
      rule: /^\d{4,6}\.tw$/i
    },
    {
      code: 'uk',
      name: 'UK Stocks',
      placeholder: 'Ex: SHEL.L',
      maxLength: '6',
      style: 'bg-red-500',
      rule: /^[a-z]{4}\.l$/i
    },
    {
      code: 'hk',
      name: 'HK Stocks',
      placeholder: 'Ex: 1299.HK',
      maxLength: '7',
      style: 'bg-teal-600/70',
      rule: /^\d{4}\.hk$/i
    },
    {
      code: 'ks',
      name: 'KR Stocks',
      placeholder: 'Ex: 005930.KS',
      maxLength: '9',
      style: 'bg-yellow-500',
      rule: /^\d{6}\.ks$/i
    },
    {
      code: 'mf',
      name: 'Mutual Funds',
      placeholder: 'Ex: TRGIX',
      maxLength: '5',
      style: 'bg-indigo-600',
      rule: /^[a-z]{5}$/i
    }
  ])

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
    countries,
    searchList,
    isSearchListLoading,
    isFocus,
    toggleSearchListSkeleton,
    toggleSearchList,
    passDataToSearchList
  }
})

export default useSearchStore
