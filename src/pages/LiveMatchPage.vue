<template>
  <q-page class="live-page">
    <section v-if="matchStatus === 'setup'" class="match-setup">
      <div class="setup-card match-setup-card">
        <div>
          <h1>{{ setupStep === 'players' ? 'Select Players' : 'Match Rules' }}</h1>
          <p>
            {{
              setupStep === 'players'
                ? 'Select players from the player database.'
                : 'Choose the number of sets and points for each set.'
            }}
          </p>
        </div>

        <div v-if="setupStep === 'players'" class="match-player-select">
          <div>
            <span class="select-label">Player A</span>
            <div class="player-select-grid">
              <button
                v-for="player in availablePlayers"
                :key="`a-${player.id}`"
                :class="[
                  'player-select-card',
                  selectedPlayerAId === player.id && 'player-select-card--active',
                ]"
                type="button"
                :disabled="selectedPlayerBId === player.id"
                @click="selectedPlayerAId = player.id"
              >
                <strong>{{ player.name }}</strong>
                <span>Rank #{{ player.rank }} - {{ player.category }}</span>
              </button>
            </div>
          </div>

          <div class="vs-pill">VS</div>

          <div>
            <span class="select-label">Player B</span>
            <div class="player-select-grid">
              <button
                v-for="player in availablePlayers"
                :key="`b-${player.id}`"
                :class="[
                  'player-select-card',
                  selectedPlayerBId === player.id && 'player-select-card--active',
                ]"
                type="button"
                :disabled="selectedPlayerAId === player.id"
                @click="selectedPlayerBId = player.id"
              >
                <strong>{{ player.name }}</strong>
                <span>Rank #{{ player.rank }} - {{ player.category }}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          v-if="setupStep === 'players'"
          class="primary-action"
          type="button"
          :disabled="!canStartSetup"
          @click="setupStep = 'format'"
        >
          Next
          <q-icon name="chevron_right" size="20px" />
        </button>

        <div v-else class="match-format-select">
          <span class="select-label">Match format</span>
          <div class="player-select-grid">
            <button
              v-for="format in matchFormatOptions"
              :key="format.value"
              :class="[
                'player-select-card',
                selectedMatchFormat === format.value && 'player-select-card--active',
              ]"
              type="button"
              @click="selectedMatchFormat = format.value"
            >
              <strong>{{ format.label }}</strong>
              <span>{{ format.description }}</span>
            </button>
          </div>
          <label v-if="selectedMatchFormat === 'custom'" class="custom-set-control">
            <span>Play up to</span>
            <select v-model.number="customSetCount">
              <option v-for="count in [1, 3, 5, 7, 9]" :key="count" :value="count">
                {{ count }}
              </option>
            </select>
            <span>sets (first to {{ setsToWin }} wins)</span>
          </label>

          <span class="select-label">Points per set</span>
          <div class="player-select-grid">
            <button
              v-for="points in [11, 15, 21]"
              :key="points"
              :class="[
                'player-select-card',
                pointFormat === points && 'player-select-card--active',
              ]"
              type="button"
              @click="pointFormat = points"
            >
              <strong>First to {{ points }}</strong>
              <span>Win by 2, cap at {{ points + 9 }}</span>
            </button>
            <button
              :class="[
                'player-select-card',
                pointFormat === 'custom' && 'player-select-card--active',
              ]"
              type="button"
              @click="pointFormat = 'custom'"
            >
              <strong>Custom</strong>
              <span>Choose a point target</span>
            </button>
          </div>
          <label v-if="pointFormat === 'custom'" class="custom-set-control">
            <span>First to</span>
            <input v-model.number="customPointTarget" type="number" min="1" max="99" />
            <span>points (win by 2, cap at {{ pointsToWin + 9 }})</span>
          </label>
        </div>

        <button
          v-if="setupStep === 'format'"
          class="secondary-action"
          type="button"
          @click="setupStep = 'players'"
        >
          Back
        </button>
        <button
          v-if="setupStep === 'format'"
          class="primary-action"
          type="button"
          :disabled="!canStartSetup"
          @click="startCoinFlip"
        >
          <q-icon name="play_arrow" size="20px" />
          Start Match
        </button>
      </div>
    </section>

    <section v-else-if="matchStatus === 'coin-flip'" class="match-setup">
      <div class="setup-card coin-card">
        <div>
          <h1>Digital Coin Flip</h1>
          <p>{{ coinFlipStatus }}</p>
        </div>

        <div :class="['coin-stage', isCoinFlipping && 'coin-stage--active']">
          <div :class="['coin-disc', coinWinner === 'B' && !isCoinFlipping && 'coin-disc--tails']">
            <div class="coin-face coin-face--front">
              <span>A</span>
              <strong>{{ firstName(playerA) }}</strong>
            </div>
            <div class="coin-face coin-face--back">
              <span>B</span>
              <strong>{{ firstName(playerB) }}</strong>
            </div>
          </div>
        </div>

        <div class="coin-matchup">
          <div :class="['coin-player', coinWinner === 'A' && 'coin-player--winner']">
            <span>Player A</span>
            <strong>{{ playerA }}</strong>
          </div>
          <div :class="['coin-player', coinWinner === 'B' && 'coin-player--winner']">
            <span>Player B</span>
            <strong>{{ playerB }}</strong>
          </div>
        </div>

        <button
          class="primary-action"
          type="button"
          :disabled="isCoinFlipping || !coinWinner"
          @click="startMatch"
        >
          <q-icon name="sports_tennis" size="20px" />
          Start Recording
        </button>
        <button
          class="secondary-action"
          type="button"
          :disabled="isCoinFlipping"
          @click="resetMatch"
        >
          Back To Setup
        </button>
      </div>
    </section>

    <section v-else-if="matchStatus === 'ended'" class="match-setup">
      <div class="setup-card">
        <div>
          <h1>Match Ended</h1>
          <p>{{ playerA }} vs {{ playerB }} - {{ timeline.length }} recorded actions.</p>
        </div>

        <div class="ended-stats">
          <div>
            <span>Total Rallies</span>
            <strong>{{ currentRally - 1 }}</strong>
          </div>
          <div>
            <span>Match Score</span>
            <strong>{{ gamesA }} - {{ gamesB }}</strong>
          </div>
          <div>
            <span>Total Shots</span>
            <strong>{{ timeline.length }}</strong>
          </div>
          <div>
            <span>Last Rally Time</span>
            <strong>{{ lastRallyDurationLabel }}</strong>
          </div>
        </div>

        <button class="primary-action" type="button" @click="$router.push('/')">
          View Dashboard
        </button>
        <button class="secondary-action" type="button" @click="resetMatch">Record Another</button>
      </div>
    </section>

    <section v-else class="live-recorder">
      <header class="live-topbar">
        <div class="live-title">
          <div class="recording-dot" />
          <span>Live Recording</span>
          <i />
          <strong>{{ playerA }} <em>vs</em> {{ playerB }}</strong>
        </div>

        <div class="live-actions">
          <div class="rally-chip">
            <span>Rally</span>
            <strong>{{ currentRally }}</strong>
          </div>
          <div class="rally-chip rally-chip--timer">
            <select v-model="selectedTimerDisplay" aria-label="Timer display">
              <option v-for="timer in timerDisplayOptions" :key="timer.value" :value="timer.value">
                {{ timer.label }}
              </option>
            </select>
            <strong>{{ selectedTimerLabel }}</strong>
          </div>
          <div class="rally-chip">
            <span>First Serve</span>
            <strong>{{ firstServerInitial }}</strong>
          </div>
          <div class="rally-chip rally-chip--turn">
            <span>Current Turn</span>
            <strong>{{ activePlayer || '-' }}</strong>
          </div>
          <div class="rally-chip">
            <span>Score</span>
            <strong>{{ scoreA }} - {{ scoreB }}</strong>
          </div>
          <div class="rally-chip">
            <span>Sets</span>
            <strong>{{ gamesA }} - {{ gamesB }}</strong>
          </div>
          <button class="danger-action" type="button" @click="endMatch">
            <q-icon name="stop" size="18px" />
            End Match
          </button>
        </div>
      </header>

      <div class="court-split">
        <PlayerShotPanel
          :player="playerA"
          side="a"
          :shots="shotTypes"
          :is-active="activePlayer === 'A'"
          :require-serve="isFirstShotOfRally"
          :disable-serve="!isFirstShotOfRally"
          @record="recordAction('A', $event)"
        />
        <PlayerShotPanel
          :player="playerB"
          side="b"
          :shots="shotTypes"
          :is-active="activePlayer === 'B'"
          :require-serve="isFirstShotOfRally"
          :disable-serve="!isFirstShotOfRally"
          @record="recordAction('B', $event)"
        />
      </div>

      <footer class="timeline-panel">
        <div class="timeline-track">
          <div v-if="currentRallyActions.length === 0" class="timeline-empty">
            Waiting for first shot in Rally {{ currentRally }}...
          </div>
          <template v-for="(action, index) in currentRallyActions" :key="action.id">
            <q-icon v-if="index > 0" name="chevron_right" class="timeline-arrow" size="18px" />
            <div :class="['timeline-shot', action.player === 'A' && 'timeline-shot--primary']">
              <span>{{ action.player === 'A' ? firstName(playerA) : firstName(playerB) }}</span>
              <strong>{{ action.shot }}</strong>
            </div>
          </template>
        </div>

        <div class="timeline-controls">
          <button
            type="button"
            :disabled="currentRallyActions.length === 0"
            @click="undoLastAction"
          >
            <q-icon name="undo" size="18px" />
            Undo Last Action
          </button>
          <button
            class="primary-action"
            type="button"
            :disabled="!canEndRally"
            @click="showOutcomeDialog = true"
          >
            End Rally
            <q-icon name="chevron_right" size="20px" />
          </button>
        </div>
      </footer>

      <q-dialog v-model="showOutcomeDialog">
        <div class="outcome-dialog">
          <div class="dialog-head">
            <h2>Rally {{ currentRally }} Outcome</h2>
            <button type="button" @click="showOutcomeDialog = false">
              <q-icon name="close" size="20px" />
            </button>
          </div>

          <div v-if="lastRallyAction" class="last-shot-summary">
            <span>Last Shot</span>
            <strong>{{ lastRallyAction.playerName }} - {{ lastRallyAction.shot }}</strong>
          </div>

          <div class="dialog-section">
            <span>Reason</span>
            <div class="dialog-grid">
              <button
                v-for="option in rallyEndingOptions"
                :key="option.value"
                :class="option.awardsLastPlayer ? 'success-choice' : 'error-choice'"
                type="button"
                @click="endRally(option)"
              >
                <strong>{{ option.label }}</strong>
                <span>{{ option.description }}</span>
              </button>
            </div>
          </div>

          <div class="dialog-section">
            <span>Manual Award</span>
            <div class="dialog-grid">
              <button type="button" @click="endRally(manualOutcome('A'))">{{ playerA }}</button>
              <button type="button" @click="endRally(manualOutcome('B'))">{{ playerB }}</button>
            </div>
          </div>
        </div>
      </q-dialog>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PlayerShotPanel from '@/components/PlayerShotPanel.vue'
