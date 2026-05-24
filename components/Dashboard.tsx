'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import TutorialModal from './TutorialModal'
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
  { icon: '📅', title: 'Termin wählen', desc: 'Fahrstunde buchen · Mo–Sa',    href: '/termin',     soon: false, color: '#22c55e', badge: 'Fahrstunde'     },
]

type LeaderboardEntry = { position: number; userId: string; displayName: string; points: number }
type Appointment = { id: string; student_name: string; full_name?: string; date: string; start_time: string; duration_min: number; status: string; note?: string; created_at: string; appointment_type?: string }

function padZ(n: number) { return n.toString().padStart(2, '0') }
function slotEnd(startTime: string, dur: number) {
  const [h, m] = startTime.split(':').map(Number)
  const end = h * 60 + m + dur
  return `${padZ(Math.floor(end / 60))}:${padZ(end % 60)}`
}

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

  // Admin
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [apptFilter, setApptFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending')
  const [actingAppt, setActingAppt] = useState<string | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const timeout = new Promise<{ data: { session: null } }>(res =>
          setTimeout(() => res({ data: { session: null } }), 6000)
        )
        const { data: { session } } = await Promise.race([supabase.auth.getSession(), timeout])
        if (!session) { router.replace('/'); return }

        // Populate from session immediately — no extra network round-trip needed
        setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Fahrschüler')
        setUserId(session.user.id)
        noteUserId.current = session.user.id

        const admin = session.user.email === 'spieletolga@gmail.com'
        setIsAdmin(admin)

        // ↓ Show dashboard now — everything below loads in background
        setLoading(false)

        if (admin) {
          const tok = session.access_token ?? ''
          setAdminToken(tok)
          supabase.from('appointments').select('*')
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })
            .then(({ data }) => setAppointments(data ?? []))
        }

        const uid = session.user.id
        let localDone = false
        try { localDone = localStorage.getItem(`tutorial_done_${uid}`) === '1' } catch {}

        // Notes — local first (instant), then sync from DB
        try {
          const local = localStorage.getItem(`note_${uid}`)
          if (local) setNoteText(local)
        } catch {}

        // Stats + leaderboard + notes DB — all fire in parallel, update as they arrive
        ;(async () => {
          try {
            const { data: stats } = await supabase.from('user_stats')
              .select('points, tutorial_done').eq('user_id', uid).single()
            if (stats) {
              setPoints(stats.points ?? 0)
              const done = !!stats.tutorial_done || localDone
              setTutorialDone(done)
              if (!done) setShowTutorial(true)
            } else {
              if (localDone) setTutorialDone(true); else setShowTutorial(true)
            }
          } catch {
            if (localDone) setTutorialDone(true); else setShowTutorial(true)
          }
        })()

        ;(async () => {
          try {
            const { data: noteData } = await supabase.from('user_notes')
              .select('content').eq('user_id', uid).single()
            if (noteData?.content != null) setNoteText(noteData.content)
          } catch {}
        })()

        fetch('/api/leaderboard', { signal: AbortSignal.timeout(4000) })
          .then(r => r.json())
          .then((data: unknown) => { if (Array.isArray(data)) setTopEntries(data.slice(0, 3)) })
          .catch(() => {})

      } catch {
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

  async function updateAppt(id: string, status: 'accepted' | 'rejected' | 'pending') {
    setActingAppt(id)
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setActingAppt(null)
  }

  const rank = getRank(points)
  const progress = getProgress(points, rank)
  const nextRank = RANKS[RANKS.indexOf(rank) + 1]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(201,144,122,0.15)', borderTop: '3px solid var(--gold)', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Wird geladen…</span>
        </div>
      </div>
    )
  }

  const progressVal = Math.round(progress)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '84px', position: 'relative' }}>

      {showTutorial && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <TutorialModal username={username} userId={userId}
            onComplete={(pts) => { setPoints(pts); setShowTutorial(false); setTutorialDone(true) }}
          />
        </div>
      )}

      {/* ── Admin Drawer ── */}
      {isAdmin && showAdmin && (
        <AdminDrawer
          onClose={() => setShowAdmin(false)}
          appointments={appointments}
          filter={apptFilter}
          setFilter={setApptFilter}
          acting={actingAppt}
          onUpdate={updateAppt}
          token={adminToken}
        />
      )}

      {/* ── Main content ── */}
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1rem 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

        {/* ── Admin button (only for admin) ── */}
        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowAdmin(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '7px 14px', borderRadius: '100px',
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Admin
            </button>
          </div>
        )}

        {/* ── HERO CARD ── */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: '1.5rem',
          padding: '1.4rem 1.4rem 1.25rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-30px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,144,122,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Badge */}
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em' }}>
            Führerschein Klasse B · 2026
          </p>

          {/* Content row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.35rem, 5vw, 1.65rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text)' }}>
                Willkommen zurück,
              </h1>
              <h1 style={{ margin: '0 0 0.55rem', fontSize: 'clamp(1.35rem, 5vw, 1.65rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                <span style={{ background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {username} 👋
                </span>
              </h1>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                Deine persönliche Lernzentrale für die Führerscheinprüfung.
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <Link href="/fragen" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '0.6rem 1.1rem', borderRadius: '100px',
                  background: 'linear-gradient(135deg, #8b5a47, #c9907a)',
                  color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                  textDecoration: 'none', boxShadow: '0 4px 20px rgba(201,144,122,0.35)',
                }}>
                  Weiterlernen
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>→</span>
                </Link>
                <Link href="/rangliste" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '0.6rem 1rem', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem',
                  textDecoration: 'none',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Statistik
                </Link>
                <button
                  onClick={async () => { await signOut(); window.location.href = '/' }}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '0.6rem 1rem', borderRadius: '100px',
                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
                    color: '#f87171', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  Abmelden
                </button>
              </div>
            </div>

            {/* Circular progress */}
            <CircularProgress value={progressVal} color="var(--gold)" />
          </div>
        </div>

        {/* ── TUTORIAL BANNER ── */}
        {!tutorialDone && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)',
            borderRadius: '1.25rem', padding: '0.9rem 1.1rem', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>🎯</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#f87171' }}>Tutorial läuft…</p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>Abschließen → +100 Punkte</p>
              </div>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '3px 9px', borderRadius: '100px', border: '1px solid rgba(239,68,68,0.2)', flexShrink: 0 }}>
              ⏳ In Bearbeitung
            </span>
          </div>
        )}

        {/* ── STAT CARDS row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[
            { icon: '📖', value: '14',             label: 'Lektionen', color: '#8b5cf6', barPct: 40  },
            { icon: '🎯', value: `${points}`,       label: 'Punkte',    color: '#ec4899', barPct: Math.min(100, (points / 300) * 100) },
            { icon: '🏆', value: rank.id,           label: rank.name,   color: rank.color, barPct: progress },
            { icon: '📈', value: `${progressVal}%`, label: nextRank ? `Zu ${nextRank.id}` : 'Max', color: '#22c55e', barPct: progress },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--surface)', borderRadius: '1rem', padding: '0.8rem 0.65rem',
              display: 'flex', flexDirection: 'column', gap: '0.15rem',
            }}>
              <span style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{s.icon}</span>
              <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>{s.label}</span>
              <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginTop: '0.4rem' }}>
                <div style={{ width: `${s.barPct}%`, height: '100%', background: s.color, borderRadius: '2px', transition: 'width 1.2s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── FEATURE GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>

        {/* ── PREMIUM BANNER ── */}
        <div style={{
          background: `linear-gradient(135deg, var(--surface) 0%, rgba(201,144,122,0.07) 100%)`,
          border: '1px solid rgba(201,144,122,0.2)',
          borderRadius: '1.25rem', padding: '1rem 1.1rem',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '11px', flexShrink: 0,
            background: 'rgba(201,144,122,0.1)', border: '1px solid rgba(201,144,122,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
          }}>💎</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>Hol dir Premium</p>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>Mehr Funktionen. Mehr Fortschritt.</p>
          </div>
          <button style={{
            padding: '0.55rem 1rem', borderRadius: '100px', flexShrink: 0,
            background: 'linear-gradient(135deg, #8b5a47, #c9907a)',
            color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.73rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            boxShadow: '0 4px 16px rgba(201,144,122,0.3)',
          }}>
            Jetzt upgraden 👑
          </button>
        </div>

        {/* ── DAILY GOAL ── */}
        <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.82rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔄 Dein heutiges Ziel
            </p>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>
              Ziel bearbeiten ✏️
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ position: 'relative', width: '46px', height: '46px', flexShrink: 0 }}>
              <svg width="46" height="46" viewBox="0 0 46 46">
                <circle cx="23" cy="23" r="18" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                <circle cx="23" cy="23" r="18" fill="none" stroke="#3b82f6" strokeWidth="4"
                  strokeDasharray={`${(2 / 5) * 2 * Math.PI * 18} ${2 * Math.PI * 18}`}
                  strokeLinecap="round" transform="rotate(-90 23 23)" />
              </svg>
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.52rem', fontWeight: 900, color: '#3b82f6' }}>2/5</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>Lektion abschließen</p>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)' }}>5 Lektionen pro Tag</p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--gold)', flexShrink: 0 }}>40%</span>
          </div>
        </div>

        {/* ── LEADERBOARD (compact) ── */}
        {topEntries.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)' }}>🏅 Top Spieler</p>
              <Link href="/rangliste" style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>Alle →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {topEntries.map((entry, i) => {
                const rColor = RANK_COLORS[getRankId(entry.points)]
                const isMe = entry.userId === userId
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={entry.userId} style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '0.5rem 0.7rem', borderRadius: '9px',
                    background: isMe ? 'rgba(201,144,122,0.08)' : 'rgba(255,255,255,0.025)',
                    border: isMe ? '1px solid rgba(201,144,122,0.22)' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{medals[i]}</span>
                    <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700, color: isMe ? 'var(--gold)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.displayName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{entry.points}</span>
                      <span style={{ fontSize: '0.53rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', border: `1px solid ${rColor}40`, background: `${rColor}10`, color: rColor }}>{getRankId(entry.points)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── NOTEPAD ── */}
        <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              📝 Notizblock
            </p>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: noteSaved ? '#22c55e' : 'var(--text-dim)', transition: 'color 0.3s' }}>
              {noteSaved ? '✓ Gespeichert' : 'Auto-Save'}
            </span>
          </div>
          <textarea
            value={noteText}
            onChange={e => handleNoteChange(e.target.value)}
            placeholder="Notizen, Merkhilfen…"
            rows={4}
            style={{
              width: '100%', resize: 'vertical', minHeight: '90px',
              padding: '0.65rem 0.75rem', borderRadius: '0.6rem', fontSize: '0.78rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text)', outline: 'none', lineHeight: 1.6,
              fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,144,122,0.35)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Live Chat */}
        <ChatBox userId={userId} username={username} />

      </div>

      {/* ── BOTTOM NAV ── */}
      <BottomNav />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── Circular Progress ──────────────────────────────────── */

function CircularProgress({ value, color }: { value: number; color: string }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const filled = circ * (value / 100)
  return (
    <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
        <circle cx="46" cy="46" r={r} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          transform="rotate(-90 46 46)"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{value}%</span>
        <span style={{ fontSize: '0.46rem', color: 'var(--text-dim)', letterSpacing: '0.04em', marginTop: '3px', textTransform: 'uppercase' }}>Fortschritt</span>
      </div>
    </div>
  )
}

/* ── Bottom Navigation ──────────────────────────────────── */

function BottomNav() {
  const pathname = usePathname()
  const tabs = [
    {
      label: 'Dashboard', href: '/dashboard',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      label: 'Lernen', href: '/unterricht',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    },
    {
      label: 'Prüfung', href: '/fragen',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6M9 16h4"/></svg>,
    },
    {
      label: 'Fortschritt', href: '/rangliste',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    },
    {
      label: 'Community', href: '/rangliste',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      label: 'Einstellungen', href: '/einstellungen',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(15,15,18,0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      padding: '0.45rem 0 calc(0.45rem + env(safe-area-inset-bottom, 0px))',
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.href
        return (
          <Link key={tab.label} href={tab.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            textDecoration: 'none', padding: '0.3rem 0.3rem', flex: 1,
            color: active ? 'var(--gold)' : 'var(--text-dim)',
            transition: 'color 0.15s',
          }}>
            {tab.icon}
            <span style={{ fontSize: '0.52rem', fontWeight: active ? 700 : 500, textAlign: 'center', lineHeight: 1.2 }}>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

/* ── Admin Drawer ───────────────────────────────────────── */

type AdminDrawerProps = {
  onClose: () => void
  appointments: Appointment[]
  filter: 'pending' | 'accepted' | 'rejected' | 'all'
  setFilter: (f: 'pending' | 'accepted' | 'rejected' | 'all') => void
  acting: string | null
  onUpdate: (id: string, status: 'accepted' | 'rejected' | 'pending') => void
  token: string
}

const ADMIN_SECTIONS = [
  { id: 'fahrstundler', label: 'Fahrschüler verwalten', icon: '👤' },
  { id: 'anfragen',     label: 'Fahrstunden-Anfragen',  icon: '🚗' },
  { id: 'sperren',      label: 'Tage sperren',           icon: '🚫' },
  { id: 'einstellung',  label: 'Kalender-Einstellungen', icon: '⚙️' },
] as const

type AdminSectionId = typeof ADMIN_SECTIONS[number]['id']

function AdminDrawer({ onClose, appointments, filter, setFilter, acting, onUpdate, token }: AdminDrawerProps) {
  const [active, setActive] = useState<AdminSectionId | null>(null)
  const pending = appointments.filter(a => a.status === 'pending').length

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
        width: 'min(480px, 100vw)',
        background: '#17171c',
        borderLeft: '1px solid rgba(139,92,246,0.2)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-12px 0 48px rgba(0,0,0,0.6)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>Admin-Bereich</p>
              <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)' }}>Nur für Administratoren</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Section list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          {ADMIN_SECTIONS.map(s => (
            <div key={s.id}>
              {/* Section toggle button */}
              <button
                onClick={() => setActive(prev => prev === s.id ? null : s.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.9rem 1rem', borderRadius: '1rem',
                  background: active === s.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active === s.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: active === s.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active === s.id ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                }}>{s.icon}</span>
                <span style={{ flex: 1, fontSize: '0.83rem', fontWeight: 700, color: active === s.id ? '#a78bfa' : 'var(--text)' }}>
                  {s.label}
                  {s.id === 'anfragen' && pending > 0 && (
                    <span style={{ marginLeft: '8px', padding: '1px 7px', borderRadius: '100px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.62rem', fontWeight: 800 }}>
                      {pending}
                    </span>
                  )}
                </span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={active === s.id ? '#a78bfa' : 'var(--text-dim)'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: active === s.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Section content */}
              {active === s.id && (
                <div style={{ marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
                  {s.id === 'fahrstundler' && <AdminFahrstundler token={token} />}
                  {s.id === 'anfragen'     && (
                    <AdminTermine
                      appointments={appointments}
                      filter={filter}
                      setFilter={setFilter}
                      acting={acting}
                      onUpdate={onUpdate}
                    />
                  )}
                  {s.id === 'sperren'      && <AdminBlockedDays token={token} />}
                  {s.id === 'einstellung'  && <AdminSettings token={token} />}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Admin Fahrstündler ─────────────────────────────────── */

type UserRow = {
  userId: string
  email: string
  username: string
  appApproved: boolean
  fahrstundler: boolean
  createdAt: string
}

function AdminFahrstundler({ token }: { token: string }) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/fahrstundler', { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setUsers(d) })
      .finally(() => setLoading(false))
  }, [token])

  async function toggleFahrstundler(userId: string, current: boolean) {
    setActing(userId)
    await fetch('/api/admin/fahrstundler', {
      method: current ? 'DELETE' : 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setUsers(prev => prev.map(u => u.userId === userId ? { ...u, fahrstundler: !current } : u))
    setActing(null)
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )
  const fahrstundlerCount = users.filter(u => u.fahrstundler).length

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(34,197,94,0.04) 0%, rgba(14,12,8,0.95) 100%)',
      border: '1px solid rgba(34,197,94,0.2)',
      borderRadius: '1.75rem',
      padding: '1.5rem 2rem',
      marginBottom: '1.25rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: open ? '1.1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, #22c55e, rgba(34,197,94,0.3))' }} />
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)' }}>
            👤 Fahrschüler verwalten
          </p>
          <span style={{ padding: '2px 10px', borderRadius: '100px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: '0.65rem', fontWeight: 800 }}>
            {fahrstundlerCount} freigegeben
          </span>
        </div>
        <button onClick={() => setOpen(v => !v)} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px', color: 'var(--text-dim)', fontSize: '0.7rem', padding: '4px 12px', cursor: 'pointer',
        }}>
          {open ? '▲ Einklappen' : '▼ Anzeigen'}
        </button>
      </div>

      {open && (
        <>
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name oder E-Mail suchen…"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.85rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '9px', color: 'var(--text)', fontSize: '0.77rem',
              fontFamily: 'inherit', outline: 'none', marginBottom: '0.85rem',
            }}
          />

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.77rem', padding: '1rem 0' }}>Lädt…</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.77rem', padding: '1rem 0' }}>Keine Nutzer gefunden.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {filtered.map(u => (
                <div key={u.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap',
                  padding: '0.7rem 1rem', borderRadius: '10px',
                  background: u.fahrstundler ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.025)',
                  border: u.fahrstundler ? '1px solid rgba(34,197,94,0.18)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  {/* Avatar initial */}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                    background: u.fahrstundler ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1.5px solid ${u.fahrstundler ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 800,
                    color: u.fahrstundler ? '#22c55e' : 'var(--text-dim)',
                  }}>
                    {u.username[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{u.username}</p>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)' }}>{u.email}</p>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 }}>
                    {u.appApproved ? (
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)', color: 'var(--gold)' }}>
                        App ✓
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                        App ✗
                      </span>
                    )}
                    {u.fahrstundler && (
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
                        Fahrschüler ✓
                      </span>
                    )}
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleFahrstundler(u.userId, u.fahrstundler)}
                    disabled={acting === u.userId}
                    style={{
                      padding: '5px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                      background: u.fahrstundler ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.1)',
                      border: u.fahrstundler ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(34,197,94,0.3)',
                      color: u.fahrstundler ? '#f87171' : '#22c55e',
                      cursor: acting === u.userId ? 'default' : 'pointer',
                      opacity: acting === u.userId ? 0.5 : 1,
                      flexShrink: 0, whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    {acting === u.userId ? '…' : u.fahrstundler ? '✕ Entziehen' : '✓ Freigeben'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Admin Termine ──────────────────────────────────────── */

function AdminTermine({
  appointments, filter, setFilter, acting, onUpdate,
}: {
  appointments: Appointment[]
  filter: 'pending' | 'accepted' | 'rejected' | 'all'
  setFilter: (f: 'pending' | 'accepted' | 'rejected' | 'all') => void
  acting: string | null
  onUpdate: (id: string, status: 'accepted' | 'rejected' | 'pending') => void
}) {
  const pending = appointments.filter(a => a.status === 'pending')
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const filterLabels: Record<string, string> = {
    pending: 'Offen', accepted: 'Bestätigt', rejected: 'Abgelehnt', all: 'Alle',
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(14,12,8,0.95) 100%)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: '1.75rem',
      padding: '1.5rem 2rem',
      marginBottom: '1.25rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.3))' }} />
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)' }}>
            🚗 Fahrstunden-Anfragen
          </p>
          {pending.length > 0 && (
            <span style={{ padding: '2px 10px', borderRadius: '100px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.68rem', fontWeight: 800 }}>
              {pending.length} offen
            </span>
          )}
        </div>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['pending', 'accepted', 'rejected', 'all'] as const).map(f => {
            const cnt = f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '4px 12px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700,
                border: filter === f ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.07)',
                background: filter === f ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                color: filter === f ? '#f87171' : 'var(--text-dim)',
                cursor: 'pointer',
              }}>
                {filterLabels[f]} ({cnt})
              </button>
            )
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem', padding: '1.25rem 0' }}>
          Keine Anfragen in dieser Kategorie.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(a => {
            const dateStr = new Date(a.date + 'T12:00:00').toLocaleDateString('de-DE', {
              weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
            })
            const timeStr = `${a.start_time.slice(0, 5)} – ${slotEnd(a.start_time, a.duration_min)} Uhr`
            const statusColors: Record<string, string> = { pending: '#c9a227', accepted: '#22c55e', rejected: '#f87171' }
            const statusLabels: Record<string, string> = { pending: 'Ausstehend', accepted: 'Bestätigt', rejected: 'Abgelehnt' }

            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                padding: '0.85rem 1.1rem', borderRadius: '12px',
                background: a.status === 'pending' ? 'rgba(201,162,39,0.04)' : 'rgba(255,255,255,0.025)',
                border: a.status === 'pending' ? '1px solid rgba(201,162,39,0.15)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    👤 {a.full_name ?? a.student_name}
                    {a.full_name && a.full_name !== a.student_name && (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 500 }}>(@{a.student_name})</span>
                    )}
                    {a.appointment_type === 'regeltermin' && (
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 7px', borderRadius: '100px', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)', color: 'var(--gold)' }}>🔁 Regeltermin</span>
                    )}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {dateStr} · {timeStr} · {a.duration_min} Min.
                  </p>
                  {a.note && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.67rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      „{a.note}"
                    </p>
                  )}
                </div>

                {/* Status + buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                    background: `${statusColors[a.status]}18`,
                    color: statusColors[a.status] ?? 'var(--text-dim)',
                    border: `1px solid ${statusColors[a.status]}30`,
                  }}>
                    {statusLabels[a.status] ?? a.status}
                  </span>

                  {a.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdate(a.id, 'accepted')}
                        disabled={acting === a.id}
                        style={{
                          padding: '5px 12px', borderRadius: '7px', fontSize: '0.68rem', fontWeight: 700,
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                          color: '#22c55e', cursor: 'pointer', opacity: acting === a.id ? 0.5 : 1,
                        }}
                      >✓ OK</button>
                      <button
                        onClick={() => onUpdate(a.id, 'rejected')}
                        disabled={acting === a.id}
                        style={{
                          padding: '5px 12px', borderRadius: '7px', fontSize: '0.68rem', fontWeight: 700,
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                          color: '#f87171', cursor: 'pointer', opacity: acting === a.id ? 0.5 : 1,
                        }}
                      >✕</button>
                    </>
                  )}
                  {a.status !== 'pending' && (
                    <button
                      onClick={() => onUpdate(a.id, 'pending')}
                      style={{
                        padding: '4px 9px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 600,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                        color: 'var(--text-dim)', cursor: 'pointer',
                      }}
                    >↩</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Admin Blocked Days ──────────────────────────────────── */

function AdminBlockedDays({ token }: { token: string }) {
  const [blocked, setBlocked] = useState<{ date: string; reason: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(true)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [acting, setActing] = useState(false)

  useEffect(() => {
    fetch('/api/admin/blocked-days')
      .then(r => r.json())
      .then((d: { date: string; reason: string | null }[]) => {
        if (Array.isArray(d)) setBlocked(d.sort((a, b) => a.date.localeCompare(b.date)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function addBlock() {
    if (!newDate || acting) return
    setActing(true)
    await fetch('/api/admin/blocked-days', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ date: newDate, reason: newReason.trim() || null }),
    })
    const entry = { date: newDate, reason: newReason.trim() || null }
    setBlocked(prev => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)))
    setNewDate('')
    setNewReason('')
    setActing(false)
  }

  async function removeBlock(date: string) {
    setActing(true)
    await fetch('/api/admin/blocked-days', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    setBlocked(prev => prev.filter(b => b.date !== date))
    setActing(false)
  }

  const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239,68,68,0.03) 0%, rgba(14,12,8,0.95) 100%)',
      border: '1px solid rgba(239,68,68,0.15)',
      borderRadius: '1.75rem',
      padding: '1.5rem 2rem',
      marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: open ? '1.1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.3))' }} />
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)' }}>
            🚫 Tage sperren
          </p>
          {blocked.length > 0 && (
            <span style={{ padding: '2px 10px', borderRadius: '100px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '0.65rem', fontWeight: 800 }}>
              {blocked.length} gesperrt
            </span>
          )}
        </div>
        <button onClick={() => setOpen(v => !v)} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px', color: 'var(--text-dim)', fontSize: '0.7rem', padding: '4px 12px', cursor: 'pointer',
        }}>
          {open ? '▲ Einklappen' : '▼ Anzeigen'}
        </button>
      </div>

      {open && (
        <>
          {/* Add blocked day */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              min="2026-01-01"
              max="2026-12-31"
              style={{
                padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9px', color: 'var(--text)', fontSize: '0.77rem', fontFamily: 'inherit', outline: 'none', colorScheme: 'dark',
              }}
            />
            <input
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
              placeholder="Grund (z.B. Urlaub, Krank)"
              style={{
                flex: 1, minWidth: '140px', padding: '0.5rem 0.75rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9px', color: 'var(--text)', fontSize: '0.77rem', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={addBlock} disabled={!newDate || acting} style={{
              padding: '0.5rem 1.1rem', borderRadius: '9px', fontSize: '0.75rem', fontWeight: 700,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', cursor: (!newDate || acting) ? 'default' : 'pointer',
              opacity: (!newDate || acting) ? 0.5 : 1, whiteSpace: 'nowrap',
            }}>
              🚫 Sperren
            </button>
          </div>

          {/* Blocked list */}
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.77rem', padding: '0.5rem 0' }}>Lädt…</p>
          ) : blocked.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Keine gesperrten Tage.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {blocked.map(b => (
                <div key={b.date} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                  padding: '0.6rem 0.85rem', borderRadius: '9px',
                  background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{fmtDate(b.date)}</p>
                    {b.reason && <p style={{ margin: 0, fontSize: '0.65rem', color: '#f87171' }}>{b.reason}</p>}
                  </div>
                  <button onClick={() => removeBlock(b.date)} disabled={acting} style={{
                    padding: '4px 12px', borderRadius: '7px', fontSize: '0.68rem', fontWeight: 700,
                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                    color: '#22c55e', cursor: acting ? 'default' : 'pointer', opacity: acting ? 0.5 : 1,
                  }}>
                    ✓ Freigeben
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Admin Settings ─────────────────────────────────────── */

function SettingRow({ label, desc, enabled, saving, onToggle }: {
  label: string; desc: string; enabled: boolean; saving: boolean; onToggle: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      padding: '0.75rem 1rem', borderRadius: '10px',
      background: enabled ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.025)',
      border: enabled ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ flex: 1, minWidth: '180px' }}>
        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)' }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{
          fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
          background: enabled ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
          color: enabled ? '#22c55e' : '#f87171',
          border: `1px solid ${enabled ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {enabled ? 'AN' : 'AUS'}
        </span>
        <button
          onClick={onToggle}
          disabled={saving}
          style={{
            padding: '5px 16px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
            background: enabled ? 'rgba(239,68,68,0.08)' : 'rgba(139,92,246,0.12)',
            border: enabled ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(139,92,246,0.3)',
            color: enabled ? '#f87171' : '#a78bfa',
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          {saving ? '…' : enabled ? 'Sperren' : 'Freigeben'}
        </button>
      </div>
    </div>
  )
}

function AdminSettings({ token }: { token: string }) {
  const [satEnabled, setSatEnabled] = useState<boolean | null>(null)
  const [multiEnabled, setMultiEnabled] = useState<boolean | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((d: Record<string, string>) => {
        setSatEnabled(d.saturday_enabled === 'true')
        setMultiEnabled(d.multi_booking_enabled === 'true')
      })
      .catch(() => {})
  }, [])

  async function toggle(key: string, current: boolean, setter: (v: boolean) => void) {
    setSaving(key)
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ key, value: String(!current) }),
    })
    setter(!current)
    setSaving(null)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(14,12,8,0.95) 100%)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: '1.75rem',
      padding: '1.5rem 2rem',
      marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: open ? '1.1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '3px', height: '22px', borderRadius: '2px', background: 'linear-gradient(180deg, #8b5cf6, rgba(139,92,246,0.3))' }} />
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)' }}>
            ⚙️ Kalender-Einstellungen
          </p>
        </div>
        <button onClick={() => setOpen(v => !v)} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px', color: 'var(--text-dim)', fontSize: '0.7rem', padding: '4px 12px', cursor: 'pointer',
        }}>
          {open ? '▲ Einklappen' : '▼ Anzeigen'}
        </button>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {satEnabled === null ? (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', padding: '0.75rem 0' }}>Lädt…</p>
          ) : (
            <>
              <SettingRow
                label="Samstag freigeben"
                desc="Fahrschüler können Sa buchen · 12–15 Uhr & 19–23 Uhr"
                enabled={satEnabled}
                saving={saving === 'saturday_enabled'}
                onToggle={() => toggle('saturday_enabled', satEnabled, setSatEnabled)}
              />
              <SettingRow
                label="Mehrfachtermine erlauben"
                desc="Mehr als 1 Termin pro Woche buchbar"
                enabled={multiEnabled ?? false}
                saving={saving === 'multi_booking_enabled'}
                onToggle={() => multiEnabled !== null && toggle('multi_booking_enabled', multiEnabled, setMultiEnabled)}
              />
            </>
          )}
        </div>
      )}
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
        background: hovered && !soon ? `linear-gradient(135deg, ${color}12 0%, var(--surface) 100%)` : 'var(--surface)',
        border: `1px solid ${hovered && !soon ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '1.1rem',
        padding: '0.9rem 0.75rem',
        cursor: soon ? 'default' : 'pointer',
        transition: 'all 0.2s',
        transform: hovered && !soon ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && !soon ? `0 8px 24px ${color}14` : 'none',
        display: 'flex', flexDirection: 'column',
        height: '100%', boxSizing: 'border-box',
      }}
    >
      {/* Icon box */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px', marginBottom: '0.6rem',
        background: `linear-gradient(135deg, ${color}20, ${color}0d)`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Title */}
      <p style={{
        margin: '0 0 0.2rem', fontSize: '0.78rem', fontWeight: 800,
        color: hovered && !soon ? color : 'var(--text)',
        transition: 'color 0.2s', lineHeight: 1.2,
      }}>
        {title}
      </p>

      {/* Description */}
      <p style={{ margin: '0 0 0.65rem', fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.45, flex: 1 }}>
        {desc}
      </p>

      {/* Badge footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '0.55rem', fontWeight: 700,
          color: soon ? '#ef4444' : color,
          display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          {soon ? '🔒' : '•'} {badge}
        </span>
        {!soon && (
          <span style={{
            width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
            background: `${color}15`, border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', color,
          }}>←</span>
        )}
      </div>
    </div>
  )

  if (soon) return inner
  return <Link href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>{inner}</Link>
}
