<template>
  <q-page class="players-page">
    <header class="section-topbar">
      <div>
        <h1>Player Database</h1>
        <p>4 Active Players</p>
      </div>

      <div class="player-tools">
        <label class="search-box">
          <q-icon name="search" size="18px" />
          <input v-model="search" type="text" placeholder="Search players..." />
        </label>
        <button class="primary-action" type="button">
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
                  <strong>{{ player.name }}</strong>
                  <span>Rank #{{ player.rank }}</span>
                </div>
              </div>
            </td>
            <td>{{ player.category }}</td>
            <td>{{ player.hand }}</td>
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
              <button class="ghost-icon" type="button">
                <q-icon name="more_horiz" size="22px" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'

const search = ref('')

const players = [
  {
    id: 1,
    name: 'Viktor Axelsen',
    hand: 'Right',
    category: "Men's Singles",
    rank: 1,
    form: [1, 1, 1, 0, 1],
  },
  {
    id: 2,
    name: 'Lee Zii Jia',
    hand: 'Right',
    category: "Men's Singles",
    rank: 10,
    form: [1, 0, 1, 1, 0],
  },
  {
    id: 3,
    name: 'An Se Young',
    hand: 'Right',
    category: "Women's Singles",
    rank: 1,
    form: [1, 1, 1, 1, 1],
  },
  {
    id: 4,
    name: 'Shi Yuqi',
    hand: 'Right',
    category: "Men's Singles",
    rank: 2,
    form: [0, 1, 1, 1, 0],
  },
]

const filteredPlayers = computed(() =>
  players.filter((player) => player.name.toLowerCase().includes(search.value.toLowerCase())),
)
</script>
