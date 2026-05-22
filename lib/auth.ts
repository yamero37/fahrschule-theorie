import { supabase } from './supabase'

// ── Supabase Auth ────────────────────────────────────────

export async function registerUser(username: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })
  if (error) throw error
  return data
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function signOut() {
  clearDemo()
  await supabase.auth.signOut()
}

// ── Demo mode (localStorage, no backend) ────────────────

const DEMO_KEY      = 'toldrive_demo'
const DEMO_USED_KEY = 'toldrive_demo_used'

export function hasDemoBeenUsed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DEMO_USED_KEY) === 'true'
}

export function startDemo() {
  localStorage.setItem(DEMO_USED_KEY, 'true')
  localStorage.setItem(DEMO_KEY, String(Date.now() + 60 * 60 * 1000))
}

export function getDemoExpiry(): number | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(DEMO_KEY)
  if (!raw) return null
  const exp = Number(raw)
  if (exp < Date.now()) { clearDemo(); return null }
  return exp
}

export function clearDemo() {
  if (typeof window !== 'undefined') localStorage.removeItem(DEMO_KEY)
  // DEMO_USED_KEY bleibt — verhindert erneute Demo
}

// ── Combined check ───────────────────────────────────────

export async function isAuthorized(): Promise<boolean> {
  if (getDemoExpiry() !== null) return true
  const session = await getSession()
  return session !== null
}
