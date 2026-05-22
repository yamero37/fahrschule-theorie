'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function WaitingApproval() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')

  async function checkApproval() {
    setChecking(true)
    setMessage('')
    const { data } = await supabase.auth.refreshSession()
    if (data.session?.user.app_metadata?.approved === true) {
      router.replace('/dashboard')
    } else {
      setMessage('Noch nicht freigeschaltet. Bitte warte auf die Bestätigung.')
    }
    setChecking(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080808', padding: '2rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--surface)',
        border: '1px solid rgba(201,162,39,0.25)',
        borderRadius: '1.25rem',
        padding: '2.5rem 2rem',
        boxShadow: '0 0 60px rgba(201,162,39,0.07)',
        textAlign: 'center',
      }}>

        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>

        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.75rem' }}>
          Konto erstellt
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Dein Konto wurde erfolgreich registriert.<br />
          Warte auf die <strong style={{ color: 'var(--text)' }}>Freischaltung durch den Admin</strong>.<br />
          Du wirst per E-Mail benachrichtigt sobald du Zugang erhältst.
        </p>

        <button
          onClick={checkApproval}
          disabled={checking}
          className="btn-gold"
          style={{ width: '100%', textAlign: 'center', cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.7 : 1, border: 'none' }}
        >
          {checking ? 'Wird geprüft…' : 'Freischaltung prüfen'}
        </button>

        {message && (
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <Link href="/" style={{ color: 'var(--gold)' }}>Zurück zur Startseite</Link>
        </p>
      </div>
    </div>
  )
}
