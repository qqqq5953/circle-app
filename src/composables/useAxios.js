import { toRefs, ref, reactive } from 'vue'
import http from '../api/index'

export default function useAxios(url, method, options = {}) {
  const data = ref(null)
  const state = reactive({
    error: null,
    loading: false
  })

  const executeAxios = async () => {
    state.loading = true

    try {
      const response = await http[method](url, options)
      const { success, content, errorMessage, result = null } = response.data
      data.value = { success, content, errorMessage, result }
      state.error = { content, message: errorMessage }

      console.log('=========賦值完成==========')
    } catch (error) {
      state.error = {
        content: 'useAxios error',
        message: error.message
      }
    } finally {
      state.loading = false
    }
  }

  executeAxios()

  return { data, ...toRefs(state) }
}

// export default function useAxios(url, method, options) {
//   const yahooData = ref(null)
//   const state = reactive({
//     errorMesssage: null,
//     isLoading: false
//   })

//   const executeAxios = async () => {
//     state.isLoading = true

//     try {
//       const response = await axios[method](url, options)
//       yahooData.value = response.data
//     } catch (error) {
//       state.errorMesssage = error
//     } finally {
//       state.isLoading = false
//     }
//   }

//   executeAxios()

//   console.log('data.value', yahooData)
//   console.log('error.value', state.errorMesssage)
//   console.log('loading.value', state.isLoading)

//   return { yahooData, ...toRefs(state) }
// }
