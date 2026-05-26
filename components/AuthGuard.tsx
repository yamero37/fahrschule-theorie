'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isSessionExpired, signOut } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION once Supabase has fully
    // initialized (token refreshed if needed) — far more reliable than
    // calling getSession() directly which can return null mid-refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        initializedRef.current = true

        if (!session) {
          // Definitely not logged in
          router.replace('/')
          return
        }

        // Custom expiry check (localStorage-only, no network)
        if (isSessionExpired()) {
          await signOut()
          router.replace('/')
          return
        }

        setReady(true)

      } else if (event === 'SIGNED_OUT') {
        // Real logout (manual or token revoked)
        setReady(false)
        router.replace('/')

      } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        // Token successfully refreshed or new login detected — ensure ready
        setReady(true)
      }
    })

    // Safety fallback: if INITIAL_SESSION never fires (rare) show content
    // after 8s so the user doesn't see a permanent spinner.
    const fallback = setTimeout(async () => {
      if (!initializedRef.current) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && !isSessionExpired()) {
          setReady(true)
        } else {
          router.replace('/')
        }
      }
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [router])

  // Periodic custom-expiry check (localStorage only, no network calls)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isSessionExpired()) {
        await signOut()
        router.replace('/')
      }
    }, 60_000)
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
