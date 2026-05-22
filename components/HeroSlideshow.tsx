'use client'

import { useState, useEffect } from 'react'

const SLIDES = [
  {
    url: 'https://images.pexels.com/photos/4119601/pexels-photo-4119601.jpeg?auto=compress&cs=tinysrgb&w=1920',
    pos: 'center 40%',
  },
  {
    url: 'https://images.pexels.com/photos/15469367/pexels-photo-15469367.jpeg?auto=compress&cs=tinysrgb&w=1920',
    pos: 'center center',
  },
  {
    url: 'https://images.pexels.com/photos/14908952/pexels-photo-14908952.jpeg?auto=compress&cs=tinysrgb&w=1920',
    pos: 'center 60%',
  },
  {
    url: 'https://images.pexels.com/photos/15071551/pexels-photo-15071551.jpeg?auto=compress&cs=tinysrgb&w=1920',
    pos: 'center center',
  },
]

export default function HeroSlideshow({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState<boolean[]>(Array(SLIDES.length).fill(false))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const markLoaded = (i: number) =>
    setLoaded(prev => { const n = [...prev]; n[i] = true; return n })

  return (
    <section style={{ position: 'relative', minHeight: '96vh', overflow: 'hidden', background: '#080808' }}>

      {/* Slide images */}
      {SLIDES.map((slide, i) => (
        <div key={i}>
          {/* Preload img (hidden) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.url}
            alt=""
            onLoad={() => markLoaded(i)}
            style={{ display: 'none' }}
          />
          {/* Visible background layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: loaded[i] ? `url(${slide.url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: slide.pos,
              opacity: i === current && loaded[i] ? 1 : 0,
              transition: 'opacity 1.8s ease',
              transform: i === current ? 'scale(1.04)' : 'scale(1)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '1.8s, 8s',
            }}
          />
        </div>
      ))}

      {/* Dark overlay — keeps cars subtle */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.7) 100%)',
          ].join(', '),
          zIndex: 2,
        }}
      />

      {/* Gold brand glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 55% 50% at 50% 42%, rgba(201,162,39,0.08) 0%, transparent 65%)',
          zIndex: 3,
        }}
      />

      {/* Slide dots */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 10,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === current ? 'var(--gold)' : 'rgba(201,162,39,0.35)',
              border: 'none',
              cursor: 'pointer',
              transition: 'width 0.3s, background 0.3s',
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
