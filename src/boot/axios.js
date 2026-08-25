import { boot } from 'quasar/wrappers'
import axios from 'axios'

<<<<<<< Updated upstream
const api = axios.create({
  baseURL: 'https://badmintonanalysis-production.up.railway.app',
  timeout: 5000,
})
=======
const apiBaseURL =
  import.meta.env.QCLI_API_BASE_URL ??
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://badmintonanalysis-production.up.railway.app')

const api = axios.create({ baseURL: apiBaseURL, timeout: 10000 })
>>>>>>> Stashed changes

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
