import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import useAxios from '@/composables/useAxios.js'

const useHoldingStore = defineStore('holding', () => {
  const toastMessage = ref(null)
  const isModalOpen = ref(false)
  const stock = ref({
    ticker: null,
    cost: null,
    shares: null,
    date: Date.now()
  })

  const { data, error, loading } = useAxios('/api/getHoldings', 'get')

  const lastMarketOpenDate = computed(() => {
    // console.log("data.value", data.value);
    // console.log("error.value", error.value);
    // console.log("loading.value", loading.value);

    if (!data.value?.result) return

    const tickers = []
    for (let ticker in data.value?.result) {
      tickers.push(ticker)
    }

    return data.value?.result[tickers[0]].date.slice(0, 10)
  })

  const activateToast = (val) => (toastMessage.value = val)

  const updateHoldings = (val) => {
    console.log('val', val)
    data.value = val
  }

  const toggleSkeleton = (isLoading) => {
    console.log('isLoading', isLoading)
    loading.value = isLoading
  }

  return {
    toastMessage,
    isModalOpen,
    stock,
    data,
    error,
    loading,
    lastMarketOpenDate,
    activateToast,
    updateHoldings,
    toggleSkeleton
  }
})

export default useHoldingStore
