'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/auth'

/* ── Theme Toggle ── */
function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('toldrive_theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('toldrive_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
      style={{
        position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
        width: '42px', height: '42px', borderRadius: '12px',
        background: 'var(--input-bg)',
        border: '1px solid rgba(var(--gold-rgb),0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '1.1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.1)'
        e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.55)'
        e.currentTarget.style.transform = 'scale(1.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--input-bg)'
        e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.3)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

/* ── Botanical leaf SVG decorations ── */
function LeavesLeft() {
  return (
    <svg width="220" height="260" viewBox="0 0 220 260" fill="none" style={{ display: 'block' }}>
      <path className="leaf-main"   d="M0 260 Q25 210 90 155 Q65 195 45 260 Z" opacity="0.45"/>
      <path className="leaf-dark"   d="M-15 240 Q15 175 85 105 Q60 155 35 240 Z" opacity="0.5"/>
      <path className="leaf-main"   d="M10 260 Q50 215 130 170 Q100 200 70 260 Z" opacity="0.3"/>
      <path className="leaf-darker" d="M-10 260 Q5 195 35 120 Q25 175 10 260 Z" opacity="0.55"/>
      <path className="leaf-main"   d="M25 260 Q55 225 110 195 Q85 220 60 260 Z" opacity="0.25"/>
      <path className="leaf-light"  d="M-5 220 Q20 170 75 120 Q55 160 30 220 Z" opacity="0.35"/>
    </svg>
  )
}

