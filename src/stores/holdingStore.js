import { defineStore } from 'pinia'
import { ref } from 'vue'
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

  // holiday
  const { data: holidaysRes } = useAxios('/api/holidays', 'get')

  return {
    stock,
    holidaysRes
  }
})

export default useHoldingStore
