<template>
  <q-page class="login-page">
    <section class="login-card">
      <div class="login-mark">
        <img src="/icons/akp-shuttletrace-mark.svg" alt="AKP ShuttleTrace" />
      </div>

      <h1>AKP ShuttleTrace</h1>
      <p>Badminton Match & Stroke Notational Analysis System</p>

      <div class="auth-switch" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          :class="authMode === 'login' && 'auth-switch--active'"
          @click="setAuthMode('login')"
        >
          Login
        </button>
        <button
          type="button"
          :class="authMode === 'signup' && 'auth-switch--active'"
          @click="setAuthMode('signup')"
        >
          Sign up
        </button>
      </div>

      <form class="login-form" @submit.prevent="submitAuth">
        <label v-if="authMode === 'signup'">
          <span>Full Name</span>
          <input v-model.trim="name" type="text" required />
        </label>

        <label>
          <span>Username / Email</span>
          <input v-model="email" type="email" required />
        </label>

        <label>
          <span>Password</span>
          <input v-model="password" type="password" required minlength="6" />
        </label>

        <label v-if="authMode === 'signup'">
          <span>Role</span>
          <select v-model="role">
            <option value="coach">Coach</option>
            <option value="player">Player</option>
          </select>
        </label>

        <p v-if="authError" class="form-error">{{ authError }}</p>

        <button type="submit" :disabled="isLoading">
          {{ submitLabel }}
        </button>
      </form>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../boot/axios'
import { saveAuth } from '@/data/auth'

const router = useRouter()
const authMode = ref('login')
const name = ref('')
const email = ref('coach@akpshuttletrace.app')
const password = ref('password')
const role = ref('coach')
const authError = ref('')
const isLoading = ref(false)

const submitLabel = computed(() => {
  if (isLoading.value) return authMode.value === 'signup' ? 'Creating account...' : 'Logging in...'
  return authMode.value === 'signup' ? 'Create Account' : 'Secure Login'
})

function setAuthMode(mode) {
  authMode.value = mode
  authError.value = ''
  if (mode === 'signup' && email.value === 'coach@akpshuttletrace.app') {
    email.value = ''
    password.value = ''
  }
}

async function submitAuth() {
  authError.value = ''
  isLoading.value = true

  try {
    const endpoint = authMode.value === 'signup' ? '/auth/register' : '/auth/login'
    const payload =
      authMode.value === 'signup'
        ? {
            name: name.value,
            email: email.value,
            password: password.value,
            role: role.value,
          }
        : {
            email: email.value,
            password: password.value,
          }

    const res = await api.post(endpoint, payload)

    saveAuth(res.data)
    router.push('/')
  } catch (error) {
    authError.value =
      error?.response?.data?.message ??
      (authMode.value === 'signup'
        ? 'Account could not be created.'
        : 'Login failed. Check your credentials.')
  } finally {
    isLoading.value = false
  }
}
</script>
