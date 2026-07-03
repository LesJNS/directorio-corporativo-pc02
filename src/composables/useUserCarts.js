import { ref } from 'vue'
import { api } from '@/boot/axios'

export function useUserCarts() {
  const carts = ref([])
  const loadingCarts = ref(false)
  const cartsError = ref(null)

  async function fetchUserCarts(userId) {
    if (!userId) return

    loadingCarts.value = true
    cartsError.value = null
    carts.value = []

    try {
      const { data } = await api.get(`/users/${userId}/carts`)
      carts.value = data.carts || []
    } catch (error) {
      cartsError.value = error
      carts.value = []
    } finally {
      loadingCarts.value = false
    }
  }

  return {
    carts,
    loadingCarts,
    cartsError,
    fetchUserCarts,
  }
}
