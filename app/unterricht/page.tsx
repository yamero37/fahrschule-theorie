import Link from 'next/link'
import { TOPICS } from '@/data/lektionen'

export const metadata = { title: 'Theorie Unterricht – TolDrive' }

export default function UnterrichtPage() {
  const generalTopics = TOPICS.filter(t => !t.classB)
  const classBTopics  = TOPICS.filter(t =>  t.classB)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            TolDrive
          </p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            📖 Theorie Unterricht
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            12 allgemeine Themen + 2 Klasse-B-Themen
          </p>
        </div>

        {/* Allgemeine Themen */}
        <h2 style={{
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--gold)',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ flex: 1, height: '1px', background: 'rgba(201,162,39,0.2)' }} />
          Allgemeine Themen
          <span style={{ flex: 1, height: '1px', background: 'rgba(201,162,39,0.2)' }} />
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
        }}>
          {generalTopics.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>

        {/* Klasse B */}
        <h2 style={{
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#60a5fa',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ flex: 1, height: '1px', background: 'rgba(96,165,250,0.25)' }} />
          Nur Klasse B
          <span style={{ flex: 1, height: '1px', background: 'rgba(96,165,250,0.25)' }} />
        </h2>

        <div style={{
          background: 'rgba(59,130,246,0.04)',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: '1.25rem',
          padding: '1.25rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {classBTopics.map(topic => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function TopicCard({ topic }: { topic: typeof TOPICS[0] }) {
  const isB = topic.classB
  const activeColor   = isB ? '#3b82f6' : 'rgba(201,162,39,0.22)'
  const inactiveColor = isB ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.06)'
  const tagBg         = isB ? 'rgba(59,130,246,0.12)' : 'rgba(201,162,39,0.1)'
  const tagColor      = isB ? '#60a5fa' : 'var(--gold)'
  const tagBorder     = isB ? 'rgba(59,130,246,0.3)' : 'rgba(201,162,39,0.25)'

  const inner = (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${topic.available ? activeColor : inactiveColor}`,
      borderRadius: '1rem',
      padding: '1.5rem',
      cursor: topic.available ? 'pointer' : 'default',
      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      position: 'relative',
      overflow: 'hidden',
      opacity: topic.available ? 1 : 0.55,
    }}>

      {/* Tag badge (B1/B2) */}
      {topic.tag && (
        <span style={{
          position: 'absolute', top: '12px', left: '12px',
          fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em',
          background: tagBg, color: tagColor,
          border: `1px solid ${tagBorder}`, borderRadius: '20px', padding: '2px 8px',
        }}>{topic.tag}</span>
      )}

      {/* Status badge */}
      <span style={{
        position: 'absolute', top: '12px', right: '12px',
        fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        background: topic.available ? tagBg : 'rgba(255,255,255,0.06)',
        color: topic.available ? tagColor : 'var(--text-dim)',
        border: `1px solid ${topic.available ? tagBorder : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '20px', padding: '2px 8px',
      }}>
        {topic.available ? 'Verfügbar' : 'Demnächst'}
      </span>

      <div style={{ fontSize: '2rem', marginBottom: '0.75rem', marginTop: topic.tag ? '1rem' : '0' }}>
        {topic.icon}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)',
          background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '1px 6px',
        }}>
          {topic.tag ?? `Thema ${topic.id}`}
        </span>
      </div>

      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
        {topic.title}
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
        {topic.subtitle}
      </p>

      {topic.available && (
        <div style={{ marginTop: '1rem', fontSize: '0.72rem', fontWeight: 700, color: tagColor }}>
          {topic.lessons.length} Lektion{topic.lessons.length !== 1 ? 'en' : ''} →
        </div>
      )}
    </div>
  )

  if (!topic.available) return inner
  return (
    <Link href={`/unterricht/${topic.id}`} style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  )
}
