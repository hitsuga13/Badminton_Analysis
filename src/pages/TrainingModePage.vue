<template>
  <q-page class="training-page">
    <section v-if="!sessionActive" class="match-setup">
      <div class="setup-card training-setup-card">
        <div>
          <h1>Training Mode</h1>
          <p>Set a drill target, then record every repetition as successful or unsuccessful.</p>
        </div>

        <div class="match-format-select">
          <span class="select-label">Player</span>
          <div class="training-player-grid">
            <button
              v-for="player in availablePlayers"
              :key="player.id"
              :class="[
                'player-select-card',
                selectedPlayerId === player.id && 'player-select-card--active',
              ]"
              type="button"
              @click="selectedPlayerId = player.id"
            >
              <strong>{{ player.name }}</strong>
              <span>{{ player.category }}</span>
            </button>
          </div>

          <span class="select-label">Training variable</span>
          <div class="training-variable-grid">
            <button
              v-for="shot in shotTypes"
              :key="shot.type"
              :class="[
                'player-select-card',
                selectedShot === shot.type && 'player-select-card--active',
              ]"
              type="button"
              @click="selectedShot = shot.type"
            >
              <strong>{{ shot.type }}</strong>
              <span>{{ shot.category }}</span>
            </button>
          </div>

          <span class="select-label">Repetitions</span>
          <div class="training-rep-grid">
            <button
              v-for="rep in repetitionOptions"
              :key="rep"
              :class="[
                'player-select-card',
                selectedRepetition === rep && 'player-select-card--active',
              ]"
              type="button"
              @click="selectedRepetition = rep"
            >
              <strong>{{ rep }}</strong>
              <span>total reps</span>
            </button>

            <button
              :class="[
                'player-select-card',
                selectedRepetition === 'custom' && 'player-select-card--active',
              ]"
              type="button"
              @click="selectedRepetition = 'custom'"
            >
              <strong>Custom</strong>
              <span>{{ customRepetitionTarget }} reps</span>
            </button>
          </div>

          <label v-if="selectedRepetition === 'custom'" class="custom-set-control">
            <span>Target reps</span>
            <input v-model.number="customRepetitionTarget" type="number" min="1" max="999" />
          </label>
        </div>

        <button
          class="primary-action"
          type="button"
          :disabled="!canStartTraining"
          @click="startTraining"
        >
          <q-icon name="fitness_center" size="20px" />
          Start Training
        </button>
      </div>
    </section>

    <section v-else class="training-recorder">
      <header class="live-topbar">
        <div class="live-title">
          <span>Training</span>
          <i />
          <strong>{{ selectedShot }}</strong>
          <em>{{ completedReps }} / {{ targetReps }} reps</em>
        </div>

        <div class="live-actions">
          <div class="rally-chip">
            <span>Accuracy</span>
            <strong>{{ accuracy }}%</strong>
          </div>
          <button
            class="primary-action"
            type="button"
            :disabled="completedReps === 0"
            @click="endTraining"
          >
            <q-icon name="stop_circle" size="18px" />
            End Training
          </button>
          <button class="secondary-action" type="button" @click="resetTraining">
            <q-icon name="restart_alt" size="18px" />
            Reset
          </button>
        </div>
      </header>

      <div class="training-progress">
        <div>
          <span>Progress</span>
          <strong>{{ remainingReps }} remaining</strong>
        </div>
        <div class="training-progress-track">
          <div class="training-progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>
      </div>

      <div class="training-action-grid">
        <button
          class="shot-button shot-button--success training-result-button"
          type="button"
          :disabled="isTrainingComplete"
          @click="recordRep(true)"
        >
          <q-icon name="check_circle" size="34px" />
          <strong>Successful</strong>
          <span>{{ successfulReps }} recorded</span>
        </button>

        <button
          class="shot-button shot-button--error training-result-button"
          type="button"
          :disabled="isTrainingComplete"
          @click="recordRep(false)"
        >
          <q-icon name="cancel" size="34px" />
          <strong>Unsuccessful</strong>
          <span>{{ unsuccessfulReps }} recorded</span>
        </button>
      </div>

      <section class="training-summary">
        <div>
          <span>Successful</span>
          <strong>{{ successfulReps }}</strong>
        </div>
        <div>
          <span>Unsuccessful</span>
          <strong>{{ unsuccessfulReps }}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{{ completedReps }}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{{ trainingStatusLabel }}</strong>
        </div>
      </section>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { loadPlayers, savePlayers } from '@/data/players'
import { loadSettings } from '@/data/settings'
import { api } from '../boot/axios'

const historyStorageKey = 'akp-shuttletrace:match-history'
const notationStorageKey = 'akp-shuttletrace:last-match-notation'
const settings = loadSettings()
const availablePlayers = ref(loadPlayers())