import { loadPlayers } from '@/data/players'
import { loadSettings } from '@/data/settings'
import { isLoggedIn, scopedStorageKey } from '@/data/auth'
import { api } from '../boot/axios'

const matchStatus = ref('setup')
const currentRally = ref(1)
const timeline = ref([])
const rallyOutcomes = ref([])
const scoreA = ref(0)
const scoreB = ref(0)
const gamesA = ref(0)
const gamesB = ref(0)
const settings = loadSettings()
const selectedMatchFormat = ref(settings.matchFormat)
const customSetCount = ref(settings.customSetCount)
const pointFormat = ref(settings.pointFormat)
const customPointTarget = ref(settings.customPointTarget)
const setupStep = ref('players')
const availablePlayers = ref(loadPlayers())
const selectedPlayerAId = ref(availablePlayers.value[0]?.id ?? null)
const selectedPlayerBId = ref(availablePlayers.value[1]?.id ?? null)
const showOutcomeDialog = ref(false)
const rallyStartedAt = ref(null)
const rallyElapsedMs = ref(0)
const overallStartedAt = ref(null)
const overallElapsedMs = ref(0)
const setStartedAt = ref(null)
const setElapsedMs = ref(0)
const setDurations = ref([])
const selectedTimerDisplay = ref('overall')
const coinWinner = ref(null)
const isCoinFlipping = ref(false)
const activePlayer = ref(null)
const matchId = ref(null)
const notationStorageKey = scopedStorageKey('akp-shuttletrace:last-match-notation')
const legacyHistoryStorageKey = `court${'sense'}:match-history`
const historyStorageKey = scopedStorageKey('akp-shuttletrace:match-history')
const remoteSavedIds = new Set()
let rallyTimerId = null
let overallTimerId = null
let setTimerId = null
let coinFlipTimerId = null
let audioContext = null

