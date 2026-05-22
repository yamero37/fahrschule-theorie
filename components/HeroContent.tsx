'use client'

import Link from 'next/link'
import { useIsMobile } from '@/hooks/useIsMobile'

interface Props {
  totalQuestions: number
  topicsCount: number
}

export default function HeroContent({ totalQuestions, topicsCount }: Props) {
  const isMobile = useIsMobile()

  return (
    <div style={{
      minHeight: isMobile ? '100svh' : '96vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMobile ? 'center' : 'flex-start',
      justifyContent: 'center',
      textAlign: isMobile ? 'center' : 'left',
      padding: isMobile
        ? '5rem 1.5rem 5rem'
        : '5rem 2rem 5rem max(2rem, calc(50vw - 600px))',
    }}>
      <div style={{ maxWidth: isMobile ? '100%' : '480px', width: '100%' }}>

        {/* Avatar — nur mobile, über dem Logo */}
        {isMobile && (
          <div className="anim-1" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/avatar.jpeg" alt="Fahrlehrer" style={{
              width: '80px', height: '80px',
              objectFit: 'cover', objectPosition: 'center top',
              borderRadius: '50%',
              border: '2px solid rgba(201,162,39,0.6)',
              boxShadow: '0 0 16px rgba(201,162,39,0.3)',
              background: '#fff',
            }} />
          </div>
        )}

        {/* TolDrive Logo */}
        <div className="anim-1" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Toldrive.jpeg" alt="TolDrive Logo" className="hero-logo" style={{
            width: isMobile ? '140px' : 'clamp(150px, 22vw, 220px)',
            height: 'auto',
            display: 'block',
            borderRadius: '12px',
          }} />
        </div>

        {/* Divider */}
        <div className="anim-2" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'flex-start',
          gap: '12px', marginBottom: '1.5rem',
        }}>
          <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
          <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>◆</span>
          <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
        </div>

        {/* Headline */}
        <h1 className="anim-3 gold-shimmer" style={{
          fontSize: isMobile ? 'clamp(1.5rem, 7vw, 2rem)' : 'clamp(1.6rem, 3.5vw, 2.6rem)',
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          marginBottom: '1rem',
        }}>
          Bestehe deine Theorieprüfung beim ersten Versuch.
        </h1>

        {/* Tagline */}
        <p className="anim-4" style={{
          fontSize: '0.68rem', fontWeight: 700,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: '0.75rem', opacity: 0.85,
        }}>
          Sicher. Kompetent. Vertrauen.
        </p>

        {/* Stats */}
        <p className="anim-5" style={{
          fontSize: '0.82rem', color: 'rgba(245,234,208,0.55)',
          marginBottom: '2.25rem',
        }}>
          {totalQuestions} Lernfragen &nbsp;·&nbsp; {topicsCount} Themen &nbsp;·&nbsp; Keine Anmeldung
        </p>

        {/* Buttons */}
        <div className="anim-6" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: isMobile ? '320px' : '400px',
          margin: isMobile ? '0 auto' : '0',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link href="/login" className="btn-ghost" style={{ textAlign: 'center' }}>
              Anmelden
            </Link>
            <Link href="/register" className="btn-gold" style={{ textAlign: 'center' }}>
              Registrieren →
            </Link>
          </div>
          <Link href="/demo" style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            padding: '0.5rem',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Demo starten (1 Stunde, kostenlos)
          </Link>
        </div>

      </div>
    </div>
  )
}
