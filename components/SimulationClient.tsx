'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ─── Phase Flow ─────────────────────────────────────────── */
type Phase = 'scene' | 'approaching' | 'stopped' | 'speaking' | 'ready'

const GREETING = 'Hallo, ich heiße Tars und ich bin dein heutiger Prüfer.'

/* ─── Static star positions (no Math.random on server) ─── */
const STARS = [
  {x:14,y:6,r:1,o:0.5},{x:38,y:14,r:1.5,o:0.7},{x:62,y:4,r:1,o:0.45},{x:90,y:18,r:1,o:0.6},
  {x:118,y:8,r:2,o:0.8},{x:145,y:22,r:1,o:0.4},{x:170,y:11,r:1.5,o:0.65},{x:198,y:5,r:1,o:0.5},
  {x:226,y:19,r:1,o:0.55},{x:255,y:9,r:1.5,o:0.7},{x:282,y:24,r:1,o:0.45},{x:310,y:6,r:2,o:0.75},
  {x:338,y:16,r:1,o:0.5},{x:365,y:8,r:1.5,o:0.6},{x:385,y:20,r:1,o:0.4},
  {x:22,y:38,r:1,o:0.35},{x:58,y:44,r:1.5,o:0.6},{x:96,y:32,r:1,o:0.5},{x:134,y:48,r:1,o:0.45},
  {x:172,y:36,r:1.5,o:0.65},{x:210,y:42,r:1,o:0.4},{x:248,y:30,r:2,o:0.7},{x:286,y:46,r:1,o:0.5},
  {x:324,y:38,r:1.5,o:0.55},{x:362,y:44,r:1,o:0.4},{x:44,y:58,r:1,o:0.35},{x:88,y:52,r:1.5,o:0.6},
  {x:132,y:62,r:1,o:0.45},{x:176,y:54,r:1,o:0.5},{x:220,y:60,r:1.5,o:0.65},{x:264,y:50,r:1,o:0.4},
  {x:308,y:58,r:2,o:0.7},{x:352,y:54,r:1,o:0.5},
]

