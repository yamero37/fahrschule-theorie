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
    <div style={{ overflow: 'hidden', height: '100%', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.6rem',
          animation: `tickerDown ${duration}s linear infinite`,
        }}
      >
        {doubled.map((quote, i) => (
          <div
            key={i}
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'rgba(201,162,39,0.45)',
              letterSpacing: '0.04em',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              writingMode: 'horizontal-tb',
            }}
          >
            {quote}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function QuoteTicker() {
  return (
    <>
      {/* Left ticker */}
      <div style={{
        position: 'absolute',
        left: '1.5rem',
        top: 0,
        bottom: 0,
        width: '140px',
        zIndex: 6,
        display: 'flex',
        alignItems: 'stretch',
        pointerEvents: 'none',
      }}>
        <Ticker quotes={QUOTES_LEFT} duration={30} />
        {/* Right border of left ticker */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: '8%',
          bottom: '8%',
          width: '1px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.6) 20%, rgba(232,197,71,0.8) 50%, rgba(201,162,39,0.6) 80%, transparent 100%)',
        }} />
      </div>

      {/* Right ticker */}
      <div style={{
        position: 'absolute',
        right: '1.5rem',
        top: 0,
        bottom: 0,
        width: '140px',
        zIndex: 6,
        display: 'flex',
        alignItems: 'stretch',
        pointerEvents: 'none',
      }}>
        {/* Left border of right ticker */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '8%',
          bottom: '8%',
          width: '1px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.6) 20%, rgba(232,197,71,0.8) 50%, rgba(201,162,39,0.6) 80%, transparent 100%)',
        }} />
        <Ticker quotes={QUOTES_RIGHT} duration={36} />
      </div>
    </>
  )
}
