'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

const BASIC_THEMES: { id: Theme; label: string; desc: string; preview: { bg: string; surface: string; card: string; accent: string; text: string; textDim: string } }[] = [
  {
    id: 'light',
    label: 'Helles Design',
    desc: 'Warmes, helles Layout für den Tag',
    preview: { bg: '#edf2f7', surface: '#ffffff', card: '#f7fafc', accent: '#0d9488', text: '#0f172a', textDim: '#94a3b8' },
  },
  {
    id: 'dark',
    label: 'Dunkles Design',
    desc: 'Modernes dunkles Layout — Standard',
    preview: { bg: '#0f0f12', surface: '#17171c', card: '#1d1d24', accent: '#c9907a', text: '#f5e8e0', textDim: '#5a3a30' },
  },
]

export default function LayoutPage() {
  const router = useRouter()
  const [current, setCurrent] = useState<Theme>('light')
  const [saved, setSaved] = useState<Theme>('light')

  useEffect(() => {
    try {
      const t = (localStorage.getItem('toldrive_theme') as Theme) || 'dark'
      setCurrent(t)
      setSaved(t)
    } catch {}
  }, [])

  function applyTheme(theme: Theme) {
    setCurrent(theme)
    try {
      localStorage.setItem('toldrive_theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
      setSaved(theme)
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>Layout ändern</h1>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>Design der App anpassen</p>
          </div>
        </div>

        {/* ── Basic Designs ── */}
        <SectionLabel>Basic Design</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {BASIC_THEMES.map(t => (
            <ThemeCard
              key={t.id}
              theme={t}
              active={current === t.id}
              onSelect={() => applyTheme(t.id)}
            />
          ))}
        </div>

        {/* ── Premium ── */}
        <SectionLabel>Premium</SectionLabel>
        <PremiumCard />

        {/* Applied hint */}
        {saved && (
          <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '1.5rem', opacity: 0.6 }}>
            Aktives Design: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
              {saved === 'light' ? 'Helles Design' : 'Dunkles Design'}
            </span> · Änderungen werden sofort übernommen
          </p>
        )}

      </div>
    </div>
  )
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 0.6rem 0.25rem',
      fontSize: '0.62rem', fontWeight: 800,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--text-dim)',
    }}>{children}</p>
  )
}

/* ── Theme preview card ── */
function ThemeCard({
  theme, active, onSelect,
}: {
  theme: typeof BASIC_THEMES[0]
  active: boolean
  onSelect: () => void
}) {
  const p = theme.preview
  return (
    <button
      onClick={onSelect}
      style={{
        background: 'var(--surface)',
        border: `2px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: '1.1rem', padding: '1rem',
        cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: active ? '0 0 0 3px rgba(var(--gold-rgb),0.15)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Active checkmark */}
      {active && (
        <div style={{
          position: 'absolute', top: '0.6rem', right: '0.6rem',
          width: '20px', height: '20px', borderRadius: '50%',
          background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6rem', color: '#fff', fontWeight: 900,
        }}>✓</div>
      )}

      {/* Mini UI preview */}
      <div style={{
        borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem',
        border: `1px solid ${p.bg === '#edf2f7' ? '#e2d8d0' : '#252530'}`,
      }}>
        {/* Top bar */}
        <div style={{ background: p.surface, padding: '5px 7px', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: `1px solid ${p.bg === '#edf2f7' ? '#e2d8d0' : '#252530'}` }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.accent }} />
          <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: p.textDim, opacity: 0.3 }} />
        </div>
        {/* Body */}
        <div style={{ background: p.bg, padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Hero card */}
          <div style={{ background: p.surface, borderRadius: '5px', padding: '6px 7px' }}>
            <div style={{ width: '55%', height: '4px', borderRadius: '2px', background: p.text, marginBottom: '3px' }} />
            <div style={{ width: '35%', height: '3px', borderRadius: '2px', background: p.accent, marginBottom: '5px' }} />
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ flex: 1, height: '14px', borderRadius: '4px', background: p.accent, opacity: 0.8 }} />
              <div style={{ flex: 1, height: '14px', borderRadius: '4px', background: p.card, border: `1px solid ${p.textDim}30` }} />
            </div>
          </div>
          {/* Stat row */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {[p.accent + '40', p.accent + '30', p.accent + '25', p.accent + '20'].map((c, i) => (
              <div key={i} style={{ flex: 1, height: '16px', borderRadius: '4px', background: p.surface }} />
            ))}
          </div>
          {/* Feature grid */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, height: '22px', borderRadius: '4px', background: p.surface }} />
            ))}
          </div>
        </div>
      </div>

      {/* Label */}
      <p style={{ margin: '0 0 2px', fontSize: '0.78rem', fontWeight: 800, color: active ? 'var(--gold)' : 'var(--text)' }}>
        {theme.label}
      </p>
      <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
        {theme.desc}
      </p>
    </button>
  )
}

/* ── Premium card (locked) ── */
function PremiumCard() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--surface) 0%, rgba(var(--gold-rgb),0.04) 100%)',
      border: '1px solid rgba(var(--gold-rgb),0.15)',
      borderRadius: '1.1rem', padding: '1.1rem 1.1rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      opacity: 0.75,
    }}>
      <div style={{
        width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
        background: 'rgba(var(--gold-rgb),0.08)', border: '1px solid rgba(var(--gold-rgb),0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem',
      }}>💎</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>Premium Layout</p>
          <span style={{
            fontSize: '0.52rem', fontWeight: 800, padding: '2px 7px', borderRadius: '100px',
            background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)',
            color: 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>Premium</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Exklusive Designs &amp; individuelle Anpassungen
        </p>
      </div>
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: 'var(--input-bg)', border: '1px solid var(--input-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
      }}>🔒</div>
    </div>
  )
}
