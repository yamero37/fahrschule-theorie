'use client'

import { useState, useEffect } from 'react'
import QuoteTicker from './QuoteTicker'

// Nur Ferrari
const SLIDES = [
  { url: 'https://images.pexels.com/photos/18433994/pexels-photo-18433994.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Ferrari' },
  { url: 'https://images.pexels.com/photos/11876181/pexels-photo-11876181.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Ferrari' },
]

// Ticker-Breite — wird hier definiert damit HeroSlideshow das Auto entsprechend einrückt
const TICKER_W = 180

export default function HeroSlideshow({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0)
  const [showBrand, setShowBrand] = useState(true)

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

  return (
    <section style={{ position: 'relative', minHeight: '96vh', overflow: 'hidden', background: '#080808', display: 'flex' }}>

      {/* ── Ferrari — zentriert zwischen den Tickern ───────────── */}
      <div style={{ position: 'absolute', inset: 0 }}>

        {/* Dunkler Gradient über Bild */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, #080808 0%, #080808 32%, rgba(8,8,8,0.7) 48%, rgba(8,8,8,0.7) 52%, #080808 68%, #080808 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, transparent 18%, transparent 82%, rgba(8,8,8,0.7) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* Slides — nur im Bereich zwischen den Tickern */}
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: `${TICKER_W + 8}px`,
              right: `${TICKER_W + 8}px`,
              height: '100%',
              backgroundImage: `url(${slide.url})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              opacity: i === current ? 1 : 0,
              transition: 'opacity 2s ease',
              transform: i === current ? 'scale(1.03)' : 'scale(1)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '2s, 12s',
              transitionTimingFunction: 'ease, ease-out',
            }}
          />
        ))}
      </div>

      {/* Brand label */}
      <div style={{
        position: 'absolute',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        opacity: showBrand ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          padding: '5px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(201,162,39,0.3)',
        }}>
          {SLIDES[current].brand}
        </span>
      </div>

      {/* Horizon line */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.4) 25%, rgba(232,197,71,0.7) 50%, rgba(201,162,39,0.4) 75%, transparent 100%)',
        zIndex: 10,
      }} />

      {/* Quote tickers */}
      <QuoteTicker width={TICKER_W} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 5, width: '100%' }}>
        {children}
      </div>
    </section>
  )
}