const shotTypes = [
  { type: 'Smash', category: 'attack' },
  { type: 'Drop', category: 'neutral' },
  { type: 'Drive', category: 'attack' },
  { type: 'Lift', category: 'defense' },
  { type: 'Netting', category: 'neutral' },
  { type: 'Block', category: 'defense' },
  { type: 'Net Shot', category: 'neutral' },
  { type: 'Serve', category: 'neutral' },
]

const repetitionOptions = [100, 200, 300, 400]
const selectedPlayerId = ref(availablePlayers.value[0]?.id ?? null)
const selectedShot = ref('Smash')
const selectedRepetition = ref(100)
const customRepetitionTarget = ref(50)
const sessionActive = ref(false)
const successfulReps = ref(0)
const unsuccessfulReps = ref(0)
const trainingRecords = ref([])
const savedStatus = ref('')
const sessionStartedAt = ref(null)
let audioContext = null

const targetReps = computed(() => {
  if (selectedRepetition.value !== 'custom') return selectedRepetition.value
  return Math.min(Math.max(Number(customRepetitionTarget.value) || 1, 1), 999)
})
const completedReps = computed(() => successfulReps.value + unsuccessfulReps.value)
const remainingReps = computed(() => Math.max(targetReps.value - completedReps.value, 0))
const isTrainingComplete = computed(() => completedReps.value >= targetReps.value)
const progressPercent = computed(() =>
  Math.min((completedReps.value / targetReps.value) * 100, 100),
)
const accuracy = computed(() => {
  if (!completedReps.value) return 0
  return Math.round((successfulReps.value / completedReps.value) * 100)
})
const selectedPlayer = computed(
  () => availablePlayers.value.find((player) => player.id === selectedPlayerId.value) ?? null,
)
const canStartTraining = computed(
  () => Boolean(selectedPlayer.value) && Boolean(selectedShot.value) && targetReps.value > 0,
)
const trainingStatusLabel = computed(() => {
  if (savedStatus.value) return 'Saved'
  return isTrainingComplete.value ? 'Complete' : 'Active'
})

onMounted(async () => {
  try {
    const response = await api.get('/players')
    if (Array.isArray(response.data) && response.data.length > 0) {
      availablePlayers.value = response.data
      if (!selectedPlayer.value) selectedPlayerId.value = availablePlayers.value[0]?.id ?? null
    }
  } catch {
    availablePlayers.value = loadPlayers()
  }
})

function startTraining() {
  successfulReps.value = 0
  unsuccessfulReps.value = 0
  trainingRecords.value = []
  savedStatus.value = ''
  sessionStartedAt.value = new Date().toISOString()
  sessionActive.value = true
  playTrainingSound('start')
}

function recordRep(isSuccessful) {
  if (isTrainingComplete.value) return

  if (isSuccessful) {
    successfulReps.value += 1
  } else {
    unsuccessfulReps.value += 1
  }

  trainingRecords.value.push({
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    repNumber: completedReps.value,
    shot: selectedShot.value,
    successful: isSuccessful,
    recordedAt: new Date().toISOString(),
  })
  savedStatus.value = ''
  playTrainingSound(isSuccessful ? 'success' : 'error')
}

function resetTraining() {
  sessionActive.value = false
  successfulReps.value = 0
  unsuccessfulReps.value = 0
  trainingRecords.value = []
  savedStatus.value = ''
  sessionStartedAt.value = null
}

async function endTraining() {
  if (completedReps.value === 0) return

  const report = buildTrainingReport()
  await saveTrainingToDatabase(report)
  saveTrainingHistoryReport(report)
  saveTrainingToPlayer(report)
  window.localStorage.setItem(notationStorageKey, JSON.stringify(report))
  window.dispatchEvent(new Event('akp-ai-summary-ready'))
  playTrainingSound('end')
  resetTraining()
}

async function saveTrainingToDatabase(report) {
  try {
    const response = await api.post('/training', {
      ...report.training,
      reps: report.training.records,
      durationMs: report.rallyOutcomes[0]?.durationMs ?? 0,
      startedAt: sessionStartedAt.value,
      endedAt: report.match.savedAt,
      savedAt: report.match.savedAt,
    })
    report.database = {
      status: 'saved',
      id: response.data?.id,
      savedAt: new Date().toISOString(),
    }
  } catch (error) {
    report.database = {
      status: 'offline',
      message: error?.response?.data?.message ?? 'Saved locally. Database sync failed.',
    }
  }
}

