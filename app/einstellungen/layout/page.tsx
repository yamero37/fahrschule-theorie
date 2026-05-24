'use client'

import { useRouter } from 'next/navigation'

export default function LayoutEinstellungPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>Layout ändern</h1>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>Dashboard-Ansicht anpassen</p>
          </div>
        </div>

        {/* Placeholder */}
        <div style={{
          background: 'var(--surface)', borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '2.5rem 1.5rem', textAlign: 'center',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 1rem',
            background: 'rgba(201,144,122,0.1)', border: '1px solid rgba(201,144,122,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          }}>🎨</div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>Layouts werden geladen…</p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Hier kannst du bald zwischen verschiedenen Dashboard-Layouts wählen.
          </p>
        </div>

      </div>
    </div>
  )
}