const shotTypes = [
  { type: 'Smash', category: 'attack' },
  { type: 'Drive', category: 'attack' },
  { type: 'Drop', category: 'neutral' },
  { type: 'Lift', category: 'defense' },
  { type: 'Netting', category: 'neutral' },
  { type: 'Block', category: 'defense' },
  { type: 'Net Shot', category: 'neutral' },
  { type: 'Serve', category: 'neutral' },
]
const matchFormatOptions = [
  { value: 'best-of-3', label: 'Best of 3', description: 'First to win 2 sets' },
  { value: 'best-of-5', label: 'Best of 5', description: 'First to win 3 sets' },
  { value: 'custom', label: 'Custom', description: 'Choose how many sets to play' },
]

const currentRallyActions = computed(() =>
  timeline.value.filter((action) => action.rallyNumber === currentRally.value),
)
const lastRallyAction = computed(() => currentRallyActions.value.at(-1) ?? null)
const isFirstShotOfRally = computed(() => currentRallyActions.value.length === 0)
const canEndRally = computed(() => currentRallyActions.value.length > 0)
const selectedPlayerA = computed(() => findAvailablePlayer(selectedPlayerAId.value))
const selectedPlayerB = computed(() => findAvailablePlayer(selectedPlayerBId.value))
const playerA = computed(() => selectedPlayerA.value?.name ?? 'Player A')
const playerB = computed(() => selectedPlayerB.value?.name ?? 'Player B')
const canStartSetup = computed(
  () =>
    Boolean(selectedPlayerA.value && selectedPlayerB.value) &&
    selectedPlayerAId.value !== selectedPlayerBId.value,
)
const customSetCountNormalized = computed(() => {
  const value = Math.min(Math.max(Number(customSetCount.value) || 1, 1), 9)
  return value % 2 === 0 ? value + 1 : value
})
const setsToWin = computed(() => {
  if (selectedMatchFormat.value === 'best-of-5') return 3
  if (selectedMatchFormat.value === 'custom') return Math.ceil(customSetCountNormalized.value / 2)
  return 2
})
const matchFormatLabel = computed(() => {
  if (selectedMatchFormat.value === 'custom') return `Best of ${customSetCountNormalized.value}`
  return selectedMatchFormat.value === 'best-of-5' ? 'Best of 5' : 'Best of 3'
})
const pointsToWin = computed(() => {
  if (pointFormat.value !== 'custom') return pointFormat.value
  return Math.min(Math.max(Number(customPointTarget.value) || 1, 1), 99)
})
const pointCap = computed(() => pointsToWin.value + 9)
const formattedRallyTime = computed(() => formatDuration(rallyElapsedMs.value))
const formattedOverallTime = computed(() => formatDuration(overallElapsedMs.value))
const formattedSetTime = computed(() => formatDuration(setElapsedMs.value))
const lastRallyDurationLabel = computed(() => rallyOutcomes.value.at(-1)?.durationLabel ?? '00:00')
const timerDisplayOptions = [
  { value: 'overall', label: 'Overall Time' },
  { value: 'rally', label: 'Rally Time' },
  { value: 'set', label: 'Set Time' },
]
const selectedTimerLabel = computed(() => {
  if (selectedTimerDisplay.value === 'rally') return formattedRallyTime.value
  if (selectedTimerDisplay.value === 'set') return formattedSetTime.value
  return formattedOverallTime.value
})
const rallyEndingOptions = computed(() => {
  const shot = lastRallyAction.value?.shot ?? 'Shot'
  return endingOptionsByShot[shot] ?? defaultEndingOptions
})
const firstServerName = computed(() => {
  if (coinWinner.value === 'A') return playerA.value
  if (coinWinner.value === 'B') return playerB.value
  return 'Pending'
})
const firstServerInitial = computed(() => {
  if (!coinWinner.value) return '-'
  return coinWinner.value
})
const activePlayerName = computed(() => playerName(activePlayer.value))
const coinFlipStatus = computed(() => {
  if (isCoinFlipping.value) return 'Coin is flipping to decide the first server.'
  if (coinWinner.value) return `${firstServerName.value} starts the first rally.`
  return 'Player A is heads. Player B is tails.'
})

