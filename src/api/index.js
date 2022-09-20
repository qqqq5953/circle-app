import axios from 'axios'
import { storeToRefs } from 'pinia'
import useApiStore from '@/stores/apiStore.js'

// const $store = useApiStore()
// const { loadingQueue } = storeToRefs($store)

const http = axios.create({
  baseURL: 'http://localhost:8080'
})

http.interceptors.request.use(
  (config) => {
    // console.log('url', config.url)
    // const url = config.url
    // const apiName = url.split('api')[1]
    // loadingQueue.value.push(apiName)

    return config
  },
  (error) => {}
)

http.interceptors.response.use(
  (response) => {
    // loadingQueue.value.shift()
    return response
  },
  (error) => {}
)

export default http
