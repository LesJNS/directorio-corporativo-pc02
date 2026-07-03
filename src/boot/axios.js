import { defineBoot } from '#q-app'
import axios from 'axios'

const api = axios.create({ baseURL: 'https://dummyjson.com' })

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
