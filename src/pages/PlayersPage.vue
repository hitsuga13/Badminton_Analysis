<template>
  <q-page class="players-page">
    <header class="section-topbar">
      <div>
        <h1>Player Database</h1>
        <p>{{ players.length }} Active Players</p>
      </div>

      <div class="player-tools">
        <label class="search-box">
          <q-icon name="search" size="18px" />
          <input v-model="search" type="text" placeholder="Search players..." />
        </label>
        <button class="primary-action" type="button" @click="showAddDialog = true">
          <q-icon name="add" size="18px" />
          Add Player
        </button>
      </div>
    </header>

    <section class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Category</th>
            <th>Hand</th>
            <th>Age</th>
            <th>Height</th>
            <th>Weight</th>
            <th>BMI</th>
            <th>Recent Form</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in filteredPlayers" :key="player.id">
            <td>
              <div class="player-cell">
                <div class="player-avatar">{{ player.name.charAt(0) }}</div>
                <div>
                  <button class="player-name-button" type="button" @click="selectedPlayer = player">
                    {{ player.name }}
                  </button>
                  <span>Rank #{{ player.rank }}</span>
                </div>
              </div>
            </td>
            <td>{{ player.category }}</td>
            <td>{{ player.hand }}</td>
            <td>{{ player.age }}</td>
            <td>{{ player.heightCm }} cm</td>
            <td>{{ player.weightKg }} kg</td>
            <td>{{ calculateBmi(player) }}</td>
            <td>
              <div class="form-bars">
                <span
                  v-for="(win, index) in player.form"
                  :key="index"
                  :class="win ? 'form-win' : 'form-loss'"
                />
              </div>
            </td>
            <td class="text-right">
              <div class="player-action-group">
                <button
                  class="ghost-icon"
                  type="button"
                  title="Details"
                  @click="selectedPlayer = player"
                >
                  <q-icon name="visibility" size="20px" />
                </button>
                <button
                  class="ghost-icon"
                  type="button"
                  title="Edit"
                  @click="startEditPlayer(player)"
                >
                  <q-icon name="edit" size="20px" />
                </button>
                <button
                  class="ghost-icon ghost-icon--danger"
                  type="button"
                  title="Delete"
                  @click="deletePlayer(player.id)"
                >
                  <q-icon name="delete" size="20px" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="showAddDialog" class="player-modal" role="dialog" aria-modal="true">
      <form class="player-dialog" @click.stop @submit.prevent="addPlayer">
        <div class="dialog-head">
          <h2>Add Player</h2>
          <button type="button" @click="closeAddPlayerDialog">
            <q-icon name="close" size="20px" />
          </button>
        </div>

        <label>
          <span>Name</span>
          <input
            v-model.trim="newPlayer.name"
            type="text"
            placeholder="Enter player name"
            required
            autofocus
          />
        </label>

        <label>
          <span>Category</span>
          <input v-model="newPlayer.category" type="text" required />
        </label>

        <label>
          <span>Dominant Hand</span>
          <input v-model="newPlayer.hand" type="text" required />
        </label>

        <div class="player-form-grid">
          <label>
            <span>Age</span>
            <div class="number-stepper">
              <button type="button" @click.prevent.stop="adjustNewPlayerValue('age', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="newPlayer.age" min="1" type="number" required />
              <button type="button" @click.prevent.stop="adjustNewPlayerValue('age', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Height (cm)</span>
            <div class="number-stepper">
              <button type="button" @click.prevent.stop="adjustNewPlayerValue('heightCm', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="newPlayer.heightCm" min="1" type="number" required />
              <button type="button" @click.prevent.stop="adjustNewPlayerValue('heightCm', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Weight (kg)</span>
            <div class="number-stepper">
              <button type="button" @click.prevent.stop="adjustNewPlayerValue('weightKg', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="newPlayer.weightKg" min="1" type="number" required />
              <button type="button" @click.prevent.stop="adjustNewPlayerValue('weightKg', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <div class="bmi-preview">
            <span>BMI</span>
            <strong>{{ calculateBmi(newPlayer) }}</strong>
          </div>
        </div>

        <p v-if="playerError" class="form-error">{{ playerError }}</p>

        <button class="primary-action" type="submit" :disabled="isSavingPlayer">
          {{ isSavingPlayer ? 'Saving...' : 'Save Player' }}
        </button>
      </form>
    </div>

    <div v-if="editingPlayer" class="player-modal" role="dialog" aria-modal="true">
      <form v-if="editingPlayer" class="player-dialog" @click.stop @submit.prevent="saveEditPlayer">
        <div class="dialog-head">
          <h2>Edit Player</h2>
          <button type="button" @click="cancelEditPlayer">
            <q-icon name="close" size="20px" />
          </button>
        </div>

        <label>
          <span>Name</span>
          <input v-model="editingPlayer.name" type="text" required />
        </label>

        <label>
          <span>Category</span>
          <input v-model="editingPlayer.category" type="text" required />
        </label>

        <label>
          <span>Dominant Hand</span>
          <input v-model="editingPlayer.hand" type="text" required />
        </label>

        <div class="player-form-grid">
          <label>
            <span>Age</span>
            <div class="number-stepper">
              <button type="button" @click.prevent.stop="adjustEditingPlayerValue('age', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="editingPlayer.age" min="1" type="number" required />
              <button type="button" @click.prevent.stop="adjustEditingPlayerValue('age', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Height (cm)</span>
            <div class="number-stepper">
              <button type="button" @click.prevent.stop="adjustEditingPlayerValue('heightCm', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="editingPlayer.heightCm" min="1" type="number" required />
              <button type="button" @click.prevent.stop="adjustEditingPlayerValue('heightCm', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Weight (kg)</span>
            <div class="number-stepper">
              <button type="button" @click.prevent.stop="adjustEditingPlayerValue('weightKg', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="editingPlayer.weightKg" min="1" type="number" required />
              <button type="button" @click.prevent.stop="adjustEditingPlayerValue('weightKg', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <div class="bmi-preview">
            <span>BMI</span>
            <strong>{{ calculateBmi(editingPlayer) }}</strong>
          </div>
        </div>

        <p v-if="playerError" class="form-error">{{ playerError }}</p>

        <button class="primary-action" type="submit">Update Player</button>
      </form>
    </div>

    <q-dialog :model-value="Boolean(selectedPlayer)" @update:model-value="selectedPlayer = null">
      <div v-if="selectedPlayer" class="player-dialog">
        <div class="dialog-head">
          <h2>{{ selectedPlayer.name }}</h2>
          <button type="button" @click="selectedPlayer = null">
            <q-icon name="close" size="20px" />
          </button>
        </div>

        <div class="player-detail-list">
          <div>
            <span>Category</span>
            <strong>{{ selectedPlayer.category }}</strong>
          </div>
          <div>
            <span>Hand</span>
            <strong>{{ selectedPlayer.hand }}</strong>
          </div>
          <div>
            <span>Rank</span>
            <strong>#{{ selectedPlayer.rank }}</strong>
          </div>
          <div>
            <span>Age</span>
            <strong>{{ selectedPlayer.age }}</strong>
          </div>
          <div>
            <span>Height</span>
            <strong>{{ selectedPlayer.heightCm }} cm</strong>
          </div>
          <div>
            <span>Weight</span>
            <strong>{{ selectedPlayer.weightKg }} kg</strong>
          </div>
          <div>
            <span>BMI</span>
            <strong>{{ calculateBmi(selectedPlayer) }}</strong>
          </div>
        </div>

        <section class="player-training-panel">
          <div class="player-training-head">
            <div>
              <span>Training History</span>
              <strong>{{ playerTrainingHistory(selectedPlayer).length }} sessions</strong>
            </div>
            <em>{{ playerTrainingSummary(selectedPlayer) }}</em>
          </div>

          <div v-if="playerTrainingHistory(selectedPlayer).length === 0" class="history-muted">
            No training sessions recorded for this player yet.
          </div>

          <div v-else class="player-training-list">
            <article
              v-for="session in playerTrainingHistory(selectedPlayer).slice(0, 5)"
              :key="session.id"
              class="player-training-card"
            >
              <div>
                <span>{{ formatTrainingDate(session.savedAt) }}</span>
                <strong>{{ session.shot }}</strong>
              </div>
              <div>
                <span>Reps</span>
                <strong>{{ session.completedReps }}/{{ session.targetReps }}</strong>
              </div>
              <div>
                <span>Accuracy</span>
                <strong>{{ session.accuracy }}%</strong>
              </div>
            </article>
          </div>
        </section>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { api } from '../boot/axios'
