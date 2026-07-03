<template>
  <q-expansion-item
    v-model="panelOpen"
    icon="filter_list"
    :label="panelLabel"
    :header-class="filtersActive ? 'text-primary text-weight-bold' : 'text-grey-8 text-weight-medium'"
    class="filter-panel q-mb-md"
  >
    <q-card flat bordered>
      <q-card-section>
        <div v-if="loadingAll" class="row items-center q-gutter-sm q-py-sm">
          <q-spinner-dots size="24px" color="primary" />
          <span class="text-grey-7 text-body2">Cargando opciones de filtro…</span>
        </div>

        <div v-else class="row q-col-gutter-md items-end">
          <!-- Género -->
          <div class="col-12 col-sm-auto">
            <div class="text-caption text-grey-7 q-mb-xs">Género</div>
            <q-btn-toggle
              :model-value="filterGender"
              @update:model-value="$emit('update:filterGender', $event)"
              :options="genderOptions"
              unelevated
              rounded
              dense
              size="sm"
              color="grey-2"
              text-color="grey-8"
              toggle-color="primary"
              toggle-text-color="white"
            />
          </div>

          <!-- Rango de edad -->
          <div class="col-12 col-sm-5 col-md-3">
            <div class="text-caption text-grey-7 q-mb-xs">
              Edad: <strong>{{ filterAge.min }}</strong> – <strong>{{ filterAge.max }}</strong> años
            </div>
            <q-range
              :model-value="filterAge"
              @update:model-value="$emit('update:filterAge', $event)"
              :min="ageMin"
              :max="ageMax"
              color="primary"
              label
              class="q-px-sm"
            />
          </div>

          <!-- Empresa -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-select
              :model-value="filterCompany"
              @update:model-value="$emit('update:filterCompany', $event ?? '')"
              :options="filteredCompanies"
              label="Empresa"
              clearable
              dense
              outlined
              options-dense
              use-input
              input-debounce="0"
              @filter="filterCompaniesFn"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Ciudad -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-select
              :model-value="filterCity"
              @update:model-value="$emit('update:filterCity', $event ?? '')"
              :options="filteredCities"
              label="Ciudad"
              clearable
              dense
              outlined
              options-dense
              use-input
              input-debounce="0"
              @filter="filterCitiesFn"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- País -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-select
              :model-value="filterCountry"
              @update:model-value="$emit('update:filterCountry', $event ?? '')"
              :options="filteredCountries"
              label="País"
              clearable
              dense
              outlined
              options-dense
              use-input
              input-debounce="0"
              @filter="filterCountriesFn"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Limpiar -->
          <div class="col-12 col-sm-auto">
            <q-btn
              flat
              dense
              color="negative"
              icon="clear"
              label="Limpiar filtros"
              :disable="!filtersActive"
              @click="$emit('clear')"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  filterGender: { type: String, default: '' },
  filterAge: { type: Object, default: () => ({ min: 0, max: 100 }) },
  filterCompany: { type: String, default: '' },
  filterCity: { type: String, default: '' },
  filterCountry: { type: String, default: '' },
  ageMin: { type: Number, default: 0 },
  ageMax: { type: Number, default: 100 },
  companies: { type: Array, default: () => [] },
  cities: { type: Array, default: () => [] },
  countries: { type: Array, default: () => [] },
  filtersActive: { type: Boolean, default: false },
  filteredCount: { type: Number, default: 0 },
  loadingAll: { type: Boolean, default: false },
})

defineEmits([
  'update:filterGender',
  'update:filterAge',
  'update:filterCompany',
  'update:filterCity',
  'update:filterCountry',
  'clear',
])

const panelOpen = ref(false)

const genderOptions = [
  { label: 'Todos', value: '' },
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
]

const panelLabel = computed(() =>
  props.filtersActive
    ? `Filtros activos · ${props.filteredCount} resultado(s)`
    : 'Filtros',
)

// Listas locales para el filtrado por texto dentro de cada select
const filteredCompanies = ref([])
const filteredCities = ref([])
const filteredCountries = ref([])

watch(() => props.companies, (val) => { filteredCompanies.value = val }, { immediate: true })
watch(() => props.cities, (val) => { filteredCities.value = val }, { immediate: true })
watch(() => props.countries, (val) => { filteredCountries.value = val }, { immediate: true })

function filterCompaniesFn(val, update) {
  update(() => {
    const q = val.toLowerCase()
    filteredCompanies.value = q
      ? props.companies.filter((c) => c.toLowerCase().includes(q))
      : props.companies
  })
}

function filterCitiesFn(val, update) {
  update(() => {
    const q = val.toLowerCase()
    filteredCities.value = q
      ? props.cities.filter((c) => c.toLowerCase().includes(q))
      : props.cities
  })
}

function filterCountriesFn(val, update) {
  update(() => {
    const q = val.toLowerCase()
    filteredCountries.value = q
      ? props.countries.filter((c) => c.toLowerCase().includes(q))
      : props.countries
  })
}
</script>

<style scoped lang="scss">
.filter-panel {
  border-radius: $app-card-radius;
  border: 1px solid rgba(0, 0, 0, 0.12);
  overflow: hidden;
}
</style>
