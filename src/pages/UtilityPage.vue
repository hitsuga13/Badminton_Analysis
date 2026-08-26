<template>
  <q-page class="utility-page settings-page">
    <div class="settings-wrap">
      <header class="section-topbar">
        <div>
          <h1>Settings</h1>
          <p>Configure match defaults, appearance and data.</p>
        </div>
        <span class="settings-status">{{ saveStatus }}</span>
      </header>

      <section class="settings-card">
        <h2>Match Defaults</h2>
        <label
          >Default match format
          <select v-model="settings.matchFormat">
            <option value="best-of-3">Best of 3</option>
            <option value="best-of-5">Best of 5</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label v-if="settings.matchFormat === 'custom'"
          >Custom total sets
          <select v-model.number="settings.customSetCount">
            <option v-for="count in [1, 3, 5, 7, 9]" :key="count" :value="count">
              {{ count }}
            </option>
          </select>
        </label>
        <label
          >Default points per set
          <select v-model="settings.pointFormat">
            <option :value="11">11 points</option>
            <option :value="15">15 points</option>
            <option :value="21">21 points</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label v-if="settings.pointFormat === 'custom'"
          >Custom point target
          <input v-model.number="settings.customPointTarget" type="number" min="1" max="99" />
        </label>
        <p class="settings-note">
          Every set uses win-by-two and a cap nine points above the target.
        </p>
      </section>

      <section class="settings-card">
        <h2>Experience</h2>
        <label class="settings-switch"
          ><input v-model="settings.soundEnabled" type="checkbox" /> Enable sound effects</label
        >
        <label
          >Sound volume: {{ settings.soundVolume }}%
          <input v-model.number="settings.soundVolume" type="range" min="0" max="100" step="5" />
        </label>
        <label
          >Theme
          <select v-model="settings.theme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
      </section>

      <section class="settings-card">
        <h2>Analytics</h2>
        <label class="settings-switch"
          ><input v-model="settings.analytics.shotFrequency" type="checkbox" /> Show shot frequency
          chart</label
        >
        <label class="settings-switch"
          ><input v-model="settings.analytics.radar" type="checkbox" /> Show performance
          radar</label
        >
        <label class="settings-switch"
          ><input v-model="settings.analytics.insights" type="checkbox" /> Show match
          insights</label
        >
      </section>

      <section class="settings-card">
        <h2>Players & Data</h2>
        <div class="settings-actions">
          <button class="secondary-action" type="button" @click="router.push('/players')">
            Manage Players
          </button>
          <button class="secondary-action" type="button" @click="exportBackup">
            Export Backup
          </button>
          <label class="secondary-action settings-file-button"
            >Import Backup<input type="file" accept="application/json" @change="importBackup"
          /></label>
          <button class="danger-action" type="button" @click="clearMatchData">
            Clear Match History
          </button>
        </div>
        <p class="settings-note">
          Backup includes players, completed matches and app settings. Clear Match History never
          deletes players or settings.
        </p>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { defaultSettings, applyTheme, loadSettings, saveSettings } from '@/data/settings'
import { playersStorageKey } from '@/data/players'
import { scopedStorageKey } from '@/data/auth'

const router = useRouter()
const settings = ref(loadSettings())
const saveStatus = ref('Saved')
const scopedPlayersStorageKey = scopedStorageKey(playersStorageKey)
const historyStorageKey = scopedStorageKey('akp-shuttletrace:match-history')
const deletedHistoryStorageKey = scopedStorageKey('akp-shuttletrace:deleted-match-history')
const notationStorageKey = scopedStorageKey('akp-shuttletrace:last-match-notation')

applyTheme(settings.value.theme)

watch(
  settings,
  (nextSettings) => {
    nextSettings.soundVolume = Math.min(Math.max(Number(nextSettings.soundVolume) || 0, 0), 100)
    nextSettings.customPointTarget = Math.min(
      Math.max(Number(nextSettings.customPointTarget) || 1, 1),
      99,
    )
    saveSettings(nextSettings)
    applyTheme(nextSettings.theme)
    saveStatus.value = 'Saved automatically'
  },
  { deep: true },
)

function exportBackup() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    players: JSON.parse(window.localStorage.getItem(scopedPlayersStorageKey) ?? '[]'),
    history: JSON.parse(window.localStorage.getItem(historyStorageKey) ?? '[]'),
    deletedHistory: JSON.parse(window.localStorage.getItem(deletedHistoryStorageKey) ?? '[]'),
    settings: settings.value,
  }
  downloadJson(backup, `akp-shuttletrace-backup-${new Date().toISOString().slice(0, 10)}.json`)
}

function importBackup(event) {
  const [file] = event.target.files ?? []
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const backup = JSON.parse(String(reader.result))
      if (!window.confirm('Replace current players, match history and settings with this backup?'))
        return
      window.localStorage.setItem(
        scopedPlayersStorageKey,
        JSON.stringify(Array.isArray(backup.players) ? backup.players : []),
      )
      window.localStorage.setItem(
        historyStorageKey,
        JSON.stringify(Array.isArray(backup.history) ? backup.history : []),
      )
      window.localStorage.setItem(
        deletedHistoryStorageKey,
        JSON.stringify(Array.isArray(backup.deletedHistory) ? backup.deletedHistory : []),
      )
      settings.value = { ...structuredClone(defaultSettings), ...(backup.settings ?? {}) }
      saveStatus.value = 'Backup imported'
    } catch {
      saveStatus.value = 'Invalid backup file'
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

function clearMatchData() {
  if (!window.confirm('Delete all current and deleted match history? This cannot be undone.'))
    return
  window.localStorage.removeItem(historyStorageKey)
  window.localStorage.removeItem(deletedHistoryStorageKey)
  window.localStorage.removeItem(notationStorageKey)
  saveStatus.value = 'Match history cleared'
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
</script>
