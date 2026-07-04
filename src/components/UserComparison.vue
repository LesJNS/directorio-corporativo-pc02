<template>
  <q-btn
    color="primary"
    icon="compare_arrows"
    label="Comparar"
    unelevated
    dense
    @click="open = true"
  >
    <q-tooltip>Selecciona dos empleados y compáralos lado a lado</q-tooltip>
  </q-btn>

  <q-dialog v-model="open" @hide="onDialogHide">
    <q-card style="width: 860px; max-width: 96vw">
      <q-card-section class="row items-center justify-between q-pb-sm">
        <div class="text-h6 row items-center q-gutter-sm">
          <q-icon name="compare_arrows" color="primary" />
          <span>Comparación de empleados</span>
        </div>
        <q-btn v-close-popup flat round dense icon="close" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-md">
        <!-- Selectores -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="user1"
              :options="options1"
              option-label="fullName"
              option-value="id"
              use-input
              input-debounce="150"
              label="Empleado 1"
              outlined
              clearable
              options-dense
              @filter="filterFn1"
            >
              <template v-slot:selected-item="scope">
                <div class="row items-center q-gutter-sm">
                  <q-avatar size="24px">
                    <img :src="scope.opt.image" :alt="scope.opt.fullName" />
                  </q-avatar>
                  <span>{{ scope.opt.fullName }}</span>
                </div>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar size="36px">
                      <img :src="scope.opt.image" :alt="scope.opt.fullName" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.fullName }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.company?.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-sm-6">
            <q-select
              v-model="user2"
              :options="options2"
              option-label="fullName"
              option-value="id"
              use-input
              input-debounce="150"
              label="Empleado 2"
              outlined
              clearable
              options-dense
              @filter="filterFn2"
            >
              <template v-slot:selected-item="scope">
                <div class="row items-center q-gutter-sm">
                  <q-avatar size="24px">
                    <img :src="scope.opt.image" :alt="scope.opt.fullName" />
                  </q-avatar>
                  <span>{{ scope.opt.fullName }}</span>
                </div>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar size="36px">
                      <img :src="scope.opt.image" :alt="scope.opt.fullName" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.fullName }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.company?.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <!-- Aviso: selección incompleta -->
        <q-banner
          v-if="!user1 || !user2"
          class="bg-blue-1 text-blue-9 q-mb-md"
          rounded
        >
          <template #avatar>
            <q-icon name="info" color="blue" />
          </template>
          Selecciona dos empleados para ver la comparación lado a lado.
          <span v-if="(user1 && !user2) || (!user1 && user2)">
            Falta elegir {{ !user1 ? 'el Empleado 1' : 'el Empleado 2' }}.
          </span>
        </q-banner>

        <!-- Tabla comparativa -->
        <template v-else>
          <!-- Cabecera con avatares -->
          <div class="row items-center q-mb-sm comparison-header">
            <div class="col-4" />
            <div class="col-4 text-center">
              <q-avatar size="54px" class="comparison-avatar comparison-avatar--1">
                <img :src="user1.image" :alt="user1.fullName" />
              </q-avatar>
              <div class="text-subtitle2 text-weight-bold text-primary q-mt-xs">
                {{ user1.fullName }}
              </div>
              <div class="text-caption text-grey-7">{{ user1.company?.name }}</div>
            </div>
            <div class="col-4 text-center">
              <q-avatar size="54px" class="comparison-avatar comparison-avatar--2">
                <img :src="user2.image" :alt="user2.fullName" />
              </q-avatar>
              <div class="text-subtitle2 text-weight-bold text-secondary q-mt-xs">
                {{ user2.fullName }}
              </div>
              <div class="text-caption text-grey-7">{{ user2.company?.name }}</div>
            </div>
          </div>

          <q-table
            flat
            bordered
            :rows="comparisonRows"
            :columns="comparisonColumns"
            row-key="field"
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
            class="comparison-table"
          >
            <template v-slot:body="props">
              <q-tr :props="props" :class="props.rowIndex % 2 === 0 ? '' : 'bg-grey-1'">
                <q-td key="field" class="text-weight-medium text-grey-8 field-col">
                  {{ props.row.field }}
                </q-td>
                <q-td key="user1" class="text-center text-primary">
                  {{ props.row.user1 }}
                </q-td>
                <q-td key="user2" class="text-center text-secondary">
                  {{ props.row.user2 }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  users: { type: Array, default: () => [] },
})

