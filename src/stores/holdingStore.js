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

  const inputValidity = ref({
    ticker: null,
    cost: null,
    shares: true,
    date: null
  })

  // holiday
  const { data: holidaysRes } = useAxios('/api/holidays', 'get')

  return {
    stock,
    inputValidity,
    holidaysRes
  }
})

export default useHoldingStore
