export type AuthState =
  | { type: 'demo'; expiresAt: number }
  | { type: 'user'; username: string; email: string }

const KEY = 'toldrive_auth'

export function getAuth(): AuthState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const auth = JSON.parse(raw) as AuthState
    if (auth.type === 'demo' && auth.expiresAt < Date.now()) {
      localStorage.removeItem(KEY)
      return null
    }
    return auth
  } catch {
    return null
  }
}

export function startDemo() {
  const auth: AuthState = { type: 'demo', expiresAt: Date.now() + 60 * 60 * 1000 }
  localStorage.setItem(KEY, JSON.stringify(auth))
}

export function registerUser(username: string, email: string) {
  const auth: AuthState = { type: 'user', username, email }
  localStorage.setItem(KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(KEY)
}
