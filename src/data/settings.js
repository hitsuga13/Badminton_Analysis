export const settingsStorageKey = 'akp-shuttletrace:settings'

export const defaultSettings = {
  matchFormat: 'best-of-3',
  customSetCount: 3,
  pointFormat: 21,
  customPointTarget: 21,
  soundEnabled: true,
  soundVolume: 55,
  theme: 'dark',
  profile: {
    name: 'Coach O.',
    role: 'Head Coach',
    initials: 'CO',
  },
  analytics: {
    shotFrequency: true,
    radar: true,
    insights: true,
  },
}

export function loadSettings() {
  if (typeof window === 'undefined') return structuredClone(defaultSettings)

  try {
    const stored = JSON.parse(window.localStorage.getItem(settingsStorageKey) ?? '{}')
    return {
      ...structuredClone(defaultSettings),
      ...stored,
      analytics: { ...defaultSettings.analytics, ...(stored.analytics ?? {}) },
      profile: { ...defaultSettings.profile, ...(stored.profile ?? {}) },
    }
  } catch {
    return structuredClone(defaultSettings)
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings))
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}
