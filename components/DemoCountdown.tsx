'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDemoExpiry } from '@/lib/auth'

export default function DemoCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const tick = () => {
      const exp = getDemoExpiry()
      if (exp === null) { setRemaining(null); return }
      const left = Math.max(0, exp - Date.now())
      setRemaining(left)
      if (left === 0) router.replace('/')
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [router])

  if (remaining === null) return null

  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  const urgent = remaining < 5 * 60 * 1000

  return (
    <span style={{
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      color: urgent ? '#ff6b6b' : 'var(--gold)',
      background: urgent ? 'rgba(255,107,107,0.08)' : 'rgba(201,162,39,0.08)',
      border: `1px solid ${urgent ? 'rgba(255,107,107,0.35)' : 'rgba(201,162,39,0.3)'}`,
      padding: '3px 10px',
      borderRadius: '20px',
      transition: 'color 0.5s, border-color 0.5s',
    }}>
      Demo {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  )
}
