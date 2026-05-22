'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getAuth()) {
      router.replace('/')
    } else {
      setReady(true)
    }
  }, [router])

  // Check demo expiry every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!getAuth()) router.replace('/')
    }, 15000)
    return () => clearInterval(interval)
  }, [router])

  if (!ready) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
          Wird geladen…
        </span>
      </div>
    )
  }

  return <>{children}</>
}
