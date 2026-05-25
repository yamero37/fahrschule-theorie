'use client'

/* ── Echte 3D-Modelle von Sketchfab ── */
const CARS = [
  {
    sketchfabId: '36c52f3f89f6439c90310f14e8ff33f2',
    name: 'Tesla Model 3',
    year: '2024',
    badge: '⚡ Elektro',
    badgeColor: '#3b82f6',
    specs: [
      { label: 'Antrieb',      value: 'Elektro (Hinterrad/AWD)' },
      { label: 'Reichweite',   value: 'bis 629 km' },
      { label: 'Leistung',     value: '208 – 358 PS' },
      { label: '0–100 km/h',   value: '3,1 – 5,8 s' },
      { label: 'Laden (DC)',   value: 'bis 250 kW' },
    ],
  },
  {
    sketchfabId: 'c1af0ef4607844299a01364537b2c71a',
    name: 'VW T-Roc',
    year: '2025',
    badge: '🚙 SUV / Crossover',
    badgeColor: '#22c55e',
    specs: [
      { label: 'Antrieb',      value: 'Benzin / mild-Hybrid' },
      { label: 'Motor',        value: '1.0 TSI – 2.0 TSI' },
      { label: 'Leistung',     value: '110 – 190 PS' },
      { label: '0–100 km/h',   value: '7,2 – 9,9 s' },
      { label: 'Getriebe',     value: '6-Gang manuell / DSG' },
    ],
  },
]

export default function CarViewerWrapper() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {CARS.map(car => (
        <div key={car.sketchfabId} style={{
          borderRadius: '1.25rem',
          overflow: 'hidden',
          border: `1.5px solid ${car.badgeColor}28`,
          background: '#06060f',
        }}>

          {/* ── Kopfzeile ── */}
          <div style={{
            padding: '0.8rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            borderBottom: `1px solid ${car.badgeColor}18`,
            background: `${car.badgeColor}08`,
          }}>
            <span style={{
              fontSize: '0.52rem', fontWeight: 800,
              padding: '2px 8px', borderRadius: '6px',
              background: `${car.badgeColor}18`,
              border: `1px solid ${car.badgeColor}35`,
              color: car.badgeColor,
              flexShrink: 0,
            }}>
              {car.badge}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>
              {car.name}
            </span>
            <span style={{
              fontSize: '0.6rem', fontWeight: 600,
              color: 'var(--text-dim)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '2px 8px', borderRadius: '100px',
            }}>
              {car.year}
            </span>
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.25)',
              flexShrink: 0,
            }}>
              🖱 Drehen · Zoomen
            </span>
          </div>

          {/* ── 3D-Viewer ── */}
          <div style={{ position: 'relative', width: '100%', height: '440px' }}>
            <iframe
              title={`${car.name} 3D-Modell`}
              src={`https://sketchfab.com/models/${car.sketchfabId}/embed?autostart=1&preload=1&ui_controls=1&ui_infos=0&ui_watermark=1&ui_watermark_link=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=1&ui_annotations=0&transparent=0&autospin=0.3`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
              allow="autoplay; fullscreen; xr-spatial-tracking"
              loading="lazy"
              allowFullScreen
            />
          </div>

          {/* ── Technische Daten ── */}
          <div style={{
            padding: '0.85rem 1rem',
            borderTop: `1px solid ${car.badgeColor}15`,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
          }}>
            {car.specs.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.58rem', color: 'var(--text-dim)' }}>{s.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text)' }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

        </div>
      ))}
    </div>
  )
}
