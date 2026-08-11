<template>
  <div :class="['shot-panel', `shot-panel--${side}`]">
    <header>
      <h2>{{ player }}</h2>
    </header>

    <div class="shot-grid">
      <button
        v-for="shot in shots"
        :key="shot.type"
        :class="['shot-button', `shot-button--${shot.category}`]"
        type="button"
        @click="$emit('record', shot.type)"
      >
        <strong>{{ shot.type }}</strong>
        <span>{{ shot.category }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['record'])

defineProps({
  player: {
    type: String,
    required: true,
  },
  side: {
    type: String,
    required: true,
  },
  shots: {
    type: Array,
    required: true,
  },
})
</script>
