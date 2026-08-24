export const defaultPlayers = [
  {
    id: 1,
    name: 'Viktor Axelsen',
    hand: 'Right',
    category: "Men's Singles",
    rank: 1,
    age: 32,
    heightCm: 194,
    weightKg: 88,
    form: [1, 1, 1, 0, 1],
  },
  {
    id: 2,
    name: 'Lee Zii Jia',
    hand: 'Right',
    category: "Men's Singles",
    rank: 10,
    age: 28,
    heightCm: 186,
    weightKg: 78,
    form: [1, 0, 1, 1, 0],
  },
  {
    id: 3,
    name: 'An Se Young',
    hand: 'Right',
    category: "Women's Singles",
    rank: 1,
    age: 24,
    heightCm: 170,
    weightKg: 62,
    form: [1, 1, 1, 1, 1],
  },
  {
    id: 4,
    name: 'Shi Yuqi',
    hand: 'Right',
    category: "Men's Singles",
    rank: 2,
    age: 30,
    heightCm: 184,
    weightKg: 80,
    form: [0, 1, 1, 1, 0],
  },
]

export const playersStorageKey = 'akp-shuttletrace:players'

export function clonePlayers(players = defaultPlayers) {
  return players.map((player) => ({
    ...player,
    form: [...(player.form ?? [])],
    trainingHistory: (player.trainingHistory ?? []).map((session) => ({
      ...session,
      records: [...(session.records ?? [])],
    })),
  }))
}

export function loadPlayers() {
  if (typeof window === 'undefined') return clonePlayers()

  try {
    const storedPlayers = JSON.parse(window.localStorage.getItem(playersStorageKey) ?? '[]')
    if (Array.isArray(storedPlayers) && storedPlayers.length > 0) {
      return clonePlayers(storedPlayers)
    }
  } catch {
    return clonePlayers()
  }

  return clonePlayers()
}

export function savePlayers(players) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(playersStorageKey, JSON.stringify(clonePlayers(players)))
}
