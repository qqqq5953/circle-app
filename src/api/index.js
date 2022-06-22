import axios from 'axios'

const service = axios.create({
  baseURL: 'http://localhost:8081'
})

service.interceptors.request.use(
  (config) => {
    console.log('config', config)
    return config
  },
  (error) => {}
)

service.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {}
)

export default service
