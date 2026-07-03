import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users-store'

/**
 * Composable de acceso a /users de dummyjson.
 * Reutilizable por cualquier módulo que necesite la lista de empleados
 * (tabla principal, dashboard, filtros, detalle, etc.). El estado vive en
 * un store de Pinia, así que todos los consumidores comparten los mismos
 * `users`, `loading` y `selectedUser` de forma reactiva.
 */
export function useUsers() {
  const store = useUsersStore()
  const { users, total, loading, error, selectedUser } = storeToRefs(store)

  function fetchUsers({ page = 1, rowsPerPage = 10, search = '' } = {}) {
    return store.fetchUsers({ page, rowsPerPage, search })
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
    fetchUsers,
    selectUser,
    clearSelectedUser,
  }
}
