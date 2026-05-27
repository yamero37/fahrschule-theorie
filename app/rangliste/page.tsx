'use client'

import Leaderboard from '@/components/Leaderboard'

const RANKS = [
  { id: 'D',       name: 'Anfänger',        min: 0,    max: 99,       color: '#6b7280', bg: '#f3f4f6', icon: '🔰', desc: 'Der erste Schritt – lern die Grundlagen' },
  { id: 'C',       name: 'Amateur',         min: 100,  max: 299,      color: '#3b82f6', bg: '#eff6ff', icon: '📘', desc: 'Du bist auf dem richtigen Weg' },
  { id: 'B',       name: 'Fortgeschritten', min: 300,  max: 599,      color: '#8b5cf6', bg: '#f5f3ff', icon: '⚡', desc: 'Solides Wissen – weiter so!' },
  { id: 'A',       name: 'Profi',           min: 600,  max: 999,      color: '#c9a227', bg: '#fefce8', icon: '🎯', desc: 'Prüfungsfit – du kennst die Regeln' },
  { id: 'S',       name: 'Experte',         min: 1000, max: 1499,     color: '#f97316', bg: '#fff7ed', icon: '🔥', desc: 'Beeindruckend – echtes Fachwissen' },
  { id: 'SS',      name: 'Meister',         min: 1500, max: 1999,     color: '#ef4444', bg: '#fff1f2', icon: '💎', desc: 'Elite-Niveau – fast unschlagbar' },
  { id: 'Legende', name: 'Legende',         min: 2000, max: Infinity, color: '#f59e0b', bg: '#fffbeb', icon: '👑', desc: 'Das Höchste – du bist eine Legende!' },
]

export default function RanglistePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0eff7', padding: '2rem 1rem 5rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6366f1', marginBottom: '.5rem' }}>
            Online Rangsystem
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', fontWeight: 900, color: '#1a1a2e', margin: '0 0 .5rem', letterSpacing: '-.02em' }}>
            🏆 Rangliste
          </h1>
          <p style={{ fontSize: '.85rem', color: '#6b7280', margin: 0 }}>
            Wer hat die meisten Punkte gesammelt?
          </p>
        </div>

        {/* ── Leaderboard ── */}
        <Leaderboard />

        {/* ── Rang-System ── */}
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎖️</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#1a1a2e' }}>Rang-System</h2>
              <p style={{ margin: 0, fontSize: '.68rem', color: '#9ca3af' }}>Sammle Punkte und steige auf</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {RANKS.map((rank, i) => {
              const isLast = i === RANKS.length - 1
              const totalMax = 2000
              const barWidth = isLast ? 100 : Math.min(100, Math.round((rank.min / totalMax) * 100 + 14))
              return (
                <div key={rank.id} style={{
                  background: '#fff', borderRadius: '1rem', padding: '.85rem 1.1rem',
                  border: `1px solid ${rank.color}25`,
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Left color bar */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: rank.color, borderRadius: '1rem 0 0 1rem' }} />

                  {/* Rank badge */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: rank.bg, border: `1.5px solid ${rank.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem',
                  }}>
                    {rank.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '.7rem', fontWeight: 900, padding: '2px 9px', borderRadius: 100,
                        background: `${rank.color}15`, border: `1px solid ${rank.color}40`, color: rank.color,
                        letterSpacing: '.04em',
                      }}>{rank.id}</span>
                      <span style={{ fontSize: '.85rem', fontWeight: 800, color: '#1a1a2e' }}>{rank.name}</span>
                    </div>
                    <p style={{ margin: '0 0 .4rem', fontSize: '.65rem', color: '#9ca3af', lineHeight: 1.4 }}>{rank.desc}</p>
                    {/* Progress bar */}
                    <div style={{ height: 4, borderRadius: 2, background: '#f3f4f6', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 2, width: `${barWidth}%`, background: `linear-gradient(90deg,${rank.color}80,${rank.color})`, transition: 'width .6s ease' }} />
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: '.78rem', fontWeight: 900, color: rank.color }}>
                      {isLast ? '2000+' : `${rank.min}–${rank.max}`}
                    </p>
                    <p style={{ margin: 0, fontSize: '.58rem', color: '#9ca3af', fontWeight: 600 }}>Punkte</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hint */}
          <div style={{ marginTop: '1rem', padding: '.85rem 1rem', borderRadius: '.85rem', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.14)', display: 'flex', gap: '.65rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
            <p style={{ margin: 0, fontSize: '.72rem', color: '#6b7280', lineHeight: 1.55 }}>
              Du sammelst Punkte durch richtiges Beantworten von Fragen im <strong style={{ color: '#6366f1' }}>Üben-Modus</strong> und bei der <strong style={{ color: '#6366f1' }}>Prüfungssimulation</strong>. Je mehr Fragen du richtig beantwortest, desto schneller steigst du auf!
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
