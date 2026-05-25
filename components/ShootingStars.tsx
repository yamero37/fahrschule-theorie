'use client'

/* ── Sternschnuppen ── */
const METEORS = [
  { top: '-4%',  left: '12%', delay: '0s',    dur: '6s',    angle: '34deg', len: 160, color: 'rgba(216,179,106,' },
  { top: '6%',   left: '52%', delay: '2.2s',  dur: '8s',    angle: '38deg', len: 130, color: 'rgba(180,200,255,' },
  { top: '-9%',  left: '33%', delay: '4.8s',  dur: '7s',    angle: '32deg', len: 175, color: 'rgba(216,179,106,' },
  { top: '16%',  left: '78%', delay: '1.4s',  dur: '9s',    angle: '40deg', len: 140, color: 'rgba(255,255,255,' },
  { top: '-2%',  left: '4%',  delay: '3.6s',  dur: '6.5s',  angle: '36deg', len: 155, color: 'rgba(216,179,106,' },
  { top: '3%',   left: '44%', delay: '6.1s',  dur: '8.5s',  angle: '33deg', len: 145, color: 'rgba(180,200,255,' },
  { top: '22%',  left: '66%', delay: '7.8s',  dur: '9s',    angle: '37deg', len: 125, color: 'rgba(255,220,180,' },
  { top: '-13%', left: '85%', delay: '2.9s',  dur: '10s',   angle: '41deg', len: 158, color: 'rgba(216,179,106,' },
  { top: '10%',  left: '25%', delay: '5.5s',  dur: '7.5s',  angle: '35deg', len: 135, color: 'rgba(255,255,255,' },
  { top: '35%',  left: '90%', delay: '0.8s',  dur: '11s',   angle: '39deg', len: 120, color: 'rgba(180,200,255,' },
  { top: '-6%',  left: '70%', delay: '9.3s',  dur: '8s',    angle: '36deg', len: 148, color: 'rgba(216,179,106,' },
  { top: '28%',  left: '15%', delay: '11s',   dur: '9.5s',  angle: '33deg', len: 138, color: 'rgba(255,255,255,' },
  { top: '-8%',  left: '58%', delay: '1.0s',  dur: '7s',    angle: '42deg', len: 165, color: 'rgba(255,220,180,' },
  { top: '45%',  left: '40%', delay: '8.5s',  dur: '10s',   angle: '30deg', len: 110, color: 'rgba(216,179,106,' },
  { top: '-3%',  left: '92%', delay: '13s',   dur: '8.5s',  angle: '38deg', len: 142, color: 'rgba(180,200,255,' },
  { top: '18%',  left: '2%',  delay: '4.2s',  dur: '9s',    angle: '35deg', len: 128, color: 'rgba(216,179,106,' },
  { top: '-15%', left: '47%', delay: '12.4s', dur: '7.5s',  angle: '44deg', len: 152, color: 'rgba(255,255,255,' },
  { top: '55%',  left: '72%', delay: '6.7s',  dur: '12s',   angle: '31deg', len: 118, color: 'rgba(216,179,106,' },
  { top: '0%',   left: '20%', delay: '15s',   dur: '8s',    angle: '37deg', len: 140, color: 'rgba(180,200,255,' },
  { top: '40%',  left: '55%', delay: '3.1s',  dur: '11s',   angle: '36deg', len: 132, color: 'rgba(255,220,180,' },
  { top: '-7%',  left: '38%', delay: '16.5s', dur: '7s',    angle: '40deg', len: 158, color: 'rgba(216,179,106,' },
  { top: '30%',  left: '8%',  delay: '9.8s',  dur: '10s',   angle: '34deg', len: 144, color: 'rgba(255,255,255,' },
  { top: '-11%', left: '62%', delay: '0.5s',  dur: '9.5s',  angle: '43deg', len: 136, color: 'rgba(216,179,106,' },
  { top: '50%',  left: '88%', delay: '14.2s', dur: '8s',    angle: '35deg', len: 126, color: 'rgba(180,200,255,' },
]

