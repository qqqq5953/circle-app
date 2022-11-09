import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

const useApiStore = defineStore('api', () => {
  const loadingQueue = ref([])
  const isLoading = computed(() => {
    return loadingQueue.value.length !== 0
  })

  const axiosControllerQueue = ref([])

  watch(isLoading, (newVal) => {
    console.log('newVal', newVal)
  })

  return {
    loadingQueue,
    isLoading,
    axiosControllerQueue
  }
})

export default useApiStore
