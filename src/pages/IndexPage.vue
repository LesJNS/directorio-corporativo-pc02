<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Directorio Corporativo</div>

    <q-table
      flat
      bordered
      title="Empleados"
      :rows="users"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :rows-per-page-options="[10, 20, 50]"
      @request="onRequest"
    >
      <template v-slot:body-cell-photo="props">
        <q-td :props="props" auto-width>
          <q-avatar size="40px">
            <img :src="props.row.image" :alt="`${props.row.firstName} ${props.row.lastName}`" />
          </q-avatar>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="visibility"
            aria-label="Ver detalle"
            @click="onViewDetail(props.row)"
          >
            <q-tooltip>Ver detalle</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>No se encontraron empleados.</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

// `selectedUser` queda disponible en el store para que Pregunta 3
// (QDialog/QDrawer de detalle) lo consuma con este mismo composable,
// sin tener que tocar esta tabla.
const { users, total, loading, fetchUsers, selectUser } = useUsers()

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  { name: 'photo', label: 'Foto', field: 'image', align: 'center' },
  {
    name: 'fullName',
    label: 'Nombre completo',
    field: (row) => `${row.firstName} ${row.lastName}`,
    align: 'left',
  },
  { name: 'age', label: 'Edad', field: 'age', align: 'center' },
  { name: 'gender', label: 'Género', field: 'gender', align: 'center' },
  { name: 'email', label: 'Correo electrónico', field: 'email', align: 'left' },
  { name: 'company', label: 'Empresa', field: (row) => row.company?.name, align: 'left' },
  { name: 'title', label: 'Cargo', field: (row) => row.company?.title, align: 'left' },
  { name: 'city', label: 'Ciudad', field: (row) => row.address?.city, align: 'left' },
  { name: 'country', label: 'País', field: (row) => row.address?.country, align: 'left' },
  { name: 'actions', label: 'Detalle', field: 'actions', align: 'center' },
]

async function loadPage({ page, rowsPerPage }) {
  await fetchUsers({ page, rowsPerPage })
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.rowsNumber = total.value
}

function onRequest({ pagination: requestedPagination }) {
  loadPage(requestedPagination)
}

function onViewDetail(user) {
  selectUser(user)
}

onMounted(() => {
  loadPage(pagination.value)
})
</script>
