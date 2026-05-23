'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthorized, getDemoExpiry } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 5000) // fallback: show content after 5s
    isAuthorized().then(ok => {
      clearTimeout(timeout)
      if (!ok) router.replace('/')
      else setReady(true)
    }).catch(() => { clearTimeout(timeout); setReady(true) })
    return () => clearTimeout(timeout)
  }, [router])

  // Check demo expiry every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      isAuthorized().then(ok => { if (!ok) router.replace('/') })
    }, 15000)
    // Also watch for demo countdown hitting zero
    const demoCheck = setInterval(() => {
      if (getDemoExpiry() === null) {
        isAuthorized().then(ok => { if (!ok) router.replace('/') })
      }
    }, 5000)
    return () => { clearInterval(interval); clearInterval(demoCheck) }
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
