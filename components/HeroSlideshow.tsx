'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  // Lamborghini
  { url: 'https://images.pexels.com/photos/4119601/pexels-photo-4119601.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Lamborghini', pos: 'center 40%' },
  // BMW – dunkle Autobahn
  { url: 'https://images.pexels.com/photos/31239242/pexels-photo-31239242.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'BMW', pos: 'center center' },
  // BMW – Tankstelle bei Nacht
  { url: 'https://images.pexels.com/photos/20398058/pexels-photo-20398058.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'BMW', pos: 'center 55%' },
  // Audi A5 – Nacht
  { url: 'https://images.pexels.com/photos/15469367/pexels-photo-15469367.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Audi', pos: 'center center' },
  // Mercedes – Lichtstreifen Nacht
  { url: 'https://images.pexels.com/photos/3122809/pexels-photo-3122809.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Mercedes-Benz', pos: 'center 50%' },
  // Mercedes G-Class – Nacht
  { url: 'https://images.pexels.com/photos/16139695/pexels-photo-16139695.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Mercedes-Benz', pos: 'center center' },
  // Ferrari – schwarz
  { url: 'https://images.pexels.com/photos/18433994/pexels-photo-18433994.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Ferrari', pos: 'center 45%' },
  // Ferrari – schwarz
  { url: 'https://images.pexels.com/photos/11876181/pexels-photo-11876181.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Ferrari', pos: 'center center' },
  // VW Golf – schwarz
  { url: 'https://images.pexels.com/photos/18690927/pexels-photo-18690927.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Volkswagen', pos: 'center 50%' },
  // Koenigsegg Regera
  { url: 'https://images.pexels.com/photos/9764734/pexels-photo-9764734.jpeg?auto=compress&cs=tinysrgb&w=1920', brand: 'Koenigsegg', pos: 'center center' },
]

export default function HeroSlideshow({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState<boolean[]>(Array(SLIDES.length).fill(false))
  const [showBrand, setShowBrand] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
      setShowBrand(true)
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // Brand label fades out after 2.5s
  useEffect(() => {
    const hide = setTimeout(() => setShowBrand(false), 2500)
    return () => clearTimeout(hide)
  }, [current])

  const markLoaded = (i: number) =>
    setLoaded(prev => { const n = [...prev]; n[i] = true; return n })

  return (
    <section style={{ position: 'relative', minHeight: '96vh', overflow: 'hidden', background: '#080808' }}>

      {/* Preload images (hidden) */}
      {SLIDES.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={slide.url} alt="" onLoad={() => markLoaded(i)} style={{ display: 'none' }} />
      ))}

      {/* Slide layers */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: loaded[i] ? `url(${slide.url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: slide.pos,
            opacity: i === current && loaded[i] ? 1 : 0,
            transition: 'opacity 2s ease',
            transform: i === current ? 'scale(1.04)' : 'scale(1)',
            transitionProperty: 'opacity, transform',
            transitionDuration: '2s, 12s',
            transitionTimingFunction: 'ease, ease-out',
          }}
        />
      ))}

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.68) 100%)',
          zIndex: 2,
        }}
      />

      {/* Gold brand glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 55% 50% at 50% 42%, rgba(201,162,39,0.07) 0%, transparent 65%)',
          zIndex: 3,
        }}
      />

      {/* Brand name label */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.75rem',
          zIndex: 10,
          opacity: showBrand ? 1 : 0,
          transition: 'opacity 0.8s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            padding: '5px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(201,162,39,0.3)',
          }}
        >
          {SLIDES[current].brand}
        </span>
      </div>

      {/* Slide dot indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '7px',
          zIndex: 10,
        }}
      >
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

      {/* Horizon glow line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.4) 25%, rgba(232,197,71,0.7) 50%, rgba(201,162,39,0.4) 75%, transparent 100%)',
          zIndex: 10,
        }}
      />

      {/* Content slot */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        {children}
      </div>
    </section>
  )
}
