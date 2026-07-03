<template>
  <q-page padding>
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h4 text-weight-bold">Dashboard</div>
      <q-btn flat round icon="refresh" color="primary" :disable="loading" @click="cargarUsuarios">
        <q-tooltip>Recargar datos</q-tooltip>
      </q-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner-dots size="60px" color="primary" />
    </div>

    <!-- Error -->
    <q-banner v-else-if="error" class="bg-red-1 text-red-9 q-mb-md" rounded>
      <template #avatar>
        <q-icon name="error" color="red" />
      </template>
      No se pudieron cargar los datos. Verifica tu conexión e inténtalo de nuevo.
      <template #action>
        <q-btn flat color="red" label="Reintentar" @click="cargarUsuarios" />
      </template>
    </q-banner>

    <!-- Indicadores -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="ind in indicadores" :key="ind.label" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="full-height">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="ind.color" text-color="white" :icon="ind.icon" size="56px" />
            <div class="q-ml-md">
              <div class="text-h4 text-weight-bold">{{ ind.value }}</div>
              <div class="text-subtitle2 text-grey-7">{{ ind.label }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])
const loading = ref(false)
const error = ref(false)

// Trae TODOS los usuarios (limit=0 = lista completa en dummyjson).
// Sin el limit=0 solo devuelve 30 y los indicadores salen mal.
async function cargarUsuarios() {
  loading.value = true
  error.value = false
  try {
    const { data } = await axios.get('https://dummyjson.com/users?limit=0')
    users.value = data.users
  } catch (e) {
    console.error('Error al cargar usuarios:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

// --- Indicadores calculados en el frontend ---
const totalUsuarios = computed(() => users.value.length)

const hombres = computed(() => users.value.filter((u) => u.gender === 'male').length)

const mujeres = computed(() => users.value.filter((u) => u.gender === 'female').length)

const promedioEdad = computed(() => {
  if (!users.value.length) return 0
  const suma = users.value.reduce((acc, u) => acc + u.age, 0)
  return Math.round(suma / users.value.length)
})

const empresasDistintas = computed(
  () => new Set(users.value.map((u) => u.company?.name).filter(Boolean)).size,
)

const ciudadesDistintas = computed(
  () => new Set(users.value.map((u) => u.address?.city).filter(Boolean)).size,
)

// Estructura para pintar las tarjetas
const indicadores = computed(() => [
  { label: 'Total de usuarios', value: totalUsuarios.value, icon: 'groups', color: 'primary' },
  { label: 'Hombres', value: hombres.value, icon: 'man', color: 'blue' },
  { label: 'Mujeres', value: mujeres.value, icon: 'woman', color: 'pink' },
  { label: 'Promedio de edad', value: promedioEdad.value, icon: 'cake', color: 'orange' },
  { label: 'Empresas distintas', value: empresasDistintas.value, icon: 'business', color: 'teal' },
  {
    label: 'Ciudades distintas',
    value: ciudadesDistintas.value,
    icon: 'location_city',
    color: 'purple',
  },
])

onMounted(cargarUsuarios)
</script>
