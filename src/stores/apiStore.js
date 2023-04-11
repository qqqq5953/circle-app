import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

const useApiStore = defineStore('api', () => {
  const loadingQueue = ref([])
  const isLoading = computed(() => {
    return loadingQueue.value.length !== 0
  })

  watch(isLoading, (newVal) => {
    console.log('newVal', newVal)
  })

  const axiosControllerQueue = ref([])
  const axiosMessages = ref('')

  function setAxiosMessage(msgObj) {
    axiosMessages.value = msgObj
  }

  return {
    loadingQueue,
    isLoading,
    axiosControllerQueue,
    axiosMessages,
    setAxiosMessage
  }
})

export default useApiStore
