import Link from 'next/link'
import { TOPICS } from '@/data/lektionen'

export const metadata = { title: 'Theorie Unterricht – TolDrive' }

export default function UnterrichtPage() {
  const generalTopics  = TOPICS.filter(t => !t.classB)
  const classBTopics   = TOPICS.filter(t =>  t.classB)
  const availableCount = TOPICS.filter(t => t.available).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '5rem' }}>
      <style>{`
        .topic-card { transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s !important; }
        .topic-card:hover { transform: translateY(-3px) !important; }
        .topic-card-indigo:hover { border-color: #6366f1 !important; box-shadow: 0 6px 28px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.05) !important; }
        .topic-card-blue:hover   { border-color: #3b82f6 !important; box-shadow: 0 6px 28px rgba(59,130,246,0.12), 0 2px 8px rgba(0,0,0,0.05) !important; }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* ── Hero Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #eef2ff 0%, #f0f4ff 50%, #ede9fe 100%)',
          border: '1px solid rgba(99,102,241,0.12)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <svg style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.06, pointerEvents: 'none' }}
            width="240" height="120" viewBox="0 0 240 120">
            <path d="M0,60 Q60,20 120,50 T240,40 L240,120 L0,120 Z" fill="#6366f1"/>
            <path d="M0,80 Q80,55 160,70 T240,65 L240,120 L0,120 Z" fill="#8b5cf6"/>
          </svg>

          <div style={{ position: 'relative' }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.68rem', fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              TolDrive · Lernbereich
            </p>
            <h1 style={{ margin: '0 0 0.4rem', fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              📖 Theorie Unterricht
            </h1>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>
              Alles, was du für die Prüfung wissen musst – strukturiert und verständlich erklärt.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {([
                { icon: '📚', label: `${TOPICS.length} Themen gesamt`,  color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
                { icon: '✅', label: `${availableCount} verfügbar`,      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.22)'  },
                { icon: '🚙', label: '2 Klasse-B-Themen',               color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.22)' },
              ] as const).map(c => (
                <span key={c.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '0.72rem', fontWeight: 700, color: c.color,
                  background: c.bg, border: `1px solid ${c.border}`,
                  borderRadius: '100px', padding: '4px 12px',
                }}>
                  {c.icon} {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Allgemeine Themen ── */}
        <SectionLabel icon="📋" title="Allgemeine Themen" accent="#6366f1" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
          gap: '0.85rem',
          marginBottom: '2.5rem',
        }}>
          {generalTopics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
        </div>

        {/* ── Klasse B ── */}
        <SectionLabel icon="🚙" title="Nur Klasse B" accent="#3b82f6" />

        <div style={{
          background: 'rgba(59,130,246,0.04)',
          border: '1px solid rgba(59,130,246,0.14)',
          borderRadius: '1.25rem',
          padding: '1rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
            gap: '0.85rem',
          }}>
            {classBTopics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
          </div>
        </div>

      </div>
    </div>
  )
}

function SectionLabel({ icon, title, accent }: { icon: string; title: string; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        background: `${accent}18`, border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
      }}>{icon}</div>
      <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1a1a2e' }}>{title}</h2>
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
    </div>
  )
}

function TopicCard({ topic }: { topic: typeof TOPICS[0] }) {
  const isB = topic.classB

  const accent       = isB ? '#3b82f6' : '#6366f1'
  const accentBg     = isB ? 'rgba(59,130,246,0.08)'  : 'rgba(99,102,241,0.08)'
  const accentBorder = isB ? 'rgba(59,130,246,0.22)'  : 'rgba(99,102,241,0.18)'
  const tagColor     = accent
  const tagBorder    = isB ? 'rgba(59,130,246,0.28)'  : 'rgba(99,102,241,0.25)'
  const hoverClass   = isB ? 'topic-card topic-card-blue' : 'topic-card topic-card-indigo'

  const inner = (
    <div
      className={topic.available ? hoverClass : ''}
      style={{
        background: '#fff',
        border: `1px solid ${topic.available ? accentBorder : '#e5e7eb'}`,
        borderRadius: '1.1rem',
        padding: '1.25rem',
        cursor: topic.available ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        opacity: topic.available ? 1 : 0.6,
        height: '100%',
        boxSizing: 'border-box' as const,
      }}
    >
      {/* Corner accent */}
      {topic.available && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
          background: `radial-gradient(circle at top right, ${accentBg}, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Top row: Label + Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{
          fontSize: '0.57rem', fontWeight: 800, letterSpacing: '0.06em',
          background: accentBg, color: tagColor,
          border: `1px solid ${tagBorder}`, borderRadius: '6px',
          padding: '2px 8px', textTransform: 'uppercase' as const,
        }}>
          {topic.tag ?? `Thema ${topic.id}`}
        </span>
        <span style={{
          fontSize: '0.55rem', fontWeight: 700,
          background: topic.available ? 'rgba(34,197,94,0.08)' : '#f9fafb',
          color: topic.available ? '#16a34a' : '#9ca3af',
          border: `1px solid ${topic.available ? 'rgba(34,197,94,0.22)' : '#e5e7eb'}`,
          borderRadius: '100px', padding: '2px 9px',
        }}>
          {topic.available ? '✓ Verfügbar' : '⏳ Demnächst'}
        </span>
      </div>

      {/* Icon bubble */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: accentBg, border: `1px solid ${tagBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', marginBottom: '0.85rem',
      }}>
        {topic.icon}
      </div>

      {/* Title + Subtitle */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.3rem', lineHeight: 1.3 }}>
        {topic.title}
      </h3>
      <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
        {topic.subtitle}
      </p>

      {/* Footer */}
      <div style={{
        marginTop: '1rem', paddingTop: '0.8rem',
        borderTop: `1px solid ${topic.available ? accentBg : '#f3f4f6'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.67rem', color: '#9ca3af', fontWeight: 600 }}>
          {topic.available
            ? `${topic.lessons.length} Lektion${topic.lessons.length !== 1 ? 'en' : ''}`
            : 'Bald verfügbar'}
        </span>
        {topic.available && (
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: tagColor }}>
            Starten →
          </span>
        )}
      </div>
    </div>
  )

  if (!topic.available) return inner
  return (
    <Link href={`/unterricht/${topic.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </Link>
  )
}