onMounted(async () => {
  try {
    const response = await api.get('/players')
    if (Array.isArray(response.data)) {
      availablePlayers.value = response.data
      if (!findAvailablePlayer(selectedPlayerAId.value)) {
        selectedPlayerAId.value = availablePlayers.value[0]?.id ?? null
      }
      if (!findAvailablePlayer(selectedPlayerBId.value)) {
        selectedPlayerBId.value = availablePlayers.value.find(
          (player) => player.id !== selectedPlayerAId.value,
        )?.id ?? null
      }
    }
  } catch {
    availablePlayers.value = isLoggedIn() ? [] : loadPlayers()
  }
})

function recordAction(player, shot) {
  if (matchStatus.value !== 'live') return
  if (player !== activePlayer.value) return
  if (isFirstShotOfRally.value && shot !== 'Serve') return
  if (!isFirstShotOfRally.value && shot === 'Serve') return
  if (shot === 'Serve') startRallyTimer()

  timeline.value.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    player,
    playerName: playerName(player),
    shot,
    sequence: timeline.value.length + 1,
    rallyNumber: currentRally.value,
    timestamp: new Date().toISOString(),
    activeTurnBeforeAction: player,
  })
  playShotSound(shot)
  activePlayer.value = opponentOf(player)
  saveNotation()
}

function startCoinFlip() {
  if (!canStartSetup.value) return
  stopCoinFlip()
  stopRallyTimer()
  matchId.value = createMatchId()
  matchStatus.value = 'coin-flip'
  coinWinner.value = null
  activePlayer.value = null
  isCoinFlipping.value = true
  rallyStartedAt.value = null
  rallyElapsedMs.value = 0
  playCoinFlipSound()

  if (typeof window === 'undefined') {
    finishCoinFlip()
    return
  }

  coinFlipTimerId = window.setTimeout(finishCoinFlip, 2200)
}

function finishCoinFlip() {
  coinWinner.value = Math.random() >= 0.5 ? 'A' : 'B'
  isCoinFlipping.value = false
  coinFlipTimerId = null
  playCoinLandSound()
  saveNotation('coin-flip')
}

