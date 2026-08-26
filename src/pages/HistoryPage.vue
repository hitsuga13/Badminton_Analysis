<template>
  <q-page class="history-page">
    <header class="section-topbar">
      <div>
        <h1>Match History</h1>
        <p>
          {{ filteredHistory.length }} shown - {{ history.length }} saved -
          {{ deletedHistory.length }} recently deleted
        </p>
      </div>

      <button class="primary-action" type="button" @click="$router.push('/live-match')">
        <q-icon name="add" size="18px" />
        New Match
      </button>
    </header>

    <section class="history-filter-bar">
      <button
        v-for="option in historyFilterOptions"
        :key="option.value"
        :class="[
          'history-filter-button',
          historyFilter === option.value && 'history-filter-button--active',
        ]"
        type="button"
        @click="historyFilter = option.value"
      >
        <q-icon :name="option.icon" size="18px" />
        <span>{{ option.label }}</span>
        <strong>{{ filterCount(option.value) }}</strong>
      </button>
    </section>

    <section v-if="history.length === 0" class="history-empty">
      <q-icon name="history" size="42px" />
      <h2>No match history yet</h2>
      <p>End a Live Match or Training session first, then the saved record will appear here.</p>
    </section>

    <section v-else-if="filteredHistory.length === 0" class="history-empty">
      <q-icon name="filter_alt" size="42px" />
      <h2>No {{ activeFilterLabel }} records</h2>
      <p>Choose another filter or save a new {{ activeFilterLabel }} session.</p>
    </section>

    <section v-else class="history-list">
      <article
        v-for="matchReport in filteredHistory"
        :key="matchReport.match.id"
        class="history-card"
      >
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
import { computed, onMounted, ref } from 'vue'
import { isLoggedIn, scopedStorageKey } from '@/data/auth'
import { api } from '../boot/axios'

const historyStorageKey = scopedStorageKey('akp-shuttletrace:match-history')
const legacyHistoryStorageKey = `court${'sense'}:match-history`
const deletedHistoryStorageKey = scopedStorageKey('akp-shuttletrace:deleted-match-history')
const legacyDeletedHistoryStorageKey = `court${'sense'}:deleted-match-history`
const notationStorageKey = scopedStorageKey('akp-shuttletrace:last-match-notation')
const history = ref([])
const deletedHistory = ref([])
const selectedMatch = ref(null)
const historyFilter = ref('all')
const historyFilterOptions = [
  { value: 'all', label: 'All', icon: 'apps' },
  { value: 'live-match', label: 'Live Match', icon: 'monitor_heart' },
  { value: 'training', label: 'Training', icon: 'fitness_center' },
]

const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') return history.value
  return history.value.filter((item) => historyType(item) === historyFilter.value)
})

const activeFilterLabel = computed(
  () =>
    historyFilterOptions.find((option) => option.value === historyFilter.value)?.label ??
    'selected',
)

onMounted(async () => {
  history.value = await loadHistory()
  deletedHistory.value = loadDeletedHistory()
})

async function loadHistory() {
  if (typeof window === 'undefined') return []

  const localHistory = loadLocalHistory()
  try {
    const [matchesResponse, trainingResponse] = await Promise.all([
      api.get('/matches'),
      api.get('/training'),
    ])
    const remoteHistory = normalizeHistory([
      ...normalizeRemoteMatches(matchesResponse.data),
      ...normalizeRemoteTraining(trainingResponse.data),
    ])

    if (remoteHistory.length > 0) {
      return normalizeHistory([
        ...remoteHistory,
        ...localHistory.filter(
          (localItem) =>
            !remoteHistory.some((remoteItem) => remoteItem.match.id === localItem.match.id),
        ),
      ])
    }
  } catch {
    return localHistory
  }

  return localHistory
}

function loadLocalHistory() {
  if (typeof window === 'undefined') return []

  const storedHistory = parseStoredJson(
    window.localStorage.getItem(historyStorageKey) ??
      (isLoggedIn() ? null : window.localStorage.getItem(legacyHistoryStorageKey)),
    [],
  )
  if (storedHistory.length > 0) return normalizeHistory(storedHistory)

  const latestReport = parseStoredJson(
    window.localStorage.getItem(notationStorageKey) ??
      (isLoggedIn() ? null : window.localStorage.getItem(`court${'sense'}:last-match-notation`)),
    null,
  )
  if (!latestReport?.match) return []

  return normalizeHistory([latestReport])
}

