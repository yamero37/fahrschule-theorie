'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  { url: 'https://images.pexels.com/photos/4119601/pexels-photo-4119601.jpeg?auto=compress&cs=tinysrgb&w=1600',    brand: 'Lamborghini' },
  { url: 'https://images.pexels.com/photos/31239242/pexels-photo-31239242.jpeg?auto=compress&cs=tinysrgb&w=1600',  brand: 'BMW' },
  { url: 'https://images.pexels.com/photos/20398058/pexels-photo-20398058.jpeg?auto=compress&cs=tinysrgb&w=1600',  brand: 'BMW' },
  { url: 'https://images.pexels.com/photos/15469367/pexels-photo-15469367.jpeg?auto=compress&cs=tinysrgb&w=1600',  brand: 'Audi' },
  { url: 'https://images.pexels.com/photos/3122809/pexels-photo-3122809.jpeg?auto=compress&cs=tinysrgb&w=1600',    brand: 'Mercedes-Benz' },
  { url: 'https://images.pexels.com/photos/16139695/pexels-photo-16139695.jpeg?auto=compress&cs=tinysrgb&w=1600',  brand: 'Mercedes-Benz' },
  { url: 'https://images.pexels.com/photos/18433994/pexels-photo-18433994.jpeg?auto=compress&cs=tinysrgb&w=1600',  brand: 'Ferrari' },
  { url: 'https://images.pexels.com/photos/11876181/pexels-photo-11876181.jpeg?auto=compress&cs=tinysrgb&w=1600',  brand: 'Ferrari' },
  { url: 'https://images.pexels.com/photos/18690927/pexels-photo-18690927.jpeg?auto=compress&cs=tinysrgb&w=1600',  brand: 'Volkswagen' },
  { url: 'https://images.pexels.com/photos/9764734/pexels-photo-9764734.jpeg?auto=compress&cs=tinysrgb&w=1600',    brand: 'Koenigsegg' },
]

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

      {/* ── Car image panel (right 55%) ─────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {/* Left dark gradient — text area */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, #080808 0%, #080808 38%, rgba(8,8,8,0.85) 52%, rgba(8,8,8,0.15) 72%, transparent 88%)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* Top & bottom fade */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, transparent 20%, transparent 80%, rgba(8,8,8,0.7) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* Slides — object-fit contain so full car is visible */}
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '62%',
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
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.75rem',
          zIndex: 10,
          opacity: showBrand ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
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

      {/* Dot indicators */}
      <div style={{
        position: 'absolute',
        bottom: '1.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '7px',
        zIndex: 10,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setShowBrand(true) }}
            style={{
              width: i === current ? '22px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === current ? 'var(--gold)' : 'rgba(201,162,39,0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: 'width 0.35s ease, background 0.3s',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Horizon line */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.4) 25%, rgba(232,197,71,0.7) 50%, rgba(201,162,39,0.4) 75%, transparent 100%)',
        zIndex: 10,
      }} />

      {/* Content slot */}
      <div style={{ position: 'relative', zIndex: 5, width: '100%' }}>
        {children}
      </div>
    </section>
  )
}
