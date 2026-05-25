'use client'

import { useState } from 'react'

/* ── Types ──────────────────────────────────────────────── */
type Check = { label: string }

type CarPart = {
  id: string
  cx: number      // SVG x-center of hotspot (viewBox 0 0 400 220)
  cy: number      // SVG y-center of hotspot
  title: string
  subtitle: string
  color: string
  checks: Check[]
  info: string
  law?: string
}

const VIEWS = ['Heck', 'Front', 'Seite', 'Innenraum'] as const
type ViewName = typeof VIEWS[number]

/* ── Prüfungsdaten ──────────────────────────────────────── */
const VIEW_PARTS: Record<ViewName, CarPart[]> = {
  Heck: [
    {
      id: 'reflektor-l',
      cx: 60, cy: 175,
      title: 'Rückstrahler links',
      subtitle: 'Untere linke Bumperecke · rot',
      color: '#ef4444',
      checks: [
        { label: 'Sauber — kein Schmutz, kein Dreck' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
      ],
      info: 'Rote Rückstrahler reflektieren das Licht anderer Fahrzeuge passiv zurück. Sie funktionieren auch ohne Strom und erhöhen so die Sichtbarkeit des Fahrzeugs.',
      law: '§ 51a StVZO',
    },
    {
      id: 'reflektor-r',
      cx: 340, cy: 175,
      title: 'Rückstrahler rechts',
      subtitle: 'Untere rechte Bumperecke · rot',
      color: '#ef4444',
      checks: [
        { label: 'Sauber — kein Schmutz, kein Dreck' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
      ],
      info: 'Rote Rückstrahler reflektieren das Licht anderer Fahrzeuge passiv zurück. Sie funktionieren auch ohne Strom und erhöhen so die Sichtbarkeit des Fahrzeugs.',
      law: '§ 51a StVZO',
    },
  ],
  Front: [],
  Seite: [],
  Innenraum: [],
}

/* ── Hotspot SVG-Element ────────────────────────────────── */
function Hotspot({
  cx, cy, color, selected, onClick, index,
}: {
  cx: number; cy: number; color: string; selected: boolean; onClick: () => void; index: number
}) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Pulsing outer ring (only when not selected) */}
      {!selected && (
        <circle cx={cx} cy={cy} r="14" fill="none" stroke={color} strokeWidth="1.5">
          <animate attributeName="r" values="14;26;14" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Main circle */}
      <circle
        cx={cx} cy={cy} r="13"
        fill={selected ? color : 'rgba(15,15,20,0.75)'}
        stroke={color}
        strokeWidth={selected ? 0 : 2}
      />

      {/* Inner glow when selected */}
      {selected && (
        <circle cx={cx} cy={cy} r="13" fill={color} opacity="0.25" />
      )}

      {/* Label */}
      <text
        x={cx} y={cy + 4}
        textAnchor="middle"
        fill={selected ? '#fff' : color}
        fontSize="11"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {index + 1}
      </text>
    </g>
  )
}

