'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TerminKalender from '@/components/TerminKalender'

export default function TerminPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [notAllowed, setNotAllowed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user.app_metadata?.approved) { router.replace('/'); return }
      const uid = session.user.id
      // Check Fahrstündler-Freigabe
      const { data } = await supabase.from('fahrstundler_approvals').select('user_id').eq('user_id', uid).single()
      if (!data) { setNotAllowed(true); setLoading(false); return }
      setUserId(uid)
      setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Fahrschüler')
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(201,162,39,0.15)', borderTop: '3px solid var(--gold)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (notAllowed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ margin: '0 0 0.75rem', color: 'var(--text)', fontWeight: 900 }}>Kein Zugang</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Du bist noch nicht als Fahrschüler freigeschaltet. Dein Fahrlehrer Tolga wird dich bald freischalten.
        </p>
        <a href="/dashboard" style={{
          display: 'inline-block', padding: '0.75rem 2rem', borderRadius: '10px',
          background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)',
          color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
        }}>
          Zurück zum Dashboard
        </a>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.22)', borderRadius: '100px', padding: '4px 14px', marginBottom: '1rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 6px var(--gold)' }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              Fahrstunde buchen
            </span>
          </div>
          <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Termin wählen
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Wähle einen freien Termin für deine Fahrstunde. Montag bis Samstag, 12:00–22:00 Uhr · Niedersachsen 2026
          </p>
        </div>

        {/* Instructor info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)',
          borderRadius: '12px', padding: '0.85rem 1.1rem', marginBottom: '1.75rem',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.jpeg" alt="Tolga" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(201,162,39,0.4)', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>Fahrlehrer Tolga</p>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>Deine Anfrage wird nach der Buchung von Tolga bestätigt.</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
            Online
          </div>
        </div>

        <TerminKalender userId={userId} username={username} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