function buildTrainingReport() {
  const savedAt = new Date().toISOString()
  const durationMs = sessionStartedAt.value
    ? Math.max(Date.now() - new Date(sessionStartedAt.value).getTime(), 0)
    : 0

  return {
    match: {
      id: `training-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'training',
      playerA: selectedPlayer.value?.name ?? 'Training Player',
      playerB: selectedShot.value,
      firstServer: selectedPlayer.value?.name ?? 'Training Player',
      firstServerCode: 'Training',
      totalRallies: completedReps.value,
      totalShots: completedReps.value,
      scoreA: successfulReps.value,
      scoreB: unsuccessfulReps.value,
      gamesA: successfulReps.value,
      gamesB: unsuccessfulReps.value,
      scoringFormat: `${targetReps.value} repetitions, ${accuracy.value}% accuracy`,
      savedAt,
    },
    notation: trainingRecords.value.map((record) => ({
      id: record.id,
      rallyNumber: record.repNumber,
      player: 'Training',
      playerName: selectedPlayer.value?.name ?? 'Training Player',
      shot: record.shot,
      timestamp: record.recordedAt,
      result: record.successful ? 'Successful' : 'Unsuccessful',
    })),
    rallyOutcomes: [
      {
        rallyNumber: 1,
        outcome: `${selectedShot.value} drill: ${successfulReps.value} successful, ${unsuccessfulReps.value} unsuccessful`,
        shots: completedReps.value,
        durationMs,
        durationLabel: formatDuration(durationMs),
        endingType: 'training',
        pointWinnerName: `${accuracy.value}% accuracy`,
      },
    ],
    training: {
      playerId: selectedPlayer.value?.id ?? null,
      playerName: selectedPlayer.value?.name ?? 'Training Player',
      shot: selectedShot.value,
      targetReps: targetReps.value,
      completedReps: completedReps.value,
      successfulReps: successfulReps.value,
      unsuccessfulReps: unsuccessfulReps.value,
      accuracy: accuracy.value,
      records: trainingRecords.value,
    },
    analysis: {
      status: 'ready',
      summary: `${selectedShot.value} training completed with ${successfulReps.value}/${completedReps.value} successful repetitions (${accuracy.value}% accuracy).`,
    },
  }
}

function saveTrainingToPlayer(report) {
  const playerId = report.training?.playerId
  if (playerId === null || playerId === undefined) return

  const players = loadPlayers()
  const playerIndex = players.findIndex((player) => player.id === playerId)
  if (playerIndex === -1) return

  const session = {
    id: report.match.id,
    savedAt: report.match.savedAt,
    shot: report.training.shot,
    targetReps: report.training.targetReps,
    completedReps: report.training.completedReps,
    successfulReps: report.training.successfulReps,
    unsuccessfulReps: report.training.unsuccessfulReps,
    accuracy: report.training.accuracy,
    records: report.training.records,
  }

  players[playerIndex] = {
    ...players[playerIndex],
    trainingHistory: [session, ...(players[playerIndex].trainingHistory ?? [])].slice(0, 50),
  }
  savePlayers(players)
  availablePlayers.value = players
}

function saveTrainingHistoryReport(report) {
  const history = parseHistory(window.localStorage.getItem(historyStorageKey))
  const nextHistory = [report, ...history].slice(0, 50)
  window.localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory))
}

function parseHistory(rawHistory) {
  try {
    return rawHistory ? JSON.parse(rawHistory) : []
  } catch {
    return []
  }
}

function playTrainingSound(type) {
  if (typeof window === 'undefined' || !settings.soundEnabled) return

  const context = getAudioContext()
  if (!context) return

  const sounds = {
    success: [
      { frequency: 520, endFrequency: 740, duration: 0.08, volume: 0.05, wave: 'triangle' },
      { frequency: 820, endFrequency: 980, duration: 0.1, volume: 0.045, wave: 'sine' },
    ],
    error: [
      { frequency: 240, endFrequency: 140, duration: 0.13, volume: 0.06, wave: 'sawtooth' },
      { frequency: 180, endFrequency: 120, duration: 0.11, volume: 0.05, wave: 'square' },
    ],
    start: [{ frequency: 420, endFrequency: 680, duration: 0.12, volume: 0.045, wave: 'sine' }],
    end: [
      { frequency: 660, endFrequency: 880, duration: 0.09, volume: 0.05, wave: 'triangle' },
      { frequency: 880, endFrequency: 1180, duration: 0.12, volume: 0.045, wave: 'triangle' },
    ],
  }

  const tones = sounds[type] ?? sounds.success
  const startTime = context.currentTime
  tones.forEach((tone, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const toneStart = startTime + index * 0.06
    const toneEnd = toneStart + tone.duration

    oscillator.type = tone.wave
    oscillator.frequency.setValueAtTime(tone.frequency, toneStart)
    oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, toneEnd)
    gain.gain.setValueAtTime(0.0001, toneStart)
    gain.gain.exponentialRampToValueAtTime(
      Math.min(tone.volume * (settings.soundVolume / 10), 0.65),
      toneStart + 0.01,
    )
    gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(toneStart)
    oscillator.stop(toneEnd + 0.02)
  })
}

function getAudioContext() {
  const AudioContext = window.AudioContext ?? window.webkitAudioContext
  if (!AudioContext) return null

  audioContext ??= new AudioContext()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
</script>
