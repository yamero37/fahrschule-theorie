'use client'

import { useState, useEffect } from 'react'
import QuoteTicker from './QuoteTicker'
import { useIsMobile } from '@/hooks/useIsMobile'

const SLIDES = [
  { url: 'https://images.pexels.com/photos/18433994/pexels-photo-18433994.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Ferrari' },
  { url: 'https://images.pexels.com/photos/11876181/pexels-photo-11876181.jpeg?auto=compress&cs=tinysrgb&w=1600', brand: 'Ferrari' },
]

const TICKER_W = 180
const AVATAR_W = 150

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
          background: 'linear-gradient(to right, #080808 0%, #080808 32%, rgba(8,8,8,0.7) 48%, rgba(8,8,8,0.7) 52%, #080808 68%, #080808 100%)',
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
            right: `${TICKER_W + AVATAR_W + 8}px`,
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

      {/* Avatar zwischen Ferrari und rechtem Ticker */}
      <div style={{
        position: 'absolute',
        right: `${TICKER_W + 8}px`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: `${AVATAR_W - 6}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 7,
        pointerEvents: 'none',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/avatar.jpeg" alt="Fahrlehrer" style={{
          width: '120px', height: '120px',
          objectFit: 'cover', objectPosition: 'center top',
          borderRadius: '50%',
          border: '2px solid rgba(201,162,39,0.7)',
          boxShadow: '0 0 20px rgba(201,162,39,0.35), 0 0 40px rgba(201,162,39,0.12)',
          background: '#fff',
        }} />
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(201,162,39,0.75)',
          textAlign: 'center', lineHeight: 1.4,
        }}>
          Dein<br />Fahrlehrer
        </span>
      </div>

      <QuoteTicker width={TICKER_W} />

      <div style={{ position: 'relative', zIndex: 5, width: '100%' }}>{children}</div>
    </section>
  )
}