/* ── Tesla Heck SVG ─────────────────────────────────────── */
function TeslaRearSVG({
  parts, selectedId, onSelect,
}: {
  parts: CarPart[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <svg viewBox="0 0 400 220" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="tailL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="tailR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#232326" />
          <stop offset="100%" stopColor="#111113" />
        </linearGradient>
        <linearGradient id="bumperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1c" />
          <stop offset="100%" stopColor="#0d0d0f" />
        </linearGradient>
        <filter id="redGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Karosserie (Hauptkörper) ── */}
      <path
        d="M 44 202 L 356 202 Q 374 202 374 184 L 374 114 Q 374 80 352 64 L 318 52 Q 262 37 200 37 Q 138 37 82 52 L 48 64 Q 26 80 26 114 L 26 184 Q 26 202 44 202 Z"
        fill="url(#bodyGrad)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="1.5"
      />

      {/* ── Heckscheibe (groß, Tesla-typisch) ── */}
      <path
        d="M 82 54 Q 138 39 200 39 Q 262 39 318 54 L 312 106 Q 260 118 200 118 Q 140 118 88 106 Z"
        fill="#08101c"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
      />
      {/* Glasreflexion */}
      <path
        d="M 105 57 Q 155 47 200 47 Q 245 47 295 57 L 290 78 Q 245 72 200 72 Q 155 72 110 78 Z"
        fill="rgba(255,255,255,0.035)"
      />
      {/* Zweite Reflexionslinie */}
      <path
        d="M 118 82 Q 160 77 200 77 Q 240 77 282 82 L 280 90 Q 240 86 200 86 Q 160 86 120 90 Z"
        fill="rgba(255,255,255,0.02)"
      />

      {/* ── Kofferraumdeckel-Kante ── */}
      <line x1="84" y1="122" x2="316" y2="122" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
      <line x1="84" y1="123" x2="316" y2="123" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />

      {/* ── Tesla T-Logo ── */}
      <text
        x="200" y="149"
        textAnchor="middle"
        fill="rgba(255,255,255,0.18)"
        fontSize="13"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >T</text>

      {/* ── Rücklichtleiste (das markante Tesla-Band) ── */}
      <rect x="26" y="126" width="348" height="17" rx="3" fill="#0b0000" />
      {/* Links leuchtend */}
      <rect x="26" y="126" width="130" height="17" rx="3" fill="url(#tailL)" />
      {/* Rechts leuchtend */}
      <rect x="244" y="126" width="130" height="17" rx="3" fill="url(#tailR)" />
      {/* Mitte (Tesla-Logo-Unterbrechung) */}
      <rect x="172" y="127" width="56" height="15" rx="2" fill="#0e0000" />
      {/* Glow-Effekt */}
      <rect x="26" y="126" width="130" height="17" rx="3" fill="rgba(220,38,38,0.2)" filter="url(#redGlow)" />
      <rect x="244" y="126" width="130" height="17" rx="3" fill="rgba(220,38,38,0.2)" filter="url(#redGlow)" />

      {/* ── Stoßstange ── */}
      <path
        d="M 30 148 L 370 148 L 372 196 Q 372 206 356 206 L 44 206 Q 28 206 28 196 Z"
        fill="url(#bumperGrad)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      {/* Stoßstangen-Trennlinie (Aero-Kante) */}
      <line x1="32" y1="162" x2="368" y2="162" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* ── Linker Rückstrahler ── */}
      <rect x="34" y="165" width="52" height="22" rx="5" fill="#3d0000" stroke="#9b1c1c" strokeWidth="1.5" />
      <rect x="37" y="167" width="46" height="16" rx="3" fill="#5a0000" />
      {/* Reflektor-Muster */}
      <rect x="38" y="168" width="20" height="7" rx="1.5" fill="rgba(252,165,165,0.15)" />
      <rect x="62" y="168" width="17" height="7" rx="1.5" fill="rgba(252,165,165,0.1)" />
      {/* Highlight */}
      <rect x="38" y="167" width="12" height="3" rx="1" fill="rgba(255,200,200,0.2)" />

      {/* ── Rechter Rückstrahler ── */}
      <rect x="314" y="165" width="52" height="22" rx="5" fill="#3d0000" stroke="#9b1c1c" strokeWidth="1.5" />
      <rect x="317" y="167" width="46" height="16" rx="3" fill="#5a0000" />
      {/* Reflektor-Muster */}
      <rect x="318" y="168" width="20" height="7" rx="1.5" fill="rgba(252,165,165,0.15)" />
      <rect x="342" y="168" width="17" height="7" rx="1.5" fill="rgba(252,165,165,0.1)" />
      {/* Highlight */}
      <rect x="318" y="167" width="12" height="3" rx="1" fill="rgba(255,200,200,0.2)" />

      {/* ── Kennzeichen ── */}
      <rect x="150" y="158" width="100" height="28" rx="4" fill="#ece8de" stroke="rgba(150,150,150,0.3)" strokeWidth="1" />
      <text x="200" y="176" textAnchor="middle" fill="#1a1a1a" fontSize="10" fontWeight="800" fontFamily="monospace" letterSpacing="1">WH · TD 2026</text>

      {/* ── Rückfahrkamera ── */}
      <rect x="194" y="189" width="12" height="9" rx="2" fill="#080808" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="200" cy="193.5" r="3" fill="#090909" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

      {/* ── Bodenschatten ── */}
      <ellipse cx="200" cy="214" rx="170" ry="7" fill="rgba(0,0,0,0.45)" />

      {/* ── Interaktive Hotspots ── */}
      {parts.map((p, i) => (
        <Hotspot
          key={p.id}
          cx={p.cx} cy={p.cy}
          color={p.color}
          selected={selectedId === p.id}
          onClick={() => onSelect(p.id)}
          index={i}
        />
      ))}
    </svg>
  )
}

