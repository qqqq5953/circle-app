import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

const useWatchlistStore = defineStore('api', () => {
  const loadingQueue = ref([])
  const isLoading = computed(() => {
    console.log('loadingQueue.value', loadingQueue.value)
    return loadingQueue.value.length !== 0
  })

  watch(isLoading, (newVal) => {
    console.log('newVal', newVal)
  })

  return {
    loadingQueue,
    isLoading
  }
})

export default useWatchlistStore
