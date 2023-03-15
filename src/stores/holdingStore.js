import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import useAxios from '@/composables/useAxios.js'

const useHoldingStore = defineStore('holding', () => {
  const stock = ref({
    ticker: null,
    tempTicker: null,
    cost: null,
    shares: '1',
    style: null,
    tradeDate: null
  })

  const inputValidity = ref({
    ticker: null,
    cost: null,
    shares: true,
    date: null
  })

  const { data, error, loading } = useAxios('/api/holdings', 'get')

  const toggleSkeleton = (isLoading) => {
    console.log('isLoading', isLoading)
    loading.value = isLoading
  }

  const lastMarketOpenDate = computed(() => {
    // console.log("data.value", data.value);
    // console.log("error.value", error.value);
    // console.log("loading.value", loading.value);
    // if (!data.value?.result) return
    // const tickers = []
    // for (let ticker in data.value?.result) {
    //   tickers.push(ticker)
    // }
    // return data.value?.result[tickers[0]].date.slice(0, 10)
  })

  const notificationMessage = ref(null)
  const activateNotification = (val) => (notificationMessage.value = val)

  // holiday
  const { data: holidaysRes } = useAxios('/api/holidays', 'get')

  return {
    notificationMessage,
    stock,
    data,
    error,
    loading,
    lastMarketOpenDate,
    inputValidity,
    activateNotification,
    toggleSkeleton,
    holidaysRes
  }
})

export default useHoldingStore
