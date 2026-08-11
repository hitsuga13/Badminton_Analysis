<template>
  <q-page class="live-page">
    <section v-if="matchStatus === 'setup'" class="match-setup">
      <div class="setup-card">
        <div>
          <h1>New Match</h1>
          <p>Configure players to start recording.</p>
        </div>

        <label>
          <span>Player A</span>
          <input v-model="playerA" type="text" />
        </label>

        <div class="vs-pill">VS</div>

        <label>
          <span>Player B</span>
          <input v-model="playerB" type="text" />
        </label>

        <button class="primary-action" type="button" @click="startMatch">
          <q-icon name="play_arrow" size="20px" />
          Start Match
        </button>
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
          <button class="danger-action" type="button" @click="matchStatus = 'ended'">
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
          @record="recordAction('A', $event)"
        />
        <PlayerShotPanel
          :player="playerB"
          side="b"
          :shots="shotTypes"
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
          <button type="button" :disabled="timeline.length === 0" @click="undoLastAction">
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
              <button type="button" @click="endRally">{{ playerA }}</button>
              <button type="button" @click="endRally">{{ playerB }}</button>
            </div>
          </div>

          <div class="dialog-section">
            <span>Or Error Type</span>
            <div class="dialog-grid">
              <button class="error-choice" type="button" @click="endRally">Net Error</button>
              <button class="error-choice" type="button" @click="endRally">Out Error</button>
              <button class="error-choice dialog-wide" type="button" @click="endRally">
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
import { computed, ref } from 'vue'
import PlayerShotPanel from '@/components/PlayerShotPanel.vue'

const matchStatus = ref('setup')
const currentRally = ref(1)
const timeline = ref([])
const playerA = ref('Viktor Axelsen')
const playerB = ref('Lee Zii Jia')
const showOutcomeDialog = ref(false)

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

function recordAction(player, shot) {
  if (matchStatus.value !== 'live') return

  timeline.value.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    player,
    shot,
    rallyNumber: currentRally.value,
  })
}

function startMatch() {
  matchStatus.value = 'live'
}

function undoLastAction() {
  timeline.value.pop()
}

function endRally() {
  currentRally.value += 1
  showOutcomeDialog.value = false
}

function firstName(name) {
  return name.split(' ')[0]
}
</script>
