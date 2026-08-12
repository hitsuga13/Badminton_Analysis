<template>
  <q-page class="live-page">
    <section v-if="matchStatus === 'setup'" class="match-setup">
      <div class="setup-card match-setup-card">
        <div>
          <h1>New Match</h1>
          <p>Select players from the player database.</p>
        </div>

        <div class="match-player-select">
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
            <span>Rally Time</span>
            <strong>{{ formattedRallyTime }}</strong>
          </div>
          <div class="rally-chip">
            <span>First Serve</span>
            <strong>{{ firstServerInitial }}</strong>
          </div>
          <div class="rally-chip rally-chip--turn">
            <span>Current Turn</span>
            <strong>{{ activePlayer || '-' }}</strong>
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
          @record="recordAction('A', $event)"
        />
        <PlayerShotPanel
          :player="playerB"
          side="b"
          :shots="shotTypes"
          :is-active="activePlayer === 'B'"
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
          <button class="primary-action" type="button" @click="showOutcomeDialog = true">
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

          <div class="dialog-section">
            <span>Winner</span>
            <div class="dialog-grid">
              <button type="button" @click="endRally(`Winner: ${playerA}`)">{{ playerA }}</button>
              <button type="button" @click="endRally(`Winner: ${playerB}`)">{{ playerB }}</button>
            </div>
          </div>

          <div class="dialog-section">
            <span>Or Error Type</span>
            <div class="dialog-grid">
              <button class="error-choice" type="button" @click="endRally('Net Error')">
                Net Error
              </button>
              <button class="error-choice" type="button" @click="endRally('Out Error')">
                Out Error
              </button>
              <button
                class="error-choice dialog-wide"
                type="button"
                @click="endRally('Service Fault')"
              >
                Service Fault
              </button>
            </div>
          </div>
        </div>
      </q-dialog>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import PlayerShotPanel from '@/components/PlayerShotPanel.vue'
import { loadPlayers } from '@/data/players'

const matchStatus = ref('setup')
const currentRally = ref(1)
const timeline = ref([])
const rallyOutcomes = ref([])
const availablePlayers = ref(loadPlayers())
const selectedPlayerAId = ref(availablePlayers.value[0]?.id ?? null)
const selectedPlayerBId = ref(availablePlayers.value[1]?.id ?? null)
const showOutcomeDialog = ref(false)
const rallyStartedAt = ref(null)
const rallyElapsedMs = ref(0)
const coinWinner = ref(null)
const isCoinFlipping = ref(false)
const activePlayer = ref(null)
const matchId = ref(null)
const notationStorageKey = 'akp-shuttletrace:last-match-notation'
const legacyHistoryStorageKey = `court${'sense'}:match-history`
const historyStorageKey = 'akp-shuttletrace:match-history'
let rallyTimerId = null
let coinFlipTimerId = null

const shotTypes = [
  { type: 'Smash', category: 'attack' },
  { type: 'Drive', category: 'attack' },
  { type: 'Clear', category: 'neutral' },
  { type: 'Drop', category: 'neutral' },
  { type: 'Lift', category: 'defense' },
  { type: 'Net Shot', category: 'neutral' },
  { type: 'Block', category: 'defense' },
  { type: 'Serve', category: 'neutral' },
  { type: 'Error', category: 'error' },
]

const currentRallyActions = computed(() =>
  timeline.value.filter((action) => action.rallyNumber === currentRally.value),
)
const selectedPlayerA = computed(() => findAvailablePlayer(selectedPlayerAId.value))
const selectedPlayerB = computed(() => findAvailablePlayer(selectedPlayerBId.value))
const playerA = computed(() => selectedPlayerA.value?.name ?? 'Player A')
const playerB = computed(() => selectedPlayerB.value?.name ?? 'Player B')
const canStartSetup = computed(
  () =>
    Boolean(selectedPlayerA.value && selectedPlayerB.value) &&
    selectedPlayerAId.value !== selectedPlayerBId.value,
)
const formattedRallyTime = computed(() => formatDuration(rallyElapsedMs.value))
const lastRallyDurationLabel = computed(() => rallyOutcomes.value.at(-1)?.durationLabel ?? '00:00')
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

function recordAction(player, shot) {
  if (matchStatus.value !== 'live') return
  if (player !== activePlayer.value) return
  if (!rallyStartedAt.value) startRallyTimer()

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
  saveNotation('coin-flip')
}

function startMatch() {
  if (!coinWinner.value) return
  activePlayer.value = coinWinner.value
  matchStatus.value = 'live'
  startRallyTimer()
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

function endRally(outcome) {
  const endedAt = new Date().toISOString()
  const startedAt = rallyStartedAt.value
  const durationMs = stopRallyTimer()

  rallyOutcomes.value.push({
    rallyNumber: currentRally.value,
    outcome,
    shots: currentRallyActions.value.length,
    durationMs,
    durationLabel: formatDuration(durationMs),
    startedAt,
    endedAt,
  })
  currentRally.value += 1
  activePlayer.value = getOutcomeWinnerCode(outcome) ?? activePlayer.value ?? coinWinner.value
  showOutcomeDialog.value = false
  saveNotation()
  startRallyTimer()
}

function endMatch() {
  stopRallyTimer()
  matchStatus.value = 'ended'
  saveNotation('ended')
}

function resetMatch() {
  stopRallyTimer()
  matchStatus.value = 'setup'
  currentRally.value = 1
  timeline.value = []
  rallyOutcomes.value = []
  showOutcomeDialog.value = false
  rallyStartedAt.value = null
  rallyElapsedMs.value = 0
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

function getOutcomeWinnerCode(outcome) {
  if (outcome === `Winner: ${playerA.value}`) return 'A'
  if (outcome === `Winner: ${playerB.value}`) return 'B'
  return null
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
      firstServer: firstServerName.value,
      firstServerCode: coinWinner.value,
      activePlayer: activePlayerName.value,
      activePlayerCode: activePlayer.value,
      savedAt: new Date().toISOString(),
    },
    notation: timeline.value,
    rallyOutcomes: rallyOutcomes.value,
  }
}

function saveNotation(status) {
  if (typeof window === 'undefined') return
  const report = buildNotationReport(status)
  window.localStorage.setItem(notationStorageKey, JSON.stringify(report))

  if (status === 'ended') saveHistoryReport(report)
}

function saveHistoryReport(report) {
  const rawHistory =
    window.localStorage.getItem(historyStorageKey) ??
    window.localStorage.getItem(legacyHistoryStorageKey)
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
    rallyElapsedMs.value = elapsedFromStart()
  }, 250)
}

function stopRallyTimer() {
  if (rallyTimerId && typeof window !== 'undefined') {
    window.clearInterval(rallyTimerId)
    rallyTimerId = null
  }

  rallyElapsedMs.value = elapsedFromStart()
  return rallyElapsedMs.value
}

function elapsedFromStart() {
  if (!rallyStartedAt.value) return rallyElapsedMs.value
  return Math.max(Date.now() - new Date(rallyStartedAt.value).getTime(), 0)
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

onUnmounted(() => {
  stopCoinFlip()
  stopRallyTimer()
})
</script>
