import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import dynamic from 'next/dynamic'

const CarViewer = dynamic(() => import('@/components/CarViewer'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '520px',
      borderRadius: '1.25rem',
      background: 'linear-gradient(160deg, #05050e 0%, #0b0b1d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '0.75rem',
      color: 'rgba(255,255,255,0.35)',
      fontSize: '0.85rem',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.08)',
        borderTop: '3px solid rgba(255,255,255,0.45)',
        animation: 'spin 0.9s linear infinite',
      }} />
      3D-Modell wird geladen…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
})

export const metadata = { title: 'Technik – TolDrive' }

const CARS = [
  {
    name: 'Tesla Model 3',
    badge: '⚡ Elektro',
    color: '#3b82f6',
    year: '2024',
    specs: [
      { label: 'Antrieb',        value: 'Elektro (RWD / AWD)' },
      { label: 'Reichweite',     value: 'bis 629 km' },
      { label: 'Leistung',       value: '208 – 358 PS' },
      { label: '0 – 100 km/h',   value: '3,1 – 5,8 s' },
      { label: 'Ladung (DC)',     value: 'bis 250 kW' },
      { label: 'Länge',          value: '4.720 mm' },
    ],
  },
  {
    name: 'VW T-Roc 2025',
    badge: '🚙 SUV / Crossover',
    color: '#22c55e',
    year: '2025',
    specs: [
      { label: 'Antrieb',        value: 'Benzin / mild-Hybrid' },
      { label: 'Hubraum',        value: '1.0 TSI – 2.0 TSI' },
      { label: 'Leistung',       value: '110 – 190 PS' },
      { label: '0 – 100 km/h',   value: '7,2 – 9,9 s' },
      { label: 'Getriebe',       value: '6-Gang / DSG' },
      { label: 'Länge',          value: '4.234 mm' },
    ],
  },
]

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
              color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            }}>←</Link>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                🚗 3D Fahrzeug-Viewer
              </h1>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>
                Interaktive 3D-Modelle · Drehen, Zoomen & Erkunden
              </p>
            </div>
          </div>

          {/* 3D Viewer */}
          <CarViewer />

          {/* Interaktions-Hinweise */}
          <div style={{
            display: 'flex', gap: '0.6rem', margin: '0.75rem 0',
            justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {[
              { icon: '🖱', text: 'Klicken & Ziehen zum Drehen' },
              { icon: '🔍', text: 'Scrollen zum Zoomen' },
              { icon: '📱', text: 'Touch-Gesten auf Handy' },
            ].map(h => (
              <span key={h.text} style={{
                fontSize: '0.62rem', color: 'var(--text-dim)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '3px 10px', borderRadius: '100px',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                {h.icon} {h.text}
              </span>
            ))}
          </div>

          {/* Fahrzeug-Specs nebeneinander */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            {CARS.map(car => (
              <div key={car.name} style={{
                background: 'transparent',
                border: `1px solid ${car.color}28`,
                borderRadius: '1.1rem',
                padding: '1rem',
                transition: 'border-color 0.2s',
              }}>
                {/* Fahrzeug-Titel */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.52rem', fontWeight: 800,
                    padding: '2px 7px', borderRadius: '6px',
                    background: `${car.color}15`,
                    border: `1px solid ${car.color}28`,
                    color: car.color,
                    display: 'inline-block',
                    marginBottom: '0.35rem',
                  }}>{car.badge}</span>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 900, color: 'var(--text)' }}>
                    {car.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)' }}>Modelljahr {car.year}</p>
                </div>

                {/* Daten */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {car.specs.map(s => (
                    <div key={s.label} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                        {s.label}
                      </span>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 700,
                        color: 'var(--text)', textAlign: 'right',
                      }}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AuthGuard>
  )
}
