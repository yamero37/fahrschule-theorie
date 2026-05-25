import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

export const metadata = { title: 'VW T-Roc – TolDrive' }

const SPECS = [
  { label: 'Antrieb',      value: 'Benzin / mild-Hybrid' },
  { label: 'Motor',        value: '1.0 TSI – 2.0 TSI' },
  { label: 'Leistung',     value: '110 – 190 PS' },
  { label: '0–100 km/h',   value: '7,2 – 9,9 s' },
  { label: 'Getriebe',     value: '6-Gang / DSG' },
  { label: 'Länge',        value: '4.234 mm' },
]

export default function TrocPage() {
  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.25rem' }}>
            <Link href="/technik" style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--text-dim)', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            }}>←</Link>
            <div>
              <span style={{
                fontSize: '0.52rem', fontWeight: 800,
                padding: '2px 8px', borderRadius: '6px',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.35)',
                color: '#4ade80',
                display: 'inline-block', marginBottom: '4px',
              }}>🚙 SUV / CROSSOVER · 2025</span>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                Volkswagen T-Roc
              </h1>
            </div>
          </div>

          {/* 3D Viewer */}
          <div style={{
            borderRadius: '1.25rem', overflow: 'hidden',
            border: '1.5px solid rgba(34,197,94,0.3)',
            background: '#06060f',
          }}>
            <div style={{
              padding: '0.65rem 1rem',
              borderBottom: '1px solid rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(34,197,94,0.06)',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80' }}>
                👆 Drehen · Pinch zum Zoomen
              </span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>
                3D-Modell
              </span>
            </div>
            <iframe
              title="VW T-Roc 3D-Modell"
              src="https://sketchfab.com/models/991a39ce1c7f40089c07ae204b5044b9/embed?autostart=1&preload=1&ui_controls=1&ui_infos=0&ui_watermark=1&ui_watermark_link=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=1&ui_annotations=0&autospin=0.3"
              className="car-iframe"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
            />
          </div>

          {/* Specs */}
          <div style={{
            marginTop: '1rem',
            background: 'transparent',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '1.1rem',
            padding: '1rem',
          }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 800, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Technische Daten
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {SPECS.map(s => (
                <div key={s.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.45rem 0.65rem', borderRadius: '0.6rem',
                  background: 'rgba(34,197,94,0.05)',
                }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{s.label}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AuthGuard>
  )
}
