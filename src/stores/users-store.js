import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    total: 0,
    loading: false,
    error: null,
    // Usuario elegido en la tabla del directorio. Otros módulos (p. ej. el
    // QDialog/QDrawer de detalle) pueden observar este estado sin acoplarse
    // al componente de la tabla.
    selectedUser: null,
  }),

  actions: {
    async fetchUsers({ page = 1, rowsPerPage = 10, search = '' } = {}) {
      this.loading = true
      this.error = null

      const limit = rowsPerPage
      const skip = (page - 1) * rowsPerPage
      const endpoint = search ? '/users/search' : '/users'
      const params = search ? { q: search, limit, skip } : { limit, skip }

      try {
        const { data } = await api.get(endpoint, { params })
        this.users = data.users
        this.total = data.total
      } catch (err) {
        this.error = err
        this.users = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    selectUser(user) {
      this.selectedUser = user
    },

    clearSelectedUser() {
      this.selectedUser = null
    },
  },
})
