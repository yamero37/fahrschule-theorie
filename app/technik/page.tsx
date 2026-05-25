import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

export const metadata = { title: 'Fahrzeuge – TolDrive' }

export default function TechnikPage() {
  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '2rem' }}>
            <Link href="/dashboard" style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--text-dim)', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            }}>←</Link>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                🚗 Fahrzeuge
              </h1>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>
                Wähle ein Fahrzeug für das 3D-Modell
              </p>
            </div>
          </div>

          {/* Fahrzeug-Karten */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Tesla Model 3 */}
            <Link href="/technik/tesla" style={{ textDecoration: 'none' }}>
              <div style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.04) 100%)',
                border: '1.5px solid rgba(59,130,246,0.4)',
                borderRadius: '1.5rem',
                padding: '1.75rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.8)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 32px rgba(59,130,246,0.2)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(59,130,246,0.4)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                {/* Hintergrund-Glow */}
                <div style={{
                  position: 'absolute', top: '-40px', right: '-20px',
                  width: '180px', height: '180px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    {/* Badge */}
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.55rem', fontWeight: 800,
                      padding: '3px 10px', borderRadius: '100px',
                      background: 'rgba(59,130,246,0.15)',
                      border: '1px solid rgba(59,130,246,0.4)',
                      color: '#60a5fa',
                      letterSpacing: '0.06em',
                      marginBottom: '0.65rem',
                    }}>⚡ ELEKTRO · 2024</span>

                    {/* Name */}
                    <h2 style={{
                      margin: '0 0 0.35rem',
                      fontSize: '1.55rem', fontWeight: 900,
                      color: 'var(--text)', lineHeight: 1.15,
                    }}>
                      Tesla<br />
                      <span style={{
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>Model 3</span>
                    </h2>

                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                      Elektrische Sportlimousine · bis 629 km Reichweite<br />
                      208 – 358 PS · 0–100 in 3,1 s
                    </p>
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '18px', flexShrink: 0,
                    background: 'rgba(59,130,246,0.12)',
                    border: '1.5px solid rgba(59,130,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem',
                    filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.4))',
                  }}>⚡</div>
                </div>

                {/* CTA */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginTop: '1.2rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '100px',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  width: 'fit-content',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa' }}>
                    3D-Modell ansehen
                  </span>
                  <span style={{ color: '#60a5fa', fontSize: '0.9rem' }}>→</span>
                </div>
              </div>
            </Link>

            {/* VW T-Roc */}
            <Link href="/technik/troc" style={{ textDecoration: 'none' }}>
              <div style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.04) 100%)',
                border: '1.5px solid rgba(34,197,94,0.4)',
                borderRadius: '1.5rem',
                padding: '1.75rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.8)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 32px rgba(34,197,94,0.2)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.4)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                {/* Hintergrund-Glow */}
                <div style={{
                  position: 'absolute', top: '-40px', right: '-20px',
                  width: '180px', height: '180px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    {/* Badge */}
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.55rem', fontWeight: 800,
                      padding: '3px 10px', borderRadius: '100px',
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.4)',
                      color: '#4ade80',
                      letterSpacing: '0.06em',
                      marginBottom: '0.65rem',
                    }}>🚙 SUV / CROSSOVER · 2025</span>

                    {/* Name */}
                    <h2 style={{
                      margin: '0 0 0.35rem',
                      fontSize: '1.55rem', fontWeight: 900,
                      color: 'var(--text)', lineHeight: 1.15,
                    }}>
                      Volkswagen<br />
                      <span style={{
                        background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>T-Roc</span>
                    </h2>

                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                      Kompakter SUV / Crossover · Benzin & Hybrid<br />
                      110 – 190 PS · 4.234 mm Länge
                    </p>
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '18px', flexShrink: 0,
                    background: 'rgba(34,197,94,0.12)',
                    border: '1.5px solid rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem',
                    filter: 'drop-shadow(0 0 12px rgba(34,197,94,0.4))',
                  }}>🚙</div>
                </div>

                {/* CTA */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginTop: '1.2rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '100px',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  width: 'fit-content',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80' }}>
                    3D-Modell ansehen
                  </span>
                  <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>→</span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
