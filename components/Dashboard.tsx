'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import TutorialModal from './TutorialModal'

const RANK_COLORS: Record<string, string> = {
  D: '#6b7280', C: '#3b82f6', B: '#8b5cf6',
  A: '#c9a227', S: '#f97316', SS: '#ef4444', Legende: '#ffd700',
}

function getRankId(points: number) {
  if (points >= 2000) return 'Legende'
  if (points >= 1500) return 'SS'
  if (points >= 1000) return 'S'
  if (points >= 600) return 'A'
  if (points >= 300) return 'B'
  if (points >= 100) return 'C'
  return 'D'
}

type LeaderboardEntry = { position: number; userId: string; displayName: string; points: number }

/* ── Rank System ───────────────────────────────────────── */

const RANKS = [
  { id: 'D',        name: 'Anfänger',       min: 0,    max: 99,       color: '#6b7280', glow: 'rgba(107,114,128,0.3)'  },
  { id: 'C',        name: 'Amateur',        min: 100,  max: 299,      color: '#3b82f6', glow: 'rgba(59,130,246,0.3)'   },
  { id: 'B',        name: 'Fortgeschritten',min: 300,  max: 599,      color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)'   },
  { id: 'A',        name: 'Profi',          min: 600,  max: 999,      color: '#c9a227', glow: 'rgba(201,162,39,0.35)'  },
  { id: 'S',        name: 'Experte',        min: 1000, max: 1499,     color: '#f97316', glow: 'rgba(249,115,22,0.35)'  },
  { id: 'SS',       name: 'Meister',        min: 1500, max: 1999,     color: '#ef4444', glow: 'rgba(239,68,68,0.35)'   },
  { id: 'Legende',  name: 'Legende',        min: 2000, max: Infinity,  color: '#ffd700', glow: 'rgba(255,215,0,0.4)'   },
]

function getRank(points: number) {
  return RANKS.find(r => points >= r.min && points <= r.max) ?? RANKS[0]
}

function getProgress(points: number, rank: typeof RANKS[0]) {
  if (rank.max === Infinity) return 100
  const range = rank.max - rank.min + 1
  const progress = ((points - rank.min) / range) * 100
  return Math.min(100, Math.max(0, progress))
}

/* ── Feature Cards ─────────────────────────────────────── */

const FEATURES = [
  {
    icon: '🎬',
    title: 'Lernvideos',
    desc: 'Erklärvideeos zu allen Themen — einfach & verständlich.',
    href: '/videos',
    soon: true,
  },
  {
    icon: '📚',
    title: 'Theoriefragen',
    desc: 'Alle Prüfungsfragen geordnet nach Thema lernen.',
    href: '/fragen',
    soon: false,
  },
  {
    icon: '⚡',
    title: 'Quiz',
    desc: 'Teste dein Wissen im schnellen Prüfungs-Modus.',
    href: '/quiz',
    soon: false,
  },
  {
    icon: '⚔️',
    title: 'Battle gegen Freunde',
    desc: 'Fordere Freunde heraus und kämpfe um den ersten Platz.',
    href: '/battle',
    soon: true,
  },
]

/* ── Component ─────────────────────────────────────────── */

