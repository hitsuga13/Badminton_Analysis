<template>
  <q-layout view="hHh Lpr fFf" class="app-shell">
    <button
      v-if="isAuthenticated"
      :class="['shell-toggle', drawerOpen && 'shell-toggle--open']"
      type="button"
      :aria-label="drawerOpen ? 'Hide sidebar' : 'Show sidebar'"
      @click="drawerOpen = !drawerOpen"
    >
      <q-icon :name="drawerOpen ? 'menu_open' : 'menu'" size="20px" />
    </button>

    <q-drawer
      v-if="isAuthenticated"
      v-model="drawerOpen"
      show-if-above
      :width="280"
      class="cs-sidebar"
      bordered
    >
      <div class="brand-block">
        <img
          class="brand-mark"
          src="/icons/akp-shuttletrace-mark.svg"
          alt="AKP ShuttleTrace mark"
        />
        <div class="brand-copy">
          <h1>AKP ShuttleTrace</h1>
          <p>Badminton Match & Stroke Notational Analysis System</p>
        </div>
      </div>

      <q-list class="nav-list">
        <q-item-label header class="nav-header">Menu</q-item-label>

        <q-item
          v-for="item in navItems"
          :key="item.to"
          clickable
          :to="item.to"
          exact
          class="nav-item"
          active-class="nav-item--active"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>

      <div class="sidebar-footer">
        <q-item clickable to="/settings" exact class="nav-item" active-class="nav-item--active">
          <q-item-section avatar>
            <q-icon name="settings" size="20px" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>

        <button class="logout-btn" type="button" @click="logout">
          <q-icon name="logout" size="20px" />
          <span>Logout</span>
        </button>

        <div class="coach-card">
          <div class="coach-avatar">CO</div>
          <div>
            <div class="coach-name">Coach O.</div>
            <div class="coach-role">Head Coach</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view @login="handleLogin" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const drawerOpen = ref(true)

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', to: '/' },
  { label: 'Live Match', icon: 'monitor_heart', to: '/live-match' },
  { label: 'Players', icon: 'groups', to: '/players' },
  { label: 'History', icon: 'history', to: '/history' },
]

const isAuthenticated = computed(() => route.path !== '/login')

function handleLogin() {
  router.push('/')
}

function logout() {
  if (window.confirm('Are you sure you want to log out?')) {
    router.push('/login')
  }
}
</script>
