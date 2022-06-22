import service from '../index'

/**
 * AXIOS MODULE SAMPLE
 */
const DEFAULT_HEADER = {
  headers: { 'Content-Type': 'application/json' }
}

export default {
  getDataList1: async (url) => {
    const response = await service.get(url)
    return response
  },
  postDataList1: async (url, data) => {
    const response = await service.post(url, data)
    return response
  },
  getDataList2: (url) => service.get(url),
  postDataList2: (url, data) => service.post(url, data)
}
