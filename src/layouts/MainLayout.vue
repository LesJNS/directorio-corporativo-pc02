<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="app-header">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-icon name="groups" size="28px" class="q-mx-sm" />
        <q-toolbar-title class="app-header__title">Directorio Corporativo</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navegación</q-item-label>

        <q-item v-ripple clickable exact to="/" active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="groups" />
          </q-item-section>
          <q-item-section>Directorio</q-item-section>
        </q-item>

        <q-item v-ripple clickable exact to="/dashboard" active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped lang="scss">
.app-header {
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
}

.app-header__title {
  font-weight: 500;
  letter-spacing: 0.02em;
}
</style>
