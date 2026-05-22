import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TOPICS, LessonBlock } from '@/data/lektionen'

interface Props { params: Promise<{ thema: string }> }

export async function generateMetadata({ params }: Props) {
  const { thema } = await params
  const topic = TOPICS.find(t => t.id === Number(thema))
  return { title: topic ? `${topic.title} – TolDrive` : 'TolDrive' }
}

export default async function ThemaPage({ params }: Props) {
  const { thema } = await params
  const topic = TOPICS.find(t => t.id === Number(thema))
  if (!topic || !topic.available) notFound()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem 5rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <Link href="/unterricht" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
            Unterricht
          </Link>
          <span>›</span>
          <span>Thema {topic.id}</span>
        </div>

        {/* Topic header */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(201,162,39,0.22)',
          borderRadius: '1.25rem',
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '1.25rem',
        }}>
          <div style={{ fontSize: '3rem', flexShrink: 0 }}>{topic.icon}</div>
          <div>
            <p style={{ margin: '0 0 0.2rem', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Thema {topic.id}
            </p>
            <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {topic.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{topic.subtitle}</p>
          </div>
        </div>

        {/* Lessons */}
        {topic.lessons.map(lesson => (
          <div key={lesson.id} style={{
            background: 'var(--surface)',
            border: '1px solid rgba(201,162,39,0.15)',
            borderRadius: '1.25rem',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '1.75rem', letterSpacing: '-0.01em' }}>
              {lesson.title}
            </h2>
            {lesson.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        ))}

        <Link href="/unterricht" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
          textDecoration: 'none', marginTop: '0.5rem',
        }}>
          ← Zurück zur Übersicht
        </Link>

      </div>
    </div>
  )
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 style={{
          fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)',
          margin: '1.5rem 0 0.75rem', letterSpacing: '-0.01em',
          paddingLeft: '12px', borderLeft: '3px solid var(--gold)',
        }}>
          {block.text}
        </h3>
      )

    case 'badge':
      return (
        <span style={{
          display: 'inline-block', marginBottom: '0.75rem',
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
          background: 'rgba(201,162,39,0.1)', color: 'var(--gold)',
          border: '1px solid rgba(201,162,39,0.3)', borderRadius: '20px', padding: '3px 10px',
        }}>
          {block.text}
        </span>
      )

    case 'list':
      return (
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {block.items?.map((item, i) => (
            <li key={i} style={{
              fontSize: '0.82rem', color: item.startsWith('→') ? 'var(--text-muted)' : 'var(--text)',
              paddingLeft: item.startsWith('→') ? '1.25rem' : '1rem',
              position: 'relative', lineHeight: 1.5,
            }}>
              {!item.startsWith('→') && (
                <span style={{ position: 'absolute', left: 0, color: 'var(--gold)', fontWeight: 700 }}>·</span>
              )}
              {item}
            </li>
          ))}
        </ul>
      )

    case 'highlight':
      return (
        <div style={{
          background: 'rgba(201,162,39,0.06)',
          border: '1px solid rgba(201,162,39,0.2)',
          borderRadius: '0.6rem',
          padding: '0.75rem 1rem',
          marginBottom: '0.75rem',
          fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold)',
        }}>
          {block.text}
        </div>
      )

    case 'question':
      return (
        <div style={{
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '0.6rem',
          padding: '0.85rem 1rem',
          marginBottom: '0.5rem',
          fontSize: '0.82rem', fontWeight: 600, color: '#93c5fd',
          fontStyle: 'italic',
        }}>
          {block.text}
        </div>
      )

    case 'answer':
      return (
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '0.6rem',
          padding: '0.85rem 1rem',
          marginBottom: '0.75rem',
        }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ✓ Antwort
          </p>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {block.items?.map((item, i) => (
              <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', paddingLeft: '1rem', position: 'relative', lineHeight: 1.5 }}>
                <span style={{ position: 'absolute', left: 0, color: '#22c55e', fontWeight: 700 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )

    case 'note':
      return (
        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '0.6rem',
          padding: '0.75rem 1rem',
          marginBottom: '0.75rem',
          fontSize: '0.8rem', fontWeight: 600, color: '#fca5a5', lineHeight: 1.5,
        }}>
          {block.text}
        </div>
      )

    case 'divider':
      return <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.25rem 0' }} />

    default:
      return null
  }
}