import { loadPlayers, savePlayers } from '@/data/players'

const search = ref('')

const showAddDialog = ref(false)
const selectedPlayer = ref(null)
const editingPlayer = ref(null)
const playerError = ref('')
const isSavingPlayer = ref(false)
const newPlayer = ref({
  name: '',
  category: "Men's Singles",
  hand: 'Right',
  age: 20,
  heightCm: 175,
  weightKg: 70,
})

const players = ref(loadPlayers())

onMounted(async () => {
  try {
    const res = await api.get('/players')
    players.value = mergeStoredPlayerData(normalizePlayers(res.data), loadPlayers())
    savePlayers(players.value)
  } catch (error) {
    playerError.value = getPlayerErrorMessage(error)
  }
})

const filteredPlayers = computed(() =>
  players.value.filter((player) => player.name.toLowerCase().includes(search.value.toLowerCase())),
)

async function addPlayer() {
  if (!newPlayer.value.name.trim()) return

  isSavingPlayer.value = true
  playerError.value = ''

  try {
    const res = await api.post('/players', {
      name: newPlayer.value.name.trim(),
      hand: newPlayer.value.hand.trim(),
      category: newPlayer.value.category.trim(),
      age: Number(newPlayer.value.age),
      heightCm: Number(newPlayer.value.heightCm),
      weightKg: Number(newPlayer.value.weightKg),
      form: [1, 1, 0, 1, 0],
    })

    players.value.push(normalizePlayer(res.data))
    savePlayers(players.value)
    resetNewPlayer()
    showAddDialog.value = false
  } catch (error) {
    playerError.value = getPlayerErrorMessage(error)
  } finally {
    isSavingPlayer.value = false
  }
}