function normalizeRemoteMatches(matches) {
  if (!Array.isArray(matches)) return []

  return matches.map((match) => ({
    match: {
      id: `db-match-${match.id}`,
      databaseId: match.id,
      status: match.status ?? 'ended',
      playerA: match.player1?.name ?? 'Player A',
      playerB: match.player2?.name ?? 'Player B',
      playerAId: match.player1Id,
      playerBId: match.player2Id,
      totalRallies: match.totalRallies ?? match.rallies?.length ?? 0,
      totalShots: match.totalShots ?? match.shotRecords?.length ?? 0,
      scoreA: match.player1Score ?? 0,
      scoreB: match.player2Score ?? 0,
      gamesA: match.sets?.filter((set) => set.winnerId === match.player1Id).length ?? 0,
      gamesB: match.sets?.filter((set) => set.winnerId === match.player2Id).length ?? 0,
      firstServer: '-',
      firstServerCode: '-',
      scoringFormat: match.matchFormat ?? '-',
      savedAt: match.endedAt ?? match.date,
    },
    notation: (match.rallies ?? []).flatMap((rally) =>
      (rally.shotRecords ?? []).map((shot) => ({
        id: `db-shot-${shot.id}`,
        rallyNumber: rally.rallyNumber,
        player: shot.playerId === match.player1Id ? 'A' : 'B',
        playerName: shot.player?.name ?? '-',
        shot: shot.shotType?.name ?? shot.shot,
        timestamp: shot.timestamp,
        result: shot.result,
      })),
    ),
    rallyOutcomes: (match.rallies ?? []).map((rally) => ({
      rallyNumber: rally.rallyNumber,
      outcome: rally.outcome,
      shots: rally.shots,
      durationMs: rally.durationMs,
      durationLabel: formatDuration(rally.durationMs ?? 0),
      endingType: rally.outcomeType,
      endingReason: rally.outcomeReason,
      pointWinnerName: rally.winner?.name ?? '-',
    })),
    setDurations: match.sets ?? [],
    database: { status: 'saved', id: match.id },
  }))
}

function normalizeRemoteTraining(sessions) {
  if (!Array.isArray(sessions)) return []

  return sessions.map((session) => ({
    match: {
      id: `db-training-${session.id}`,
      databaseId: session.id,
      status: 'training',
      playerA: session.player?.name ?? 'Training Player',
      playerB: session.shotType?.name ?? session.shot,
      firstServer: session.player?.name ?? 'Training Player',
      firstServerCode: 'Training',
      totalRallies: session.completedReps ?? 0,
      totalShots: session.completedReps ?? 0,
      scoreA: session.successfulReps ?? 0,
      scoreB: session.unsuccessfulReps ?? 0,
      gamesA: session.successfulReps ?? 0,
      gamesB: session.unsuccessfulReps ?? 0,
      scoringFormat: `${session.targetReps} repetitions, ${session.accuracy}% accuracy`,
      savedAt: session.savedAt,
    },
    notation: (session.reps ?? []).map((rep) => ({
      id: `db-rep-${rep.id}`,
      rallyNumber: rep.repNumber,
      player: 'Training',
      playerName: session.player?.name ?? 'Training Player',
      shot: session.shotType?.name ?? session.shot,
      timestamp: rep.recordedAt,
      result: rep.successful ? 'Successful' : 'Unsuccessful',
    })),
    rallyOutcomes: [
      {
        rallyNumber: 1,
        outcome: `${session.shotType?.name ?? session.shot} drill: ${session.successfulReps} successful, ${session.unsuccessfulReps} unsuccessful`,
        shots: session.completedReps,
        durationMs: session.durationMs,
        durationLabel: formatDuration(session.durationMs ?? 0),
        endingType: 'training',
        pointWinnerName: `${session.accuracy}% accuracy`,
      },
    ],
    training: {
      playerId: session.playerId,
      playerName: session.player?.name ?? 'Training Player',
      shot: session.shotType?.name ?? session.shot,
      targetReps: session.targetReps,
      completedReps: session.completedReps,
      successfulReps: session.successfulReps,
      unsuccessfulReps: session.unsuccessfulReps,
      accuracy: session.accuracy,
      records: session.reps ?? [],
    },
    database: { status: 'saved', id: session.id },
  }))
}

function loadDeletedHistory() {
  if (typeof window === 'undefined') return []

  return normalizeHistory(
    parseStoredJson(
      window.localStorage.getItem(deletedHistoryStorageKey) ??
        (isLoggedIn() ? null : window.localStorage.getItem(legacyDeletedHistoryStorageKey)),
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

async function deleteHistory(matchReport) {
  const deletedReport = {
    ...matchReport,
    deletedAt: new Date().toISOString(),
  }

  await softDeleteRemoteHistory(matchReport)

  history.value = history.value.filter((item) => item.match.id !== matchReport.match.id)
  deletedHistory.value = normalizeHistory([
    deletedReport,
    ...deletedHistory.value.filter((item) => item.match.id !== matchReport.match.id),
  ])
  selectedMatch.value = null
  persistHistory()
}

async function softDeleteRemoteHistory(matchReport) {
  const databaseId = matchReport?.match?.databaseId
  if (!databaseId) return

  try {
    if (historyType(matchReport) === 'training') {
      await api.delete(`/training/${databaseId}`)
      return
    }
    await api.delete(`/matches/${databaseId}`)
  } catch {
    // Keep local recently-deleted behavior even when backend sync is unavailable.
  }
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
    training: 'Training',
  }

  return labels[status] ?? status ?? 'Unknown'
}

function historyType(matchReport) {
  return matchReport?.match?.status === 'training' ? 'training' : 'live-match'
}

function filterCount(filterValue) {
  if (filterValue === 'all') return history.value.length
  return history.value.filter((item) => historyType(item) === filterValue).length
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
