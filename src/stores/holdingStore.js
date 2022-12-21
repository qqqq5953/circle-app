import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import useAxios from '@/composables/useAxios.js'
import http from '../api/index'

const useHoldingStore = defineStore('holding', () => {
  const stock = ref({
    ticker: null,
    cost: null,
    shares: null,
    date: Date.now()
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

    if (!data.value?.result) return

    const tickers = []
    for (let ticker in data.value?.result) {
      tickers.push(ticker)
    }

    return data.value?.result[tickers[0]].date.slice(0, 10)
  })

  const toastMessage = ref(null)
  const activateToast = (val) => (toastMessage.value = val)

  const isModalOpen = ref(false)

  const toggleModal = (event, isOpen) => {
    isModalOpen.value = isOpen
    const style = isOpen ? 'overflow:hidden' : null
    disableVerticalScrollbar(style)
  }

  const disableVerticalScrollbar = (style) => {
    document.querySelector('body').style = style
  }

  // NewAdding ---------

  const inputValidity = ref({
    ticker: null,
    cost: null,
    shares: null
  })

  const isAllValid = computed(() =>
    Object.values(inputValidity.value).every((item) => !!item)
  )

  const addStock = async (event) => {
    if (!isAllValid.value) return

    toggleModal(event, false)
    toggleSkeleton(true)

    try {
      const stockObj = {
        ...stock.value,
        ticker: stock.value.ticker.toUpperCase()
      }

      const res = await http.post(`/api/addStock`, stockObj)
      console.log('addStock res', res)

      await updateHoldings(res.data, res.data.errorMessage)
    } catch (error) {
      console.log('addStock error', error)
    }
  }

  const updateHoldings = async (newData, errorMessage) => {
    console.log('updateHoldings newData', newData)
    console.log('updateHoldings errorMessage', errorMessage)

    if (newData.success) {
      try {
        const res = await http.get(`/api/getHoldings`)

        data.value = res.data
        toggleSkeleton(false)
        activateToast(newData)
      } catch (error) {
        console.log('updateHoldings error', error)
      }
    } else {
      activateToast(errorMessage)
    }
  }

  return {
    toastMessage,
    isModalOpen,
    stock,
    data,
    error,
    loading,
    lastMarketOpenDate,
    inputValidity,
    isAllValid,
    toggleModal,
    activateToast,
    updateHoldings,
    toggleSkeleton,
    addStock
  }
})

export default useHoldingStore
