import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    total: 0,
    loading: false,
    error: null,
    selectedUser: null,
    // Lista completa sin paginación — usada por filtros (P7) y comparación (P8)
    allUsers: [],
    loadingAll: false,
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

    async fetchAllUsers() {
      if (this.allUsers.length > 0) return
      this.loadingAll = true
      try {
        const { data } = await api.get('/users', { params: { limit: 0 } })
        this.allUsers = data.users
      } catch {
        // La tabla paginada sigue funcionando; filtros/comparación no tendrán datos
      } finally {
        this.loadingAll = false
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
