'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import TutorialModal from './TutorialModal'
import CarSlideshow from './CarSlideshow'
import ChatBox from './ChatBox'

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
  { icon: '📖', title: 'Unterricht',    desc: 'Theorie lernen & verstehen',   href: '/unterricht', soon: false, color: '#a78bfa', badge: '14 Lektionen'   },
  { icon: '📚', title: 'Theoriefragen', desc: 'Alle Prüfungsfragen üben',     href: '/fragen',     soon: false, color: '#c9a227', badge: '700 Fragen'     },
  { icon: '⚡', title: 'Quiz',          desc: 'Schnell-Test starten',         href: '/quiz',       soon: false, color: '#f97316', badge: 'Prüfungsmodus'  },
  { icon: '🎬', title: 'Lernvideos',    desc: 'Erklärvideos ansehen',         href: '/videos',     soon: true,  color: '#22c55e', badge: 'Bald'           },
  { icon: '⚔️', title: 'Battle',       desc: 'Gegen Freunde antreten',       href: '/battle',     soon: true,  color: '#ef4444', badge: 'Bald'           },
  { icon: '🏆', title: 'Rangliste',     desc: 'Globales Online-Ranking',      href: '/rangliste',  soon: false, color: '#ffd700', badge: 'Live'           },
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

        const statsP = (async () => {
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
        })()

        const leaderP = (async () => {
          try {
            const ctrl = new AbortController()
            const timer = setTimeout(() => ctrl.abort(), 4000)
            const res = await fetch('/api/leaderboard', { signal: ctrl.signal })
            clearTimeout(timer)
            const data = await res.json()
            if (Array.isArray(data)) setTopEntries(data.slice(0, 3))
          } catch {}
        })()

        await Promise.race([
          Promise.allSettled([statsP, leaderP]),
          new Promise<void>(res => setTimeout(res, 5000)),
        ])

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
      <CarSlideshow />
      {showTutorial && (
        <div style={{ position: 'relative', zIndex: 100 }}>
          <TutorialModal username={username} userId={userId}
            onComplete={(pts) => { setPoints(pts); setShowTutorial(false); setTutorialDone(true) }}
          />
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── HERO CARD ── */}
        <div style={{
          background: 'linear-gradient(135deg, #111008 0%, #0e0c08 60%, #120a06 100%)',
          border: '1px solid rgba(201,162,39,0.22)',
          borderRadius: '1.75rem',
          padding: '2rem 2.5rem',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow orbs */}
          <div style={{ position: 'absolute', top: '-100px', right: '120px', width: '380px', height: '380px', borderRadius: '50%', background: `radial-gradient(circle, ${rank.color}0d 0%, transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="dash-hero-flex" style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'flex-start' }}>

            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)',
                borderRadius: '100px', padding: '5px 14px', marginBottom: '1.25rem',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, boxShadow: '0 0 6px var(--gold)' }} />
                <span style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                  Führerschein Klasse B · 2026
                </span>
              </div>

              {/* Title */}
              <h1 style={{ margin: '0 0 0.4rem', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text)' }}>
                Willkommen zurück,{' '}
                <span style={{
                  background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{username}</span>
              </h1>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Deine persönliche Lernzentrale für die Führerscheinprüfung.
              </p>

              {/* Stats row */}
              <div className="dash-stats-row" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                {[
                  { icon: '📚', value: '14', label: 'Lektionen' },
                  { icon: '🎯', value: `${points}`, label: 'Punkte' },
                  { icon: '🏆', value: rank.id, label: rank.name, accent: rank.color, glow: rank.glow },
                  { icon: '📈', value: `${Math.round(progress)}%`, label: nextRank ? `Zu ${nextRank.id}` : 'Maximum' },
                ].map(s => (
                  <div key={s.label} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: s.accent ? `${s.accent}10` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${s.accent ? `${s.accent}28` : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '12px', padding: '0.65rem 1rem',
                    boxShadow: s.glow ? `0 0 14px ${s.glow}` : 'none',
                  }}>
                    <span style={{ fontSize: '1.05rem' }}>{s.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: s.accent ?? 'var(--text)', lineHeight: 1 }}>{s.value}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.57rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: rank circle + sign out */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              <div style={{
                width: '82px', height: '82px', borderRadius: '50%',
                border: `2.5px solid ${rank.color}`,
                boxShadow: `0 0 28px ${rank.glow}, 0 0 56px ${rank.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${rank.color}12`,
              }}>
                <span style={{
                  fontSize: rank.id === 'Legende' ? '0.75rem' : rank.id === 'SS' ? '1.15rem' : '1.75rem',
                  fontWeight: 900, color: rank.color,
                }}>
                  {rank.id}
                </span>
              </div>
              <button
                onClick={async () => { await signOut(); router.replace('/') }}
                style={{
                  padding: '7px 15px', borderRadius: '10px', fontSize: '0.73rem', fontWeight: 600,
                  background: 'rgba(239,68,68,0.08)', color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.22)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.22)' }}
              >
                Abmelden
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {nextRank && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                <span style={{ fontSize: '0.63rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Fortschritt zu {nextRank.name} — noch {nextRank.min - points} Punkte
                </span>
                <span style={{ fontSize: '0.63rem', color: rank.color, fontWeight: 700 }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px', width: `${progress}%`,
                  background: `linear-gradient(90deg, ${rank.color}70, ${rank.color})`,
                  boxShadow: `0 0 10px ${rank.glow}`,
                  transition: 'width 1.2s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* ── TUTORIAL BANNER ── */}
        {!tutorialDone && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)',
            borderRadius: '1rem', padding: '1rem 1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>🎯</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#f87171' }}>Tutorial läuft…</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Schließe es ab und erhalte +100 Punkte</p>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⏳ In Bearbeitung
            </span>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '3px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, var(--gold), rgba(201,162,39,0.3))' }} />
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Deine Bereiche</p>
              </div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)' }}>Wähle einen Bereich zum Starten</p>
            </div>

            {/* Feature grid */}
            <div className="dash-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
            </div>

            {/* Tutorial done badge */}
            {tutorialDone && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: '1rem', padding: '1rem 1.5rem',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                }}>✅</div>
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
                rows={5}
                style={{
                  width: '100%', resize: 'vertical', minHeight: '110px',
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

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Leaderboard */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid rgba(201,162,39,0.15)',
              borderRadius: '1.25rem',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: 'linear-gradient(180deg, var(--gold), rgba(201,162,39,0.3))' }} />
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>Top Spieler</p>
                </div>
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
                    const medals = ['🥇', '🥈', '🥉']
                    return (
                      <div key={entry.userId} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '0.6rem 0.75rem', borderRadius: '10px',
                        background: isMe ? 'rgba(201,162,39,0.08)' : 'rgba(255,255,255,0.025)',
                        border: isMe ? '1px solid rgba(201,162,39,0.22)' : '1px solid transparent',
                      }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{medals[i]}</span>
                        <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700, color: isMe ? 'var(--gold)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.displayName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{entry.points}</span>
                          <span style={{ fontSize: '0.56rem', fontWeight: 800, padding: '2px 6px', borderRadius: '8px', border: `1px solid ${rColor}40`, background: `${rColor}10`, color: rColor }}>
                            {getRankId(entry.points)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Rank system */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1.25rem',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: 'linear-gradient(180deg, var(--gold), rgba(201,162,39,0.3))' }} />
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>Rangsystem</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {RANKS.slice().reverse().map(r => {
                  const active = r.id === rank.id
                  return (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '6px 10px', borderRadius: '8px',
                      background: active ? `${r.color}10` : 'transparent',
                      border: active ? `1px solid ${r.color}28` : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}>
                      <span style={{
                        width: '32px', height: '22px', borderRadius: '6px',
                        border: `1.5px solid ${r.color}${active ? 'cc' : '50'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.48rem', fontWeight: 900,
                        color: active ? r.color : `${r.color}70`,
                        flexShrink: 0,
                      }}>{r.id}</span>
                      <span style={{ flex: 1, fontSize: '0.72rem', fontWeight: active ? 700 : 500, color: active ? r.color : 'var(--text-dim)' }}>
                        {r.name}
                      </span>
                      <span style={{ fontSize: '0.58rem', color: active ? `${r.color}bb` : 'var(--text-dim)', fontWeight: 600 }}>
                        {r.min === 0 ? '0' : r.min}{r.max === Infinity ? '+' : `–${r.max}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Live Chat */}
            <ChatBox userId={userId} username={username} />

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Feature Card ───────────────────────────────────────── */

function FeatureCard({ icon, title, desc, href, soon, color, badge }: {
  icon: string; title: string; desc: string; href: string; soon: boolean; color: string; badge: string
}) {
  const [hovered, setHovered] = useState(false)

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && !soon ? `linear-gradient(135deg, ${color}0d 0%, var(--surface) 100%)` : 'var(--surface)',
        border: `1px solid ${hovered && !soon ? `${color}35` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '1.25rem',
        padding: '1.25rem',
        cursor: soon ? 'default' : 'pointer',
        transition: 'all 0.2s',
        transform: hovered && !soon ? 'translateY(-3px)' : 'none',
        boxShadow: hovered && !soon ? `0 14px 36px ${color}12` : 'none',
        opacity: soon ? 0.6 : 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top row: icon + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}22, ${color}0d)`,
          border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.04em',
          padding: '3px 8px', borderRadius: '100px',
          background: soon ? 'rgba(239,68,68,0.1)' : `${color}10`,
          color: soon ? '#f87171' : color,
          border: `1px solid ${soon ? 'rgba(239,68,68,0.25)' : `${color}25`}`,
          whiteSpace: 'nowrap',
        }}>{badge}</span>
      </div>

      {/* Title */}
      <p style={{
        margin: '0 0 0.3rem', fontSize: '0.88rem', fontWeight: 800,
        color: hovered && !soon ? color : 'var(--text)',
        transition: 'color 0.2s',
      }}>
        {title}
      </p>

      {/* Description */}
      <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.5, flex: 1 }}>
        {desc}
      </p>

      {/* Footer */}
      {!soon ? (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: hovered ? color : 'var(--text-muted)',
            transition: 'color 0.2s',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            Öffnen
            <span style={{
              display: 'inline-block',
              transform: hovered ? 'translateX(4px)' : 'none',
              transition: 'transform 0.2s',
            }}>→</span>
          </span>
        </div>
      ) : (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(239,68,68,0.5)', fontWeight: 600 }}>Bald verfügbar</span>
        </div>
      )}
    </div>
  )

  if (soon) return inner
  return <Link href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>{inner}</Link>
}
