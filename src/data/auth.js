export const authStorageKey = 'akp-shuttletrace:auth'

export function loadAuth() {
  if (typeof window === 'undefined') return null

  try {
    const auth = JSON.parse(window.localStorage.getItem(authStorageKey) ?? 'null')
    if (!auth?.token || !auth?.user) return null
    if (auth.expiresAt && new Date(auth.expiresAt) <= new Date()) {
      clearAuth()
      return null
    }
    return auth
  } catch {
    return null
  }
}

export function saveAuth(auth) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(authStorageKey, JSON.stringify(auth))
  window.dispatchEvent(new Event('akp-auth-updated'))
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(authStorageKey)
  window.dispatchEvent(new Event('akp-auth-updated'))
}

export function isLoggedIn() {
  return Boolean(loadAuth()?.token)
}

export function currentUserId() {
  return loadAuth()?.user?.id ?? null
}

export function scopedStorageKey(baseKey) {
  const userId = currentUserId()
  return userId ? `${baseKey}:user:${userId}` : baseKey
}
