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
      background: '#09070400',
      backgroundColor: '#09070a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.25rem 4rem',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* Background: deep dark with warm glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(180,120,20,0.22) 0%, rgba(120,80,10,0.08) 45%, transparent 70%), #09070a',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '430px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', animation: 'fadeUp 0.6s ease both' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Toldrive.jpeg"
            alt="TolDrive"
            style={{
              width: '88px', height: '88px',
              objectFit: 'cover', borderRadius: '50%',
              border: '2px solid rgba(201,162,39,0.5)',
              boxShadow: '0 0 0 6px rgba(201,162,39,0.07), 0 0 50px rgba(201,162,39,0.22)',
              display: 'block', margin: '0 auto 1rem',
            }}
          />
          <h2 style={{
            margin: '0 0 0.3rem',
            fontSize: '1.45rem', fontWeight: 900,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            TolDrive
          </h2>
          <span style={{
            fontSize: '0.54rem', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}>
            Dein Weg zum Führerschein
          </span>
        </div>

        {/* ── Welcome heading ── */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', animation: 'fadeUp 0.6s ease 0.08s both' }}>
          <h1 style={{
            margin: '0 0 0.45rem',
            fontSize: 'clamp(1.5rem, 6vw, 1.9rem)',
            fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.025em',
          }}>
            Willkommen bei TolDrive
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Lerne einfach für deine Theorieprüfung.
          </p>
        </div>

        {/* ── Card ── */}
        <div style={{
          width: '100%',
          background: 'rgba(16,12,6,0.95)',
          border: '1px solid rgba(201,162,39,0.13)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          animation: 'fadeUp 0.6s ease 0.15s both',
        }}>

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(201,162,39,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.97rem', fontWeight: 800, color: 'var(--text)' }}>Anmelden</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '1px' }}>Gib deine Zugangsdaten ein, um fortzufahren.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.05rem' }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.6rem', fontWeight: 800,
                letterSpacing: '0.13em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '0.5rem', opacity: 0.9,
              }}>
                E-Mail
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(201,162,39,0.35)', display: 'flex',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="z.B. name@email.de"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  autoFocus
                  style={{
                    width: '100%', padding: '0.82rem 1rem 0.82rem 2.6rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: 'var(--text)',
                    fontSize: '0.9rem', fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.6rem', fontWeight: 800,
                letterSpacing: '0.13em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '0.5rem', opacity: 0.9,
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
                    width: '100%', padding: '0.82rem 2.75rem 0.82rem 1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: 'var(--text)',
                    fontSize: '0.9rem', fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-dim)', padding: '4px',
                    display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                borderRadius: '10px', padding: '0.65rem 0.9rem',
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
                width: '100%', padding: '1rem',
                borderRadius: '100px', fontSize: '0.92rem', fontWeight: 700,
                background: loading
                  ? 'rgba(201,162,39,0.5)'
                  : 'linear-gradient(135deg, #b8891c 0%, #e8c547 50%, #b8891c 100%)',
                color: '#0a0800',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 6px 28px rgba(201,162,39,0.35)',
                marginTop: '0.15rem',
                transition: 'opacity 0.15s, box-shadow 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #0a0800', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  Anmelden…
                </>
              ) : (
                <>→ Anmelden</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>oder</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Demo */}
          <Link href="/demo" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '0.85rem 1rem', boxSizing: 'border-box',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.07)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.05rem',
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Kostenlos testen</p>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)', marginTop: '1px' }}>1 Stunde voller Zugriff</p>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,162,39,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>

        {/* Footer link */}
        <p style={{ marginTop: '1.75rem', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', animation: 'fadeUp 0.6s ease 0.25s both' }}>
          Noch kein Konto?{' '}
          <Link href="/register" style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>
            Jetzt kostenlos registrieren
          </Link>
          {' '}›
        </p>

        {/* ── Instructor bio (scrollable below on mobile) ── */}
        <div style={{
          width: '100%', marginTop: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(201,162,39,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          animation: 'fadeUp 0.6s ease 0.35s both',
        }}>
          <span style={{
            fontSize: '0.54rem', fontWeight: 800, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.7,
          }}>
            Dein Fahrlehrer
          </span>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.jpeg"
            alt="Tolga"
            style={{
              width: '100px', height: '100px',
              borderRadius: '50%', objectFit: 'cover',
              border: '2.5px solid rgba(201,162,39,0.45)',
              boxShadow: '0 0 0 5px rgba(201,162,39,0.06), 0 8px 32px rgba(0,0,0,0.6)',
            }}
          />

          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>Tolga</p>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>28 Jahre · 6 Jahre Fahrlehrer</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'center', maxWidth: '380px' }}>
            {[
              'Hey, ich bin Tolga, 28 Jahre alt und seit über 6 Jahren leidenschaftlicher Fahrlehrer.',
              'Mit dieser Seite möchte ich Menschen wie dir helfen, motivieren und auf dem Weg zum Führerschein unterstützen.',
              'Ich weiß aus eigener Erfahrung, dass die Theorie manchmal anstrengend wirken kann – genau deshalb habe ich diese Plattform erstellt.',
              'Egal ob Tipps oder Theoriefragen – hier findest du alles, was dir hilft. 🚗',
            ].map((text, i) => (
              <p key={i} style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{text}</p>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '320px' }}>
            <a
              href="https://www.instagram.com/tolga_ar/"
              target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                padding: '0.55rem 0.8rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.08)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              📷 @tolga_ar
            </a>
            <a
              href="https://www.tiktok.com/@fahrlehrertolga"
              target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                padding: '0.55rem 0.8rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.08)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              🎵 @fahrlehrertolga
            </a>
          </div>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