function startMatch() {
  if (!coinWinner.value) return
  activePlayer.value = coinWinner.value
  matchStatus.value = 'live'
  startOverallTimer()
  startSetTimer()
  saveNotation()
}

function undoLastAction() {
  const lastCurrentRallyAction = currentRallyActions.value.at(-1)
  if (!lastCurrentRallyAction) return

  const actionIndex = timeline.value.findIndex((action) => action.id === lastCurrentRallyAction.id)
  if (actionIndex === -1) return

  timeline.value.splice(actionIndex, 1)
  activePlayer.value = lastCurrentRallyAction.player
  saveNotation()
}

function endRally(outcomeOption) {
  if (!canEndRally.value) return
  const endingAction = lastRallyAction.value
  if (!endingAction) return

  const endedAt = new Date().toISOString()
  const startedAt = rallyStartedAt.value
  const durationMs = stopRallyTimer()
  const winner = getOutcomeWinnerCode(outcomeOption, endingAction)

  if (!winner) return

  rallyOutcomes.value.push({
    rallyNumber: currentRally.value,
    outcome: formatOutcomeLabel(outcomeOption, endingAction, winner),
    shots: currentRallyActions.value.length,
    durationMs,
    durationLabel: formatDuration(durationMs),
    startedAt,
    endedAt,
    winner,
    endingShot: endingAction.shot,
    endingPlayer: endingAction.player,
    endingPlayerName: endingAction.playerName,
    endingReason: outcomeOption.reason ?? 'Manual',
    endingType: outcomeOption.type ?? 'manual',
    pointWinnerName: playerName(winner),
  })
  awardPoint(winner)
  const latestOutcome = rallyOutcomes.value.at(-1)
  latestOutcome.scoreA = scoreA.value
  latestOutcome.scoreB = scoreB.value
  latestOutcome.gamesA = gamesA.value
  latestOutcome.gamesB = gamesB.value
  currentRally.value += 1
  activePlayer.value = winner
  showOutcomeDialog.value = false
  saveNotation()
  if (matchStatus.value === 'live') resetRallyTimer()
}

function endMatch() {
  finishCurrentSetTimer()
  stopOverallTimer()
  stopRallyTimer()
  matchStatus.value = 'ended'
  saveNotation('ended')
}

function awardPoint(winner) {
  if (winner === 'A') scoreA.value += 1
  if (winner === 'B') scoreB.value += 1

  const winnerScore = winner === 'A' ? scoreA.value : scoreB.value
  const opponentScore = winner === 'A' ? scoreB.value : scoreA.value
  const winsGame =
    (winnerScore >= pointsToWin.value && winnerScore - opponentScore >= 2) ||
    winnerScore === pointCap.value
  if (!winsGame) return

  if (winner === 'A') gamesA.value += 1
  if (winner === 'B') gamesB.value += 1

  if (gamesA.value === setsToWin.value || gamesB.value === setsToWin.value) {
    matchStatus.value = 'ended'
    finishCurrentSetTimer()
    stopOverallTimer()
    stopRallyTimer()
    return
  }

  finishCurrentSetTimer()
  startSetTimer()
  scoreA.value = 0
  scoreB.value = 0
}

function resetMatch() {
  stopOverallTimer()
  stopSetTimer()
  stopRallyTimer()
  matchStatus.value = 'setup'
  setupStep.value = 'players'
  currentRally.value = 1
  timeline.value = []
  rallyOutcomes.value = []
  scoreA.value = 0
  scoreB.value = 0
  gamesA.value = 0
  gamesB.value = 0
  showOutcomeDialog.value = false
  rallyStartedAt.value = null
  rallyElapsedMs.value = 0
  overallStartedAt.value = null
  overallElapsedMs.value = 0
  setStartedAt.value = null
  setElapsedMs.value = 0
  setDurations.value = []
  selectedTimerDisplay.value = 'overall'
  coinWinner.value = null
  isCoinFlipping.value = false
  activePlayer.value = null
  matchId.value = null
  stopCoinFlip()
}

function firstName(name) {
  return name.split(' ')[0]
}

function playerName(player) {
  if (player === 'A') return playerA.value
  if (player === 'B') return playerB.value
  return 'Pending'
}

function findAvailablePlayer(playerId) {
  return availablePlayers.value.find((player) => player.id === playerId) ?? null
}

function opponentOf(player) {
  return player === 'A' ? 'B' : 'A'
}

function getOutcomeWinnerCode(outcomeOption, endingAction) {
  if (outcomeOption.winner) return outcomeOption.winner
  if (outcomeOption.awardsLastPlayer) return endingAction.player
  return opponentOf(endingAction.player)
}

function manualOutcome(winner) {
  return {
    type: 'manual',
    reason: 'Manual',
    winner,
    label: `Manual: ${playerName(winner)}`,
  }
}

