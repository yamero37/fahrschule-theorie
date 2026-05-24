'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'

export default function EinstellungenPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/'); return }
      setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || '')
      setEmail(session.user.email || '')
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(201,144,122,0.15)', borderTop: '3px solid var(--gold)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>Einstellungen</h1>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>Dein Konto verwalten</p>
          </div>
        </div>

        {/* Profile section */}
        <Section title="Profil" icon="👤">
          <SettingRow
            label="Benutzername"
            value={username}
            desc="Dein angezeigter Name in der App"
          />
          <SettingRow
            label="E-Mail"
            value={email}
            desc="Deine Anmeldedaten"
          />
        </Section>

        {/* App section */}
        <Section title="App" icon="📱">
          <LinkRow
            label="Layout ändern"
            desc="Dashboard-Ansicht anpassen"
            href="/einstellungen/layout"
            accent
          />
          <SettingRow label="Benachrichtigungen" desc="Push-Nachrichten & Erinnerungen" value="Bald verfügbar" muted />
          <SettingRow label="Sprache" desc="App-Sprache" value="Deutsch" muted />
          <SettingRow label="Design" desc="Helles / Dunkles Design" value="Dunkel" muted />
        </Section>

        {/* Lern-Einstellungen */}
        <Section title="Lernen" icon="📚">
          <SettingRow label="Tägliches Ziel" desc="Lektionen pro Tag" value="5" muted />
          <SettingRow label="Schwierigkeitsgrad" desc="Quiz & Übungen" value="Standard" muted />
          <SettingRow label="Lernstreak" desc="Streak-Erinnerung" value="Bald verfügbar" muted />
        </Section>

        {/* Konto */}
        <Section title="Konto" icon="🔐">
          <SettingRow label="Passwort ändern" desc="Neues Passwort setzen" value="→" muted />
          <SettingRow label="Daten exportieren" desc="Deine Lernstatistiken herunterladen" value="Bald verfügbar" muted />
        </Section>

        {/* Abmelden */}
        <div style={{ marginTop: '0.5rem' }}>
          <button
            onClick={async () => { await signOut(); window.location.href = '/' }}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '1rem',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.13)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)' }}
          >
            Abmelden
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '1.5rem', opacity: 0.5 }}>
          TolDrive · Version 1.0
        </p>

      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem' }}>{icon}</span>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{title}</span>
      </div>
      <div style={{
        background: 'var(--surface)', borderRadius: '1.1rem',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, desc, value, muted }: { label: string; desc: string; value: string; muted?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 1rem', gap: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.63rem', color: 'var(--text-dim)', marginTop: '1px' }}>{desc}</p>
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, color: muted ? 'var(--text-dim)' : 'var(--gold)' }}>
        {value}
      </span>
    </div>
  )
}

function LinkRow({ label, desc, href, accent }: { label: string; desc: string; href: string; accent?: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1rem', gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: accent ? 'var(--gold)' : 'var(--text)' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '0.63rem', color: 'var(--text-dim)', marginTop: '1px' }}>{desc}</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accent ? 'var(--gold)' : 'var(--text-dim)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </Link>
  )
}
