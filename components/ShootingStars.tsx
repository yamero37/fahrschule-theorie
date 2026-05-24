'use client'

const STARS = [
  { top: '-4%',  left: '12%', delay: '0s',    dur: '7s',    angle: '34deg', len: 130 },
  { top: '6%',   left: '52%', delay: '2.2s',  dur: '9s',    angle: '38deg', len: 115 },
  { top: '-9%',  left: '33%', delay: '4.8s',  dur: '8s',    angle: '32deg', len: 145 },
  { top: '16%',  left: '78%', delay: '1.4s',  dur: '10s',   angle: '40deg', len: 120 },
  { top: '-2%',  left: '4%',  delay: '3.6s',  dur: '7.5s',  angle: '36deg', len: 135 },
  { top: '3%',   left: '44%', delay: '6.1s',  dur: '9.5s',  angle: '33deg', len: 125 },
  { top: '22%',  left: '66%', delay: '7.8s',  dur: '10s',   angle: '37deg', len: 110 },
  { top: '-13%', left: '85%', delay: '2.9s',  dur: '11s',   angle: '41deg', len: 138 },
  { top: '10%',  left: '25%', delay: '5.5s',  dur: '8.5s',  angle: '35deg', len: 122 },
  { top: '35%',  left: '90%', delay: '0.8s',  dur: '12s',   angle: '39deg', len: 108 },
  { top: '-6%',  left: '70%', delay: '9.3s',  dur: '9s',    angle: '36deg', len: 118 },
  { top: '28%',  left: '15%', delay: '11s',   dur: '10.5s', angle: '33deg', len: 128 },
]

const css = STARS.map((_, i) => `
  @keyframes star${i} {
    0%   { transform: rotate(${STARS[i].angle}) translateX(-350px); opacity: 0; }
    6%   { opacity: 0.28; }
    70%  { opacity: 0.12; }
    100% { transform: rotate(${STARS[i].angle}) translateX(2600px); opacity: 0; }
  }
`).join('')

export default function ShootingStars() {
  return (
    <>
      <style>{css}</style>
      <div className="shooting-stars" style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 1, overflow: 'hidden',
      }}>
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: `${s.len}px`,
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(201,139,122,0.45) 40%, rgba(232,190,175,0.22) 72%, transparent 100%)',
              filter: 'blur(3px)',
              borderRadius: '2px',
              animation: `star${i} ${s.dur} ${s.delay} linear infinite`,
            }}
          />
        ))}
      </div>
    </>
  )
}