function formatOutcomeLabel(outcomeOption, endingAction, winner) {
  if (outcomeOption.type === 'manual') return `Winner: ${playerName(winner)}`

  return `${endingAction.shot} by ${endingAction.playerName} ${outcomeOption.phrase}. Point: ${playerName(
    winner,
  )}`
}

const defaultEndingOptions = [
  {
    value: 'winner',
    label: 'Successful',
    reason: 'Winner',
    type: 'winner',
    phrase: 'won the rally',
    description: 'Point to last hitter',
    awardsLastPlayer: true,
  },
  {
    value: 'out',
    label: 'Out',
    reason: 'Out',
    type: 'error',
    phrase: 'went out',
    description: 'Point to opponent',
    awardsLastPlayer: false,
  },
  {
    value: 'net',
    label: 'Net',
    reason: 'Net',
    type: 'error',
    phrase: 'hit the net',
    description: 'Point to opponent',
    awardsLastPlayer: false,
  },
  {
    value: 'fault',
    label: 'Fault',
    reason: 'Fault',
    type: 'error',
    phrase: 'ended in a fault',
    description: 'Point to opponent',
    awardsLastPlayer: false,
  },
]

const endingOptionsByShot = {
  Serve: [
    {
      value: 'ace',
      label: 'Ace',
      reason: 'Ace',
      type: 'winner',
      phrase: 'was an ace',
      description: 'Point to server',
      awardsLastPlayer: true,
    },
    {
      value: 'serve-out',
      label: 'Out',
      reason: 'Out',
      type: 'error',
      phrase: 'went out',
      description: 'Point to receiver',
      awardsLastPlayer: false,
    },
    {
      value: 'serve-net',
      label: 'Net',
      reason: 'Net',
      type: 'error',
      phrase: 'hit the net',
      description: 'Point to receiver',
      awardsLastPlayer: false,
    },
    {
      value: 'serve-fault',
      label: 'Fault',
      reason: 'Fault',
      type: 'error',
      phrase: 'was a fault',
      description: 'Point to receiver',
      awardsLastPlayer: false,
    },
  ],
  Lift: [
    {
      value: 'deep-lift',
      label: 'Successful',
      reason: 'Winner',
      type: 'winner',
      phrase: 'won the rally',
      description: 'Point to last hitter',
      awardsLastPlayer: true,
    },
    {
      value: 'lift-out',
      label: 'Out',
      reason: 'Out',
      type: 'error',
      phrase: 'went long',
      description: 'Point to opponent',
      awardsLastPlayer: false,
    },
    {
      value: 'lift-short',
      label: 'Too Short',
      reason: 'Short',
      type: 'error',
      phrase: 'landed too short',
      description: 'Point to opponent',
      awardsLastPlayer: false,
    },
    {
      value: 'lift-net',
      label: 'Net',
      reason: 'Net',
      type: 'error',
      phrase: 'hit the net',
      description: 'Point to opponent',
      awardsLastPlayer: false,
    },
  ],
}

function buildNotationReport(status = matchStatus.value) {
  return {
    match: {
      id: matchId.value,
      playerA: playerA.value,
      playerB: playerB.value,
      playerAId: selectedPlayerAId.value,
      playerBId: selectedPlayerBId.value,
      playerAProfile: selectedPlayerA.value,
      playerBProfile: selectedPlayerB.value,
      status,
      currentRally: currentRally.value,
      totalRallies: Math.max(currentRally.value - 1, 0),
      totalShots: timeline.value.length,
      currentRallyStartedAt: rallyStartedAt.value,
      currentRallyDurationMs: rallyElapsedMs.value,
      currentRallyDurationLabel: formattedRallyTime.value,
      overallStartedAt: overallStartedAt.value,
      overallDurationMs: overallElapsedMs.value,
      overallDurationLabel: formattedOverallTime.value,
      currentSetStartedAt: setStartedAt.value,
      currentSetDurationMs: setElapsedMs.value,
      currentSetDurationLabel: formattedSetTime.value,
      firstServer: firstServerName.value,
      firstServerCode: coinWinner.value,
      activePlayer: activePlayerName.value,
      activePlayerCode: activePlayer.value,
      scoreA: scoreA.value,
      scoreB: scoreB.value,
      gamesA: gamesA.value,
      gamesB: gamesB.value,
      matchFormat: matchFormatLabel.value,
      setsToWin: setsToWin.value,
      pointsToWin: pointsToWin.value,
      pointCap: pointCap.value,
      scoringFormat: `${matchFormatLabel.value}, first to ${pointsToWin.value}, win-by-2, cap ${pointCap.value}`,
      savedAt: new Date().toISOString(),
    },
    notation: timeline.value,
    rallyOutcomes: rallyOutcomes.value,
    setDurations: setDurations.value,
  }
}

