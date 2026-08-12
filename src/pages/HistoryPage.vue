<template>
  <q-page class="history-page">
    <header class="section-topbar">
      <div>
        <h1>Match History</h1>
        <p>{{ history.length }} saved matches - {{ deletedHistory.length }} recently deleted</p>
      </div>

      <button class="primary-action" type="button" @click="$router.push('/live-match')">
        <q-icon name="add" size="18px" />
        New Match
      </button>
    </header>

    <section v-if="history.length === 0" class="history-empty">
      <q-icon name="history" size="42px" />
      <h2>No match history yet</h2>
      <p>End a Live Match first, then the saved match will appear here.</p>
    </section>

    <section v-else class="history-list">
      <article v-for="matchReport in history" :key="matchReport.match.id" class="history-card">
        <div class="history-card-main">
          <div>
            <span>{{ formatDate(matchReport.match.savedAt) }}</span>
            <h2>{{ matchReport.match.playerA }} vs {{ matchReport.match.playerB }}</h2>
          </div>

          <div class="history-badges">
            <span>{{ statusLabel(matchReport.match.status) }}</span>
            <span>First serve: {{ matchReport.match.firstServerCode ?? '-' }}</span>
          </div>
        </div>

        <div class="history-metrics">
          <div>
            <span>Rallies</span>
            <strong>{{ matchReport.match.totalRallies ?? 0 }}</strong>
          </div>
          <div>
            <span>Shots</span>
            <strong>{{ matchReport.match.totalShots ?? 0 }}</strong>
          </div>
          <div>
            <span>Longest</span>
            <strong>{{ longestRally(matchReport) }}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{{ totalDuration(matchReport) }}</strong>
          </div>
        </div>

        <div class="history-actions">
          <button class="secondary-action" type="button" @click="selectedMatch = matchReport">
            View Details
          </button>
          <button class="history-danger-action" type="button" @click="deleteHistory(matchReport)">
            <q-icon name="delete" size="18px" />
            Delete
          </button>
        </div>
      </article>
    </section>

    <section class="history-deleted-section">
      <div class="history-section-head">
        <div>
          <h2>Recently Deleted</h2>
          <p>{{ deletedHistory.length }} matches can be restored</p>
        </div>
        <button
          class="secondary-action"
          type="button"
          :disabled="deletedHistory.length === 0"
          @click="clearDeletedHistory"
        >
          Clear Deleted
        </button>
      </div>

      <div v-if="deletedHistory.length === 0" class="history-muted">
        Deleted matches will appear here before permanent removal.
      </div>

      <div v-else class="history-deleted-list">
        <article
          v-for="matchReport in deletedHistory"
          :key="`deleted-${matchReport.match.id}`"
          class="history-deleted-card"
        >
          <div>
            <span>{{ formatDate(matchReport.deletedAt) }}</span>
            <strong>{{ matchReport.match.playerA }} vs {{ matchReport.match.playerB }}</strong>
            <em>Deleted from {{ formatDate(matchReport.match.savedAt) }}</em>
          </div>

          <div class="history-actions">
            <button class="secondary-action" type="button" @click="restoreHistory(matchReport)">
              <q-icon name="restore" size="18px" />
              Restore
            </button>
            <button
              class="history-danger-action"
              type="button"
              @click="permanentlyDelete(matchReport)"
            >
              Delete Forever
            </button>
          </div>
        </article>
      </div>
    </section>

    <q-dialog :model-value="Boolean(selectedMatch)" @update:model-value="selectedMatch = null">
      <div v-if="selectedMatch" class="history-dialog">
        <div class="dialog-head">
          <h2>{{ selectedMatch.match.playerA }} vs {{ selectedMatch.match.playerB }}</h2>
          <button type="button" @click="selectedMatch = null">
            <q-icon name="close" size="20px" />
          </button>
        </div>

        <div class="history-detail-grid">
          <div>
            <span>Status</span>
            <strong>{{ statusLabel(selectedMatch.match.status) }}</strong>
          </div>
          <div>
            <span>Saved</span>
            <strong>{{ formatDate(selectedMatch.match.savedAt) }}</strong>
          </div>
          <div>
            <span>First Server</span>
            <strong>{{ selectedMatch.match.firstServer }}</strong>
          </div>
          <div>
            <span>Total Duration</span>
            <strong>{{ totalDuration(selectedMatch) }}</strong>
          </div>
        </div>

        <div class="history-timeline">
          <h3>Rally Outcomes</h3>
          <div v-if="selectedMatch.rallyOutcomes.length === 0" class="history-muted">
            No rally outcomes recorded.
          </div>
          <div
            v-for="outcome in selectedMatch.rallyOutcomes"
            :key="`${selectedMatch.match.id}-${outcome.rallyNumber}`"
            class="history-rally-row"
          >
            <span>Rally {{ outcome.rallyNumber }}</span>
            <strong>{{ outcome.outcome }}</strong>
            <em>{{ outcome.shots }} shots - {{ outcome.durationLabel ?? '00:00' }}</em>
          </div>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const historyStorageKey = 'akp-shuttletrace:match-history'
