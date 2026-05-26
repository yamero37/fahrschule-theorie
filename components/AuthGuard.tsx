'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAuthorized, isSessionExpired, signOut } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  /* ── Initial check on mount ────────────────────────────── */
  useEffect(() => {
    // Fallback: nach 6 s Inhalt trotzdem zeigen (verhindert ewige Ladeanimation)
    const fallback = setTimeout(() => setReady(true), 6000)

    async function check() {
      clearTimeout(fallback)
      // Unsere eigene 3-h-Sperre
      if (isSessionExpired()) {
        await signOut()
        router.replace('/')
        return
      }
      // Supabase-Session prüfen — bei Netzwerkfehler pessimistisch erlauben (catch → true)
      const ok = await isAuthorized().catch(() => true)
      if (!ok) {
        router.replace('/')
      } else {
        setReady(true)
      }
    }
    check()

    return () => clearTimeout(fallback)
  }, [router])

  /* ── Sofort auf Supabase-SIGNED_OUT reagieren ──────────── */
  // Kein Polling nötig — onAuthStateChange feuert sofort bei echter Abmeldung
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  /* ── Nur unsere 3-h-Sperre periodisch prüfen (kein Netzwerk) ── */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isSessionExpired()) {
        await signOut()
        router.replace('/')
      }
    }, 60_000) // alle 60 s, rein localStorage-basiert
    return () => clearInterval(interval)
  }, [router])

  if (!ready) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
          Wird geladen…
        </span>
      </div>
    )
  }

  return <>{children}</>
}
