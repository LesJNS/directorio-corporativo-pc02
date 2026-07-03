import { ref } from 'vue'
import { api } from '@/boot/axios'

export function useUserDetail() {
  const userDetail = ref(null)
  const loadingDetail = ref(false)
  const detailError = ref(null)

  async function fetchUserDetail(userId) {
    if (!userId) return

    loadingDetail.value = true
    detailError.value = null

    try {
      const { data } = await api.get(`/users/${userId}`)
      userDetail.value = data
    } catch (error) {
      detailError.value = error
      userDetail.value = null
    } finally {
      loadingDetail.value = false
    }
  }

  function clearUserDetail() {
    userDetail.value = null
    detailError.value = null
  }

  return {
    userDetail,
    loadingDetail,
    detailError,
    fetchUserDetail,
    clearUserDetail,
  }
}