const legacyHistoryStorageKey = `court${'sense'}:match-history`
const deletedHistoryStorageKey = 'akp-shuttletrace:deleted-match-history'
const legacyDeletedHistoryStorageKey = `court${'sense'}:deleted-match-history`
const notationStorageKey = 'akp-shuttletrace:last-match-notation'
const history = ref([])
const deletedHistory = ref([])
const selectedMatch = ref(null)

onMounted(() => {
  history.value = loadHistory()
  deletedHistory.value = loadDeletedHistory()
})

function loadHistory() {
  if (typeof window === 'undefined') return []

  const storedHistory = parseStoredJson(
    window.localStorage.getItem(historyStorageKey) ??
      window.localStorage.getItem(legacyHistoryStorageKey),
    [],
  )
  if (storedHistory.length > 0) return normalizeHistory(storedHistory)

  const latestReport = parseStoredJson(
    window.localStorage.getItem(notationStorageKey) ??
      window.localStorage.getItem(`court${'sense'}:last-match-notation`),
    null,
  )
  if (!latestReport?.match) return []

  return normalizeHistory([latestReport])
}

function loadDeletedHistory() {
  if (typeof window === 'undefined') return []

  return normalizeHistory(
    parseStoredJson(
      window.localStorage.getItem(deletedHistoryStorageKey) ??
        window.localStorage.getItem(legacyDeletedHistoryStorageKey),
      [],
    ),
  )
}

function normalizeHistory(items) {
  return items
    .filter((item) => item?.match)
    .map((item) => ({
      ...item,
      match: {
        ...item.match,
        id: item.match.id ?? `legacy-${item.match.savedAt ?? item.match.playerA}`,
      },
      notation: item.notation ?? [],
      rallyOutcomes: item.rallyOutcomes ?? [],
    }))
    .sort((a, b) => new Date(b.match.savedAt ?? 0) - new Date(a.match.savedAt ?? 0))
}

function parseStoredJson(rawValue, fallback) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function deleteHistory(matchReport) {
  const deletedReport = {
    ...matchReport,
    deletedAt: new Date().toISOString(),
  }

  history.value = history.value.filter((item) => item.match.id !== matchReport.match.id)
  deletedHistory.value = normalizeHistory([
    deletedReport,
    ...deletedHistory.value.filter((item) => item.match.id !== matchReport.match.id),
  ])
  selectedMatch.value = null
  persistHistory()
}

function restoreHistory(matchReport) {
  history.value = normalizeHistory([
    matchReport,
    ...history.value.filter((item) => item.match.id !== matchReport.match.id),
  ])
  deletedHistory.value = deletedHistory.value.filter(
    (item) => item.match.id !== matchReport.match.id,
  )
  persistHistory()
}

function permanentlyDelete(matchReport) {
  deletedHistory.value = deletedHistory.value.filter(
    (item) => item.match.id !== matchReport.match.id,
  )
  persistHistory()
}

function clearDeletedHistory() {
  deletedHistory.value = []
  persistHistory()
}

function persistHistory() {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(historyStorageKey, JSON.stringify(history.value))
  window.localStorage.setItem(deletedHistoryStorageKey, JSON.stringify(deletedHistory.value))
  syncLatestNotation()
}

function syncLatestNotation() {
  if (typeof window === 'undefined') return

  const latest = history.value[0]
  if (latest) {
    window.localStorage.setItem(notationStorageKey, JSON.stringify(latest))
    return
  }

  window.localStorage.removeItem(notationStorageKey)
}

function formatDate(value) {
  if (!value) return 'Unknown date'

  return new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function statusLabel(status) {
  const labels = {
    ended: 'Ended',
    live: 'Live',
    'coin-flip': 'Coin Flip',
  }

  return labels[status] ?? status ?? 'Unknown'
}

function longestRally(matchReport) {
  return Math.max(0, ...matchReport.rallyOutcomes.map((outcome) => outcome.shots ?? 0))
}

function totalDuration(matchReport) {
  const totalMs = matchReport.rallyOutcomes.reduce(
    (total, outcome) => total + (outcome.durationMs ?? 0),
    0,
  )

  return formatDuration(totalMs)
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
</script>
