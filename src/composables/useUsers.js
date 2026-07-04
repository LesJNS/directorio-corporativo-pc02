import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users-store'

export function useUsers() {
  const store = useUsersStore()
  const { users, total, loading, error, selectedUser, allUsers, loadingAll } = storeToRefs(store)

  function fetchUsers({ page = 1, rowsPerPage = 10, search = '' } = {}) {
    return store.fetchUsers({ page, rowsPerPage, search })
  }

  function fetchAllUsers() {
    return store.fetchAllUsers()
  }

  function selectUser(user) {
    store.selectUser(user)
  }

  function clearSelectedUser() {
    store.clearSelectedUser()
  }

  return {
    users,
    total,
    loading,
    error,
    selectedUser,
    allUsers,
    loadingAll,
    fetchUsers,
    fetchAllUsers,
    selectUser,
    clearSelectedUser,
  }
}
