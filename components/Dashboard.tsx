'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import TutorialModal from './TutorialModal'

/* ── Ranks ─────────────────────────────────────────────── */

const RANKS = [
  { id: 'D',       name: 'Anfänger',        min: 0,    max: 99,       color: '#6b7280', glow: 'rgba(107,114,128,0.3)' },
  { id: 'C',       name: 'Amateur',         min: 100,  max: 299,      color: '#3b82f6', glow: 'rgba(59,130,246,0.3)'  },
  { id: 'B',       name: 'Fortgeschritten', min: 300,  max: 599,      color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)'  },
  { id: 'A',       name: 'Profi',           min: 600,  max: 999,      color: '#c9a227', glow: 'rgba(201,162,39,0.35)' },
  { id: 'S',       name: 'Experte',         min: 1000, max: 1499,     color: '#f97316', glow: 'rgba(249,115,22,0.35)' },
  { id: 'SS',      name: 'Meister',         min: 1500, max: 1999,     color: '#ef4444', glow: 'rgba(239,68,68,0.35)'  },
  { id: 'Legende', name: 'Legende',         min: 2000, max: Infinity, color: '#ffd700', glow: 'rgba(255,215,0,0.4)'  },
]

const RANK_COLORS: Record<string, string> = Object.fromEntries(RANKS.map(r => [r.id, r.color]))

function getRank(points: number) {
  return RANKS.find(r => points >= r.min && points <= r.max) ?? RANKS[0]
}
function getRankId(points: number) {
  return getRank(points).id
}
function getProgress(points: number, rank: typeof RANKS[0]) {
  if (rank.max === Infinity) return 100
  return Math.min(100, Math.max(0, ((points - rank.min) / (rank.max - rank.min + 1)) * 100))
}

/* ── Features ───────────────────────────────────────────── */

const FEATURES = [
  { icon: '📖', title: 'Unterricht',       desc: '14 Lektionen',          href: '/unterricht', soon: false, color: '#a78bfa' },
  { icon: '📚', title: 'Theoriefragen',    desc: 'Alle Prüfungsfragen',   href: '/fragen',     soon: false, color: '#c9a227' },
  { icon: '⚡', title: 'Quiz',             desc: 'Wissen testen',         href: '/quiz',       soon: false, color: '#f97316' },
  { icon: '🎬', title: 'Lernvideos',       desc: 'Erklärvideos',          href: '/videos',     soon: true,  color: '#22c55e' },
  { icon: '⚔️', title: 'Battle',          desc: 'Gegen Freunde',         href: '/battle',     soon: true,  color: '#ef4444' },
  { icon: '🏆', title: 'Rangliste',        desc: 'Online Ranking',        href: '/rangliste',  soon: false, color: '#ffd700' },
]

type LeaderboardEntry = { position: number; userId: string; displayName: string; points: number }

/* ── Dashboard ──────────────────────────────────────────── */

