<template>
  <q-page class="q-pa-md">
    <div class="text-h6 text-weight-medium q-mb-md">Empleados</div>

    <q-card class="employees-card">
      <q-card-section class="q-pa-lg">
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
          <template v-slot:top-right>
            <q-input
              v-model="searchQuery"
              dense
              outlined
              debounce="400"
              clearable
              placeholder="Buscar por nombre o apellido..."
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-photo="props">
            <q-td :props="props" auto-width>
              <q-avatar size="48px" class="employee-avatar">
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
                class="detail-btn"
                @click="onViewDetail(props.row)"
              >
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span v-if="searchQuery">
                No se encontraron empleados para "{{ searchQuery }}".
              </span>
              <span v-else>No se encontraron empleados.</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="isDetailOpen" maximized>
      <q-card>
        <q-card-section class="row items-center justify-between">
          <div class="row items-center q-gutter-md">
            <q-avatar size="70px" class="employee-avatar">
              <img :src="selectedUser?.image" :alt="selectedUser?.firstName" />
            </q-avatar>

            <div>
              <div class="text-h6">{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</div>
              <div class="text-grey-7">
                {{ selectedUser?.company?.title }} - {{ selectedUser?.company?.name }}
              </div>
            </div>
          </div>

          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>

        <q-separator />

        <q-tabs
          v-model="detailTab"
          dense
          active-color="primary"
          indicator-color="primary"
          align="left"
        >
          <q-tab name="info" label="Información" icon="person" />
          <q-tab name="compras" label="Compras" icon="shopping_cart" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="detailTab" animated>
          <q-tab-panel name="info">
            <div class="text-subtitle1 text-weight-medium q-mb-md">Detalle del colaborador</div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-weight-medium">Datos personales</div>
                    <div>Edad: {{ selectedUser?.age }}</div>
                    <div>Género: {{ selectedUser?.gender }}</div>
                    <div>Email: {{ selectedUser?.email }}</div>
                    <div>Teléfono: {{ selectedUser?.phone }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-weight-medium">Información laboral</div>
                    <div>Empresa: {{ selectedUser?.company?.name }}</div>
                    <div>Cargo: {{ selectedUser?.company?.title }}</div>
                    <div>Departamento: {{ selectedUser?.company?.department }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-weight-medium">Dirección</div>
                    <div>Ciudad: {{ selectedUser?.address?.city }}</div>
                    <div>Estado: {{ selectedUser?.address?.state }}</div>
                    <div>País: {{ selectedUser?.address?.country }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="compras">
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              Carritos de compra asociados
            </div>

            <q-inner-loading :showing="loadingCarts">
              <q-spinner-dots size="40px" color="primary" />
            </q-inner-loading>

            <q-banner v-if="cartsError" class="bg-red-1 text-red q-mb-md">
              No se pudieron cargar las compras del colaborador.
            </q-banner>

            <q-banner
              v-if="!loadingCarts && !carts.length && !cartsError"
              class="bg-grey-2 text-grey-8"
            >
              Este colaborador no tiene carritos de compra registrados.
            </q-banner>

            <div v-for="cart in carts" :key="cart.id" class="q-mb-lg">
              <q-card flat bordered>
                <q-card-section class="row items-center justify-between">
                  <div class="text-weight-medium">Carrito #{{ cart.id }}</div>
                  <q-chip color="primary" text-color="white">
                    Total: ${{ formatMoney(cart.total) }}
                  </q-chip>
                </q-card-section>

                <q-table
                  flat
                  bordered
                  :rows="cart.products"
                  :columns="purchaseColumns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 0 }"
                  hide-pagination
                >
                  <template v-slot:body-cell-thumbnail="props">
                    <q-td :props="props">
                      <q-img
                        :src="props.row.thumbnail"
                        :alt="props.row.title"
                        width="54px"
                        height="54px"
                        fit="contain"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-price="props">
                    <q-td :props="props"> ${{ formatMoney(props.row.price) }} </q-td>
                  </template>

                  <template v-slot:body-cell-total="props">
                    <q-td :props="props"> ${{ formatMoney(props.row.total) }} </q-td>
                  </template>
                </q-table>

                <q-card-section class="row justify-end">
                  <div class="text-h6">Total general: ${{ formatMoney(cart.total) }}</div>
                </q-card-section>
              </q-card>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'
import { useUserCarts } from '@/composables/useUserCarts'

// `selectedUser` queda disponible en el store para que Pregunta 3
// (QDialog/QDrawer de detalle) lo consuma con este mismo composable,
// sin tener que tocar esta tabla.
const { users, total, loading, selectedUser, fetchUsers, selectUser } = useUsers()

const isDetailOpen = ref(false)
const searchQuery = ref('')

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const detailTab = ref('info')

const { carts, loadingCarts, cartsError, fetchUserCarts } = useUserCarts()

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

const purchaseColumns = [
  { name: 'thumbnail', label: 'Imagen', field: 'thumbnail', align: 'center' },
  { name: 'title', label: 'Producto', field: 'title', align: 'left' },
  { name: 'quantity', label: 'Cantidad', field: 'quantity', align: 'center' },
  { name: 'price', label: 'Precio unitario', field: 'price', align: 'right' },
  { name: 'total', label: 'Subtotal', field: 'total', align: 'right' },
]

async function loadPage({ page, rowsPerPage }) {
  await fetchUsers({ page, rowsPerPage, search: searchQuery.value })
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.rowsNumber = total.value
}

function onRequest({ pagination: requestedPagination }) {
  loadPage(requestedPagination)
}

async function onViewDetail(user) {
  selectUser(user)
  detailTab.value = 'info'
  isDetailOpen.value = true
  await fetchUserCarts(user.id)
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

watch(searchQuery, () => {
  loadPage({ page: 1, rowsPerPage: pagination.value.rowsPerPage })
})

onMounted(() => {
  loadPage(pagination.value)
})
</script>

<style scoped lang="scss">
.employees-card {
  border-radius: $app-card-radius;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.search-input {
  width: 280px;
}

.employee-avatar {
  box-shadow: 0 0 0 2px $app-avatar-ring;
  transition: transform 0.2s ease;
}

.detail-btn {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.detail-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(26, 35, 126, 0.35);
}

:deep(thead tr th) {
  background-color: rgba(26, 35, 126, 0.04);
  font-weight: 600;
}

:deep(tbody tr) {
  transition: background-color 0.15s ease;
}

:deep(tbody tr:nth-child(even)) {
  background-color: rgba(26, 35, 126, 0.015);
}

:deep(tbody tr:hover) {
  background-color: rgba(26, 35, 126, 0.05);
}

:deep(tbody tr:hover .employee-avatar) {
  transform: scale(1.08);
}
</style>
