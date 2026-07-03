<template>
  <q-page class="q-pa-md">
    <q-toolbar class="bg-primary text-white rounded-borders shadow-2 q-mb-md">
      <q-icon name="groups" size="28px" class="q-mr-sm" />
      <q-toolbar-title class="text-h6">Directorio Corporativo</q-toolbar-title>
    </q-toolbar>

    <q-card class="shadow-3">
      <q-card-section>
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
              <q-avatar size="40px" class="employee-avatar">
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
      </q-card-section>
    </q-card>

    <q-dialog v-model="isDetailOpen">
      <q-card style="min-width: 280px">
        <!-- TODO: Mattias reemplaza este contenido con el detalle completo (Pregunta 3) -->
        <q-card-section class="column items-center q-gutter-sm q-pt-lg">
          <q-avatar size="80px" class="employee-avatar">
            <img :src="selectedUser?.image" :alt="selectedUser?.firstName" />
          </q-avatar>
          <div class="text-h6 text-center">
            {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cerrar" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

// `selectedUser` queda disponible en el store para que Pregunta 3
// (QDialog/QDrawer de detalle) lo consuma con este mismo composable,
// sin tener que tocar esta tabla.
const { users, total, loading, selectedUser, fetchUsers, selectUser } = useUsers()

const isDetailOpen = ref(false)

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
  isDetailOpen.value = true
}

onMounted(() => {
  loadPage(pagination.value)
})
</script>

<style scoped lang="scss">
.employee-avatar {
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
