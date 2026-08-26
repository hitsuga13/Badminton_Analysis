<template>
  <q-page class="login-page">
    <section class="login-card">
      <div class="login-mark">
        <img src="/icons/akp-shuttletrace-mark.svg" alt="AKP ShuttleTrace" />
      </div>

      <h1>AKP ShuttleTrace</h1>
      <p>Badminton Match & Stroke Notational Analysis System</p>

      <form class="login-form" @submit.prevent="login">
        <label>
          <span>Username / Email</span>
          <input v-model="email" type="email" required />
        </label>

        <label>
          <span>Password</span>
          <input v-model="password" type="password" required />
        </label>

        <p v-if="authError" class="form-error">{{ authError }}</p>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Secure Login' }}
        </button>
      </form>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../boot/axios'
import { saveAuth } from '@/data/auth'

const router = useRouter()
const email = ref('coach@akpshuttletrace.app')
const password = ref('password')
const authError = ref('')
const isLoading = ref(false)

async function login() {
  authError.value = ''
  isLoading.value = true

  try {
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })

    saveAuth(res.data)
    router.push('/')
  } catch (error) {
    authError.value = error?.response?.data?.message ?? 'Login failed. Check your credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>
