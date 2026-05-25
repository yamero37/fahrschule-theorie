import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import CarViewerWrapper from '@/components/CarViewerWrapper'

export const metadata = { title: 'Fahrzeug-Viewer – TolDrive' }

export default function TechnikPage() {
  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.4rem' }}>
            <Link href="/dashboard" style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--text-dim)', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            }}>←</Link>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                🚗 3D Fahrzeug-Viewer
              </h1>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>
                Echte 3D-Modelle · Jeden einzeln drehen & zoomen
              </p>
            </div>
          </div>

          {/* Hinweis */}
          <div style={{
            display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem',
          }}>
            {['🖱 Linksklick + Ziehen zum Drehen', '🔍 Scrollen zum Zoomen', '📱 Touch auf Handy'].map(h => (
              <span key={h} style={{
                fontSize: '0.62rem', color: 'var(--text-dim)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '3px 10px', borderRadius: '100px',
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* 3D-Viewer */}
          <CarViewerWrapper />

        </div>
      </div>
    </AuthGuard>
  )
}
