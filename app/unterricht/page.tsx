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
        .t-card {
          transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
        }
        .t-card:hover {
          transform: translateY(-3px);
          border-color: rgba(var(--gold-rgb), 0.5) !important;
          box-shadow: 0 8px 32px rgba(var(--gold-rgb), 0.12), 0 2px 8px rgba(0,0,0,0.08) !important;
        }
        .t-card-locked { opacity: 0.45; }
        @media (max-width: 640px) {
          .t-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* ── Hero ── */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'var(--surface)',
          border: '1px solid rgba(var(--gold-rgb), 0.22)',
          borderRadius: '1.5rem',
          padding: '2.25rem 2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Decorative glow blobs */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--gold-rgb),0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '10%',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--gold-rgb),0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.9rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, boxShadow: '0 0 8px rgba(var(--gold-rgb),0.5)' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                TolDrive · Lernbereich
              </span>
            </div>

            <h1 style={{
              margin: '0 0 0.5rem',
              fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
              fontWeight: 900, color: 'var(--text)',
              letterSpacing: '-0.02em', lineHeight: 1.15,
            }}>
              📖 Theorie Unterricht
            </h1>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '520px' }}>
              Alles, was du für die Prüfung wissen musst – strukturiert, kompakt und verständlich erklärt.
            </p>

            {/* Stat badges */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {[
                { icon: '📚', label: `${TOPICS.length} Themen gesamt`,  color: 'var(--gold)',  bg: 'rgba(var(--gold-rgb),0.1)',  border: 'rgba(var(--gold-rgb),0.25)' },
                { icon: '✅', label: `${availableCount} verfügbar`,      color: '#22c55e',     bg: 'rgba(34,197,94,0.1)',          border: 'rgba(34,197,94,0.25)'       },
                { icon: '🚙', label: '2 Klasse-B-Themen',               color: 'var(--gold-light)', bg: 'rgba(var(--gold-rgb),0.07)', border: 'rgba(var(--gold-rgb),0.18)' },
              ].map(b => (
                <span key={b.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '0.72rem', fontWeight: 700, color: b.color,
                  background: b.bg, border: `1px solid ${b.border}`,
                  borderRadius: '100px', padding: '5px 13px',
                }}>
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Allgemeine Themen ── */}
        <SectionLabel icon="📋" title="Allgemeine Themen" />

        <div className="t-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.9rem',
          marginBottom: '2.75rem',
        }}>
          {generalTopics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
        </div>

        {/* ── Klasse B ── */}
        <SectionLabel icon="🚙" title="Nur Klasse B" />

        <div style={{
          background: 'rgba(var(--gold-rgb),0.03)',
          border: '1px solid rgba(var(--gold-rgb),0.12)',
          borderRadius: '1.25rem',
          padding: '1rem',
        }}>
          <div className="t-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.9rem',
          }}>
            {classBTopics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Section divider ── */
function SectionLabel({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.1rem' }}>
      <div style={{
        width: '4px', height: '22px', borderRadius: '2px',
        background: 'linear-gradient(180deg, var(--gold), rgba(var(--gold-rgb),0.2))',
        flexShrink: 0,
      }} />
      <span style={{ fontSize: '0.65rem' }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.01em' }}>
        {title}
      </h2>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

/* ── Topic card ── */
function TopicCard({ topic }: { topic: typeof TOPICS[0] }) {
  const lessonCount = topic.lessons.length

  const card = (
    <div
      className={topic.available ? 't-card' : 't-card t-card-locked'}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '1.15rem',
        padding: '1.25rem',
        cursor: topic.available ? 'pointer' : 'default',
        position: 'relative', overflow: 'hidden',
        height: '100%', boxSizing: 'border-box' as const,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Corner glow for available topics */}
      {topic.available && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '120px', height: '120px', pointerEvents: 'none',
          background: 'radial-gradient(circle at top right, rgba(var(--gold-rgb),0.08), transparent 70%)',
        }} />
      )}

      {/* Top row: tag + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{
          fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' as const,
          background: 'rgba(var(--gold-rgb),0.1)',
          color: 'var(--gold)',
          border: '1px solid rgba(var(--gold-rgb),0.22)',
          borderRadius: '6px', padding: '2px 8px',
        }}>
          {topic.tag ?? `Thema ${topic.id}`}
        </span>
        <span style={{
          fontSize: '0.54rem', fontWeight: 700, borderRadius: '100px', padding: '2px 9px',
          background: topic.available ? 'rgba(34,197,94,0.08)' : 'var(--input-bg)',
          color: topic.available ? '#22c55e' : 'var(--text-dim)',
          border: `1px solid ${topic.available ? 'rgba(34,197,94,0.22)' : 'var(--border)'}`,
        }}>
          {topic.available ? '✓ Verfügbar' : '⏳ Demnächst'}
        </span>
      </div>

      {/* Icon */}
      <div style={{
        width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
        background: 'rgba(var(--gold-rgb),0.1)',
        border: '1px solid rgba(var(--gold-rgb),0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.55rem', marginBottom: '0.9rem',
      }}>
        {topic.icon}
      </div>

      {/* Text */}
      <h3 style={{
        fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)',
        margin: '0 0 0.3rem', lineHeight: 1.3,
      }}>
        {topic.title}
      </h3>
      <p style={{
        fontSize: '0.72rem', color: 'var(--text-muted)',
        margin: 0, lineHeight: 1.55, flex: 1,
      }}>
        {topic.subtitle}
      </p>

      {/* Footer */}
      <div style={{
        marginTop: '1rem', paddingTop: '0.75rem',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.67rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          {topic.available
            ? `${lessonCount} Lektion${lessonCount !== 1 ? 'en' : ''}`
            : 'Bald verfügbar'}
        </span>
        {topic.available && (
          <span style={{
            fontSize: '0.73rem', fontWeight: 800,
            color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            Starten
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        )}
      </div>
    </div>
  )

  if (!topic.available) return card
  return (
    <Link href={`/unterricht/${topic.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
      {card}
    </Link>
  )
}
