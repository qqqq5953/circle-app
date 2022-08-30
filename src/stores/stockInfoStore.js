import { defineStore } from 'pinia'
import { ref } from 'vue'

const useStockInfoStore = defineStore('stockInfo', () => {
  const stockInfo = ref(null)

  return {
    stockInfo
  }
})

export default useStockInfoStore
