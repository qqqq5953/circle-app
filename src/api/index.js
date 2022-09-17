import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8080'
})

http.interceptors.request.use(
  (config) => {
    console.log('config', config)
    return config
  },
  (error) => {}
)

http.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {}
)

export default http
