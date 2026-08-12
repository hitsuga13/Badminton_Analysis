<template>
  <div :class="['shot-panel', `shot-panel--${side}`, isActive && 'shot-panel--active']">
    <header>
      <h2>{{ player }}</h2>
      <span>{{ panelStatus }}</span>
    </header>

    <div class="shot-grid">
      <button
        v-for="shot in shots"
        :key="shot.type"
        :class="[
          'shot-button',
          `shot-button--${shot.category}`,
          requireServe && shot.type !== 'Serve' && 'shot-button--locked',
          disableServe && shot.type === 'Serve' && 'shot-button--locked',
          isActive && isShotDisabled(shot) && 'shot-button--unavailable',
        ]"
        type="button"
        :disabled="isShotDisabled(shot)"
        @click="$emit('record', shot.type)"
      >
        <strong>{{ shot.type }}</strong>
        <span>{{ shot.category }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['record'])

const props = defineProps({
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
  requireServe: {
    type: Boolean,
    default: false,
  },
  disableServe: {
    type: Boolean,
    default: false,
  },
})

const panelStatus = computed(() => {
  if (!props.isActive) return 'Waiting Turn'
  if (props.requireServe) return 'Serve Required'
  return 'Active Turn'
})

function isShotDisabled(shot) {
  if (!props.isActive) return true
  if (props.disableServe && shot.type === 'Serve') return true
  return props.requireServe && shot.type !== 'Serve'
}
</script>
