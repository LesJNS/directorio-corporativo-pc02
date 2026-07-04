import { ref, computed, watch } from 'vue'

export function useUserFilters(allUsers) {
  const filterGender = ref('')
  const filterAge = ref({ min: 0, max: 100 })
  const filterCompany = ref('')
  const filterCity = ref('')
  const filterCountry = ref('')

  const ageMin = computed(() =>
    allUsers.value.length ? Math.min(...allUsers.value.map((u) => u.age)) : 0,
  )
  const ageMax = computed(() =>
    allUsers.value.length ? Math.max(...allUsers.value.map((u) => u.age)) : 100,
  )

  // Inicializa el rango de edad con los valores reales de los datos al cargar
  watch([ageMin, ageMax], ([min, max]) => {
    filterAge.value = { min, max }
  }, { once: true })

  const companies = computed(() =>
    [...new Set(allUsers.value.map((u) => u.company?.name).filter(Boolean))].sort(),
  )
  const cities = computed(() =>
    [...new Set(allUsers.value.map((u) => u.address?.city).filter(Boolean))].sort(),
  )
  const countries = computed(() =>
    [...new Set(allUsers.value.map((u) => u.address?.country).filter(Boolean))].sort(),
  )

  const filtersActive = computed(
    () =>
      !!filterGender.value ||
      filterAge.value.min > ageMin.value ||
      filterAge.value.max < ageMax.value ||
      !!filterCompany.value ||
      !!filterCity.value ||
      !!filterCountry.value,
  )

  const filteredUsers = computed(() => {
    if (!allUsers.value.length) return []
    if (!filtersActive.value) return allUsers.value
    return allUsers.value.filter((u) => {
      if (filterGender.value && u.gender !== filterGender.value) return false
      if (u.age < filterAge.value.min || u.age > filterAge.value.max) return false
      if (filterCompany.value && u.company?.name !== filterCompany.value) return false
      if (filterCity.value && u.address?.city !== filterCity.value) return false
      if (filterCountry.value && u.address?.country !== filterCountry.value) return false
      return true
    })
  })

  function clearFilters() {
    filterGender.value = ''
    filterAge.value = { min: ageMin.value, max: ageMax.value }
    filterCompany.value = ''
    filterCity.value = ''
    filterCountry.value = ''
  }

  return {
    filterGender,
    filterAge,
    filterCompany,
    filterCity,
    filterCountry,
    ageMin,
    ageMax,
    companies,
    cities,
    countries,
    filtersActive,
    filteredUsers,
    clearFilters,
  }
}
