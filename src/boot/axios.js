import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { loadAuth } from '@/data/auth'

const apiBaseURL =
  import.meta.env.QCLI_API_BASE_URL ??
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://badmintonanalysis-production.up.railway.app')

const api = axios.create({ baseURL: apiBaseURL, timeout: 10000 })

api.interceptors.request.use((config) => {
  const token = loadAuth()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
