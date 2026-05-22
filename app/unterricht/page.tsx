import Link from 'next/link'
import { TOPICS } from '@/data/lektionen'

export const metadata = { title: 'Theorie Unterricht – TolDrive' }

export default function UnterrichtPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            TolDrive
          </p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            📖 Theorie Unterricht
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            12 Themen · Alles was du für die Prüfung brauchst
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {TOPICS.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>

      </div>
    </div>
  )
}

function TopicCard({ topic }: { topic: typeof TOPICS[0] }) {
  const inner = (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${topic.available ? 'rgba(201,162,39,0.22)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '1rem',
      padding: '1.5rem',
      cursor: topic.available ? 'pointer' : 'default',
      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      position: 'relative',
      overflow: 'hidden',
      opacity: topic.available ? 1 : 0.55,
    }}>
      {!topic.available && (
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2px 8px',
        }}>Demnächst</span>
      )}
      {topic.available && (
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          background: 'rgba(201,162,39,0.1)', color: 'var(--gold)',
          border: '1px solid rgba(201,162,39,0.25)', borderRadius: '20px', padding: '2px 8px',
        }}>Verfügbar</span>
      )}

      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{topic.icon}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)',
          background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '1px 6px',
        }}>
          Thema {topic.id}
        </span>
      </div>

      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
        {topic.title}
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
        {topic.subtitle}
      </p>

      {topic.available && (
        <div style={{ marginTop: '1rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)' }}>
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
