'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/auth'
import CarSlideshow from './CarSlideshow'

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
      const isAdmin = data.session?.user.email === 'spieletolga@gmail.com'
      if (isAdmin || data.session?.user.app_metadata?.approved === true) {
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

      <CarSlideshow />

      {/* Gold grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.018, zIndex: 1,
        backgroundImage: 'linear-gradient(rgba(201,162,39,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.6) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Main layout: login + instructor */}
      <div className="login-layout" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3.5rem',
        zIndex: 2,
        width: '100%',
        maxWidth: '860px',
        position: 'relative',
      }}>

        {/* Left: Logo + card + footer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Logo + App name */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeUp 0.6s ease both' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Toldrive.jpeg"
              alt="TolDrive"
              style={{
                width: '64px', height: '64px',
                objectFit: 'cover', borderRadius: '16px',
                border: '1.5px solid rgba(201,162,39,0.35)',
                boxShadow: '0 0 28px rgba(201,162,39,0.2), 0 0 60px rgba(201,162,39,0.08)',
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

          {/* Login card */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'rgba(14,12,8,0.97)',
            border: '1px solid rgba(201,162,39,0.18)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.75), 0 0 40px rgba(201,162,39,0.05)',
            backdropFilter: 'blur(24px)',
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

              {/* Submit */}
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
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              ⚡ Demo starten (1 Stunde)
            </Link>
          </div>

          {/* Below card */}
          <p style={{
            marginTop: '1.5rem', fontSize: '0.78rem',
            color: 'var(--text-dim)',
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

        </div>{/* end left column */}

        {/* Right: Instructor panel */}
        <div className="login-instructor" style={{
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.1rem',
          minWidth: '200px',
          animation: 'fadeUp 0.6s ease 0.25s both',
        }}>
          <span style={{
            fontSize: '0.55rem', fontWeight: 800,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--gold)', opacity: 0.8,
            marginBottom: '0.25rem',
          }}>
            Dein Fahrlehrer
          </span>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.jpeg"
            alt="Tolga"
            style={{
              width: '110px', height: '110px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid rgba(201,162,39,0.45)',
              boxShadow: '0 0 0 5px rgba(201,162,39,0.07), 0 8px 32px rgba(0,0,0,0.6)',
            }}
          />

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.25rem', fontWeight: 800, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Tolga
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              28 Jahre · 6 Jahre Fahrlehrer
            </p>
          </div>

          <p style={{
            margin: 0, fontSize: '0.73rem', color: 'var(--text-muted)',
            textAlign: 'center', lineHeight: 1.65,
          }}>
            Leidenschaftlicher Fahrlehrer aus München. Ich begleite dich sicher durch deine Fahrausbildung.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <a
              href="https://www.instagram.com/tolga_ar/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.5rem 0.8rem',
                borderRadius: '9px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none',
                fontSize: '0.74rem', fontWeight: 600,
                color: 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.25)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <span>📷</span> @tolga_ar
            </a>
            <a
              href="https://www.tiktok.com/@fahrlehrertolga"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.5rem 0.8rem',
                borderRadius: '9px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none',
                fontSize: '0.74rem', fontWeight: 600,
                color: 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.25)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <span>🎵</span> @fahrlehrertolga
            </a>
          </div>
        </div>{/* end instructor panel */}

      </div>{/* end login-layout */}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
