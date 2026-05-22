import Link from 'next/link'
import HeroSlideshow from '@/components/HeroSlideshow'

export const metadata = { title: 'TolDrive – Führerschein Theorie' }

export default function HomePage() {
  return (
    <HeroSlideshow>
      <div
        style={{
          minHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          textAlign: 'left',
          padding: '5rem 2rem 5rem max(2rem, calc(50vw - 600px))',
        }}
      >
        <div style={{ maxWidth: '480px', width: '100%' }}>

          {/* Logo */}
          <div className="anim-1" style={{ marginBottom: '2rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Toldrive.jpeg"
              alt="TolDrive Logo"
              className="hero-logo"
              style={{
                width: 'clamp(150px, 22vw, 220px)',
                height: 'auto',
                display: 'block',
                borderRadius: '12px',
              }}
            />
          </div>

          {/* Divider */}
          <div className="anim-2" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.75rem' }}>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>◆</span>
            <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
          </div>

          {/* Headline */}
          <h1
            className="anim-3 gold-shimmer"
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Bestehe deine Theorieprüfung beim ersten Versuch.
          </h1>

          {/* Tagline */}
          <p
            className="anim-4"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '2.5rem',
              opacity: 0.85,
            }}
          >
            Sicher. Kompetent. Vertrauen.
          </p>

          {/* Buttons 2×2 */}
          <div className="anim-5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

            <Link href="/fragen" className="btn-gold" style={{ textAlign: 'center' }}>
              Jetzt lernen →
            </Link>

            <Link href="/quiz" className="btn-ghost" style={{ textAlign: 'center' }}>
              Kostenlos starten
            </Link>

            <Link href="/demo" className="btn-ghost" style={{ textAlign: 'center' }}>
              Demo starten
            </Link>

            <Link href="/register" className="btn-register" style={{ textAlign: 'center' }}>
              Registrieren
            </Link>

          </div>

        </div>
      </div>
    </HeroSlideshow>
  )
}
