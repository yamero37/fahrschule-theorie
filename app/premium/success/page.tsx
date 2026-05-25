'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PremiumSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(6)

  useEffect(() => {
    // Supabase-Session im Hintergrund refreshen, damit is_premium aktuell ist
    supabase.auth.refreshSession().catch(() => {})

    const timer = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) {
          clearInterval(timer)
          router.replace('/dashboard')
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Confetti-ähnlicher Glow-Hintergrund */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(216,179,106,0.12) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', maxWidth: '420px', width: '100%',
        background: 'linear-gradient(135deg, rgba(96,165,250,0.07), rgba(167,139,250,0.06), rgba(244,114,182,0.05))',
        border: '1.5px solid rgba(147,197,253,0.45)',
        borderRadius: '2rem',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        animation: 'glowDiamond 4s ease-in-out infinite',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>

        {/* Shimmer */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: '55%', borderRadius: 'inherit',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          animation: 'shimmer 4s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Diamond icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '22px', margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.18), rgba(244,114,182,0.15))',
          border: '1.5px solid rgba(147,197,253,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem',
          filter: 'drop-shadow(0 0 20px rgba(147,197,253,0.6))',
        }}>💎</div>

        {/* Title */}
        <h1 style={{
          margin: '0 0 0.6rem',
          fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, #93c5fd, #c4b5fd, #f9a8d4, #93c5fd)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'goldShine 3s linear infinite',
        }}>
          Willkommen bei Premium!
        </h1>

        <p style={{ margin: '0 0 0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Deine Zahlung war erfolgreich 🎉
        </p>
        <p style={{ margin: '0 0 2rem', fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Alle Premium-Features sind jetzt für dich freigeschaltet.
        </p>

        {/* Checkmarks */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1rem', padding: '1rem 1.2rem', marginBottom: '1.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.55rem', textAlign: 'left',
        }}>
          {[
            '🎬 Lernvideos — alle Erklärvideos',
            '⚔️ Battle-Modus — gegen Freunde antreten',
            '💎 Exklusive Premium-Inhalte',
            '🚀 Früher Zugang zu neuen Features',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={() => router.replace('/dashboard')}
          style={{
            width: '100%', padding: '0.9rem',
            borderRadius: '100px', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 8px 28px rgba(139,92,246,0.4)',
          }}
        >
          Zum Dashboard →
        </button>

        <p style={{ margin: '0.9rem 0 0', fontSize: '0.62rem', color: 'var(--text-dim)' }}>
          Weiterleitung in {countdown} Sekunde{countdown !== 1 ? 'n' : ''} …
        </p>
      </div>

      <style>{`
        @keyframes glowDiamond {
          0%   { box-shadow: 0 0 30px rgba(96,165,250,0.3);  border-color: rgba(96,165,250,0.5);  }
          25%  { box-shadow: 0 0 40px rgba(167,139,250,0.35); border-color: rgba(167,139,250,0.6); }
          50%  { box-shadow: 0 0 40px rgba(244,114,182,0.3);  border-color: rgba(244,114,182,0.5); }
          75%  { box-shadow: 0 0 35px rgba(52,211,153,0.3);   border-color: rgba(52,211,153,0.5);  }
          100% { box-shadow: 0 0 30px rgba(96,165,250,0.3);   border-color: rgba(96,165,250,0.5);  }
        }
        @keyframes shimmer {
          0%   { left: -60%; }
          100% { left: 160%; }
        }
        @keyframes goldShine {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
