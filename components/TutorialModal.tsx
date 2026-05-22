'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const RANKS_PREVIEW = [
  { id: 'D', name: 'Anfänger',        color: '#6b7280', pts: '0–99'       },
  { id: 'C', name: 'Amateur',         color: '#3b82f6', pts: '100–299'    },
  { id: 'B', name: 'Fortgeschritten', color: '#8b5cf6', pts: '300–599'    },
  { id: 'A', name: 'Profi',           color: '#c9a227', pts: '600–999'    },
  { id: 'S', name: 'Experte',         color: '#f97316', pts: '1.000–1.499'},
  { id: 'SS',name: 'Meister',         color: '#ef4444', pts: '1.500–1.999'},
  { id: 'Legende', name: 'Legende',   color: '#ffd700', pts: '2.000+'     },
]

const FEATURES = [
  { icon: '🎬', title: 'Lernvideos',           desc: 'Erklärvideos zu allen Themen.',         soon: true  },
  { icon: '📚', title: 'Theoriefragen',         desc: 'Alle Prüfungsfragen nach Thema.',       soon: false },
  { icon: '⚡', title: 'Quiz',                  desc: 'Teste dich im Prüfungs-Modus.',         soon: false },
  { icon: '⚔️', title: 'Battle gegen Freunde', desc: 'Fordere Freunde heraus.',               soon: true  },
]

const STEPS = [
  {
    title: 'Willkommen bei TolDrive! 🚗',
    content: (username: string) => (
      <div style={{ textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Toldrive.jpeg" alt="TolDrive" style={{
          width: '80px', height: '80px', borderRadius: '12px',
          border: '1px solid rgba(201,162,39,0.4)',
          boxShadow: '0 0 20px rgba(201,162,39,0.25)',
          margin: '0 auto 1.25rem', display: 'block',
        }} />
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          Hey <strong style={{ color: 'var(--gold)' }}>{username}</strong>, schön dass du dabei bist!
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          TolDrive hilft dir, die Theorieprüfung beim <strong style={{ color: 'var(--text)' }}>ersten Versuch</strong> zu bestehen.
          Dieses kurze Tutorial zeigt dir wie alles funktioniert.
        </p>
      </div>
    ),
  },
  {
    title: 'Das Rangsystem 🏆',
    content: () => (
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textAlign: 'center', lineHeight: 1.6 }}>
          Je mehr du lernst und richtig beantwortest, desto mehr Punkte sammelst du und steigst im Rang auf.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {RANKS_PREVIEW.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: `${r.color}08`, border: `1px solid ${r.color}25`,
              borderRadius: '8px', padding: '8px 12px',
            }}>
              <span style={{
                width: '32px', height: '28px', borderRadius: '10px',
                border: `2px solid ${r.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 900, color: r.color,
                flexShrink: 0,
              }}>{r.id}</span>
              <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{r.name}</span>
              <span style={{ fontSize: '0.7rem', color: r.color, fontWeight: 600 }}>{r.pts} Pkt.</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Deine Features 📋',
    content: () => (
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textAlign: 'center', lineHeight: 1.6 }}>
          Auf dem Dashboard findest du vier Bereiche:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'var(--surface-2)',
              border: '1px solid rgba(201,162,39,0.12)',
              borderRadius: '10px', padding: '14px',
              position: 'relative', overflow: 'hidden',
            }}>
              {f.soon && (
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  fontSize: '0.5rem', fontWeight: 700, color: 'var(--gold)',
                  background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)',
                  borderRadius: '20px', padding: '1px 6px',
                }}>Bald</span>
              )}
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{f.icon}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '3px' }}>{f.title}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Du bist bereit! 🎉',
    content: () => (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Tutorial abgeschlossen!<br />
          Dafür bekommst du jetzt:
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'rgba(201,162,39,0.08)',
          border: '1px solid rgba(201,162,39,0.35)',
          borderRadius: '12px', padding: '14px 28px',
          marginBottom: '1.5rem',
          boxShadow: '0 0 24px rgba(201,162,39,0.15)',
        }}>
          <span style={{ fontSize: '1.8rem' }}>⭐</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold)' }}>+100 Punkte</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Du startest jetzt als <strong style={{ color: '#3b82f6' }}>Rang C – Amateur</strong>.
          Lerne weiter um höher aufzusteigen!
        </p>
      </div>
    ),
  },
]

interface Props {
  username: string
  userId: string
  onComplete: (newPoints: number) => void
}

export default function TutorialModal({ username, userId, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [completing, setCompleting] = useState(false)

  const isLast = step === STEPS.length - 1

  async function handleComplete() {
    setCompleting(true)
    await supabase.from('user_stats').upsert({
      user_id: userId,
      points: 100,
      tutorial_done: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    onComplete(100)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(8,8,8,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'var(--surface)',
        border: '1px solid rgba(201,162,39,0.25)',
        borderRadius: '1.25rem',
        padding: '2rem',
        boxShadow: '0 0 60px rgba(201,162,39,0.1), 0 24px 64px rgba(0,0,0,0.7)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.75rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '20px' : '6px',
              height: '6px', borderRadius: '3px',
              background: i === step ? 'var(--gold)' : i < step ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Step counter */}
        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Schritt {step + 1} von {STEPS.length}
        </p>

        {/* Title */}
        <h2 style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
          {STEPS[step].title}
        </h2>

        {/* Content */}
        <div style={{ marginBottom: '2rem' }}>
          {STEPS[step].content(username)}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '0.65rem',
                background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              ← Zurück
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="btn-gold"
              style={{ flex: 1, textAlign: 'center', cursor: 'pointer', border: 'none', padding: '0.75rem' }}
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="btn-gold"
              style={{ flex: 1, textAlign: 'center', cursor: completing ? 'not-allowed' : 'pointer', border: 'none', padding: '0.75rem', opacity: completing ? 0.7 : 1 }}
            >
              {completing ? 'Wird gespeichert…' : '🎉 Los geht\'s!'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
