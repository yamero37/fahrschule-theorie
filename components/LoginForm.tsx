'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/auth'

/* ── Botanical leaf SVG decorations ── */
function LeavesLeft() {
  return (
    <svg width="220" height="260" viewBox="0 0 220 260" fill="none" style={{ display: 'block' }}>
      <path d="M0 260 Q25 210 90 155 Q65 195 45 260 Z" fill="#c9a227" opacity="0.45"/>
      <path d="M-15 240 Q15 175 85 105 Q60 155 35 240 Z" fill="#a37d1a" opacity="0.5"/>
      <path d="M10 260 Q50 215 130 170 Q100 200 70 260 Z" fill="#c9a227" opacity="0.3"/>
      <path d="M-10 260 Q5 195 35 120 Q25 175 10 260 Z" fill="#8b6914" opacity="0.55"/>
      <path d="M25 260 Q55 225 110 195 Q85 220 60 260 Z" fill="#c9a227" opacity="0.25"/>
      <path d="M-5 220 Q20 170 75 120 Q55 160 30 220 Z" fill="#d4a843" opacity="0.35"/>
    </svg>
  )
}

function LeavesRight() {
  return (
    <svg width="220" height="260" viewBox="0 0 220 260" fill="none" style={{ display: 'block', transform: 'scaleX(-1)' }}>
      <path d="M0 260 Q25 210 90 155 Q65 195 45 260 Z" fill="#c9a227" opacity="0.45"/>
      <path d="M-15 240 Q15 175 85 105 Q60 155 35 240 Z" fill="#a37d1a" opacity="0.5"/>
      <path d="M10 260 Q50 215 130 170 Q100 200 70 260 Z" fill="#c9a227" opacity="0.3"/>
      <path d="M-10 260 Q5 195 35 120 Q25 175 10 260 Z" fill="#8b6914" opacity="0.55"/>
      <path d="M25 260 Q55 225 110 195 Q85 220 60 260 Z" fill="#c9a227" opacity="0.25"/>
      <path d="M-5 220 Q20 170 75 120 Q55 160 30 220 Z" fill="#d4a843" opacity="0.35"/>
    </svg>
  )
}

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
      background: '#070503',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.25rem 0',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* ── Background: warm radial spotlight from top ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(190,130,20,0.28) 0%, rgba(140,90,10,0.1) 45%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Botanical leaves – bottom left ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
        <LeavesLeft />
      </div>

      {/* ── Botanical leaves – bottom right ── */}
      <div style={{ position: 'fixed', bottom: 0, right: 0, pointerEvents: 'none', zIndex: 0 }}>
        <LeavesRight />
      </div>

      {/* ── Page content ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: '4rem',
      }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease both' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Toldrive.jpeg"
            alt="TolDrive"
            style={{
              width: '90px', height: '90px',
              objectFit: 'cover', borderRadius: '50%',
              border: '2px solid rgba(201,162,39,0.6)',
              boxShadow: '0 0 0 7px rgba(201,162,39,0.06), 0 0 60px rgba(201,162,39,0.25)',
              display: 'block', margin: '0 auto 1.1rem',
            }}
          />
          <h2 style={{
            margin: '0 0 0.3rem',
            fontSize: '1.55rem', fontWeight: 900,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #e8c960 0%, #c9a227 60%, #8b6914 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            TolDrive
          </h2>
          <span style={{
            fontSize: '0.53rem', fontWeight: 700,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(201,162,39,0.45)',
          }}>
            Dein Weg zum Führerschein
          </span>
        </div>

        {/* ── Welcome heading ── */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeUp 0.5s ease 0.07s both' }}>
          <h1 style={{
            margin: '0 0 0.5rem',
            fontSize: 'clamp(1.55rem, 6.5vw, 1.95rem)',
            fontWeight: 900, color: '#f5ead0',
            letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Willkommen bei TolDrive
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(168,144,96,0.8)', lineHeight: 1.5 }}>
            Lerne einfach für deine Theorieprüfung.
          </p>
        </div>

        {/* ── Card ── */}
        <div style={{
          width: '100%',
          background: 'rgba(18,14,8,0.97)',
          border: '1px solid rgba(201,162,39,0.14)',
          borderRadius: '20px',
          padding: '1.6rem 1.5rem',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)',
          animation: 'fadeUp 0.5s ease 0.13s both',
        }}>

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.4rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(201,162,39,0.09)', border: '1px solid rgba(201,162,39,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="rgba(201,162,39,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f0e0b0' }}>Anmelden</p>
              <p style={{ margin: 0, fontSize: '0.69rem', color: 'rgba(168,144,96,0.7)', marginTop: '1px' }}>Gib deine Zugangsdaten ein, um fortzufahren.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* E-Mail */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.59rem', fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#c9a227', marginBottom: '0.48rem', opacity: 0.85,
              }}>E-Mail</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(201,162,39,0.3)', display: 'flex', pointerEvents: 'none',
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
                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.55rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: '#f0e0b0',
                    fontSize: '0.9rem', fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.45)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            {/* Passwort */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.59rem', fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#c9a227', marginBottom: '0.48rem', opacity: 0.85,
              }}>Passwort</label>
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
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: '#f0e0b0',
                    fontSize: '0.9rem', fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.45)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(168,144,96,0.5)', padding: '4px',
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
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px', padding: '0.65rem 0.9rem',
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
                width: '100%', padding: '1rem',
                borderRadius: '100px', fontSize: '0.95rem', fontWeight: 700,
                background: loading
                  ? 'rgba(201,162,39,0.4)'
                  : 'linear-gradient(135deg, #b8881b 0%, #e6c040 40%, #d4a828 70%, #b8881b 100%)',
                color: '#1a0f00',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 30px rgba(201,162,39,0.4)',
                marginTop: '0.2rem',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #1a0f00', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  Anmelden…
                </>
              ) : '→ Anmelden'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: '0.67rem', color: 'rgba(168,144,96,0.45)', letterSpacing: '0.05em' }}>oder</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>

          {/* Demo */}
          <Link href="/demo" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '0.85rem 1rem', boxSizing: 'border-box',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.06)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.13)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(201,162,39,0.6)', fontSize: '1.1rem',
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.83rem', fontWeight: 700, color: '#d4c090' }}>Kostenlos testen</p>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'rgba(168,144,96,0.6)', marginTop: '1px' }}>1 Stunde voller Zugriff</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,162,39,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <p style={{ marginTop: '1.6rem', fontSize: '0.8rem', color: 'rgba(168,144,96,0.55)', textAlign: 'center', animation: 'fadeUp 0.5s ease 0.22s both' }}>
          Noch kein Konto?{' '}
          <Link href="/register" style={{ color: '#c9a227', fontWeight: 700, textDecoration: 'none' }}>
            Jetzt kostenlos registrieren
          </Link>
          {' '}›
        </p>

        {/* ── Instructor bio ── */}
        <div style={{
          width: '100%', marginTop: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(201,162,39,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          animation: 'fadeUp 0.5s ease 0.3s both',
        }}>
          <span style={{ fontSize: '0.53rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,162,39,0.5)' }}>
            Dein Fahrlehrer
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.jpeg"
            alt="Tolga"
            style={{
              width: '96px', height: '96px',
              borderRadius: '50%', objectFit: 'cover',
              border: '2.5px solid rgba(201,162,39,0.4)',
              boxShadow: '0 0 0 5px rgba(201,162,39,0.05), 0 8px 32px rgba(0,0,0,0.6)',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '1rem', color: '#f0e0b0' }}>Tolga</p>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'rgba(168,144,96,0.6)', lineHeight: 1.5 }}>28 Jahre · 6 Jahre Fahrlehrer</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'center', maxWidth: '370px' }}>
            {[
              'Hey, ich bin Tolga, 28 Jahre alt und seit über 6 Jahren leidenschaftlicher Fahrlehrer.',
              'Mit dieser Seite möchte ich Menschen wie dir helfen, motivieren und auf dem Weg zum Führerschein unterstützen.',
              'Ich weiß aus eigener Erfahrung, dass die Theorie manchmal anstrengend wirken kann – genau deshalb habe ich diese Plattform erstellt.',
              'Egal ob Tipps oder Theoriefragen – hier findest du alles, was dir hilft. 🚗',
            ].map((text, i) => (
              <p key={i} style={{ margin: 0, fontSize: '0.73rem', color: 'rgba(168,144,96,0.75)', lineHeight: 1.7 }}>{text}</p>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '320px' }}>
            {[
              { href: 'https://www.instagram.com/tolga_ar/', label: '📷 @tolga_ar' },
              { href: 'https://www.tiktok.com/@fahrlehrertolga', label: '🎵 @fahrlehrertolga' },
            ].map(({ href, label }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', padding: '0.55rem 0.7rem', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                textDecoration: 'none', fontSize: '0.73rem', fontWeight: 600,
                color: 'rgba(168,144,96,0.7)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.07)'; e.currentTarget.style.color = '#c9a227'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(168,144,96,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: rgba(168,144,96,0.35) !important; }
      `}</style>
    </div>
  )
}
