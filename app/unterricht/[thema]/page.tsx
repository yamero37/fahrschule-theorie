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
          <Link href="/unterricht" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 700 }}>
            ← Unterricht
          </Link>
          <span style={{ color: 'var(--border)' }}>›</span>
          <span>{topic.tag ?? `Thema ${topic.id}`}</span>
        </div>

        {/* Klasse-B Banner */}
        {topic.classB && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(var(--gold-rgb),0.07)',
            border: '1px solid rgba(var(--gold-rgb),0.22)',
            borderRadius: '0.85rem', padding: '0.7rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600,
          }}>
            <span style={{ fontSize: '1rem' }}>🚙</span>
            Dieses Thema ist ausschließlich für <strong style={{ color: 'var(--gold)' }}>Führerschein Klasse B</strong>
          </div>
        )}

        {/* Topic header */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(var(--gold-rgb),0.22)',
          borderRadius: '1.25rem',
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '1.25rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(var(--gold-rgb),0.1) 0%, transparent 70%)',
          }} />

          <div style={{
            width: '64px', height: '64px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>
            {topic.icon}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <span style={{
                fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' as const,
                background: 'rgba(var(--gold-rgb),0.1)', color: 'var(--gold)',
                border: '1px solid rgba(var(--gold-rgb),0.22)', borderRadius: '6px', padding: '2px 8px',
              }}>
                {topic.tag ?? `Thema ${topic.id}`}
              </span>
              {topic.classB && (
                <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-dim)' }}>Klasse B</span>
              )}
            </div>
            <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {topic.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{topic.subtitle}</p>
          </div>
        </div>

        {/* Lessons */}
        {topic.lessons.map((lesson, li) => (
          <div key={lesson.id} style={{
            background: 'var(--surface)',
            border: '1px solid rgba(var(--gold-rgb),0.15)',
            borderRadius: '1.25rem',
            padding: '2rem',
            marginBottom: '1.5rem',
          }}>
            {/* Lesson number + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.75rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                background: 'rgba(var(--gold-rgb),0.12)', border: '1px solid rgba(var(--gold-rgb),0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)',
              }}>
                {li + 1}
              </div>
              <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {lesson.title}
              </h2>
            </div>

            {lesson.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        ))}

        <Link href="/unterricht" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
          textDecoration: 'none', marginTop: '0.5rem',
          padding: '0.5rem 0.9rem', borderRadius: '8px',
          background: 'var(--input-bg)', border: '1px solid var(--border)',
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
          background: 'rgba(var(--gold-rgb),0.1)', color: 'var(--gold)',
          border: '1px solid rgba(var(--gold-rgb),0.3)', borderRadius: '20px', padding: '3px 10px',
        }}>
          {block.text}
        </span>
      )

    case 'list':
      return (
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {block.items?.map((item, i) => (
            <li key={i} style={{
              fontSize: '0.82rem',
              color: item.startsWith('→') ? 'var(--text-muted)' : 'var(--text)',
              paddingLeft: item.startsWith('→') ? '1.5rem' : '1rem',
              position: 'relative', lineHeight: 1.55,
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
          background: 'rgba(var(--gold-rgb),0.07)',
          border: '1px solid rgba(var(--gold-rgb),0.22)',
          borderRadius: '0.7rem', padding: '0.75rem 1rem',
          marginBottom: '0.75rem',
          fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold)',
        }}>
          ⚡ {block.text}
        </div>
      )

    case 'question':
      return (
        <div style={{
          background: 'rgba(var(--gold-rgb),0.05)',
          border: '1px solid rgba(var(--gold-rgb),0.18)',
          borderRadius: '0.7rem', padding: '0.85rem 1rem',
          marginBottom: '0.5rem',
          fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}>
          💬 {block.text}
        </div>
      )

    case 'answer':
      return (
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '0.7rem', padding: '0.85rem 1rem',
          marginBottom: '0.75rem',
        }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.66rem', fontWeight: 800, color: '#22c55e', letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>
            ✓ Antwort
          </p>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {block.items?.map((item, i) => (
              <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', paddingLeft: '1.2rem', position: 'relative', lineHeight: 1.55 }}>
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
          borderRadius: '0.7rem', padding: '0.75rem 1rem',
          marginBottom: '0.75rem',
          fontSize: '0.8rem', fontWeight: 600, color: '#fca5a5', lineHeight: 1.55,
        }}>
          ⚠ {block.text}
        </div>
      )

    case 'divider':
      return <div style={{ height: '1px', background: 'var(--border)', margin: '1.25rem 0' }} />

    default:
      return null
  }
}
