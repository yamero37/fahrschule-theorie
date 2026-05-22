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
        router.replace('/fragen')
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
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080808',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--surface)',
        border: '1px solid rgba(201,162,39,0.25)',
        borderRadius: '1.25rem',
        padding: '2.5rem 2rem',
        boxShadow: '0 0 60px rgba(201,162,39,0.07), 0 20px 60px rgba(0,0,0,0.6)',
      }}>

        {/* Avatar + Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.jpeg" alt="Fahrlehrer" style={{
            width: '72px', height: '72px',
            objectFit: 'cover', objectPosition: 'center top',
            borderRadius: '50%',
            border: '2px solid rgba(201,162,39,0.6)',
            boxShadow: '0 0 16px rgba(201,162,39,0.2)',
            background: '#fff',
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Toldrive.jpeg" alt="TolDrive" style={{
            width: '72px', height: '72px',
            objectFit: 'cover', borderRadius: '10px',
            border: '1px solid rgba(201,162,39,0.3)',
          }} />
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
          Willkommen zurück
        </h1>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Mit deinem Konto anmelden
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div>
            <label className="form-label">E-Mail</label>
            <input className="form-input" type="email" placeholder="email@beispiel.de"
              value={form.email} onChange={set('email')} autoComplete="email" autoFocus />
          </div>

          <div>
            <label className="form-label">Passwort</label>
            <input className="form-input" type="password" placeholder="Dein Passwort"
              value={form.password} onChange={set('password')} autoComplete="current-password" />
          </div>

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#ff6b6b', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-gold"
            disabled={loading}
            style={{ width: '100%', textAlign: 'center', marginTop: '0.25rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Anmelden…' : 'Anmelden →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>oder</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        <Link href="/demo" className="btn-ghost"
          style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
          Demo starten (1 Stunde)
        </Link>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Noch kein Konto?{' '}
          <Link href="/register" style={{ color: 'var(--gold)' }}>Jetzt registrieren</Link>
        </p>
      </div>
    </div>
  )
}
