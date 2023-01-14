import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import useAxios from '@/composables/useAxios.js'

const useHoldingStore = defineStore('holding', () => {
  const today = computed(() => {
    return new Date().toISOString().split('T')[0]
  })

  const stock = ref({
    ticker: null,
    tempTicker: null,
    cost: null,
    shares: '1',
    style: null,
    tradeDate: today.value
  })

  const inputValidity = ref({
    ticker: null,
    cost: null,
    shares: null
  })

  const { data, error, loading } = useAxios('/api/getHoldings', 'get')

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

  const isModalOpen = ref(false)

  const toggleModal = (isOpen) => {
    isModalOpen.value = isOpen || false
    const style = isOpen ? 'overflow:hidden' : null
    disableVerticalScrollbar(style)
  }

  const disableVerticalScrollbar = (style) => {
    document.querySelector('body').style = style
  }

  return {
    notificationMessage,
    isModalOpen,
    stock,
    data,
    error,
    loading,
    lastMarketOpenDate,
    inputValidity,
    today,
    toggleModal,
    activateNotification,
    toggleSkeleton
  }
})

export default useHoldingStore
