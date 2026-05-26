'use client'

import { useState, useEffect } from 'react'

const CARS = [
  'https://images.unsplash.com/photo-1562141961-b5d1dfb57448?w=1920&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1761554619924-627006522506?w=1920&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1742815734568-03b1f2fd03e3?w=1920&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1750712347796-4f05affe7814?w=1920&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626141892008-498eacf87c79?w=1920&q=75&auto=format&fit=crop',
]

export default function CarSlideshow() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % CARS.length)
        setVisible(true)
      }, 1200)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      {/* Car image */}
      <div
        style={{
          position: 'absolute',
          inset: '-8%',
          backgroundImage: `url(${CARS[idx]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(14px) brightness(0.28) saturate(0.5)',
          transform: 'scale(1.05)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      />
      {/* Dark gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.3) 50%, rgba(8,8,8,0.65) 100%)',
      }} />
      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '6px', zIndex: 2,
      }}>
        {CARS.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? '20px' : '6px',
            height: '6px',
            borderRadius: '3px',
            background: i === idx ? 'var(--gold)' : 'var(--border)',
            transition: 'all 0.4s ease',
            boxShadow: i === idx ? '0 0 8px rgba(var(--gold-rgb),0.5)' : 'none',
          }} />
        ))}
      </div>
    </div>
  )
}
