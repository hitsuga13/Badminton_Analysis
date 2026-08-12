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

    <q-dialog v-model="showAddDialog" persistent>
      <form class="player-dialog" @submit.prevent="addPlayer">
        <div class="dialog-head">
          <h2>Add Player</h2>
          <button type="button" @click="showAddDialog = false">
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
              <button type="button" @click="adjustNewPlayerValue('age', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="newPlayer.age" min="1" type="number" required />
              <button type="button" @click="adjustNewPlayerValue('age', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Height (cm)</span>
            <div class="number-stepper">
              <button type="button" @click="adjustNewPlayerValue('heightCm', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="newPlayer.heightCm" min="1" type="number" required />
              <button type="button" @click="adjustNewPlayerValue('heightCm', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Weight (kg)</span>
            <div class="number-stepper">
              <button type="button" @click="adjustNewPlayerValue('weightKg', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="newPlayer.weightKg" min="1" type="number" required />
              <button type="button" @click="adjustNewPlayerValue('weightKg', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <div class="bmi-preview">
            <span>BMI</span>
            <strong>{{ calculateBmi(newPlayer) }}</strong>
          </div>
        </div>

        <button class="primary-action" type="submit">Save Player</button>
      </form>
    </q-dialog>

    <q-dialog
      :model-value="Boolean(editingPlayer)"
      persistent
      @update:model-value="cancelEditPlayer"
    >
      <form v-if="editingPlayer" class="player-dialog" @submit.prevent="saveEditPlayer">
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
              <button type="button" @click="adjustEditingPlayerValue('age', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="editingPlayer.age" min="1" type="number" required />
              <button type="button" @click="adjustEditingPlayerValue('age', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Height (cm)</span>
            <div class="number-stepper">
              <button type="button" @click="adjustEditingPlayerValue('heightCm', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="editingPlayer.heightCm" min="1" type="number" required />
              <button type="button" @click="adjustEditingPlayerValue('heightCm', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <label>
            <span>Weight (kg)</span>
            <div class="number-stepper">
              <button type="button" @click="adjustEditingPlayerValue('weightKg', -1)">
                <q-icon name="remove" size="18px" />
              </button>
              <input v-model.number="editingPlayer.weightKg" min="1" type="number" required />
              <button type="button" @click="adjustEditingPlayerValue('weightKg', 1)">
                <q-icon name="add" size="18px" />
              </button>
            </div>
          </label>

          <div class="bmi-preview">
            <span>BMI</span>
            <strong>{{ calculateBmi(editingPlayer) }}</strong>
          </div>
        </div>

        <button class="primary-action" type="submit">Update Player</button>
      </form>
    </q-dialog>

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
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { loadPlayers, savePlayers } from '@/data/players'

const search = ref('')

const showAddDialog = ref(false)
const selectedPlayer = ref(null)
const editingPlayer = ref(null)
const newPlayer = ref({
  name: '',
  category: "Men's Singles",
  hand: 'Right',
  age: 20,
  heightCm: 175,
  weightKg: 70,
})

const players = ref(loadPlayers())

const filteredPlayers = computed(() =>
  players.value.filter((player) => player.name.toLowerCase().includes(search.value.toLowerCase())),
)

function addPlayer() {
  if (!newPlayer.value.name.trim()) return

  players.value.push({
    id: Date.now(),
    name: newPlayer.value.name.trim(),
    hand: newPlayer.value.hand.trim(),
    category: newPlayer.value.category.trim(),
    age: Number(newPlayer.value.age),
    heightCm: Number(newPlayer.value.heightCm),
    weightKg: Number(newPlayer.value.weightKg),
    rank: players.value.length + 1,
    form: [1, 1, 0, 1, 0],
  })

  savePlayers(players.value)
  resetNewPlayer()
  showAddDialog.value = false
}

function startEditPlayer(player) {
  editingPlayer.value = {
    ...player,
    form: [...player.form],
  }
}

function saveEditPlayer() {
  const playerIndex = players.value.findIndex((player) => player.id === editingPlayer.value.id)
  if (playerIndex === -1) return

  players.value[playerIndex] = {
    ...editingPlayer.value,
    name: editingPlayer.value.name.trim(),
    hand: editingPlayer.value.hand.trim(),
    category: editingPlayer.value.category.trim(),
    age: Number(editingPlayer.value.age),
    heightCm: Number(editingPlayer.value.heightCm),
    weightKg: Number(editingPlayer.value.weightKg),
  }
  savePlayers(players.value)
  editingPlayer.value = null
}

function cancelEditPlayer() {
  editingPlayer.value = null
}

function deletePlayer(playerId) {
  players.value = players.value.filter((player) => player.id !== playerId)
  savePlayers(players.value)
  if (selectedPlayer.value?.id === playerId) selectedPlayer.value = null
  if (editingPlayer.value?.id === playerId) editingPlayer.value = null
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
</script>