export default function Dashboard() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [points, setPoints] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialDone, setTutorialDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([])
  const [noteText, setNoteText] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noteUserId = useRef('')

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.replace('/login'); return }

        setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Fahrschüler')
        setUserId(session.user.id)
        noteUserId.current = session.user.id

        // Load note in background — does NOT block the main load
        const uid = session.user.id
        ;(async () => {
          try {
            const local = localStorage.getItem(`note_${uid}`)
            if (local) setNoteText(local)
          } catch {}
          try {
            const { data: noteData } = await supabase
              .from('user_notes').select('content').eq('user_id', uid).single()
            if (noteData?.content != null) setNoteText(noteData.content)
          } catch {}
        })()

        let localDone = false
        try { localDone = localStorage.getItem(`tutorial_done_${session.user.id}`) === '1' } catch {}

        try {
          const { data: stats } = await supabase
            .from('user_stats')
            .select('points, tutorial_done')
            .eq('user_id', session.user.id)
            .single()

          if (stats) {
            setPoints(stats.points ?? 0)
            const done = !!stats.tutorial_done || localDone
            setTutorialDone(done)
            if (!done) setShowTutorial(true)
          } else {
            if (localDone) { setTutorialDone(true) } else { setShowTutorial(true) }
          }
        } catch {
          if (localDone) { setTutorialDone(true) } else { setShowTutorial(true) }
        }

        try {
          const res = await fetch('/api/leaderboard')
          const data = await res.json()
          if (Array.isArray(data)) setTopEntries(data.slice(0, 3))
        } catch {}

      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const saveNote = useCallback(async (text: string, uid: string) => {
    try { localStorage.setItem(`note_${uid}`, text) } catch {}
    try {
      await supabase.from('user_notes').upsert({ user_id: uid, content: text, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    } catch {}
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }, [])

  function handleNoteChange(text: string) {
    setNoteText(text)
    setNoteSaved(false)
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current)
    noteSaveTimer.current = setTimeout(() => saveNote(text, noteUserId.current), 1000)
  }

  const rank = getRank(points)
  const progress = getProgress(points, rank)
  const nextRank = RANKS[RANKS.indexOf(rank) + 1]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(201,162,39,0.15)', borderTop: '3px solid var(--gold)', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Wird geladen…</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.5rem 1rem 5rem' }}>
      {showTutorial && (
        <TutorialModal username={username} userId={userId}
          onComplete={(pts) => { setPoints(pts); setShowTutorial(false); setTutorialDone(true) }}
        />
      )}

      <div style={{ maxWidth: '940px', margin: '0 auto' }}>

        {/* ── LOGO BAR ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Toldrive.jpeg" alt="TolDrive" style={{
            width: '42px', height: '42px', objectFit: 'cover',
            borderRadius: '10px', border: '1.5px solid rgba(201,162,39,0.4)',
            boxShadow: '0 0 16px rgba(201,162,39,0.2)',
          }} />
          <div>
            <p style={{
              margin: 0, fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>TolDrive</p>
            <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Führerschein Theorie</p>
          </div>
        </div>

        {/* ── HERO HEADER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${rank.color}18 0%, rgba(8,8,8,0) 60%)`,
          border: `1px solid ${rank.color}30`,
          borderRadius: '1.5rem',
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: `radial-gradient(circle, ${rank.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Rank circle */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                border: `2.5px solid ${rank.color}`,
                boxShadow: `0 0 20px ${rank.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${rank.color}15`,
              }}>
                <span style={{ fontSize: rank.id === 'SS' ? '1.1rem' : '1.6rem', fontWeight: 900, color: rank.color }}>
                  {rank.id}
                </span>
              </div>
              <div>
                <p style={{ margin: '0 0 0.1rem', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Willkommen zurück
                </p>
                <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {username}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: rank.color }}>{rank.name}</span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{points} Punkte</span>
                </div>
              </div>
            </div>

            <button onClick={async () => { await signOut(); router.replace('/') }} style={{
              padding: '8px 18px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 600,
              background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              Abmelden
            </button>
          </div>

          {/* Progress bar */}
          {nextRank && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Fortschritt zu Rang {nextRank.id} — {nextRank.min - points} Punkte fehlen
                </span>
                <span style={{ fontSize: '0.65rem', color: rank.color, fontWeight: 700 }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${rank.color}70, ${rank.color})`,
                  boxShadow: `0 0 8px ${rank.glow}`,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* ── TUTORIAL BANNER (if not done) ── */}
        {!tutorialDone && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            background: 'rgba(201,162,39,0.07)',
            border: '1px solid rgba(201,162,39,0.3)',
            borderRadius: '1rem', padding: '1rem 1.25rem',
            marginBottom: '1.5rem', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🎯</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold)' }}>Tutorial läuft…</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Schließe es ab und erhalte +100 Punkte</p>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700 }}>⏳ In Bearbeitung</span>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Feature grid */}
            <section>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.85rem' }}>
                Bereiche
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
              </div>
            </section>

            {/* Tutorial done badge */}
            {tutorialDone && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)',
                borderRadius: '1rem', padding: '1rem 1.25rem',
              }}>
                <span style={{ fontSize: '1.4rem' }}>✅</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#22c55e' }}>Tutorial abgeschlossen</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>+100 Punkte erhalten · Rang C freigeschaltet</p>
                </div>
              </div>
            )}

            {/* Notepad */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '1.25rem',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📝 Privater Notizblock
                </p>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 600,
                  color: noteSaved ? '#22c55e' : 'var(--text-dim)',
                  transition: 'color 0.3s',
                }}>
                  {noteSaved ? '✓ Gespeichert' : 'Auto-Save'}
                </span>
              </div>
              <textarea
                value={noteText}
                onChange={e => handleNoteChange(e.target.value)}
                placeholder="Notizen, Merkhilfen, wichtige Punkte…"
                rows={6}
                style={{
                  width: '100%', resize: 'vertical', minHeight: '120px',
                  padding: '0.75rem', borderRadius: '0.6rem', fontSize: '0.8rem',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text)', outline: 'none', lineHeight: 1.6,
                  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.35)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* All Ranks */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1.25rem',
              padding: '1.25rem',
            }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.85rem' }}>
                Rangsystem
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {RANKS.slice().reverse().map(r => {
                  const active = r.id === rank.id
                  return (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '6px 10px', borderRadius: '8px',
                      background: active ? `${r.color}12` : 'transparent',
                      border: active ? `1px solid ${r.color}30` : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}>
                      <span style={{
                        width: '30px', height: '22px', borderRadius: '6px',
                        border: `1.5px solid ${r.color}${active ? 'ff' : '60'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.5rem', fontWeight: 900,
                        color: active ? r.color : `${r.color}80`,
                        flexShrink: 0,
                      }}>{r.id}</span>
                      <span style={{ flex: 1, fontSize: '0.72rem', fontWeight: active ? 700 : 500, color: active ? r.color : 'var(--text-dim)' }}>
                        {r.name}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: active ? `${r.color}cc` : 'var(--text-dim)', fontWeight: 600 }}>
                        {r.min === 0 ? '0' : r.min}
                        {r.max === Infinity ? '+' : `–${r.max}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Leaderboard */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid rgba(201,162,39,0.15)',
              borderRadius: '1.25rem',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  🏆 Top Spieler
                </p>
                <Link href="/rangliste" style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>
                  Alle →
                </Link>
              </div>

              {topEntries.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.75rem 0' }}>
                  Noch keine Einträge
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {topEntries.map((entry, i) => {
                    const rColor = RANK_COLORS[getRankId(entry.points)]
                    const isMe = entry.userId === userId
                    return (
                      <div key={entry.userId} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '0.55rem 0.75rem', borderRadius: '8px',
                        background: isMe ? 'rgba(201,162,39,0.08)' : 'rgba(255,255,255,0.025)',
                        border: isMe ? '1px solid rgba(201,162,39,0.22)' : '1px solid transparent',
                      }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                          {['🥇','🥈','🥉'][i]}
                        </span>
                        <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700, color: isMe ? 'var(--gold)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.displayName}
                        </span>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '1px 6px', borderRadius: '8px', border: `1px solid ${rColor}50`, background: `${rColor}12`, color: rColor, flexShrink: 0 }}>
                          {getRankId(entry.points)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Feature Card ───────────────────────────────────────── */

function FeatureCard({ icon, title, desc, href, soon, color }: {
  icon: string; title: string; desc: string; href: string; soon: boolean; color: string
}) {
  const [hovered, setHovered] = useState(false)

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && !soon ? `${color}0e` : 'var(--surface)',
        border: `1px solid ${hovered && !soon ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '1rem',
        padding: '1.1rem',
        cursor: soon ? 'default' : 'pointer',
        transition: 'all 0.2s',
        transform: hovered && !soon ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && !soon ? `0 8px 24px ${color}18` : 'none',
        position: 'relative',
        overflow: 'hidden',
        opacity: soon ? 0.55 : 1,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{icon}</div>
      <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', fontWeight: 800, color: hovered && !soon ? color : 'var(--text)', transition: 'color 0.2s' }}>
        {title}
      </p>
      <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{desc}</p>
      {soon && (
        <span style={{
          position: 'absolute', top: '7px', right: '7px',
          fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1px 5px',
        }}>bald</span>
      )}
    </div>
  )

  if (soon) return inner
  return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
}
