'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/auth'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password.trim()) {
      setError('Bitte alle Felder ausfüllen.')
      return
    }
    setLoading(true)
    try {
      const data = await loginUser(form.email.trim(), form.password)
      if (data.session?.user.app_metadata?.approved === true) {
        router.replace('/dashboard')
      } else {
        router.replace('/warten')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.'
      if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) {
        setError('E-Mail oder Passwort falsch.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080808',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Background atmosphere ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 90% 55% at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 65%),
          radial-gradient(ellipse 60% 45% at 0% 100%, rgba(239,68,68,0.05) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 100% 60%, rgba(201,162,39,0.05) 0%, transparent 55%)
        `,
      }} />

      {/* ── Subtle grid overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
        backgroundImage: 'linear-gradient(rgba(201,162,39,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* ── Logo + App name ── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', zIndex: 1, animation: 'fadeUp 0.6s ease both' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Toldrive.jpeg"
          alt="TolDrive"
          style={{
            width: '64px', height: '64px',
            objectFit: 'cover', borderRadius: '16px',
            border: '1.5px solid rgba(201,162,39,0.35)',
            boxShadow: '0 0 28px rgba(201,162,39,0.2), 0 0 60px rgba(201,162,39,0.08)',
            marginBottom: '0.85rem',
            display: 'block', margin: '0 auto 0.85rem',
            filter: 'brightness(1.05) contrast(1.1)',
          }}
        />
        <h1 style={{
          margin: '0 0 0.35rem',
          fontSize: '1.5rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          TolDrive
        </h1>
        <span style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
        }}>
          Führerschein Klasse B · 2026
        </span>
      </div>

      {/* ── Login card ── */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(14,12,8,0.97)',
        border: '1px solid rgba(201,162,39,0.18)',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.75), 0 0 40px rgba(201,162,39,0.05)',
        backdropFilter: 'blur(24px)',
        zIndex: 1,
        animation: 'fadeUp 0.6s ease 0.1s both',
      }}>

        <h2 style={{
          margin: '0 0 0.35rem',
          fontSize: '1.35rem',
          fontWeight: 900,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
        }}>
          Anmelden
        </h2>
        <p style={{ margin: '0 0 1.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Gib deine Zugangsdaten ein, um fortzufahren.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* E-Mail */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-dim)', marginBottom: '0.5rem',
            }}>
              E-Mail
            </label>
            <input
              type="email"
              placeholder="z.B. name@email.de"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              autoFocus
              style={{
                width: '100%', padding: '0.8rem 1rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '10px', color: 'var(--text)',
                fontSize: '0.88rem', fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,162,39,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Passwort */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.62rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-dim)', marginBottom: '0.5rem',
            }}>
              Passwort
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '0.8rem 2.75rem 0.8rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '10px', color: 'var(--text)',
                  fontSize: '0.88rem', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,162,39,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-dim)', fontSize: '1rem', padding: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)' }}
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              fontSize: '0.78rem', color: '#f87171',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: '8px', padding: '0.65rem 0.9rem',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.9rem',
              borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700,
              background: loading
                ? 'rgba(201,162,39,0.4)'
                : 'linear-gradient(135deg, var(--gold-dark) 0%, var(--gold) 50%, var(--gold-dark) 100%)',
              backgroundSize: '200% auto',
              color: '#0a0800',
              border: '1px solid var(--gold)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(201,162,39,0.25)',
              marginTop: '0.25rem',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.backgroundPosition = 'right center'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(201,162,39,0.4)' } }}
            onMouseLeave={e => { e.currentTarget.style.backgroundPosition = 'left center'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,162,39,0.25)' }}
          >
            {loading ? (
              <>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #0a0800', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Anmelden…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Anmelden
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>oder</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Demo button */}
        <Link href="/demo" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          width: '100%', padding: '0.8rem', boxSizing: 'border-box',
          borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-muted)',
          border: '1px solid rgba(255,255,255,0.08)',
          textDecoration: 'none',
          transition: 'all 0.15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          ⚡ Demo starten (1 Stunde)
        </Link>
      </div>

      {/* ── Below card ── */}
      <p style={{
        marginTop: '1.5rem', fontSize: '0.78rem',
        color: 'var(--text-dim)', zIndex: 1,
        animation: 'fadeUp 0.6s ease 0.2s both',
      }}>
        Noch keinen Zugang?{' '}
        <Link href="/register" style={{
          color: 'var(--gold)', fontWeight: 700, textDecoration: 'none',
          borderBottom: '1px solid rgba(201,162,39,0.3)',
          paddingBottom: '1px', transition: 'border-color 0.15s',
        }}>
          Registrieren
        </Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
