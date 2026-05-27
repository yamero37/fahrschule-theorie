'use client'

import { useState, useEffect } from 'react'

const LS_KEY = 'toldrive_homescreen_shown'

export function markHomeScreenTutorialPending() {
  if (typeof window !== 'undefined') localStorage.setItem('toldrive_homescreen_pending', '1')
}

export function useHomeScreenModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('toldrive_homescreen_pending') === '1') {
        localStorage.removeItem('toldrive_homescreen_pending')
        if (localStorage.getItem(LS_KEY) !== '1') setOpen(true)
      }
    } catch {}
  }, [])

  function openManually() { setOpen(true) }
  function close() {
    try { localStorage.setItem(LS_KEY, '1') } catch {}
    setOpen(false)
  }

  return { open, openManually, close }
}

/* ── Step indicator ── */
function Step({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{n}</div>
      <p style={{ margin: 0, fontSize: '.82rem', color: '#374151', lineHeight: 1.55 }}>{text}</p>
    </div>
  )
}

/* ── Main Modal ── */
export default function HomeScreenModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'ios' | 'android'>('ios')

  useEffect(() => {
    // Auto-detect platform
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase()
      if (ua.includes('android')) setTab('android')
    }
  }, [])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      {/* Sheet */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, background: '#fff', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.5rem 1.5rem 2.5rem', boxShadow: '0 -8px 40px rgba(0,0,0,.15)', animation: 'hsSlideUp .3s ease' }}>
        <style>{`@keyframes hsSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e5e7eb', margin: '0 auto 1.25rem' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/avatar.jpeg" alt="TolDrive" style={{ width: 40, height: 40, borderRadius: 11, objectFit: 'cover', border: '1.5px solid rgba(99,102,241,.25)' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: '.95rem', color: '#1a1a2e' }}>Zum Homescreen hinzufügen</p>
              <p style={{ margin: 0, fontSize: '.67rem', color: '#9ca3af' }}>Wie eine echte App auf deinem Handy 📱</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Platform tabs */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem' }}>
          {(['ios', 'android'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '.55rem', borderRadius: '.75rem', border: 'none', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', transition: 'all .15s', background: tab === t ? '#1a1a2e' : '#f3f4f6', color: tab === t ? '#fff' : '#6b7280' }}>
              {t === 'ios' ? '🍎 iPhone / iPad' : '🤖 Android'}
            </button>
          ))}
        </div>

        {/* iOS instructions */}
        {tab === 'ios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            <Step n={1} text="Öffne diese Seite im Safari-Browser auf deinem iPhone." />
            <Step n={2} text={`Tippe unten in der Mitte auf das Teilen-Symbol (□↑).`} />
            <Step n={3} text={`Scrolle nach unten und tippe auf „Zum Homescreen hinzufügen".`} />
            <Step n={4} text={`Tippe oben rechts auf „Hinzufügen" – fertig! 🎉`} />

            {/* Visual hint */}
            <div style={{ background: 'linear-gradient(135deg,#f0f0ff,#f5f3ff)', borderRadius: '1rem', padding: '1rem', border: '1px solid rgba(99,102,241,.15)', textAlign: 'center', marginTop: '.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>□↑</div>
              <p style={{ margin: 0, fontSize: '.72rem', color: '#6366f1', fontWeight: 700 }}>Teilen-Symbol in Safari</p>
              <p style={{ margin: '.2rem 0 0', fontSize: '.65rem', color: '#9ca3af' }}>Befindet sich in der unteren Menüleiste</p>
            </div>
          </div>
        )}

        {/* Android instructions */}
        {tab === 'android' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            <Step n={1} text="Öffne diese Seite in Chrome auf deinem Android-Gerät." />
            <Step n={2} text={`Tippe oben rechts auf die drei Punkte (⋮).`} />
            <Step n={3} text={`Tippe auf „App installieren" oder „Zum Startbildschirm hinzufügen".`} />
            <Step n={4} text={`Bestätige mit „Hinzufügen" – fertig! 🎉`} />

            {/* Visual hint */}
            <div style={{ background: 'linear-gradient(135deg,#f0fff4,#ecfdf5)', borderRadius: '1rem', padding: '1rem', border: '1px solid rgba(34,197,94,.15)', textAlign: 'center', marginTop: '.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>⋮</div>
              <p style={{ margin: 0, fontSize: '.72rem', color: '#22c55e', fontWeight: 700 }}>Drei-Punkte-Menü in Chrome</p>
              <p style={{ margin: '.2rem 0 0', fontSize: '.65rem', color: '#9ca3af' }}>Oben rechts in der Browser-Leiste</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <button onClick={onClose} style={{ width: '100%', marginTop: '1.5rem', padding: '.9rem', borderRadius: '1rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '.88rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,.35)' }}>
          Verstanden! ✓
        </button>
      </div>
    </div>
  )
}