/* ── Funkelnde Sterne (statische Punkte) ── */
const SPARKLES = [
  { top: '8%',   left: '18%',  size: 2.5, delay: '0s',    dur: '2.8s'  },
  { top: '14%',  left: '72%',  size: 2,   delay: '0.6s',  dur: '3.2s'  },
  { top: '25%',  left: '38%',  size: 3,   delay: '1.2s',  dur: '2.5s'  },
  { top: '5%',   left: '55%',  size: 1.5, delay: '1.8s',  dur: '3.8s'  },
  { top: '42%',  left: '88%',  size: 2,   delay: '0.3s',  dur: '2.2s'  },
  { top: '60%',  left: '22%',  size: 2.5, delay: '2.4s',  dur: '3.5s'  },
  { top: '32%',  left: '62%',  size: 1.5, delay: '0.9s',  dur: '4.0s'  },
  { top: '70%',  left: '45%',  size: 2,   delay: '1.5s',  dur: '2.7s'  },
  { top: '18%',  left: '92%',  size: 3,   delay: '3.0s',  dur: '3.1s'  },
  { top: '80%',  left: '10%',  size: 2,   delay: '0.4s',  dur: '2.9s'  },
  { top: '48%',  left: '30%',  size: 1.5, delay: '2.1s',  dur: '3.6s'  },
  { top: '90%',  left: '65%',  size: 2.5, delay: '1.0s',  dur: '2.4s'  },
  { top: '55%',  left: '78%',  size: 2,   delay: '3.5s',  dur: '3.3s'  },
  { top: '22%',  left: '5%',   size: 1.5, delay: '0.7s',  dur: '4.2s'  },
  { top: '75%',  left: '50%',  size: 3,   delay: '2.8s',  dur: '2.6s'  },
  { top: '38%',  left: '15%',  size: 2,   delay: '1.3s',  dur: '3.0s'  },
  { top: '12%',  left: '42%',  size: 2.5, delay: '4.0s',  dur: '2.8s'  },
  { top: '65%',  left: '85%',  size: 1.5, delay: '0.2s',  dur: '3.7s'  },
  { top: '85%',  left: '28%',  size: 2,   delay: '2.6s',  dur: '2.3s'  },
  { top: '52%',  left: '58%',  size: 2.5, delay: '1.7s',  dur: '3.4s'  },
  { top: '7%',   left: '80%',  size: 2,   delay: '3.2s',  dur: '2.9s'  },
  { top: '95%',  left: '40%',  size: 1.5, delay: '0.8s',  dur: '3.8s'  },
  { top: '20%',  left: '25%',  size: 3,   delay: '4.5s',  dur: '2.5s'  },
  { top: '44%',  left: '70%',  size: 2,   delay: '1.1s',  dur: '3.1s'  },
  { top: '78%',  left: '95%',  size: 2.5, delay: '2.3s',  dur: '2.7s'  },
  { top: '30%',  left: '48%',  size: 1.5, delay: '3.8s',  dur: '4.1s'  },
  { top: '68%',  left: '12%',  size: 2,   delay: '0.5s',  dur: '3.3s'  },
  { top: '3%',   left: '33%',  size: 2.5, delay: '1.9s',  dur: '2.6s'  },
  { top: '88%',  left: '75%',  size: 1.5, delay: '2.9s',  dur: '3.5s'  },
  { top: '58%',  left: '2%',   size: 2,   delay: '4.3s',  dur: '2.8s'  },
  { top: '15%',  left: '60%',  size: 3,   delay: '0.1s',  dur: '3.9s'  },
  { top: '35%',  left: '95%',  size: 2,   delay: '3.6s',  dur: '2.4s'  },
  { top: '72%',  left: '35%',  size: 2.5, delay: '1.4s',  dur: '3.2s'  },
  { top: '92%',  left: '52%',  size: 1.5, delay: '2.2s',  dur: '4.0s'  },
  { top: '47%',  left: '20%',  size: 2,   delay: '0.6s',  dur: '2.7s'  },
]

