'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startDemo } from '@/lib/auth'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    startDemo()
    router.replace('/fragen')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080808',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--gold)', fontSize: '1rem', letterSpacing: '0.1em' }}>
          Demo wird gestartet…
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Du hast 60 Minuten Zugang zu allen Fragen.
        </p>
      </div>
    </div>
  )
}
