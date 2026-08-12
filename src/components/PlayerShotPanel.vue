<template>
  <div :class="['shot-panel', `shot-panel--${side}`, isActive && 'shot-panel--active']">
    <header>
      <h2>{{ player }}</h2>
      <span>{{ isActive ? 'Active Turn' : 'Waiting Turn' }}</span>
    </header>

    <div class="shot-grid">
      <button
        v-for="shot in shots"
        :key="shot.type"
        :class="['shot-button', `shot-button--${shot.category}`]"
        type="button"
        :disabled="!isActive"
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
  isActive: {
    type: Boolean,
    default: false,
  },
})
</script>