const open = ref(false)
const user1 = ref(null)
const user2 = ref(null)
const options1 = ref([])
const options2 = ref([])

const usersWithFullName = computed(() =>
  props.users.map((u) => ({ ...u, fullName: `${u.firstName} ${u.lastName}` })),
)

function filterFn1(val, update) {
  update(() => {
    const q = val.toLowerCase()
    options1.value = q
      ? usersWithFullName.value.filter(
          (u) =>
            u.fullName.toLowerCase().includes(q) ||
            (u.company?.name ?? '').toLowerCase().includes(q),
        )
      : usersWithFullName.value
  })
}

function filterFn2(val, update) {
  update(() => {
    const q = val.toLowerCase()
    options2.value = q
      ? usersWithFullName.value.filter(
          (u) =>
            u.fullName.toLowerCase().includes(q) ||
            (u.company?.name ?? '').toLowerCase().includes(q),
        )
      : usersWithFullName.value
  })
}

function onDialogHide() {
  user1.value = null
  user2.value = null
}

const comparisonColumns = computed(() => [
  { name: 'field', label: 'Campo', field: 'field', align: 'left' },
  {
    name: 'user1',
    label: user1.value?.fullName ?? 'Empleado 1',
    field: 'user1',
    align: 'center',
  },
  {
    name: 'user2',
    label: user2.value?.fullName ?? 'Empleado 2',
    field: 'user2',
    align: 'center',
  },
])

const comparisonRows = computed(() => {
  if (!user1.value || !user2.value) return []
  const u1 = user1.value
  const u2 = user2.value
  const genero = (g) => (g === 'male' ? 'Masculino' : 'Femenino')
  return [
    { field: 'Nombre completo', user1: u1.fullName, user2: u2.fullName },
    { field: 'Edad', user1: `${u1.age} años`, user2: `${u2.age} años` },
    { field: 'Género', user1: genero(u1.gender), user2: genero(u2.gender) },
    { field: 'Empresa', user1: u1.company?.name ?? '—', user2: u2.company?.name ?? '—' },
    { field: 'Cargo', user1: u1.company?.title ?? '—', user2: u2.company?.title ?? '—' },
    { field: 'Universidad', user1: u1.university ?? '—', user2: u2.university ?? '—' },
    { field: 'Ciudad', user1: u1.address?.city ?? '—', user2: u2.address?.city ?? '—' },
    { field: 'País', user1: u1.address?.country ?? '—', user2: u2.address?.country ?? '—' },
    {
      field: 'Altura',
      user1: u1.height != null ? `${u1.height} cm` : '—',
      user2: u2.height != null ? `${u2.height} cm` : '—',
    },
    {
      field: 'Peso',
      user1: u1.weight != null ? `${u1.weight} kg` : '—',
      user2: u2.weight != null ? `${u2.weight} kg` : '—',
    },
    {
      field: 'Grupo sanguíneo',
      user1: u1.bloodGroup ?? '—',
      user2: u2.bloodGroup ?? '—',
    },
  ]
})
</script>

<style scoped lang="scss">
.comparison-avatar {
  transition: transform 0.2s ease;

  &--1 {
    box-shadow: 0 0 0 3px $primary;
  }

  &--2 {
    box-shadow: 0 0 0 3px $secondary;
  }
}

.field-col {
  width: 33%;
}

:deep(.comparison-table thead tr th:nth-child(2)) {
  color: $primary;
  font-weight: 600;
}

:deep(.comparison-table thead tr th:nth-child(3)) {
  color: $secondary;
  font-weight: 600;
}
</style>
