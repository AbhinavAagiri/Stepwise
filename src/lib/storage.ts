const PREFIX = 'stepwise'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}.${key}`)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}.${key}`, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private browsing. The app still works.
  }
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}.${key}`)
  } catch {
    // Ignore.
  }
}
