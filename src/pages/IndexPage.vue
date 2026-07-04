<template>
  <q-page class="q-pa-md">
    <!-- Título + botón comparar -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-medium">Empleados</div>
      <UserComparison :users="allUsers" />
    </div>

    <!-- Panel de filtros (P7) -->
    <UserFilters
      v-model:filter-gender="filterGender"
      v-model:filter-age="filterAge"
      v-model:filter-company="filterCompany"
      v-model:filter-city="filterCity"
      v-model:filter-country="filterCountry"
      :age-min="ageMin"
      :age-max="ageMax"
      :companies="companies"
      :cities="cities"
      :countries="countries"
      :filters-active="filtersActive"
      :filtered-count="filteredUsers.length"
      :loading-all="loadingAll"
      @clear="clearFilters"
    />

    <!-- Tabla principal -->
    <q-card class="employees-card">
      <q-card-section class="q-pa-lg">
        <q-table
          flat
          bordered
          title="Empleados"
          :rows="activeRows"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          :loading="tableLoading"
          :rows-per-page-options="[10, 20, 50]"
          v-bind="serverSideProps"
        >
          <!-- Buscador (P2) — deshabilitado cuando hay filtros activos -->
          <template v-slot:top-right>
            <q-input
              v-model="searchQuery"
              dense
              outlined
              debounce="400"
              clearable
              :disable="filtersActive"
              placeholder="Buscar por nombre o apellido..."
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-if="filtersActive" v-slot:append>
                <q-icon name="filter_alt" color="primary" size="18px">
                  <q-tooltip>Desactiva los filtros para usar la búsqueda</q-tooltip>
                </q-icon>
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
              <span v-if="filtersActive">
                No hay empleados que coincidan con los filtros aplicados.
              </span>
              <span v-else-if="searchQuery">
                No se encontraron empleados para "{{ searchQuery }}".
              </span>
              <span v-else>No se encontraron empleados.</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Diálogo de detalle (P3 + P4) -->
    <q-dialog v-model="isDetailOpen" maximized>
      <q-card>
        <q-card-section class="row items-center justify-between">
          <div class="row items-center q-gutter-md">
            <q-avatar size="70px" class="employee-avatar">
              <img :src="selectedUser?.image" :alt="selectedUser?.firstName" />
            </q-avatar>

            <div>
              <div class="row items-center q-gutter-sm">
                <div class="text-h6">{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</div>
                <q-chip v-if="userDetail?.role" dense color="primary" text-color="white" class="text-capitalize">
                  {{ userDetail.role }}
                </q-chip>
              </div>
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

            <q-inner-loading :showing="loadingDetail">
              <q-spinner-dots size="40px" color="primary" />
            </q-inner-loading>

            <q-banner v-if="detailError" class="bg-red-1 text-red q-mb-md">
              No se pudo cargar la información completa del colaborador.
            </q-banner>

            <div v-else class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section class="column items-center">
                    <div class="section-title q-mb-sm">
                      <q-icon name="image" color="primary" />
                      <span>Imagen</span>
                    </div>
                    <q-avatar size="110px" class="employee-avatar">
                      <img :src="userDetail?.image" :alt="userDetail?.firstName" />
                    </q-avatar>
                    <div class="text-subtitle2 q-mt-sm">
                      {{ userDetail?.firstName }} {{ userDetail?.lastName }}
                    </div>
                    <div class="text-caption text-grey-7">@{{ userDetail?.username }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="person" color="primary" />
                      <span>Datos personales</span>
                    </div>
                    <div>Edad: {{ userDetail?.age }}</div>
                    <div>Género: {{ userDetail?.gender }}</div>
                    <div>Email: {{ userDetail?.email }}</div>
                    <div>Teléfono: {{ userDetail?.phone }}</div>
                    <div>Fecha de nacimiento: {{ formatDate(userDetail?.birthDate) }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="work" color="primary" />
                      <span>Información laboral</span>
                    </div>
                    <div>Empresa: {{ userDetail?.company?.name }}</div>
                    <div>Cargo: {{ userDetail?.company?.title }}</div>
                    <div>Departamento: {{ userDetail?.company?.department }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="home" color="primary" />
                      <span>Dirección</span>
                    </div>
                    <div>{{ userDetail?.address?.address }}</div>
                    <div>Ciudad: {{ userDetail?.address?.city }}</div>
                    <div>Estado: {{ userDetail?.address?.state }}</div>
                    <div>Código postal: {{ userDetail?.address?.postalCode }}</div>
                    <div>País: {{ userDetail?.address?.country }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="school" color="primary" />
                      <span>Universidad</span>
                    </div>
                    <div>{{ userDetail?.university }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="account_balance" color="primary" />
                      <span>Banco</span>
                    </div>
                    <div>Tipo de tarjeta: {{ userDetail?.bank?.cardType }}</div>
                    <div>Número de tarjeta: {{ maskCardNumber(userDetail?.bank?.cardNumber) }}</div>
                    <div>Vencimiento: {{ userDetail?.bank?.cardExpire }}</div>
                    <div>Moneda: {{ userDetail?.bank?.currency }}</div>
                    <div>IBAN: {{ userDetail?.bank?.iban }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="fitness_center" color="primary" />
                      <span>Información física</span>
                    </div>
                    <div>Altura: {{ userDetail?.height }} cm</div>
                    <div>Peso: {{ userDetail?.weight }} kg</div>
                    <div>Grupo sanguíneo: {{ userDetail?.bloodGroup }}</div>
                    <div>Color de ojos: {{ userDetail?.eyeColor }}</div>
                    <div>Cabello: {{ userDetail?.hair?.color }} ({{ userDetail?.hair?.type }})</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat bordered class="detail-section-card">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="currency_bitcoin" color="primary" />
                      <span>Criptomonedas</span>
                    </div>
                    <div>Moneda: {{ userDetail?.crypto?.coin }}</div>
                    <div>Wallet: {{ userDetail?.crypto?.wallet }}</div>
                    <div>Red: {{ userDetail?.crypto?.network }}</div>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'
import { useUserCarts } from '@/composables/useUserCarts'
import { useUserDetail } from '@/composables/useUserDetail'
import { useUserFilters } from '@/composables/useUserFilters'
import UserFilters from '@/components/UserFilters.vue'
import UserComparison from '@/components/UserComparison.vue'

// --- Datos del store ---
const {
  users,
  total,
  loading,
  selectedUser,
  allUsers,
  loadingAll,
  fetchUsers,
  fetchAllUsers,
  selectUser,
} = useUsers()

// --- Búsqueda (P2) ---
const searchQuery = ref('')

// --- Filtros (P7) ---
const {
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
} = useUserFilters(allUsers)

// --- Estado UI ---
const isDetailOpen = ref(false)
const detailTab = ref('info')

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// --- Detalle y compras (P3 / P4) ---
const { carts, loadingCarts, cartsError, fetchUserCarts } = useUserCarts()
const { userDetail, loadingDetail, detailError, fetchUserDetail, clearUserDetail } =
  useUserDetail()

// --- Lógica de tabla: server-side vs client-side ---
// Cuando los filtros están activos: muestra filteredUsers (modo client-side).
// Cuando no: muestra users paginados desde la API (modo server-side).
const activeRows = computed(() => (filtersActive.value ? filteredUsers.value : users.value))
const tableLoading = computed(() => (filtersActive.value ? loadingAll.value : loading.value))

// v-bind dinámico: agrega @request solo en modo server-side
const serverSideProps = computed(() =>
  filtersActive.value ? {} : { onRequest },
)

// Al cambiar el resultado filtrado, volver a página 1
watch(filteredUsers, () => {
  if (filtersActive.value) pagination.value.page = 1
})

// Al limpiar filtros, recargar tabla paginada desde la API
watch(filtersActive, (active, wasActive) => {
  if (!active && wasActive) {
    loadPage({ page: 1, rowsPerPage: pagination.value.rowsPerPage })
  }
})

// Búsqueda: recargar al cambiar el texto
watch(searchQuery, () => {
  loadPage({ page: 1, rowsPerPage: pagination.value.rowsPerPage })
})

// --- Columnas ---
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

// --- Funciones ---
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
  clearUserDetail()
  await Promise.all([fetchUserDetail(user.id), fetchUserCarts(user.id)])
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function maskCardNumber(cardNumber) {
  if (!cardNumber) return ''
  const digits = cardNumber.replace(/\s+/g, '')
  const lastFour = digits.slice(-4)
  return `**** **** **** ${lastFour}`
}

onMounted(() => {
  // Carga inicial: tabla paginada (P1) + todos los usuarios para filtros/comparación (P7/P8)
  Promise.all([loadPage(pagination.value), fetchAllUsers()])
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

.detail-section-card {
  height: 100%;
  word-break: break-word;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 4px;
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