export default function SimulationClient() {
  const [phase, setPhase] = useState<Phase>('scene')
  const [typed,  setTyped]  = useState(0)

  /* Phase sequence */
  useEffect(() => {
    const t = setTimeout(() => setPhase('approaching'), 900)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'approaching') return
    const t = setTimeout(() => setPhase('stopped'), 3200)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'stopped') return
    const t = setTimeout(() => setPhase('speaking'), 500)
    return () => clearTimeout(t)
  }, [phase])

  /* Typewriter */
  useEffect(() => {
    if (phase !== 'speaking') return
    if (typed >= GREETING.length) { setPhase('ready'); return }
    const ch = GREETING[typed]
    const delay = ch === '.' ? 320 : ch === ',' ? 160 : 42
    const t = setTimeout(() => setTyped(i => i + 1), delay)
    return () => clearTimeout(t)
  }, [phase, typed])

  const charVisible    = phase !== 'scene'
  const isApproaching  = phase === 'approaching'
  const showDialogue   = phase === 'speaking' || phase === 'ready'
  const showContinue   = phase === 'ready'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(180deg, #020810 0%, #060e1e 30%, #0a1628 60%, #0d2035 100%)',
      overflow: 'hidden',
      fontFamily: 'inherit',
    }}>

      {/* ── Back button ── */}
      <Link href="/dashboard" style={{
        position: 'absolute', top: '1rem', left: '1rem', zIndex: 200,
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.55)', fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
      }}>←</Link>

      {/* ── Label top-right ── */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem', zIndex: 200,
        padding: '4px 10px', borderRadius: '8px',
        background: 'rgba(20,100,190,0.2)', border: '1px solid rgba(20,100,190,0.35)',
        fontSize: '0.58rem', fontWeight: 800, color: '#60b4ff', letterSpacing: '0.1em',
      }}>⚠ PRÜFUNGSMODUS</div>

      {/* ── Stars SVG ── */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'55%', pointerEvents:'none' }}>
        {STARS.map((s,i) => (
          <circle key={i} cx={`${(s.x/390)*100}%`} cy={`${(s.y/160)*100}%`} r={s.r} fill="white" opacity={s.o}>
            <animate attributeName="opacity"
              values={`${s.o};${s.o*0.25};${s.o}`}
              dur={`${2.2 + (i%6)*0.55}s`} repeatCount="indefinite"/>
          </circle>
        ))}
      </svg>

      {/* ── Moon ── */}
      <div style={{
        position:'absolute', top:'6%', right:'10%',
        width:'44px', height:'44px', borderRadius:'50%',
        background:'radial-gradient(circle at 35% 35%, #f2eacc, #c8b840)',
        boxShadow:'0 0 36px 10px rgba(235,220,140,0.22)',
      }}/>

      {/* ── Main scene SVG ── */}
      <svg
        viewBox="0 0 390 420"
        preserveAspectRatio="xMidYMax meet"
        style={{ position:'absolute', bottom:'6%', left:0, width:'100%', pointerEvents:'none' }}
      >
        <defs>
          <linearGradient id="simGround" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10202e"/>
            <stop offset="100%" stopColor="#080f1a"/>
          </linearGradient>
          <linearGradient id="simRoad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#18263a"/>
            <stop offset="100%" stopColor="#0c1828"/>
          </linearGradient>
          <radialGradient id="buildLight" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="rgba(20,100,190,0.12)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Distant city silhouette */}
        <path d="M0,200 L0,230 L20,230 L20,210 L35,210 L35,195 L50,195 L50,220 L70,220 L70,205
                 L80,205 L80,180 L90,180 L90,215 L105,215 L105,200 L120,200 L120,225 L140,225
                 L140,190 L150,190 L150,175 L160,175 L160,195 L175,195 L175,210 L190,210
                 L190,185 L200,185 L200,230 L390,230 L390,200 L370,200 L370,215 L355,215
                 L355,195 L340,195 L340,210 L325,210 L325,180 L310,180 L310,210 L295,210
                 L295,195 L280,195 L280,215 L265,215 L265,200 L250,200 L250,220 L235,220
                 L235,205 L220,205 L220,190 Z"
          fill="#0a1625" stroke="none"/>

        {/* Ground plane */}
        <rect x="0" y="295" width="390" height="130" fill="url(#simGround)"/>
        {/* Road */}
        <rect x="0" y="335" width="390" height="65" fill="url(#simRoad)"/>
        <line x1="0" y1="335" x2="390" y2="335" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
        {/* Dashed lane markings */}
        {[15,55,95,135,175,215,255,295,335,375].map(x => (
          <rect key={x} x={x} y="364" width="30" height="4" rx="2" fill="rgba(255,255,255,0.18)"/>
        ))}
        {/* Curb */}
        <rect x="0" y="395" width="390" height="3" rx="1" fill="rgba(255,255,255,0.07)"/>

        {/* Parking lot lines */}
        {[50,100,150,200,250,300,350].map(x => (
          <line key={x} x1={x} y1="295" x2={x} y2="335" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        ))}

        {/* ═══ TARS-STATION BUILDING ═══ */}
        {/* Ground light under building */}
        <ellipse cx="128" cy="300" rx="90" ry="10" fill="url(#buildLight)"/>

        {/* Building main structure */}
        <rect x="28" y="62" width="196" height="240" rx="4" fill="#0c1c32" stroke="#1a3254" strokeWidth="1.5"/>
        {/* Glass facade overlay */}
        <rect x="32" y="66" width="188" height="232" rx="2" fill="#0d1e30"/>
        {/* Facade reflection */}
        <path d="M32,66 L32,220 L85,66 Z" fill="rgba(255,255,255,0.015)"/>

        {/* Structural columns */}
        {[40,72,104,136,168,196].map((x,i) => (
          <rect key={i} x={x} y="66" width="3" height="232" rx="1" fill="rgba(255,255,255,0.04)"/>
        ))}

        {/* Windows - 8 rows × 5 cols */}
        {Array.from({length:8}, (_,row) =>
          [40,70,100,130,170].map((x, col) => {
            const skip = (row*5+col) % 9 === 0 || (row*5+col) % 13 === 0
            const warm = (row + col) % 3 === 0
            return !skip && (
              <rect key={`${row}-${col}`}
                x={x} y={72 + row*28} width={20} height={20} rx="2"
                fill={warm ? `rgba(255,200,90,${0.45 + (row+col)*0.025})` : `rgba(140,200,255,${0.35 + row*0.03})`}/>
            )
          })
        )}

        {/* Rooftop ── */}
        <rect x="28" y="58" width="196" height="8" rx="3" fill="#1a3060" stroke="#2a4a80" strokeWidth="1"/>
        <rect x="55" y="40" width="142" height="22" rx="3" fill="#0e1c34" stroke="#1a3254" strokeWidth="1"/>
        {/* Roof antenna */}
        <line x1="126" y1="40" x2="126" y2="8" stroke="#1e3a60" strokeWidth="2.5"/>
        <circle cx="126" cy="6" r="4" fill="#f97316" filter="url(#glow2)">
          <animate attributeName="opacity" values="1;0.15;1" dur="1.4s" repeatCount="indefinite"/>
        </circle>
        {/* Secondary antenna */}
        <line x1="145" y1="40" x2="145" y2="15" stroke="#1e3a60" strokeWidth="1.5"/>
        <circle cx="145" cy="13" r="3" fill="#22c55e" filter="url(#glow2)" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.9s" repeatCount="indefinite"/>
        </circle>

        {/* Entrance door */}
        <rect x="96" y="256" width="60" height="44" rx="3" fill="#08101e" stroke="#1a3050" strokeWidth="1.2"/>
        {/* Door panels */}
        <rect x="99" y="259" width="26" height="41" rx="2" fill="#0d2040" stroke="#1a4060" strokeWidth="0.8"/>
        <rect x="127" y="259" width="26" height="41" rx="2" fill="#0d2040" stroke="#1a4060" strokeWidth="0.8"/>
        {/* Door reflections */}
        <line x1="103" y1="263" x2="103" y2="296" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <line x1="131" y1="263" x2="131" y2="296" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

        {/* ═══ TARS-STATION SIGN ═══ */}
        <rect x="36" y="236" width="180" height="22" rx="4" fill="#082856" stroke="#1464be" strokeWidth="1.8"/>
        <rect x="38" y="238" width="176" height="18" rx="3" fill="#0a3572"/>
        {/* Sign glow */}
        <rect x="36" y="236" width="180" height="22" rx="4" fill="url(#buildLight)" opacity="0.5"/>
        <text x="127" y="251" textAnchor="middle" fontSize="10" fontWeight="900"
          fill="#60b4ff" fontFamily="monospace" letterSpacing="2.5">TARS-STATION</text>

        {/* ═══ FLAGPOLE ═══ */}
        <line x1="228" y1="300" x2="228" y2="42" stroke="#2a3a50" strokeWidth="2.5"/>
        <circle cx="228" cy="39" r="5" fill="#4a6080" stroke="#3a5070" strokeWidth="1"/>

        {/* Tars Flag – animated wave */}
        <rect x="230" y="46" width="52" height="34" rx="3" fill="#1055b0">
          <animateTransform attributeName="transform" type="skewX"
            values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </rect>
        {/* Flag stripe */}
        <rect x="230" y="65" width="52" height="8" rx="0" fill="#0a3a8a">
          <animateTransform attributeName="transform" type="skewX"
            values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </rect>
        {/* Flag text */}
        <text x="256" y="60" textAnchor="middle" fontSize="10" fontWeight="900"
          fill="white" fontFamily="monospace" letterSpacing="1">
          TARS
          <animateTransform attributeName="transform" type="skewX"
            values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </text>
        {/* Flag emblem - T in circle */}
        <circle cx="256" cy="73" r="5" fill="rgba(255,255,255,0.15)">
          <animateTransform attributeName="transform" type="skewX"
            values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <text x="256" y="76" textAnchor="middle" fontSize="7" fontWeight="900" fill="white">
          T
          <animateTransform attributeName="transform" type="skewX"
            values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </text>

        {/* ═══ FAHRSCHULE CAR ═══ */}
        {/* Car shadow */}
        <ellipse cx="322" cy="316" rx="60" ry="7" fill="rgba(0,0,0,0.5)"/>

        {/* Car body */}
        <path d="M262,308 L262,285 Q264,270 278,266 L308,258 L342,258 Q360,258 372,268 L378,285 L378,308 Z"
          fill="#18283e" stroke="#2a3e5a" strokeWidth="1.5"/>

        {/* Roof line */}
        <path d="M278,266 L308,254 L342,254 L368,268" fill="none" stroke="#3a5070" strokeWidth="1"/>

        {/* Windshield */}
        <path d="M278,266 L286,258 L314,256 L314,270 L275,272 Z" fill="#1a3a60" stroke="#2a5080" strokeWidth="0.8" opacity="0.9"/>
        {/* Rear window */}
        <path d="M342,256 L366,268 L365,272 L342,270 Z" fill="#1a3a60" stroke="#2a5080" strokeWidth="0.8" opacity="0.9"/>
        {/* Side window */}
        <rect x="318" y="258" width="22" height="10" rx="2" fill="#1a3a60" stroke="#2a5080" strokeWidth="0.5" opacity="0.9"/>

        {/* Door line */}
        <line x1="318" y1="258" x2="318" y2="307" stroke="#243450" strokeWidth="0.8"/>
        {/* Door handle */}
        <rect x="295" y="285" width="18" height="4" rx="2" fill="#2a3e5a" stroke="#3a5070" strokeWidth="0.5"/>

        {/* Front lights */}
        <rect x="265" y="283" width="10" height="7" rx="2" fill="#fef08a" opacity="0.5" filter="url(#glow2)"/>
        {/* Rear lights */}
        <rect x="376" y="283" width="5" height="7" rx="1" fill="#ef4444" opacity="0.6"/>

        {/* Wheels */}
        <circle cx="285" cy="308" r="12" fill="#0e1520" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="285" cy="308" r="8"  fill="#18243a" stroke="#4b5563" strokeWidth="1"/>
        <circle cx="285" cy="308" r="3"  fill="#374151"/>
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <line key={i}
            x1={285 + 4*Math.cos(a*Math.PI/180)} y1={308 + 4*Math.sin(a*Math.PI/180)}
            x2={285 + 7*Math.cos(a*Math.PI/180)} y2={308 + 7*Math.sin(a*Math.PI/180)}
            stroke="#4b5563" strokeWidth="1.5"/>
        ))}

        <circle cx="358" cy="308" r="12" fill="#0e1520" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="358" cy="308" r="8"  fill="#18243a" stroke="#4b5563" strokeWidth="1"/>
        <circle cx="358" cy="308" r="3"  fill="#374151"/>
        {[0,45,90,135,180,225,270,315].map((a,i) => (
          <line key={i}
            x1={358 + 4*Math.cos(a*Math.PI/180)} y1={308 + 4*Math.sin(a*Math.PI/180)}
            x2={358 + 7*Math.cos(a*Math.PI/180)} y2={308 + 7*Math.sin(a*Math.PI/180)}
            stroke="#4b5563" strokeWidth="1.5"/>
        ))}

        {/* Fahrschule roof sign */}
        <rect x="290" y="246" width="66" height="14" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2"/>
        <text x="323" y="256" textAnchor="middle" fontSize="7" fontWeight="900" fill="#78350f" letterSpacing="0.5">FAHRSCHULE</text>
        {/* Sign supports */}
        <line x1="305" y1="256" x2="305" y2="260" stroke="#d97706" strokeWidth="1.5"/>
        <line x1="341" y1="256" x2="341" y2="260" stroke="#d97706" strokeWidth="1.5"/>
      </svg>

      {/* ═══ TARS CHARACTER ═══ */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: '20%',
        width: '90px',
        transformOrigin: 'bottom center',
        transform: charVisible
          ? 'translateX(-50%) scale(1) translateY(0px)'
          : 'translateX(-50%) scale(0.07) translateY(-120px)',
        opacity: charVisible ? 1 : 0,
        transition: isApproaching
          ? 'transform 3.2s cubic-bezier(0.15, 0.0, 0.35, 1), opacity 0.3s ease'
          : 'none',
        pointerEvents: 'none',
        zIndex: 50,
      }}>
        {/* Bob animation when stopped */}
        <div style={{
          animation: (phase === 'stopped' || phase === 'speaking' || phase === 'ready')
            ? 'tarsIdle 3s ease-in-out infinite' : 'none',
        }}>
          <TarsCharacter />
        </div>
      </div>

      {/* ═══ DIALOGUE BOX ═══ */}
      {showDialogue && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'linear-gradient(to top, rgba(4,10,22,0.99) 0%, rgba(4,10,22,0.97) 65%, transparent 100%)',
          padding: '1.25rem 1.25rem 2.75rem',
          animation: 'simDialogUp 0.4s cubic-bezier(0.2,0,0.2,1)',
        }}>
          {/* Speaker header */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.8rem' }}>
            {/* Avatar */}
            <div style={{
              width:'42px', height:'42px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, #1464be 0%, #082856 100%)',
              border:'2px solid rgba(96,180,255,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.25rem',
            }}>🎓</div>
            <div>
              <p style={{ margin:0, fontSize:'0.78rem', fontWeight:900, color:'#60b4ff' }}>Tars</p>
              <p style={{ margin:0, fontSize:'0.58rem', color:'rgba(255,255,255,0.38)', letterSpacing:'0.04em' }}>
                TÜV · Amtlich bestellter Fahrprüfer
              </p>
            </div>
            {/* Speaking dots */}
            {phase === 'speaking' && (
              <div style={{ marginLeft:'auto', display:'flex', gap:'4px', alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:'6px', height:'6px', borderRadius:'50%', background:'#1464be',
                    animation:`tarsDot 1.1s ${i*0.22}s ease-in-out infinite`,
                  }}/>
                ))}
              </div>
            )}
          </div>

          {/* Speech text */}
          <div style={{
            background:'rgba(10,24,50,0.6)', borderRadius:'0.85rem',
            border:'1px solid rgba(20,100,190,0.25)',
            padding:'0.85rem 1rem', marginBottom:'0.85rem',
            minHeight:'60px',
          }}>
            <p style={{
              margin:0, fontSize:'0.96rem', fontWeight:500,
              color:'rgba(255,255,255,0.92)', lineHeight:1.65,
              letterSpacing:'0.01em',
            }}>
              {GREETING.slice(0, typed)}
              {phase === 'speaking' && (
                <span style={{ animation:'tarsCursor 0.75s step-end infinite', opacity:1 }}>|</span>
              )}
            </p>
          </div>

          {/* Continue button */}
          {showContinue && (
            <button
              onClick={() => {/* next phase coming soon */}}
              style={{
                width:'100%', padding:'0.9rem',
                background:'linear-gradient(135deg, #1055b0, #082856)',
                border:'1px solid rgba(96,180,255,0.35)', borderRadius:'100px',
                color:'white', fontWeight:800, fontSize:'0.92rem', cursor:'pointer',
                boxShadow:'0 4px 24px rgba(20,100,190,0.4)',
                animation:'simFadeIn 0.5s ease',
                letterSpacing:'0.02em',
              }}
            >
              Weiter →
            </button>
          )}
        </div>
      )}

      {/* CSS keyframes */}
      <style>{`
        @keyframes simDialogUp {
          from { transform: translateY(24px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        @keyframes simFadeIn {
          from { opacity: 0; transform: translateY(10px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes tarsIdle {
          0%,100% { transform: translateY(0px) }
          50%     { transform: translateY(-4px) }
        }
        @keyframes tarsDot {
          0%,60%,100% { transform: translateY(0); opacity: 0.7 }
          30%         { transform: translateY(-5px); opacity: 1 }
        }
        @keyframes tarsCursor {
          0%,100% { opacity: 1 }
          50%     { opacity: 0 }
        }
      `}</style>
    </div>
  )
}

