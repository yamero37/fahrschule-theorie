import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

export const metadata = { title: 'Technik – TolDrive' }

const TOPICS = [
  {
    icon: '🔧', title: 'Motor & Antrieb', color: '#06b6d4',
    desc: 'Verbrennungsmotor, Getriebe, Kupplung und Antriebsarten – Benzin, Diesel, Elektro, Hybrid.',
    items: ['4-Takt-Motor', 'Automatik vs. Schaltgetriebe', 'Elektroantrieb', 'Hybridtechnologie'],
    soon: false,
  },
  {
    icon: '🛞', title: 'Reifen & Räder', color: '#f97316',
    desc: 'Reifentypen, Profiltiefen, Luftdruck und saisonale Bereifung – alles was du wissen musst.',
    items: ['Mindestprofiltiefe', 'Reifendruck', 'Sommer- & Winterreifen', 'Reifenbezeichnung'],
    soon: false,
  },
  {
    icon: '🛑', title: 'Bremsen & Sicherheit', color: '#ef4444',
    desc: 'ABS, ESP, Bremsweg-Berechnung und aktive Sicherheitssysteme moderner Fahrzeuge.',
    items: ['ABS & ESP', 'Bremsweg berechnen', 'Scheiben- vs. Trommelbremse', 'Fahrerassistenz'],
    soon: false,
  },
  {
    icon: '💡', title: 'Elektrik & Beleuchtung', color: '#fbbf24',
    desc: 'Fahrzeugbeleuchtung, Batterie, Lichtpflicht und elektrische Systeme im Überblick.',
    items: ['Lichtpflicht', 'Abblend- & Fernlicht', 'Batterie & Lichtmaschine', 'Nebelscheinwerfer'],
    soon: false,
  },
  {
    icon: '⛽', title: 'Kraftstoff & Umwelt', color: '#22c55e',
    desc: 'Kraftstoffarten, Umweltzonen, Abgasklassen und umweltbewusstes Fahren.',
    items: ['Euro-Norm', 'Umweltzonen', 'Kraftstoffverbrauch', 'Schadstoffklassen'],
    soon: false,
  },
  {
    icon: '🔍', title: 'Fahrzeugkontrolle', color: '#a78bfa',
    desc: 'Pflichtprüfungen, Hauptuntersuchung, Ölstand, Kühlwasser und tägliche Kontrollen.',
    items: ['HU & AU', 'Ölstand prüfen', 'Kühlwasser', 'Scheibenwischer & Flüssigkeiten'],
    soon: false,
  },
]

export default function TechnikPage() {
  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.5rem 1rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
            <Link href="/dashboard" style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            }}>←</Link>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                🔧 Fahrzeugtechnik
              </h1>
              <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>
                Technik für die Theorieprüfung
              </p>
            </div>
          </div>

          {/* Intro card */}
          <div style={{
            background: 'transparent', border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: '1.25rem', padding: '1.1rem 1.2rem', marginBottom: '1.25rem',
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
            }}>🔧</div>
            <div>
              <p style={{ margin: '0 0 0.3rem', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>
                Technik im Theorietest
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Etwa <strong style={{ color: '#06b6d4' }}>15–20 %</strong> der Prüfungsfragen behandeln Fahrzeugtechnik.
                Hier lernst du alles Wichtige kompakt und verständlich.
              </p>
            </div>
          </div>

          {/* Topic grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {TOPICS.map(t => (
              <div key={t.title} style={{
                background: 'transparent',
                border: `1px solid ${t.color}35`,
                borderRadius: '1.1rem', padding: '1rem 1.1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '11px', flexShrink: 0,
                    background: `${t.color}15`, border: `1px solid ${t.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                  }}>{t.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 0.3rem', fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>
                      {t.title}
                    </p>
                    <p style={{ margin: '0 0 0.65rem', fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      {t.desc}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {t.items.map(item => (
                        <span key={item} style={{
                          fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                          background: `${t.color}12`, border: `1px solid ${t.color}25`, color: t.color,
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: '1.5rem', padding: '1rem 1.2rem', borderRadius: '1.1rem',
            background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '0.82rem', color: 'var(--text)' }}>
                Technik-Fragen üben
              </p>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Direkt in den Theoriefragen nach Technik filtern
              </p>
            </div>
            <Link href="/fragen" style={{
              padding: '0.55rem 1rem', borderRadius: '100px', textDecoration: 'none',
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
              color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
            }}>
              Zu den Fragen →
            </Link>
          </div>

        </div>
      </div>
    </AuthGuard>
  )
}