function startEditPlayer(player) {
  editingPlayer.value = {
    ...player,
    form: player.form ? [...player.form] : [], //edit player napi
  }
}

async function saveEditPlayer() {
  playerError.value = ''

  try {
    const res = await api.put(`/players/${editingPlayer.value.id}`, {
      name: editingPlayer.value.name.trim(),
      hand: editingPlayer.value.hand.trim(),
      category: editingPlayer.value.category.trim(),
      age: Number(editingPlayer.value.age),
      heightCm: Number(editingPlayer.value.heightCm),
      weightKg: Number(editingPlayer.value.weightKg),
    })

    const playerIndex = players.value.findIndex((player) => player.id === editingPlayer.value.id)
    if (playerIndex !== -1) players.value[playerIndex] = normalizePlayer(res.data)
    savePlayers(players.value)
    editingPlayer.value = null
  } catch (error) {
    playerError.value = getPlayerErrorMessage(error)
  }
}

function cancelEditPlayer() {
  editingPlayer.value = null
  clearPlayerDialogState()
}

function closeAddPlayerDialog() {
  showAddDialog.value = false
  clearPlayerDialogState()
}

function clearPlayerDialogState() {
  playerError.value = ''
  isSavingPlayer.value = false
}

async function deletePlayer(playerId) {
  playerError.value = ''

  try {
    await api.delete(`/players/${playerId}`)
    players.value = players.value.filter((player) => player.id !== playerId)
    savePlayers(players.value)
    if (selectedPlayer.value?.id === playerId) selectedPlayer.value = null
    if (editingPlayer.value?.id === playerId) editingPlayer.value = null
  } catch (error) {
    playerError.value = getPlayerErrorMessage(error)
  }
}

function adjustNewPlayerValue(field, amount) {
  newPlayer.value[field] = clampPositiveNumber(newPlayer.value[field], amount)
}

function adjustEditingPlayerValue(field, amount) {
  if (!editingPlayer.value) return
  editingPlayer.value[field] = clampPositiveNumber(editingPlayer.value[field], amount)
}

function clampPositiveNumber(value, amount) {
  return Math.max(Number(value || 1) + amount, 1)
}

function calculateBmi(player) {
  const heightMeters = Number(player.heightCm) / 100
  const weightKg = Number(player.weightKg)

  if (!heightMeters || !weightKg) return '-'

  return (weightKg / heightMeters ** 2).toFixed(1)
}

function resetNewPlayer() {
  newPlayer.value = {
    name: '',
    category: "Men's Singles",
    hand: 'Right',
    age: 20,
    heightCm: 175,
    weightKg: 70,
  }
}

function normalizePlayers(playersList) {
  if (!Array.isArray(playersList)) return []
  return playersList.map(normalizePlayer)
}

function normalizePlayer(player) {
  return {
    ...player,
    rank: player.rank ?? 0,
    form: Array.isArray(player.form) ? player.form : [],
    trainingHistory: Array.isArray(player.trainingHistory) ? player.trainingHistory : [],
  }
}

function mergeStoredPlayerData(fetchedPlayers, storedPlayers) {
  return fetchedPlayers.map((player) => {
    const storedPlayer = storedPlayers.find((stored) => stored.id === player.id)
    return {
      ...player,
      trainingHistory: storedPlayer?.trainingHistory ?? player.trainingHistory ?? [],
    }
  })
}

function playerTrainingHistory(player) {
  return [...(player?.trainingHistory ?? [])].sort(
    (a, b) => new Date(b.savedAt ?? 0) - new Date(a.savedAt ?? 0),
  )
}

function playerTrainingSummary(player) {
  const sessions = playerTrainingHistory(player)
  if (sessions.length === 0) return 'No embedded training data'

  const totalReps = sessions.reduce((sum, session) => sum + (session.completedReps ?? 0), 0)
  const successfulReps = sessions.reduce((sum, session) => sum + (session.successfulReps ?? 0), 0)
  const accuracy = totalReps ? Math.round((successfulReps / totalReps) * 100) : 0
  return `${totalReps} reps logged - ${accuracy}% accuracy`
}

function formatTrainingDate(value) {
  if (!value) return 'Unknown date'

  return new Intl.DateTimeFormat('en-MY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getPlayerErrorMessage(error) {
  if (error?.code === 'ECONNABORTED') {
    return 'Backend took too long to respond. You can close this dialog and try again.'
  }

  return error?.response?.data?.message ?? 'Player could not be saved. Check backend connection.'
}
</script>