export default function Dashboard() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [points, setPoints] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialDone, setTutorialDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.replace('/login'); return }

        setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Fahrschüler')
        setUserId(session.user.id)

        // Check localStorage fallback first (works even if table doesn't exist)
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
            if (localDone) {
              setTutorialDone(true)
            } else {
              setShowTutorial(true)
            }
          }
        } catch {
          // Table might not exist yet — still show dashboard
          if (localDone) {
            setTutorialDone(true)
          } else {
            setShowTutorial(true)
          }
        }

        try {
          const lbRes = await fetch('/api/leaderboard')
          const lbData = await lbRes.json()
          if (Array.isArray(lbData)) setTopEntries(lbData.slice(0, 3))
        } catch { /* leaderboard optional */ }

      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.replace('/')
  }

  const rank = getRank(points)
  const progress = getProgress(points, rank)
  const nextRank = RANKS[RANKS.indexOf(rank) + 1]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span style={{ color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Wird geladen…</span>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem 4rem' }}>
      {showTutorial && (
        <TutorialModal
          username={username}
          userId={userId}
          onComplete={(pts) => {
            setPoints(pts)
            setShowTutorial(false)
            setTutorialDone(true)
          }}
        />
      )}
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Willkommen zurück
            </p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              {username} <span style={{ color: 'var(--gold)' }}>👋</span>
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            }}
          >
            Abmelden
          </button>
        </div>

        {/* Rank Card */}
        <div style={{
          background: 'var(--surface)',
          border: `1px solid ${rank.color}40`,
          borderRadius: '1.25rem',
          padding: '2rem',
          marginBottom: '2.5rem',
          boxShadow: `0 0 40px ${rank.glow}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: `radial-gradient(circle, ${rank.glow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>

            {/* Rank Badge */}
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', flexShrink: 0,
              border: `3px solid ${rank.color}`,
              boxShadow: `0 0 24px ${rank.glow}, 0 0 48px ${rank.glow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: rank.id === 'Legende'
                ? 'linear-gradient(135deg, #3a2a00, #1a1000)'
                : `${rank.color}15`,
              animation: rank.id === 'Legende' ? 'borderPulse 2s ease-in-out infinite' : 'none',
            }}>
              <span style={{
                fontSize: rank.id === 'SS' ? '1.5rem' : rank.id === 'Legende' ? '1rem' : '2.2rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                ...(rank.id === 'Legende' ? {
                  background: 'linear-gradient(90deg, #ffd700, #fff5c0, #ffd700)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'goldShine 2s linear infinite',
                } : { color: rank.color }),
              }}>
                {rank.id}
              </span>
            </div>

            {/* Rank Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: rank.color }}>
                  Rang {rank.id}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {rank.name}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {points} Punkte{nextRank ? ` · ${nextRank.min - points} bis Rang ${nextRank.id}` : ' · Höchster Rang!'}
              </p>

              {/* Progress Bar */}
              {nextRank && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Fortschritt zu Rang {nextRank.id}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: rank.color, fontWeight: 700 }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${rank.color}80, ${rank.color})`,
                      transition: 'width 0.8s ease',
                      boxShadow: `0 0 8px ${rank.glow}`,
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* All Ranks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {RANKS.slice().reverse().map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: r.id === rank.id ? 1 : 0.35,
                }}>
                  <span style={{
                    width: '28px', height: '24px', borderRadius: '12px',
                    border: `2px solid ${r.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 900, color: r.color,
                    background: r.id === rank.id ? `${r.color}20` : 'transparent',
                    flexShrink: 0,
                  }}>{r.id}</span>
                  <span style={{ fontSize: '0.7rem', color: r.id === rank.id ? r.color : 'var(--text-dim)', fontWeight: 600 }}>
                    {r.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tutorial Status */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: tutorialDone ? 'rgba(34,197,94,0.06)' : 'rgba(201,162,39,0.06)',
          border: `1px solid ${tutorialDone ? 'rgba(34,197,94,0.2)' : 'rgba(201,162,39,0.2)'}`,
          borderRadius: '0.85rem', padding: '1rem 1.25rem',
          marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>{tutorialDone ? '✅' : '📖'}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: tutorialDone ? '#22c55e' : 'var(--gold)' }}>
                Tutorial {tutorialDone ? 'abgeschlossen' : 'verfügbar'}
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {tutorialDone
                  ? 'Du hast das Tutorial erfolgreich abgeschlossen und +100 Punkte erhalten.'
                  : 'Schließe das Tutorial ab und erhalte +100 Punkte als Belohnung.'}
              </p>
            </div>
          </div>
          <span style={{
            padding: '5px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
            background: tutorialDone ? 'rgba(34,197,94,0.12)' : 'rgba(201,162,39,0.10)',
            color: tutorialDone ? '#22c55e' : 'var(--gold)',
            border: `1px solid ${tutorialDone ? 'rgba(34,197,94,0.25)' : 'rgba(201,162,39,0.25)'}`,
          }}>
            {tutorialDone ? '✓ Abgeschlossen' : '⏳ Läuft…'}
          </span>
        </div>

        {/* Leaderboard Preview */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(201,162,39,0.18)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem' }}>🏆</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>Online Rangliste</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Top Spieler dieser Woche</p>
              </div>
            </div>
            <Link href="/rangliste" style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)',
              textDecoration: 'none', padding: '5px 12px', borderRadius: '20px',
              border: '1px solid rgba(201,162,39,0.3)', background: 'rgba(201,162,39,0.07)',
            }}>
              Alle →
            </Link>
          </div>

          {topEntries.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>
              Noch keine Einträge vorhanden.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topEntries.map((entry, i) => {
                const rankId = getRankId(entry.points)
                const rankColor = RANK_COLORS[rankId]
                const isMe = entry.userId === userId
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={entry.userId} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '0.7rem 0.85rem', borderRadius: '0.75rem',
                    background: isMe ? 'rgba(201,162,39,0.08)' : 'rgba(255,255,255,0.025)',
                    border: isMe ? '1px solid rgba(201,162,39,0.25)' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center', flexShrink: 0 }}>{medals[i]}</span>
                    <span style={{
                      flex: 1, fontSize: '0.82rem', fontWeight: 700,
                      color: isMe ? 'var(--gold)' : 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.displayName} {isMe && <span style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>(Du)</span>}
                    </span>
                    <span style={{
                      padding: '2px 7px', borderRadius: '10px', fontSize: '0.58rem', fontWeight: 800, flexShrink: 0,
                      border: `1px solid ${rankColor}60`, background: `${rankColor}15`, color: rankColor,
                    }}>{rankId}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {entry.points} Pkt
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <h2 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Was möchtest du tun?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}>
          {FEATURES.map(f => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc, href, soon }: {
  icon: string; title: string; desc: string; href: string; soon: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const card = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered && !soon ? 'rgba(201,162,39,0.4)' : 'rgba(201,162,39,0.12)'}`,
        borderRadius: '1rem',
        padding: '1.75rem 1.5rem',
        cursor: soon ? 'default' : 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        transform: hovered && !soon ? 'translateY(-3px)' : 'none',
        boxShadow: hovered && !soon ? '0 8px 32px rgba(201,162,39,0.12)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        minHeight: '180px',
      }}
    >
      {soon && (
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          background: 'rgba(201,162,39,0.12)', color: 'var(--gold)',
          border: '1px solid rgba(201,162,39,0.25)', borderRadius: '20px',
          padding: '2px 8px',
        }}>Demnächst</span>
      )}

      <div style={{ fontSize: '2rem' }}>{icon}</div>

      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
          {desc}
        </p>
      </div>

      {!soon && (
        <div style={{
          marginTop: 'auto',
          fontSize: '0.75rem', fontWeight: 700,
          color: hovered ? 'var(--gold)' : 'var(--text-dim)',
          transition: 'color 0.2s',
        }}>
          Starten →
        </div>
      )}
    </div>
  )

  if (soon) return card
  return <Link href={href} style={{ textDecoration: 'none' }}>{card}</Link>
}
