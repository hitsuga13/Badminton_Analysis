<template>
  <q-page class="profile-page">
    <div class="profile-card">
      <div class="profile-avatar">{{ draft.initials || 'CO' }}</div>
      <div class="profile-heading">
        <span>Coach Profile</span>
        <h1>{{ draft.name || 'Coach' }}</h1>
        <p>{{ draft.role || 'Coach' }}</p>
      </div>

      <form class="profile-form" @submit.prevent="saveProfile">
        <label>Display name<input v-model.trim="draft.name" required maxlength="40" /></label>
        <label>Role<input v-model.trim="draft.role" required maxlength="60" /></label>
        <label>Initials<input v-model.trim="draft.initials" required maxlength="3" /></label>
        <div class="profile-actions">
          <button class="secondary-action" type="button" @click="resetProfile">Reset</button>
          <button class="primary-action" type="submit">Save Profile</button>
        </div>
      </form>
      <p class="profile-status">{{ status }}</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { defaultSettings, loadSettings, saveSettings } from '@/data/settings'

const settings = loadSettings()
const draft = ref({ ...settings.profile })
const status = ref('')

function saveProfile() {
  settings.profile = {
    name: draft.value.name.trim(),
    role: draft.value.role.trim(),
    initials: draft.value.initials.trim().toUpperCase(),
  }
  saveSettings(settings)
  window.dispatchEvent(new Event('akp-settings-updated'))
  status.value = 'Profile saved'
}

function resetProfile() {
  draft.value = { ...defaultSettings.profile }
  status.value = 'Default profile restored. Save to apply it.'
}
</script>
