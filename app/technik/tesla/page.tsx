import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

export const metadata = { title: 'Tesla Model 3 – TolDrive' }

const SPECS = [
  { label: 'Antrieb',      value: 'Elektro (RWD / AWD)' },
  { label: 'Reichweite',   value: 'bis 629 km' },
  { label: 'Leistung',     value: '208 – 358 PS' },
  { label: '0–100 km/h',   value: '3,1 – 5,8 s' },
  { label: 'Laden (DC)',   value: 'bis 250 kW' },
  { label: 'Länge',        value: '4.720 mm' },
]

export default function TeslaPage() {
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
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.35)',
                color: '#60a5fa',
                display: 'inline-block', marginBottom: '4px',
              }}>⚡ ELEKTRO · 2024</span>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                Tesla Model 3
              </h1>
            </div>
          </div>

          {/* 3D Viewer */}
          <div style={{
            borderRadius: '1.25rem', overflow: 'hidden',
            border: '1.5px solid rgba(59,130,246,0.3)',
            background: '#06060f',
          }}>
            <div style={{
              padding: '0.65rem 1rem',
              borderBottom: '1px solid rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(59,130,246,0.06)',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa' }}>
                🖱 Drehen · Scrollen zum Zoomen
              </span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>
                3D-Modell
              </span>
            </div>
            <iframe
              title="Tesla Model 3 2024 3D-Modell"
              src="https://sketchfab.com/models/36c52f3f89f6439c90310f14e8ff33f2/embed?autostart=1&preload=1&ui_controls=1&ui_infos=0&ui_watermark=1&ui_watermark_link=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=1&ui_annotations=0&autospin=0.3"
              style={{ width: '100%', height: '480px', border: 'none', display: 'block' }}
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
            />
          </div>

          {/* Specs */}
          <div style={{
            marginTop: '1rem',
            background: 'transparent',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '1.1rem',
            padding: '1rem',
          }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Technische Daten
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {SPECS.map(s => (
                <div key={s.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.45rem 0.65rem', borderRadius: '0.6rem',
                  background: 'rgba(59,130,246,0.05)',
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
