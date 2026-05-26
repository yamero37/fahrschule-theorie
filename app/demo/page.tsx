'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasDemoBeenUsed, startDemo } from '@/lib/auth'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    if (hasDemoBeenUsed()) {
      // Demo bereits genutzt → zur Registrierung weiterleiten
      router.replace('/register?reason=demo_expired')
    } else {
      startDemo()
      router.replace('/fragen')
    }
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <p style={{ color: 'var(--gold)', fontSize: '1rem', letterSpacing: '0.1em' }}>
        Wird geprüft…
      </p>
    </div>
  )
}
