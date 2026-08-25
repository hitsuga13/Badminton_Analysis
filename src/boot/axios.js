import { boot } from 'quasar/wrappers'
import axios from 'axios'

const apiBaseURL =
  import.meta.env.QCLI_API_BASE_URL ??
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://badmintonanalysis-production.up.railway.app')

const api = axios.create({ baseURL: apiBaseURL, timeout: 10000 })

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
