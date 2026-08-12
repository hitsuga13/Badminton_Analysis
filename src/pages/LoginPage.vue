<template>
  <q-page class="login-page">
    <section class="login-card">
      <div class="login-mark">
        <q-icon name="monitor_heart" size="32px" />
      </div>

      <h1>AKP ShuttleTrace</h1>
      <p>Badminton Match & Stroke Notational Analysis System</p>

      <form class="login-form" @submit.prevent="$emit('login')">
        <label>
          <span>Username / Email</span>
          <input v-model="email" type="email" required />
        </label>

        <label>
          <span>Password</span>
          <input v-model="password" type="password" required />
        </label>

        <button type="submit">Secure Login</button>
      </form>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['login'])

const email = ref('coach@akpshuttletrace.app')
const password = ref('password')
</script>