function LeavesRight() {
  return (
    <svg width="220" height="260" viewBox="0 0 220 260" fill="none" style={{ display: 'block', transform: 'scaleX(-1)' }}>
      <path className="leaf-main"   d="M0 260 Q25 210 90 155 Q65 195 45 260 Z" opacity="0.45"/>
      <path className="leaf-dark"   d="M-15 240 Q15 175 85 105 Q60 155 35 240 Z" opacity="0.5"/>
      <path className="leaf-main"   d="M10 260 Q50 215 130 170 Q100 200 70 260 Z" opacity="0.3"/>
      <path className="leaf-darker" d="M-10 260 Q5 195 35 120 Q25 175 10 260 Z" opacity="0.55"/>
      <path className="leaf-main"   d="M25 260 Q55 225 110 195 Q85 220 60 260 Z" opacity="0.25"/>
      <path className="leaf-light"  d="M-5 220 Q20 170 75 120 Q55 160 30 220 Z" opacity="0.35"/>
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
      const loginPromise = loginUser(form.email.trim(), form.password)
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 12000)
      )
      const data = await Promise.race([loginPromise, timeout])

      if (!data.session) {
        setError('Anmeldung fehlgeschlagen – bitte versuche es erneut oder kontaktiere den Admin.')
        return
      }

      const isAdmin = data.session.user.email === 'spieletolga@gmail.com'
      if (isAdmin || data.session.user.app_metadata?.approved === true) {
        router.replace('/dashboard')
      } else {
        router.replace('/warten')
      }
    } catch (err: unknown) {
      let msg = 'Anmeldung fehlgeschlagen.'
      if (err instanceof Error) {
        msg = err.message
      } else if (err && typeof err === 'object' && 'message' in err) {
        msg = String((err as { message: unknown }).message)
      }

      if (msg === 'timeout') {
        // Supabase-Projekt pausiert oder nicht erreichbar?
        setError('Server nicht erreichbar – möglicherweise ist das Supabase-Projekt pausiert. Bitte auf supabase.com prüfen und „Restore" klicken, oder Seite neu laden.')
      } else if (msg.includes('Invalid login') || msg.includes('invalid_credentials') || msg.includes('Invalid email') || msg.includes('invalid') || msg.includes('credentials')) {
        setError('E-Mail oder Passwort falsch.')
      } else if (msg.includes('Email not confirmed')) {
        setError('E-Mail-Adresse noch nicht bestätigt. Bitte prüfe dein Postfach.')
      } else if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('429')) {
        setError('Zu viele Versuche – bitte 5 Minuten warten und dann erneut versuchen.')
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setError('Netzwerkfehler – prüfe deine Internetverbindung.')
      } else {
        setError(`Fehler: ${msg}`)
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
      padding: '3rem 1.25rem 0',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      <ThemeToggle />

      {/* Background spotlight — teal on light, rose gold on dark */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'var(--spotlight)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Botanical leaves – bottom left */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
        <LeavesLeft />
      </div>

      {/* Botanical leaves – bottom right */}
      <div style={{ position: 'fixed', bottom: 0, right: 0, pointerEvents: 'none', zIndex: 0 }}>
        <LeavesRight />
      </div>

      {/* Page content */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: '4rem',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', animation: 'fadeUp 0.5s ease both' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.jpeg"
            alt="Tolga"
            style={{
              width: '90px', height: '90px',
              objectFit: 'cover', borderRadius: '50%',
              border: '2px solid rgba(var(--gold-rgb),0.6)',
              boxShadow: '0 0 0 7px rgba(var(--gold-rgb),0.06), 0 0 60px rgba(var(--gold-rgb),0.25)',
              display: 'block', margin: '0 auto 1.1rem',
            }}
          />
          <h2 style={{
            margin: '0 0 0.3rem',
            fontSize: '1.55rem', fontWeight: 900,
            letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>
            <span style={{ color: 'var(--text-h)' }}>Tol</span><span style={{
              background: 'linear-gradient(180deg, var(--gold-light) 0%, var(--gold) 60%, var(--gold-dark) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Drive</span>
          </h2>
          <span style={{
            fontSize: '0.53rem', fontWeight: 700,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(var(--gold-rgb),0.5)',
          }}>
            Dein Weg zum Führerschein
          </span>
        </div>

        {/* Welcome heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeUp 0.5s ease 0.07s both' }}>
          <h1 style={{
            margin: '0 0 0.5rem',
            fontSize: 'clamp(1.55rem, 6.5vw, 1.95rem)',
            fontWeight: 900, color: 'var(--text-h)',
            letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Willkommen bei TolDrive
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Lerne einfach für deine Theorieprüfung.
          </p>
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '20px',
          padding: '1.6rem 1.5rem',
          boxShadow: 'var(--card-shadow)',
          animation: 'fadeUp 0.5s ease 0.13s both',
        }}>

          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.4rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(var(--gold-rgb),0.09)', border: '1px solid rgba(var(--gold-rgb),0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeOpacity={0.7} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-h)' }}>Anmelden</p>
              <p style={{ margin: 0, fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: '1px' }}>Gib deine Zugangsdaten ein, um fortzufahren.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* E-Mail */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.59rem', fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '0.48rem', opacity: 0.9,
              }}>E-Mail</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                  display: 'flex', pointerEvents: 'none',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeOpacity={0.4} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '12px', color: 'var(--input-color)',
                    fontSize: '0.9rem', fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--gold-rgb),0.08)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--input-border)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Passwort */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.59rem', fontWeight: 800,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '0.48rem', opacity: 0.9,
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
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '12px', color: 'var(--input-color)',
                    fontSize: '0.9rem', fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--gold-rgb),0.08)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--input-border)'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '4px', opacity: 0.6,
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
                  ? 'rgba(var(--gold-rgb),0.4)'
                  : 'linear-gradient(135deg, var(--gold-dark) 0%, var(--gold-light) 40%, var(--gold) 70%, var(--gold-dark) 100%)',
                color: '#fff',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 30px rgba(var(--gold-rgb),0.4)',
                marginTop: '0.2rem',
                letterSpacing: '0.01em',
                transition: 'box-shadow 0.2s, transform 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  Anmelden…
                </>
              ) : '→ Anmelden'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--divider-color)' }} />
            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', letterSpacing: '0.05em', opacity: 0.6 }}>oder</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--divider-color)' }} />
          </div>

          {/* Demo */}
          <Link href="/demo" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '0.85rem 1rem', boxSizing: 'border-box',
            borderRadius: '14px',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.06)'; e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.borderColor = 'var(--input-border)' }}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(var(--gold-rgb),0.08)', border: '1px solid rgba(var(--gold-rgb),0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold)', fontSize: '1.1rem',
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-h)' }}>Kostenlos testen</p>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '1px' }}>1 Stunde voller Zugriff</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeOpacity={0.5} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <p style={{ marginTop: '1.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', animation: 'fadeUp 0.5s ease 0.22s both', opacity: 0.8 }}>
          Noch kein Konto?{' '}
          <Link href="/register" style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>
            Jetzt kostenlos registrieren
          </Link>
          {' '}›
        </p>

        {/* Instructor bio */}
        <div style={{
          width: '100%', marginTop: '2.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(var(--gold-rgb),0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          animation: 'fadeUp 0.5s ease 0.3s both',
        }}>
          <span style={{ fontSize: '0.53rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(var(--gold-rgb),0.5)' }}>
            Dein Fahrlehrer
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.jpeg"
            alt="Tolga"
            style={{
              width: '96px', height: '96px',
              borderRadius: '50%', objectFit: 'cover',
              border: '2.5px solid rgba(var(--gold-rgb),0.4)',
              boxShadow: '0 0 0 5px rgba(var(--gold-rgb),0.05), 0 8px 32px rgba(0,0,0,0.35)',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '1rem', color: 'var(--text-h)' }}>Tolga</p>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>28 Jahre · 6 Jahre Fahrlehrer</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'center', maxWidth: '370px' }}>
            {[
              'Hey, ich bin Tolga, 28 Jahre alt und seit über 6 Jahren leidenschaftlicher Fahrlehrer.',
              'Mit dieser Seite möchte ich Menschen wie dir helfen, motivieren und auf dem Weg zum Führerschein unterstützen.',
              'Ich weiß aus eigener Erfahrung, dass die Theorie manchmal anstrengend wirken kann – genau deshalb habe ich diese Plattform erstellt.',
              'Egal ob Tipps oder Theoriefragen – hier findest du alles, was dir hilft. 🚗',
            ].map((text, i) => (
              <p key={i} style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.7, opacity: 0.85 }}>{text}</p>
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
                background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                textDecoration: 'none', fontSize: '0.73rem', fontWeight: 600,
                color: 'var(--text-muted)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.07)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--input-border)' }}
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
        input::placeholder { color: var(--text-dim) !important; }
      `}</style>
    </div>
  )
}
