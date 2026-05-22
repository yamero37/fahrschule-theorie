'use client'

import { useState, useEffect } from 'react'
import QuoteTicker from './QuoteTicker'
import { useIsMobile } from '@/hooks/useIsMobile'

const SLIDES = [
  { url: 'https://images.pexels.com/photos/18433994/pexels-photo-18433994.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Ferrari' },
  { url: 'https://images.pexels.com/photos/11876181/pexels-photo-11876181.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Ferrari' },
  { url: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Lamborghini' },
  { url: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Lamborghini' },
  { url: 'https://images.pexels.com/photos/1719648/pexels-photo-1719648.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'McLaren' },
  { url: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Porsche' },
  { url: 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'BMW' },
  { url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Sportwagen' },
]

const TICKER_W = 180
const RIGHT_PANEL_W = 260

export default function HeroSlideshow({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0)
  const [showBrand, setShowBrand] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
      setShowBrand(true)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const hide = setTimeout(() => setShowBrand(false), 2500)
    return () => clearTimeout(hide)
  }, [current])

  /* ── Mobile ──────────────────────────────────────────── */
  if (isMobile) {
    return (
      <section style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', background: '#080808' }}>

        {/* Ferrari sehr dunkel im Hintergrund */}
        {SLIDES.map((slide, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: i === current ? 0.25 : 0,
            transition: 'opacity 2s ease',
          }} />
        ))}

        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.7)', zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 45%, rgba(201,162,39,0.07) 0%, transparent 65%)', zIndex: 2 }} />

        {/* Horizon line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.5) 30%, rgba(232,197,71,0.8) 50%, rgba(201,162,39,0.5) 70%, transparent)', zIndex: 5 }} />

        <div style={{ position: 'relative', zIndex: 3 }}>{children}</div>
      </section>
    )
  }

  /* ── Desktop ─────────────────────────────────────────── */
  return (
    <section style={{ position: 'relative', minHeight: '96vh', overflow: 'hidden', background: '#080808', display: 'flex' }}>

      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #080808 0%, #080808 14%, transparent 28%, transparent 72%, #080808 86%, #080808 100%)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, transparent 18%, transparent 82%, rgba(8,8,8,0.7) 100%)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {SLIDES.map((slide, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 0,
            left: `${TICKER_W + 8}px`,
            right: `${RIGHT_PANEL_W}px`,
            height: '100%',
            backgroundImage: `url(${slide.url})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 30%',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 2s ease',
            transform: i === current ? 'scale(1.03)' : 'scale(1)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '2s, 12s',
            transitionTimingFunction: 'ease, ease-out',
          }} />
        ))}
      </div>

      {/* Brand label */}
      <div style={{
        position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, opacity: showBrand ? 1 : 0, transition: 'opacity 0.8s ease',
      }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--gold)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(201,162,39,0.3)',
        }}>
          {SLIDES[current].brand}
        </span>
      </div>

      {/* Horizon line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.4) 25%, rgba(232,197,71,0.7) 50%, rgba(201,162,39,0.4) 75%, transparent 100%)',
        zIndex: 10,
      }} />

      {/* Rechtes Panel: Avatar + Über mich Text */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: `${RIGHT_PANEL_W}px`,
        zIndex: 7,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 18px',
        gap: '1rem',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {/* Gold border — linke Kante */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '6%',
          bottom: '6%',
          width: '2px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.5) 15%, rgba(232,197,71,0.9) 50%, rgba(201,162,39,0.5) 85%, transparent 100%)',
          boxShadow: '0 0 8px rgba(201,162,39,0.3)',
        }} />

        {/* Avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/avatar.jpeg" alt="Tolga" style={{
          width: '110px', height: '110px',
          objectFit: 'cover', objectPosition: 'center top',
          borderRadius: '50%',
          border: '2px solid rgba(201,162,39,0.7)',
          boxShadow: '0 0 20px rgba(201,162,39,0.35), 0 0 40px rgba(201,162,39,0.12)',
          background: '#fff',
          flexShrink: 0,
        }} />

        <span style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(201,162,39,0.8)',
          textAlign: 'center',
        }}>
          Dein Fahrlehrer
        </span>

        {/* Über mich Text */}
        <p style={{
          fontSize: '0.68rem',
          color: 'rgba(245,234,208,0.5)',
          lineHeight: 1.65,
          textAlign: 'center',
          margin: 0,
        }}>
          Hey, ich bin Tolga, 28 Jahre alt und seit über 6 Jahren leidenschaftlicher Fahrlehrer.
          <br /><br />
          Mit dieser Seite möchte ich Menschen wie dir helfen, motivieren und auf dem Weg zum Führerschein unterstützen.
          <br /><br />
          Ich weiß aus eigener Erfahrung, dass die Theorie manchmal anstrengend wirken kann – genau deshalb habe ich diese Plattform erstellt.
          <br /><br />
          Egal ob Tipps oder Theoriefragen – hier findest du alles, was dir hilft. 🚗
        </p>

        {/* Social Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', pointerEvents: 'auto' }}>
          <a
            href="https://www.instagram.com/tolga_ar/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--gold)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              textShadow: '0 0 10px rgba(201,162,39,0.6), 0 0 20px rgba(201,162,39,0.3)',
              transition: 'text-shadow 0.3s, color 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.textShadow = '0 0 16px rgba(232,197,71,0.9), 0 0 32px rgba(201,162,39,0.5)'
              e.currentTarget.style.color = 'var(--gold-light)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.textShadow = '0 0 10px rgba(201,162,39,0.6), 0 0 20px rgba(201,162,39,0.3)'
              e.currentTarget.style.color = 'var(--gold)'
            }}
          >
            📷 @tolga_ar
          </a>
          <a
            href="https://www.tiktok.com/@fahrlehrertolga"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--gold)',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              textShadow: '0 0 10px rgba(201,162,39,0.6), 0 0 20px rgba(201,162,39,0.3)',
              transition: 'text-shadow 0.3s, color 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.textShadow = '0 0 16px rgba(232,197,71,0.9), 0 0 32px rgba(201,162,39,0.5)'
              e.currentTarget.style.color = 'var(--gold-light)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.textShadow = '0 0 10px rgba(201,162,39,0.6), 0 0 20px rgba(201,162,39,0.3)'
              e.currentTarget.style.color = 'var(--gold)'
            }}
          >
            🎵 @fahrlehrertolga
          </a>
        </div>
      </div>

      <QuoteTicker width={TICKER_W} />

      <div style={{ position: 'relative', zIndex: 5, width: '100%' }}>{children}</div>
    </section>
  )
}