const meteorCss = METEORS.map((s, i) => `
  @keyframes meteor${i} {
    0%   { transform: rotate(${s.angle}) translateX(-400px); opacity: 0; }
    5%   { opacity: 0.9; }
    60%  { opacity: 0.4; }
    100% { transform: rotate(${s.angle}) translateX(2800px); opacity: 0; }
  }
`).join('')

const sparkleCss = `
  @keyframes sparkle {
    0%,100% { opacity: 0; transform: scale(0.4); }
    50%      { opacity: 1; transform: scale(1); }
  }
  @keyframes sparkleCross {
    0%,100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
    50%      { opacity: 0.85; transform: scale(1) rotate(45deg); }
  }
`

export default function ShootingStars() {
  return (
    <>
      <style>{meteorCss + sparkleCss}</style>
      <div style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 1, overflow: 'hidden',
      }}>
        {/* ── Sternschnuppen ── */}
        {METEORS.map((s, i) => (
          <div key={`m${i}`} style={{ position: 'absolute', top: s.top, left: s.left }}>
            {/* Schweif */}
            <div style={{
              width: `${s.len}px`,
              height: '1.8px',
              background: `linear-gradient(90deg, transparent 0%, ${s.color}0.6) 35%, ${s.color}0.3) 70%, transparent 100%)`,
              filter: 'blur(2.5px)',
              borderRadius: '2px',
              animation: `meteor${i} ${s.dur} ${s.delay} linear infinite`,
            }} />
            {/* Kopf-Glühen */}
            <div style={{
              position: 'absolute',
              top: '-3px', left: `${s.len * 0.35}px`,
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: s.color.replace('rgba(', 'radial-gradient(circle, ').replace(',', '') + '0.9) 0%, transparent 70%)',
              filter: 'blur(3px)',
              animation: `meteor${i} ${s.dur} ${s.delay} linear infinite`,
            }} />
          </div>
        ))}

        {/* ── Funkelnde Sterne ── */}
        {SPARKLES.map((s, i) => (
          <div key={`sp${i}`} style={{
            position: 'absolute',
            top: s.top, left: s.left,
            animation: `sparkle ${s.dur} ${s.delay} ease-in-out infinite`,
          }}>
            {/* Kern */}
            <div style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: '50%',
              background: i % 3 === 0
                ? 'rgba(216,179,106,0.95)'
                : i % 3 === 1
                  ? 'rgba(200,220,255,0.95)'
                  : 'rgba(255,255,255,0.95)',
              boxShadow: i % 3 === 0
                ? `0 0 ${s.size * 3}px ${s.size}px rgba(216,179,106,0.5)`
                : i % 3 === 1
                  ? `0 0 ${s.size * 3}px ${s.size}px rgba(180,200,255,0.5)`
                  : `0 0 ${s.size * 3}px ${s.size}px rgba(255,255,255,0.4)`,
            }} />
            {/* Kreuz-Strahlen (nur bei großen Sternen) */}
            {s.size >= 2.5 && (
              <>
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${s.size * 5}px`,
                  height: '1px',
                  background: i % 3 === 0
                    ? 'linear-gradient(90deg, transparent, rgba(216,179,106,0.6), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(200,220,255,0.6), transparent)',
                  animation: `sparkleCross ${s.dur} ${s.delay} ease-in-out infinite`,
                }} />
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '1px',
                  height: `${s.size * 5}px`,
                  background: i % 3 === 0
                    ? 'linear-gradient(180deg, transparent, rgba(216,179,106,0.6), transparent)'
                    : 'linear-gradient(180deg, transparent, rgba(200,220,255,0.6), transparent)',
                  animation: `sparkleCross ${s.dur} ${s.delay} ease-in-out infinite`,
                }} />
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