/* ─── Tars Character SVG ─────────────────────────────────── */
function TarsCharacter() {
  return (
    <svg viewBox="0 0 90 172" width="90" height="172">
      {/* ── Shadow ── */}
      <ellipse cx="45" cy="168" rx="22" ry="5" fill="rgba(0,0,0,0.45)"/>

      {/* ── Legs ── */}
      <rect x="28" y="118" width="13" height="42" rx="5" fill="#0a1e40"/>
      <rect x="47" y="118" width="13" height="42" rx="5" fill="#0a1e40"/>

      {/* ── Shoes ── */}
      <rect x="24" y="156" width="20" height="9" rx="4" fill="#111820"/>
      <rect x="44" y="156" width="20" height="9" rx="4" fill="#111820"/>

      {/* ── Uniform body ── */}
      <path d="M18,60 Q16,57 22,54 L34,52 L45,56 L56,52 L68,54 Q74,57 72,60 L74,118 L16,118 Z"
        fill="#1055b0" stroke="#0a3a8a" strokeWidth="1"/>

      {/* ── Shirt collar & tie ── */}
      <path d="M37,53 L45,58 L53,53" fill="white"/>
      <path d="M42,55 L45,72 L48,55" fill="#c0392b" stroke="#922b21" strokeWidth="0.5"/>

      {/* ── Belt ── */}
      <rect x="18" y="104" width="54" height="6" rx="3" fill="#08142a"/>
      <rect x="39" y="104" width="12" height="6" rx="2" fill="#c8a020"/>

      {/* ── Official Badge ── */}
      <rect x="48" y="64" width="18" height="24" rx="3" fill="#0a3060" stroke="#1464be" strokeWidth="1"/>
      <rect x="50" y="66" width="14" height="20" rx="2" fill="#d4a020" opacity="0.9"/>
      <text x="57" y="78" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0a1e40">TÜV</text>
      <line x1="51" y1="80" x2="63" y2="80" stroke="#0a1e40" strokeWidth="0.8"/>
      <text x="57" y="84" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#0a1e40">PRÜFER</text>

      {/* ── Left arm ── */}
      <path d="M18,60 Q9,72 11,90 L18,88 Q20,72 24,62 Z"
        fill="#1055b0" stroke="#0a3a8a" strokeWidth="0.8"/>
      {/* Left hand */}
      <circle cx="13" cy="93" r="6" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.5"/>

      {/* ── Right arm + clipboard ── */}
      <path d="M72,60 Q81,72 79,90 L72,88 Q70,72 66,62 Z"
        fill="#1055b0" stroke="#0a3a8a" strokeWidth="0.8"/>

      {/* ── Clipboard ── */}
      <rect x="68" y="68" width="20" height="30" rx="3" fill="#e8c870" stroke="#b89820" strokeWidth="1"/>
      {/* Clip */}
      <rect x="72" y="63" width="12" height="8" rx="2" fill="#8b6818" stroke="#6b4e10" strokeWidth="0.8"/>
      {/* Paper lines */}
      <line x1="70" y1="76" x2="86" y2="76" stroke="#8b6818" strokeWidth="1.2"/>
      <line x1="70" y1="82" x2="86" y2="82" stroke="#8b6818" strokeWidth="1.2"/>
      <line x1="70" y1="88" x2="80" y2="88" stroke="#8b6818" strokeWidth="1.2"/>
      {/* Right hand */}
      <circle cx="77" cy="100" r="5" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.5"/>

      {/* ── Neck ── */}
      <rect x="37" y="44" width="16" height="14" rx="5" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.5"/>

      {/* ── Head ── */}
      <circle cx="45" cy="30" r="20" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.8"/>

      {/* ── Ears ── */}
      <ellipse cx="25" cy="31" rx="4" ry="5" fill="#ebbf98" stroke="#ddb880" strokeWidth="0.5"/>
      <ellipse cx="65" cy="31" rx="4" ry="5" fill="#ebbf98" stroke="#ddb880" strokeWidth="0.5"/>

      {/* ── Eyes ── */}
      <circle cx="36" cy="28" r="4" fill="white"/>
      <circle cx="54" cy="28" r="4" fill="white"/>
      <circle cx="37" cy="29" r="2.2" fill="#2a3e70"/>
      <circle cx="55" cy="29" r="2.2" fill="#2a3e70"/>
      {/* Pupils */}
      <circle cx="37.5" cy="29" r="1" fill="#111"/>
      <circle cx="55.5" cy="29" r="1" fill="#111"/>
      {/* Eye shine */}
      <circle cx="38.5" cy="27.5" r="0.8" fill="rgba(255,255,255,0.8)"/>
      <circle cx="56.5" cy="27.5" r="0.8" fill="rgba(255,255,255,0.8)"/>

      {/* ── Eyebrows ── */}
      <path d="M31,22 Q36,20 41,22" fill="none" stroke="#7a5535" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M49,22 Q54,20 59,22" fill="none" stroke="#7a5535" strokeWidth="1.8" strokeLinecap="round"/>

      {/* ── Friendly smile ── */}
      <path d="M35,38 Q45,45 55,38" fill="none" stroke="#7a5535" strokeWidth="1.8" strokeLinecap="round"/>

      {/* ── Nose ── */}
      <path d="M43,32 Q45,35 47,32" fill="none" stroke="#c8956a" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ── Official cap ── */}
      <path d="M24,22 Q24,8 45,8 Q66,8 66,22 Z" fill="#0a2a60" stroke="#1464be" strokeWidth="1"/>
      {/* Cap brim */}
      <rect x="20" y="22" width="50" height="6" rx="2" fill="#0a2a60" stroke="#1464be" strokeWidth="1"/>
      {/* Cap badge */}
      <rect x="32" y="11" width="26" height="13" rx="3" fill="#c8a020" stroke="#a07810" strokeWidth="0.8"/>
      <text x="45" y="20" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0a1e40">TÜV</text>

      {/* ── Shoulder stripes ── */}
      <rect x="16" y="56" width="12" height="4" rx="1" fill="#d4a020" opacity="0.8"/>
      <rect x="62" y="56" width="12" height="4" rx="1" fill="#d4a020" opacity="0.8"/>
    </svg>
  )
}
