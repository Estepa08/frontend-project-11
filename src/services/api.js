import axios from 'axios'

const PROXY_URL = 'https://allorigins.hexlet.app'
const TIMEOUT = 15000

const apiClient = axios.create({
  timeout: TIMEOUT,
})

export const fetchRss = (url) => {
  const proxyUrl = `${PROXY_URL}/get?disableCache=true&url=${encodeURIComponent(url)}`

  return apiClient
    .get(proxyUrl)
    .then((response) => {
      if (response.data && response.data.contents) {
        return response.data.contents
      }
      throw new Error('errors.network')
    })
    .catch(() => {
      throw new Error('errors.network')
    })
}