function saveNotation(status) {
  if (typeof window === 'undefined') return
  const report = buildNotationReport(status)
  window.localStorage.setItem(notationStorageKey, JSON.stringify(report))

  if (status === 'ended') {
    report.analysis = { status: 'generating', summary: '' }
    saveHistoryReport(report)
    window.localStorage.setItem(notationStorageKey, JSON.stringify(report))
    void saveMatchReportToDatabase(report)
    void generateAiSummary(report)
  }
}

async function saveMatchReportToDatabase(report) {
  if (!report?.match?.id || remoteSavedIds.has(report.match.id)) return

  try {
    await api.post('/matches/reports', report)
    remoteSavedIds.add(report.match.id)
    report.database = { status: 'saved', savedAt: new Date().toISOString() }
  } catch (error) {
    report.database = {
      status: 'offline',
      message: error?.response?.data?.message ?? 'Saved locally. Database sync failed.',
    }
  }

  window.localStorage.setItem(notationStorageKey, JSON.stringify(report))
  saveHistoryReport(report)
}

async function generateAiSummary(report) {
  try {
    const response = await fetch('http://localhost:8787/api/ai-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error ?? 'AI summary failed.')

    report.analysis = { status: 'ready', summary: result.summary }
  } catch (error) {
    report.analysis = { status: 'unavailable', summary: error.message ?? 'AI summary unavailable.' }
  }

  saveHistoryReport(report)
  window.localStorage.setItem(notationStorageKey, JSON.stringify(report))
  window.dispatchEvent(new Event('akp-ai-summary-ready'))
}

function saveHistoryReport(report) {
  const rawHistory =
    window.localStorage.getItem(historyStorageKey) ??
    (isLoggedIn() ? null : window.localStorage.getItem(legacyHistoryStorageKey))
  const history = parseHistory(rawHistory)

  const nextHistory = [
    report,
    ...history.filter((item) => item?.match?.id !== report.match.id),
  ].slice(0, 50)

  window.localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory))
}

function parseHistory(rawHistory) {
  try {
    return rawHistory ? JSON.parse(rawHistory) : []
  } catch {
    return []
  }
}