/* ── Hauptkomponente ────────────────────────────────────── */
export default function TeslaInspect() {
  const [activeView, setActiveView] = useState<ViewName>('Heck')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const parts = VIEW_PARTS[activeView]
  const selected = parts.find(p => p.id === selectedId) ?? null

  function togglePart(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  return (
    <div style={{ marginTop: '1.25rem' }}>

      {/* ── Abschnittstitel ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '0.9rem',
        padding: '0.75rem 1rem',
        background: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '0.85rem',
      }}>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔍</span>
        <div>
          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)' }}>
            Interaktiver Fahrzeug-Check
          </p>
          <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Tippe auf die nummerierten Punkte für Prüfungshinweise
          </p>
        </div>
      </div>

      {/* ── Ansicht-Tabs ── */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {VIEWS.map(v => {
          const hasContent = VIEW_PARTS[v].length > 0
          const active = v === activeView
          return (
            <button
              key={v}
              onClick={() => { setActiveView(v); setSelectedId(null) }}
              disabled={!hasContent}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem',
                fontWeight: 700, cursor: hasContent ? 'pointer' : 'default',
                background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? '#60a5fa' : hasContent ? 'var(--text-muted)' : 'var(--text-dim)',
                opacity: hasContent ? 1 : 0.45,
                transition: 'all 0.15s',
              }}
            >
              {v}
              {!hasContent && (
                <span style={{ fontSize: '0.52rem', marginLeft: '4px', opacity: 0.6 }}>bald</span>
              )}
              {hasContent && (
                <span style={{
                  marginLeft: '5px', fontSize: '0.55rem', fontWeight: 800,
                  background: active ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                  padding: '1px 5px', borderRadius: '100px',
                  color: active ? '#93c5fd' : 'var(--text-dim)',
                }}>
                  {VIEW_PARTS[v].length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── SVG-Diagramm ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #0c0c14 0%, #070709 100%)',
        border: `1px solid ${selectedId ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.2)'}`,
        borderRadius: '1.1rem',
        overflow: 'hidden',
        padding: '1.25rem 1.25rem 0.75rem',
        transition: 'border-color 0.3s',
      }}>

        {/* Ansicht-Label oben rechts */}
        <div style={{
          position: 'absolute', top: '10px', right: '12px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{
            fontSize: '0.55rem', fontWeight: 700, color: 'rgba(59,130,246,0.7)',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            padding: '2px 8px', borderRadius: '100px',
          }}>
            Ansicht: {activeView}
          </span>
        </div>

        {/* Hinweistext unten links */}
        <div style={{
          position: 'absolute', bottom: '8px', left: '12px',
          fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            border: '1.5px solid rgba(239,68,68,0.6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5px', color: '#ef4444',
          }}>!</span>
          {parts.length} Prüfungspunkt{parts.length !== 1 ? 'e' : ''}
        </div>

        {activeView === 'Heck' && (
          <TeslaRearSVG
            parts={parts}
            selectedId={selectedId}
            onSelect={togglePart}
          />
        )}

        {activeView !== 'Heck' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '180px', flexDirection: 'column', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '2rem', opacity: 0.3 }}>🚗</span>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Diese Ansicht wird bald hinzugefügt.
            </p>
          </div>
        )}
      </div>

      {/* ── Info-Panel ── */}
      {selected && (
        <div style={{
          marginTop: '0.75rem',
          background: 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(8,8,10,0.95) 100%)',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: '1rem',
          padding: '1rem 1.1rem',
          animation: 'fadeUp 0.2s ease both',
        }}>

          {/* Titel-Zeile */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '0.5rem',
            marginBottom: '0.9rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  background: selected.color, fontSize: '0.6rem', fontWeight: 900,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {parts.findIndex(p => p.id === selected.id) + 1}
                </span>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>
                  {selected.title}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '0.63rem', color: 'var(--text-dim)', marginLeft: '26px' }}>
                {selected.subtitle}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
              {selected.law && (
                <span style={{
                  fontSize: '0.55rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '6px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5',
                }}>
                  {selected.law}
                </span>
              )}
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)',
                  fontSize: '0.7rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
          </div>

          {/* Prüfungsanforderungen */}
          <p style={{
            margin: '0 0 0.5rem',
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-dim)',
          }}>
            Prüfungsanforderungen
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
            {selected.checks.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.55rem 0.8rem', borderRadius: '0.65rem',
                background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)',
              }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', color: '#22c55e', fontWeight: 900,
                }}>✓</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          {/* Erklärungstext */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
            padding: '0.65rem 0.8rem', borderRadius: '0.65rem',
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)',
          }}>
            <span style={{ fontSize: '0.82rem', flexShrink: 0, marginTop: '1px' }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              {selected.info}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
