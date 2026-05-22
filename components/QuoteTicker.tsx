'use client'

const QUOTES_LEFT = [
  "Bald ist Sommer —",
  "mach deinen Führerschein!",
  "Lern jetzt,",
  "fahr morgen.",
  "Freiheit beginnt",
  "auf der Straße.",
  "Dein Führerschein —",
  "deine Unabhängigkeit.",
  "Theorie heute,",
  "Autobahn morgen.",
  "Du schaffst das.",
  "Fang heute an.",
  "Jeden Tag klüger.",
  "Bald sitzt du am Steuer.",
]

const QUOTES_RIGHT = [
  "Die Prüfung wartet.",
  "Du auch?",
  "Kein Stress —",
  "lern in deinem Tempo.",
  "Der erste Versuch",
  "ist dein bester.",
  "Sommer ohne Führerschein?",
  "Nicht mit TolDrive.",
  "75 Fragen. 1 Ziel.",
  "Heute lernen,",
  "morgen bestehen.",
  "Dein Weg zur Freiheit",
  "beginnt hier.",
  "Vollgas beim Lernen.",
]

function Ticker({ quotes, duration }: { quotes: string[]; duration: number }) {
  const doubled = [...quotes, ...quotes]

  return (
    <div style={{
      overflow: 'hidden',
      height: '100%',
      padding: '0 14px',
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.8rem',
        animation: `tickerDown ${duration}s linear infinite`,
      }}>
        {doubled.map((quote, i) => (
          <div key={i} style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'rgba(232,197,71,0.6)',
            letterSpacing: '0.03em',
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
          }}>
            {quote}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function QuoteTicker({ width = 160 }: { width?: number }) {
  return (
    <>
      {/* Left ticker */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${width}px`,
        zIndex: 6,
        pointerEvents: 'none',
      }}>
        <Ticker quotes={QUOTES_LEFT} duration={30} />

        {/* Gold border — inner right edge with gap */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: '6%',
          bottom: '6%',
          width: '2px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.5) 15%, rgba(232,197,71,0.9) 50%, rgba(201,162,39,0.5) 85%, transparent 100%)',
          boxShadow: '0 0 8px rgba(201,162,39,0.3)',
        }} />
      </div>

      {/* Right ticker */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: `${width}px`,
        zIndex: 6,
        pointerEvents: 'none',
      }}>
        {/* Gold border — inner left edge with gap */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '6%',
          bottom: '6%',
          width: '2px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.5) 15%, rgba(232,197,71,0.9) 50%, rgba(201,162,39,0.5) 85%, transparent 100%)',
          boxShadow: '0 0 8px rgba(201,162,39,0.3)',
        }} />

        <Ticker quotes={QUOTES_RIGHT} duration={36} />
      </div>
    </>
  )
}