function createMatchId() {
  return `match-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function stopCoinFlip() {
  if (coinFlipTimerId && typeof window !== 'undefined') {
    window.clearTimeout(coinFlipTimerId)
    coinFlipTimerId = null
  }
}

function startRallyTimer() {
  stopRallyTimer()
  rallyStartedAt.value = new Date().toISOString()
  rallyElapsedMs.value = 0

  if (typeof window === 'undefined') return

  rallyTimerId = window.setInterval(() => {
    rallyElapsedMs.value = elapsedFromStart(rallyStartedAt.value, rallyElapsedMs.value)
  }, 250)
}

function stopRallyTimer() {
  if (rallyTimerId && typeof window !== 'undefined') {
    window.clearInterval(rallyTimerId)
    rallyTimerId = null
  }

  rallyElapsedMs.value = elapsedFromStart(rallyStartedAt.value, rallyElapsedMs.value)
  return rallyElapsedMs.value
}

function resetRallyTimer() {
  stopRallyTimer()
  rallyStartedAt.value = null
  rallyElapsedMs.value = 0
}

function startOverallTimer() {
  stopOverallTimer()
  overallStartedAt.value = new Date().toISOString()
  overallElapsedMs.value = 0

  if (typeof window === 'undefined') return

  overallTimerId = window.setInterval(() => {
    overallElapsedMs.value = elapsedFromStart(overallStartedAt.value, overallElapsedMs.value)
  }, 250)
}

function stopOverallTimer() {
  if (overallTimerId && typeof window !== 'undefined') {
    window.clearInterval(overallTimerId)
    overallTimerId = null
  }

  overallElapsedMs.value = elapsedFromStart(overallStartedAt.value, overallElapsedMs.value)
  return overallElapsedMs.value
}

function startSetTimer() {
  stopSetTimer()
  setStartedAt.value = new Date().toISOString()
  setElapsedMs.value = 0

  if (typeof window === 'undefined') return

  setTimerId = window.setInterval(() => {
    setElapsedMs.value = elapsedFromStart(setStartedAt.value, setElapsedMs.value)
  }, 250)
}

function stopSetTimer() {
  if (setTimerId && typeof window !== 'undefined') {
    window.clearInterval(setTimerId)
    setTimerId = null
  }

  setElapsedMs.value = elapsedFromStart(setStartedAt.value, setElapsedMs.value)
  return setElapsedMs.value
}

function finishCurrentSetTimer() {
  const durationMs = stopSetTimer()
  if (!setStartedAt.value) return durationMs

  setDurations.value.push({
    setNumber: setDurations.value.length + 1,
    startedAt: setStartedAt.value,
    endedAt: new Date().toISOString(),
    durationMs,
    durationLabel: formatDuration(durationMs),
    scoreA: scoreA.value,
    scoreB: scoreB.value,
    gamesA: gamesA.value,
    gamesB: gamesB.value,
  })
  setStartedAt.value = null
  return durationMs
}

function elapsedFromStart(startedAt, fallbackMs = 0) {
  if (!startedAt) return fallbackMs
  return Math.max(Date.now() - new Date(startedAt).getTime(), 0)
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function playShotSound(shot) {
  if (typeof window === 'undefined' || !settings.soundEnabled) return

  const sound = shotSoundMap[shot] ?? shotSoundMap.default
  const context = getAudioContext()
  if (!context) return

  const startTime = context.currentTime
  sound.tones.forEach((tone, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const delay = index * sound.spacing
    const toneStart = startTime + delay
    const toneEnd = toneStart + tone.duration

    oscillator.type = tone.type
    oscillator.frequency.setValueAtTime(tone.frequency, toneStart)
    if (tone.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, toneEnd)
    }

    gain.gain.setValueAtTime(0.0001, toneStart)
    gain.gain.exponentialRampToValueAtTime(
      Math.min(tone.volume * (settings.soundVolume / 10), 0.65),
      toneStart + 0.012,
    )
    gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(toneStart)
    oscillator.stop(toneEnd + 0.02)
  })
}

function playCoinFlipSound() {
  if (typeof window === 'undefined' || !settings.soundEnabled) return

  const context = getAudioContext()
  if (!context) return

  const startTime = context.currentTime
  const ticks = 16

  for (let index = 0; index < ticks; index += 1) {
    const progress = index / ticks
    const toneStart = startTime + index * 0.085
    const duration = 0.035 + progress * 0.018
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()

    oscillator.type = index % 2 === 0 ? 'triangle' : 'square'
    oscillator.frequency.setValueAtTime(980 + index * 42, toneStart)
    oscillator.frequency.exponentialRampToValueAtTime(520 + index * 18, toneStart + duration)
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(420, toneStart)

    gain.gain.setValueAtTime(0.0001, toneStart)
    gain.gain.exponentialRampToValueAtTime(
      Math.min(0.34 * (settings.soundVolume / 10), 0.65),
      toneStart + 0.006,
    )
    gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + duration)

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    oscillator.start(toneStart)
    oscillator.stop(toneStart + duration + 0.02)
  }
}

function playCoinLandSound() {
  if (typeof window === 'undefined' || !settings.soundEnabled) return

  const context = getAudioContext()
  if (!context) return

  const startTime = context.currentTime
  const tones = [
    { frequency: 780, endFrequency: 420, duration: 0.09, volume: 0.42, type: 'square' },
    { frequency: 320, endFrequency: 180, duration: 0.16, volume: 0.5, type: 'triangle' },
  ]

  tones.forEach((tone, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const toneStart = startTime + index * 0.055
    const toneEnd = toneStart + tone.duration

    oscillator.type = tone.type
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
  if (audioContext.state === 'suspended') audioContext.resume()
  return audioContext
}

const shotSoundMap = {
  Serve: {
    spacing: 0.045,
    tones: [
      { frequency: 520, endFrequency: 720, duration: 0.08, volume: 0.045, type: 'sine' },
      { frequency: 780, duration: 0.06, volume: 0.035, type: 'triangle' },
    ],
  },
  Smash: {
    spacing: 0.025,
    tones: [
      { frequency: 150, endFrequency: 80, duration: 0.12, volume: 0.09, type: 'sawtooth' },
      { frequency: 760, endFrequency: 360, duration: 0.08, volume: 0.045, type: 'square' },
    ],
  },
  Drive: {
    spacing: 0.035,
    tones: [
      { frequency: 420, endFrequency: 560, duration: 0.07, volume: 0.05, type: 'square' },
      { frequency: 560, endFrequency: 420, duration: 0.07, volume: 0.035, type: 'square' },
    ],
  },
  Drop: {
    spacing: 0.045,
    tones: [{ frequency: 640, endFrequency: 410, duration: 0.14, volume: 0.035, type: 'sine' }],
  },
  Lift: {
    spacing: 0.045,
    tones: [{ frequency: 300, endFrequency: 700, duration: 0.18, volume: 0.04, type: 'triangle' }],
  },
  'Net Shot': {
    spacing: 0.035,
    tones: [
      { frequency: 860, duration: 0.045, volume: 0.035, type: 'sine' },
      { frequency: 1020, duration: 0.045, volume: 0.03, type: 'sine' },
    ],
  },
  default: {
    spacing: 0.04,
    tones: [{ frequency: 520, duration: 0.08, volume: 0.04, type: 'sine' }],
  },
}

onUnmounted(() => {
  stopCoinFlip()
  stopOverallTimer()
  stopSetTimer()
  stopRallyTimer()
  audioContext?.close()
  audioContext = null
})
</script>
