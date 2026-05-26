'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut, setSessionExpiry, getSessionExpiry, isSessionExpired } from '@/lib/auth'
import TutorialModal from './TutorialModal'
import ChatBox from './ChatBox'

/* ── Ranks ─────────────────────────────────────────────── */
const RANKS = [
  { id: 'D',       name: 'Anfänger',        min: 0,    max: 99,       color: '#6b7280' },
  { id: 'C',       name: 'Amateur',         min: 100,  max: 299,      color: '#3b82f6' },
  { id: 'B',       name: 'Fortgeschritten', min: 300,  max: 599,      color: '#8b5cf6' },
  { id: 'A',       name: 'Profi',           min: 600,  max: 999,      color: '#c9a227' },
  { id: 'S',       name: 'Experte',         min: 1000, max: 1499,     color: '#f97316' },
  { id: 'SS',      name: 'Meister',         min: 1500, max: 1999,     color: '#ef4444' },
  { id: 'Legende', name: 'Legende',         min: 2000, max: Infinity, color: '#ffd700' },
]
const RANK_COLORS: Record<string, string> = Object.fromEntries(RANKS.map(r => [r.id, r.color]))

function getRank(p: number) { return RANKS.find(r => p >= r.min && p <= r.max) ?? RANKS[0] }
function getRankId(p: number) { return getRank(p).id }
function getProgress(p: number, rank: typeof RANKS[0]) {
  if (rank.max === Infinity) return 100
  return Math.min(100, Math.max(0, ((p - rank.min) / (rank.max - rank.min + 1)) * 100))
}
function padZ(n: number) { return n.toString().padStart(2, '0') }
function slotEnd(t: string, dur: number) {
  const [h, m] = t.split(':').map(Number)
  const e = h * 60 + m + dur
  return `${padZ(Math.floor(e / 60))}:${padZ(e % 60)}`
}

/* ── Types ─────────────────────────────────────────────── */
type LeaderboardEntry = { position: number; userId: string; displayName: string; points: number }
type Appointment = {
  id: string; student_name: string; full_name?: string; date: string
  start_time: string; duration_min: number; status: string; note?: string
  created_at: string; appointment_type?: string
}

/* ── Quick-access items ────────────────────────────────── */
const QUICK_STANDARD = [
  { icon: '📚', title: 'Theorie lernen',  desc: 'Lektionen & Erklärungen',  href: '/unterricht', color: '#8b5cf6', bg: '#f3f0ff' },
  { icon: '💬', title: 'Theoriefragen',   desc: 'Üben & Fragen beantworten', href: '/fragen',     color: '#3b82f6', bg: '#eff6ff' },
  { icon: '✅', title: 'Prüfung starten', desc: 'Im Echtmodus prüfen',       href: '/quiz',       color: '#22c55e', bg: '#f0fdf4' },
  { icon: '▶️', title: 'Lernvideos',      desc: 'Erklärvideos ansehen',      href: '/videos',     color: '#ef4444', bg: '#fff1f2' },
]

const QUICK_PREMIUM = [
  { icon: '🔧', title: 'Technik',    desc: 'Fahrzeug-Technik kennenlernen',  href: '/technik',    color: '#06b6d4', bg: '#ecfeff' },
  { icon: '🚗', title: 'Simulation', desc: 'Prüfung realistisch simulieren', href: '/simulation', color: '#f97316', bg: '#fff7ed' },
]

/* ── CSS ───────────────────────────────────────────────── */
const CSS = `
@keyframes db-spin { to { transform: rotate(360deg); } }
@keyframes db-shimmer { 0%{left:-60%} 100%{left:160%} }

/* ── Layout ── */
.db-root { display:flex; min-height:100vh; background:#f0eff7; }

.db-sidebar {
  width:220px; flex-shrink:0; background:#1e1346;
  display:none; flex-direction:column;
  position:fixed; top:0; left:0; bottom:0;
  overflow-y:auto; z-index:40;
  border-right:1px solid rgba(255,255,255,0.07);
}
.db-main { flex:1; min-height:100vh; display:flex; flex-direction:column; }
.db-topbar {
  display:none; align-items:center; justify-content:space-between;
  padding:.9rem 2rem; background:#f0eff7;
  border-bottom:1px solid #e5e7eb; position:sticky; top:0; z-index:30;
}
.db-scroll { padding:1.5rem 2rem; flex:1; padding-bottom:1.5rem; }

/* ── Grids ── */
.db-quick-grid  { display:grid; grid-template-columns:repeat(5,1fr); gap:.75rem; }
.db-stats-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem; }
.db-two-col     { display:grid; grid-template-columns:1fr 1fr;       gap:1rem;   }
.db-disc-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:.75rem; }

/* ── Hover effects ── */
.db-qcard:hover, .db-disc:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.08); }
.db-qcard, .db-disc { transition:transform .15s,box-shadow .15s; }

/* ── Desktop (≥900px): show sidebar, hide global nav ── */
@media (min-width:900px) {
  .db-sidebar { display:flex; }
  .db-main { margin-left:220px; }
  .db-topbar { display:flex; }
  .db-mob-pad { display:none !important; }
  .db-bottomnav { display:none !important; }
  .db-mob-admin { display:none !important; }
}

/* ── Mobile (<900px) ── */
@media (max-width:899px) {
  .db-scroll { padding:.85rem; padding-bottom:90px; }
  .db-quick-grid { grid-template-columns:repeat(2,1fr); }
  .db-stats-grid { grid-template-columns:repeat(2,1fr); }
  .db-hero-stats { grid-template-columns:repeat(2,1fr) !important; }
  .db-two-col    { grid-template-columns:1fr; }
  .db-disc-grid  { grid-template-columns:1fr; }
}

/* ── Sidebar nav ── */
.db-navlink {
  display:flex; align-items:center; gap:.75rem;
  padding:.55rem .85rem; border-radius:.75rem;
  color:#6b6b8a; text-decoration:none; font-size:.85rem; font-weight:500;
  transition:background .15s,color .15s;
}
.db-navlink:hover { background:rgba(255,255,255,0.08); color:#e0e0f8; }
.db-navlink.active { background:rgba(99,102,241,.15); color:#a5b4fc; font-weight:700; }
`

/* ── Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter()
  const [username, setUsername]         = useState('')
  const [userId,   setUserId]           = useState('')
  const [userToken, setUserToken]       = useState('')
  const [points,   setPoints]           = useState(0)
  const [fragenDone, setFragenDone]     = useState(0)
  const [isPremium, setIsPremium]       = useState(false)
  const [checkingOut, setCheckingOut]   = useState(false)
  const [agbConsent, setAgbConsent]     = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialDone, setTutorialDone] = useState(false)
  const [loading,  setLoading]          = useState(true)
  const [topEntries, setTopEntries]     = useState<LeaderboardEntry[]>([])
  const [streakCount, setStreakCount]   = useState(0)
  const [streakDays,  setStreakDays]    = useState<boolean[]>([false,false,false,false,false,false,false])
  const [chatOpen,    setChatOpen]      = useState(false)
  const [noteText, setNoteText]         = useState('')
  const [noteSaved, setNoteSaved]       = useState(false)
  const noteSaveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noteUserId       = useRef('')
  const sessionTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [dailyGoal,    setDailyGoal]    = useState(10)
  const [dailyCount,   setDailyCount]   = useState(0)
  const [editGoal,     setEditGoal]     = useState(false)
  const [editGoalVal,  setEditGoalVal]  = useState('10')

  const [isAdmin,      setIsAdmin]      = useState(false)
  const [adminToken,   setAdminToken]   = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [apptFilter,   setApptFilter]   = useState<'pending'|'accepted'|'rejected'|'all'>('pending')
  const [actingAppt,   setActingAppt]   = useState<string|null>(null)
  const [showAdmin,    setShowAdmin]    = useState(false)

  /* ── Hide global header/footer on desktop ── */
  useEffect(() => {
    const hdr = document.querySelector('body > header') as HTMLElement | null
    const ftr = document.querySelector('body > footer') as HTMLElement | null
    function sync() {
      const desk = window.innerWidth >= 900
      if (hdr) hdr.style.display = desk ? 'none' : ''
      if (ftr) ftr.style.display = desk ? 'none' : ''
    }
    sync()
    window.addEventListener('resize', sync)
    return () => {
      if (hdr) hdr.style.display = ''
      if (ftr) ftr.style.display = ''
      window.removeEventListener('resize', sync)
      if (sessionTimer.current) clearTimeout(sessionTimer.current)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const timeout = new Promise<{ data: { session: null } }>(res =>
          setTimeout(() => res({ data: { session: null } }), 6000))
        const { data: { session } } = await Promise.race([supabase.auth.getSession(), timeout])
        if (!session) { router.replace('/'); return }

        // ── 3-h Session-Check ──
        if (isSessionExpired()) {
          await signOut()
          router.replace('/')
          return
        }
        // Kein Stempel → jetzt setzen (Nutzer war vor dem Feature schon eingeloggt)
        let expiry = getSessionExpiry()
        if (!expiry) { setSessionExpiry(); expiry = getSessionExpiry()! }
        // Timer planen, der beim Ablauf automatisch ausloggt
        const remaining = expiry - Date.now()
        sessionTimer.current = setTimeout(async () => {
          await signOut()
          router.replace('/')
        }, remaining)

        setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Fahrschüler')
        setUserId(session.user.id)
        setUserToken(session.access_token ?? '')
        noteUserId.current = session.user.id
        try { const ids = JSON.parse(localStorage.getItem('fragenCorrectIds') ?? '[]'); setFragenDone(Array.isArray(ids) ? ids.length : 0) } catch {}
        // ── Streak ──
        try {
          const today     = new Date().toISOString().slice(0, 10)
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          const lastDate  = localStorage.getItem('streak_last') ?? ''
          const saved     = parseInt(localStorage.getItem('streak_count') ?? '0', 10)
          let count = lastDate === today ? saved : lastDate === yesterday ? saved + 1 : 1
          if (lastDate !== today) { localStorage.setItem('streak_count', String(count)); localStorage.setItem('streak_last', today) }
          setStreakCount(count)
          // 7-day week view (Mo=0 … So=6)
          const dow = new Date().getDay()
          const todayIdx = dow === 0 ? 6 : dow - 1
          const active = Array.from({ length: 7 }, (_, i) => i <= todayIdx && i >= todayIdx - (Math.min(count, todayIdx + 1) - 1))
          setStreakDays(active)
        } catch {}
        const admin = session.user.email === 'spieletolga@gmail.com'
        setIsAdmin(admin)
        setLoading(false)

        try {
          const g    = parseInt(localStorage.getItem('fragenDailyGoal') ?? '10', 10)
          const goal = isNaN(g) ? 10 : Math.min(700, Math.max(1, g))
          setDailyGoal(goal); setEditGoalVal(String(goal))
          const today = new Date().toISOString().slice(0, 10)
          const c = parseInt(localStorage.getItem(`fragenDaily_${today}`) ?? '0', 10)
          setDailyCount(isNaN(c) ? 0 : c)
        } catch {}

        if (admin) {
          setAdminToken(session.access_token ?? '')
          supabase.from('appointments').select('*')
            .order('date', { ascending: true }).order('start_time', { ascending: true })
            .then(({ data }) => setAppointments(data ?? []))
        }

        const uid = session.user.id
        let localDone = false
        try { localDone = localStorage.getItem(`tutorial_done_${uid}`) === '1' } catch {}
        try { const l = localStorage.getItem(`note_${uid}`); if (l) setNoteText(l) } catch {}

        ;(async () => {
          try {
            const { data: stats } = await supabase.from('user_stats')
              .select('points,tutorial_done,is_premium').eq('user_id', uid).single()
            if (stats) {
              setPoints(stats.points ?? 0); setIsPremium(!!stats.is_premium)
              const done = !!stats.tutorial_done || localDone
              setTutorialDone(done); if (!done) setShowTutorial(true)
            } else { if (localDone) setTutorialDone(true); else setShowTutorial(true) }
          } catch { if (localDone) setTutorialDone(true); else setShowTutorial(true) }
        })()
        ;(async () => {
          try {
            const { data: n } = await supabase.from('user_notes').select('content').eq('user_id', uid).single()
            if (n?.content != null) setNoteText(n.content)
          } catch {}
        })()

        fetch('/api/leaderboard', { signal: AbortSignal.timeout(4000) })
          .then(r => r.json())
          .then((d: unknown) => { if (Array.isArray(d)) setTopEntries(d.slice(0, 5)) })
          .catch(() => {})
      } catch { setLoading(false) }
    }
    load()
  }, [router])

  const saveNote = useCallback(async (text: string, uid: string) => {
    try { localStorage.setItem(`note_${uid}`, text) } catch {}
    try { await supabase.from('user_notes').upsert({ user_id: uid, content: text, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }) } catch {}
    setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000)
  }, [])

  function handleNoteChange(text: string) {
    setNoteText(text); setNoteSaved(false)
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current)
    noteSaveTimer.current = setTimeout(() => saveNote(text, noteUserId.current), 1000)
  }

  async function updateAppt(id: string, status: 'accepted'|'rejected'|'pending') {
    setActingAppt(id)
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setActingAppt(null)
  }

  function saveGoal() {
    const n = Math.min(700, Math.max(1, parseInt(editGoalVal, 10) || 10))
    setDailyGoal(n); setEditGoalVal(String(n))
    try { localStorage.setItem('fragenDailyGoal', String(n)) } catch {}
    setEditGoal(false)
  }

  async function startCheckout() {
    if (checkingOut || isPremium) return
    setCheckingOut(true)
    try {
      const res  = await fetch('/api/checkout', { method: 'POST', headers: { authorization: `Bearer ${userToken}` } })
      const data = await res.json()
      if (data.error === 'already_premium') { setIsPremium(true); setCheckingOut(false); return }
      if (data.url) window.location.href = data.url
      else { console.error('Kein Checkout-URL:', data); setCheckingOut(false) }
    } catch (e) { console.error('Checkout-Fehler:', e); setCheckingOut(false) }
  }

  async function handleSignOut() {
    try { await signOut() } catch {}
    try { Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-') || k.startsWith('supabase')) localStorage.removeItem(k) }) } catch {}
    window.location.replace('/')
  }

  const rank      = getRank(points)
  const progress  = getProgress(points, rank)
  const nextRank  = RANKS[RANKS.indexOf(rank) + 1]
  const progVal   = Math.round(progress)
  const dailyPct  = dailyGoal > 0 ? Math.min(100, Math.round((dailyCount / dailyGoal) * 100)) : 0
  const TOTAL_Q   = 2100
  const fragenPct = Math.round((fragenDone / TOTAL_Q) * 100)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0eff7' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(99,102,241,.15)', borderTop: '3px solid #6366f1', margin: '0 auto 1rem', animation: 'db-spin .8s linear infinite' }} />
        <span style={{ color: '#6b7280', fontSize: '.8rem' }}>Wird geladen…</span>
      </div>
      <style>{`@keyframes db-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div className="db-root">
      <style>{CSS}</style>

      {/* ── Overlays ── */}
      {showTutorial && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <TutorialModal username={username} userId={userId}
            onComplete={pts => { setPoints(pts); setShowTutorial(false); setTutorialDone(true) }} />
        </div>
      )}
      {isAdmin && showAdmin && (
        <AdminDrawer onClose={() => setShowAdmin(false)} appointments={appointments}
          filter={apptFilter} setFilter={setApptFilter} acting={actingAppt}
          onUpdate={updateAppt} token={adminToken} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="db-sidebar">
        {/* Logo */}
        <div style={{ padding: '1.2rem 1.25rem 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.jpeg" alt="TolDrive" style={{
            width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
            border: '1.5px solid rgba(255,255,255,0.25)',
            boxShadow: '0 0 0 3px rgba(139,92,246,0.35)',
            flexShrink: 0,
          }} />
          <span style={{ fontWeight: 900, fontSize: '.95rem', color: '#ffffff', letterSpacing: '.06em' }}>TOLDRIVE</span>
        </div>

        {/* Nav */}
        <SidebarNav />

        <div style={{ flex: 1 }} />

        {/* PRO card */}
        <div style={{ margin: '0 .85rem .75rem', padding: '1rem', borderRadius: '1rem', background: 'linear-gradient(135deg,rgba(99,102,241,.18),rgba(139,92,246,.12))', border: '1px solid rgba(99,102,241,.25)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>💎</div>
          <p style={{ margin: '0 0 .15rem', fontWeight: 800, fontSize: '.85rem', color: '#f0f0ff' }}>TolDrive</p>
          <span style={{ display: 'inline-block', fontSize: '.52rem', fontWeight: 900, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', color: '#fff', padding: '1px 7px', borderRadius: 4, marginBottom: '.5rem', letterSpacing: '.06em' }}>PRO</span>
          <p style={{ margin: '0 0 .8rem', fontSize: '.66rem', color: '#9090b8', lineHeight: 1.45 }}>Mehr Funktionen.<br />Mehr Erfolg.</p>
          {isPremium ? (
            <span style={{ fontSize: '.72rem', color: '#22c55e', fontWeight: 700 }}>✓ Aktiv</span>
          ) : (
            <button onClick={startCheckout} disabled={checkingOut} style={{ width: '100%', padding: '.5rem', borderRadius: '.5rem', background: '#f0f0ff', color: '#1a1a2e', border: 'none', fontWeight: 700, fontSize: '.75rem', cursor: checkingOut ? 'default' : 'pointer', opacity: checkingOut ? .6 : 1 }}>
              {checkingOut ? 'Lädt…' : 'Upgrade'}
            </button>
          )}
        </div>

        {/* Notizblock */}
        <div style={{ margin: '0 .85rem .75rem', padding: '.85rem', borderRadius: '1rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
            <p style={{ margin: 0, fontSize: '.72rem', fontWeight: 700, color: '#e0e0f8' }}>📝 Notizblock</p>
            <span style={{ fontSize: '.55rem', color: noteSaved ? '#22c55e' : '#6b6b8a', transition: 'color .3s' }}>{noteSaved ? '✓ Gespeichert' : 'Auto-Save'}</span>
          </div>
          <textarea value={noteText} onChange={e => handleNoteChange(e.target.value)} placeholder="Notizen…" rows={4}
            style={{ width: '100%', resize: 'vertical', minHeight: 80, padding: '.5rem .6rem', borderRadius: '.5rem', fontSize: '.72rem', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#e0e0f8', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,.6)' }}
            onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)' }}
          />
        </div>

        {/* User */}
        <div style={{ padding: '.7rem 1.1rem .9rem', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '.82rem', fontWeight: 800, color: '#fff' }}>
            {username[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '.75rem', fontWeight: 700, color: '#e0e0f8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
            <p style={{ margin: 0, fontSize: '.6rem', color: '#6b6b8a' }}>Klasse B</p>
          </div>
          <button onClick={handleSignOut} title="Abmelden" style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="db-main">

        {/* Top bar */}
        <div className="db-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1a1a2e' }}>Dashboard</h2>
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} style={{ padding: '3px 11px', borderRadius: 100, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.3)', color: '#6366f1', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' }}>Admin</button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            {[
              <svg key="s" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
              <svg key="b" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
            ].map((ic, i) => (
              <button key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic}</button>
            ))}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.88rem', fontWeight: 800, color: '#fff', cursor: 'pointer' }}>
              {username[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="db-scroll">

          {/* ── Mobile admin button ── */}
          {isAdmin && (
            <div className="db-mob-admin" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '.75rem' }}>
              <button onClick={() => setShowAdmin(true)} style={{ padding: '5px 13px', borderRadius: 100, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.3)', color: '#6366f1', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer' }}>Admin</button>
            </div>
          )}

          {/* ── WELCOME ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 .2rem', fontSize: '.88rem', color: '#6b7280' }}>Willkommen zurück,</p>
            <h1 style={{ margin: '0 0 .25rem', fontSize: 'clamp(1.55rem,4vw,2rem)', fontWeight: 900, color: '#1a1a2e', lineHeight: 1.15 }}>
              {username} 👋
            </h1>
            <p style={{ margin: 0, fontSize: '.82rem', color: '#9ca3af' }}>Bereit für deine nächste Lerneinheit?</p>
          </div>

          {/* ── HERO CARD ── */}
          <div style={{ background: 'linear-gradient(135deg,#eef2ff 0%,#f0f4ff 50%,#ede9fe 100%)', borderRadius: '1.5rem', padding: '1.75rem 2rem 1.5rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(99,102,241,.12)' }}>
            {/* Deko-Wellen */}
            <svg style={{ position: 'absolute', bottom: 0, right: 0, opacity: .07, pointerEvents: 'none' }} width="260" height="140" viewBox="0 0 260 140">
              <path d="M0,70 Q45,35 90,60 T180,42 T260,52 L260,140 L0,140 Z" fill="#6366f1"/>
              <path d="M0,95 Q65,68 130,85 T260,75 L260,140 L0,140 Z" fill="#8b5cf6"/>
            </svg>

            {/* Top: Text + Fortschritts-Ring */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', position: 'relative', marginBottom: '1.4rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 .35rem', fontSize: '.7rem', fontWeight: 700, color: '#6366f1', letterSpacing: '.04em' }}>Führerschein Klasse B · 2026</p>
                <h2 style={{ margin: '0 0 .2rem', fontSize: 'clamp(1.25rem,3.5vw,1.65rem)', fontWeight: 900, color: '#1a1a2e', lineHeight: 1.2 }}>
                  Du bist auf dem<br />besten Weg!
                </h2>
                <p style={{ margin: '0 0 .6rem', fontSize: '.78rem', color: '#6b7280', fontStyle: 'italic' }}>Deine persönliche Lernzentrale</p>
                <Link href="/fragen" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '.58rem 1.15rem', borderRadius: 100, background: '#1a1a2e', color: '#fff', fontWeight: 700, fontSize: '.82rem', textDecoration: 'none' }}>
                  Weiterlernen →
                </Link>
              </div>
              <CircularProg value={progVal} label="Rang-XP" />
            </div>

            {/* Stats-Reihe */}
            <div className="db-hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.65rem', position: 'relative' }}>
              {[
                { icon: '⭐', val: points.toLocaleString('de'), label: 'Punkte', color: '#6366f1', bg: 'rgba(99,102,241,.1)', border: 'rgba(99,102,241,.2)' },
                { icon: rank.id === 'Legende' ? '👑' : '🏆', val: rank.id, label: rank.name, color: rank.color, bg: `${rank.color}18`, border: `${rank.color}35` },
                { icon: '📖', val: `${fragenPct}%`, label: `${fragenDone} / ${TOTAL_Q}`, color: '#22c55e', bg: 'rgba(34,197,94,.1)', border: 'rgba(34,197,94,.22)' },
                { icon: '🎯', val: nextRank ? `${nextRank.min - points} XP` : 'MAX', label: nextRank ? `bis Rang ${nextRank.id}` : 'Legende!', color: '#f97316', bg: 'rgba(249,115,22,.1)', border: 'rgba(249,115,22,.22)' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '1rem', padding: '.65rem .75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '.2rem', lineHeight: 1 }}>{s.icon}</div>
                  <p style={{ margin: '0 0 .1rem', fontSize: '.88rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{s.val}</p>
                  <p style={{ margin: 0, fontSize: '.55rem', color: '#6b7280', lineHeight: 1.3, fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── TERMIN ── */}
          <Link href="/termin" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.25rem' }}>
            <div style={{ borderRadius: '1.25rem', padding: '1.1rem 1.5rem', background: 'linear-gradient(135deg,rgba(34,197,94,.07),rgba(34,197,94,.03))', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>📅</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 .15rem', fontWeight: 800, fontSize: '.9rem', color: '#1a1a2e' }}>Termin wählen</p>
                <p style={{ margin: 0, fontSize: '.72rem', color: '#6b7280' }}>Fahrstunde buchen · Montag – Samstag</p>
              </div>
              <span style={{ color: '#22c55e', fontSize: '1.2rem', fontWeight: 700 }}>→</span>
            </div>
          </Link>

          {/* ── DEINE BEREICHE ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.8rem' }}>
              <span style={{ fontSize: '.82rem' }}>📖</span>
              <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: '#1a1a2e' }}>Deine Bereiche</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.75rem' }} className="db-quick-grid">
              {QUICK_STANDARD.map(item => (
                <Link key={item.title} href={item.href} style={{ textDecoration: 'none' }}>
                  <div className="db-qcard" style={{ background: '#fff', borderRadius: '1.1rem', padding: '1rem .9rem', border: '1px solid #e5e7eb', cursor: 'pointer', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '.7rem' }}>{item.icon}</div>
                    <p style={{ margin: '0 0 .22rem', fontWeight: 800, fontSize: '.8rem', color: '#1a1a2e' }}>{item.title}</p>
                    <p style={{ margin: '0 0 .6rem', fontSize: '.65rem', color: '#9ca3af', lineHeight: 1.4 }}>{item.desc}</p>
                    <span style={{ fontSize: '.85rem', color: item.color }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── PREMIUM BEREICH ── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.8rem' }}>
              <span style={{ fontSize: '.82rem' }}>💎</span>
              <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: '#1a1a2e' }}>Premium Bereich</h3>
              <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: 'linear-gradient(90deg,rgba(99,102,241,.12),rgba(139,92,246,.12))', border: '1px solid rgba(99,102,241,.25)', color: '#6366f1', letterSpacing: '.04em' }}>EXKLUSIV</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.75rem' }}>
              {QUICK_PREMIUM.map(item => (
                <Link key={item.title} href={item.href} style={{ textDecoration: 'none' }}>
                  <div className="db-qcard" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.04),rgba(139,92,246,.04))', borderRadius: '1.1rem', padding: '1.1rem 1rem', border: '1px solid rgba(99,102,241,.18)', cursor: 'pointer', height: '100%', boxSizing: 'border-box' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '.75rem' }}>{item.icon}</div>
                    <p style={{ margin: '0 0 .22rem', fontWeight: 800, fontSize: '.85rem', color: '#1a1a2e' }}>{item.title}</p>
                    <p style={{ margin: '0 0 .7rem', fontSize: '.67rem', color: '#9ca3af', lineHeight: 1.4 }}>{item.desc}</p>
                    <span style={{ fontSize: '.75rem', fontWeight: 800, color: item.color }}>Öffnen →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── STREAK + COMMUNITY ── */}
          <div className="db-two-col" style={{ marginBottom: '1.5rem' }}>

            {/* Streak */}
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🔥</div>
                <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: '#1a1a2e' }}>Deine Streak</h3>
              </div>

              {/* Count */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{streakCount}</span>
                <div style={{ paddingBottom: '4px' }}>
                  <p style={{ margin: 0, fontSize: '.72rem', fontWeight: 700, color: '#f97316' }}>Tage in Folge</p>
                  <p style={{ margin: 0, fontSize: '.62rem', color: '#9ca3af' }}>
                    {streakCount >= 7 ? '🏆 Mega-Streak!' : streakCount >= 3 ? '💪 Weiter so!' : 'Jeden Tag lernen!'}
                  </p>
                </div>
              </div>

              {/* Week dots */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Mo','Di','Mi','Do','Fr','Sa','So'].map((day, i) => (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '100%', aspectRatio: '1', borderRadius: '8px',
                      background: streakDays[i] ? 'linear-gradient(135deg,#f97316,#fb923c)' : '#f3f4f6',
                      border: `1px solid ${streakDays[i] ? 'rgba(249,115,22,0.35)' : '#e5e7eb'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.55rem', color: streakDays[i] ? '#fff' : '#d1d5db', fontWeight: 800,
                      boxShadow: streakDays[i] ? '0 2px 8px rgba(249,115,22,0.25)' : 'none',
                    }}>
                      {streakDays[i] ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '.52rem', color: streakDays[i] ? '#f97316' : '#9ca3af', fontWeight: 700 }}>{day}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '.85rem', height: 5, borderRadius: 3, background: '#f3f4f6', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${Math.min(100, (streakCount / 7) * 100)}%`,
                  background: 'linear-gradient(90deg,#f97316,#fb923c)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <p style={{ margin: '.4rem 0 0', fontSize: '.6rem', color: '#9ca3af' }}>
                {streakCount >= 7 ? 'Ziel erreicht 🎉' : `${7 - Math.min(streakCount, 7)} Tage bis zur 7-Tage-Streak`}
              </p>
            </div>

            {/* Community – Top Lernende */}
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏆</div>
                  <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 800, color: '#1a1a2e' }}>Community</h3>
                </div>
                <Link href="/rangliste" style={{ fontSize: '.7rem', fontWeight: 700, color: '#6366f1', textDecoration: 'none', padding: '4px 10px', borderRadius: '100px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
                  Alle →
                </Link>
              </div>

              {topEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af', fontSize: '.78rem' }}>Wird geladen…</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {topEntries.map((e, i) => {
                    const rc  = RANK_COLORS[getRankId(e.points)]
                    const me  = e.userId === userId
                    const medals = ['🥇','🥈','🥉']
                    return (
                      <div key={e.userId} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '.6rem .85rem', borderRadius: '10px',
                        background: me ? 'rgba(99,102,241,0.07)' : '#f9fafb',
                        border: me ? '1px solid rgba(99,102,241,0.22)' : '1px solid #f3f4f6',
                      }}>
                        {/* Position */}
                        <div style={{ width: 24, flexShrink: 0, textAlign: 'center', fontSize: i < 3 ? '1.05rem' : '.72rem', fontWeight: 800, color: '#9ca3af' }}>
                          {i < 3 ? medals[i] : `${i + 1}.`}
                        </div>
                        {/* Avatar */}
                        <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: `${rc}20`, border: `1.5px solid ${rc}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 900, color: rc }}>
                          {e.displayName[0]?.toUpperCase()}
                        </div>
                        {/* Name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '.78rem', fontWeight: me ? 800 : 700, color: me ? '#6366f1' : '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {e.displayName}{me ? ' (Du)' : ''}
                          </p>
                          <p style={{ margin: 0, fontSize: '.6rem', color: '#9ca3af', fontWeight: 600 }}>{getRankId(e.points)}</p>
                        </div>
                        {/* Points */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 900, color: '#1a1a2e' }}>{e.points.toLocaleString('de')}</p>
                          <p style={{ margin: 0, fontSize: '.55rem', color: '#9ca3af' }}>Punkte</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── PREMIUM BANNER ── */}
          {!isPremium && (
            <div style={{ background: 'linear-gradient(135deg,#f0f0ff,#f5f3ff)', borderRadius: '1.25rem', padding: '1.2rem', marginBottom: '1rem', border: '1px solid rgba(99,102,241,.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '.3rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '.9rem', color: '#1a1a2e' }}>Hol dir Premium</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '.7rem', color: '#6b7280' }}>Einmalig <strong>9,99 €</strong> · keine Abo-Kosten · zzgl. MwSt.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end', flexShrink: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', fontSize: '.6rem', color: '#6b7280', lineHeight: 1.4 }}>
                    <input type="checkbox" checked={agbConsent} onChange={e => setAgbConsent(e.target.checked)} style={{ marginTop: 2, accentColor: '#6366f1' }} />
                    Ich stimme den{' '}<a href="/agb" target="_blank" style={{ color: '#6366f1', textDecoration: 'underline' }}>AGB</a>{' '}zu
                  </label>
                  <button onClick={startCheckout} disabled={checkingOut || !agbConsent}
                    style={{ padding: '.5rem 1.2rem', borderRadius: 100, background: (!agbConsent || checkingOut) ? '#e5e7eb' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: (!agbConsent || checkingOut) ? '#9ca3af' : '#fff', border: 'none', fontWeight: 700, fontSize: '.75rem', cursor: (!agbConsent || checkingOut) ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
                    {checkingOut ? 'Lädt…' : 'Jetzt upgraden 💎'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile bottom padding */}
          <div className="db-mob-pad" style={{ height: 84 }} />
        </div>

        {/* Bottom nav — mobile only */}
        <BottomNav />
      </div>

      {/* ── FLOATING CHAT ── */}
      {/* Toggle button */}
      <button
        onClick={() => setChatOpen(v => !v)}
        title="Live-Chat öffnen"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 60,
          width: 52, height: 52, borderRadius: '50%',
          background: chatOpen ? '#1a1a2e' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          border: chatOpen ? '2px solid rgba(99,102,241,.4)' : 'none',
          boxShadow: '0 4px 20px rgba(99,102,241,.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s',
        }}
      >
        {chatOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 59,
          width: 'min(380px, calc(100vw - 2rem))',
          maxHeight: '70vh',
          borderRadius: '1.25rem',
          boxShadow: '0 12px 48px rgba(0,0,0,.18)',
          overflow: 'hidden',
          border: '1px solid rgba(99,102,241,.2)',
          background: '#fff',
        }}>
          <ChatBox userId={userId} username={username} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  )
}

/* ── Sidebar Nav ───────────────────────────────────────── */
function SidebarNav() {
  const pathname = usePathname()
  const items = [
    { label: 'Dashboard',   href: '/dashboard',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: 'Lernen',      href: '/unterricht',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    { label: 'Prüfung',     href: '/fragen',       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="M9 12h6M9 16h4"/></svg> },
    { label: 'Fortschritt', href: '/rangliste',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { label: 'Community',   href: '/battle',       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'Einstellungen', href: '/einstellungen', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]
  return (
    <nav style={{ padding: '0 .75rem', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
      {items.map(it => (
        <Link key={it.label} href={it.href} className={`db-navlink${pathname === it.href ? ' active' : ''}`}>
          {it.icon}
          {it.label}
        </Link>
      ))}
    </nav>
  )
}

/* ── Circular Progress ─────────────────────────────────── */
function CircularProg({ value, label = 'Fortschritt' }: { value: number; label?: string }) {
  const r = 38; const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(99,102,241,.15)" strokeWidth="5.5"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#pg)" strokeWidth="5.5"
          strokeLinecap="round" strokeDasharray={`${c*(value/100)} ${c*(1-value/100)}`}
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
        <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient></defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{value}%</span>
        <span style={{ fontSize: '.42rem', color: '#9ca3af', letterSpacing: '.05em', marginTop: 3, textTransform: 'uppercase' }}>{label}</span>
      </div>
    </div>
  )
}

/* ── Sparkline ─────────────────────────────────────────── */
function Sparkline({ color, data }: { color: string; data: number[] }) {
  const w = 80, h = 28
  const mx = Math.max(...data), mn = Math.min(...data), rng = mx - mn || 1
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-((v-mn)/rng)*(h-4)-2}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".8"/>
    </svg>
  )
}

/* ── Bottom Nav ────────────────────────────────────────── */
function BottomNav() {
  const pathname = usePathname()
  const tabs = [
    { label: 'Dashboard',   href: '/dashboard',    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: 'Lernen',      href: '/unterricht',   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    { label: 'Prüfung',     href: '/fragen',       icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg> },
    { label: 'Fortschritt', href: '/rangliste',    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { label: 'Settings',    href: '/einstellungen',icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(247,244,239,.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around', alignItems: 'stretch', padding: '.45rem 0 calc(.45rem + env(safe-area-inset-bottom,0px))' }}
      className="db-bottomnav">
      {tabs.map(tab => {
        const active = pathname === tab.href
        return (
          <Link key={tab.label} href={tab.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', padding: '.3rem', flex: 1, color: active ? '#6366f1' : '#9ca3af', transition: 'color .15s' }}>
            {tab.icon}
            <span style={{ fontSize: '.5rem', fontWeight: active ? 700 : 500 }}>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

/* ─── Admin components (unchanged) ────────────────────── */

type AdminDrawerProps = {
  onClose: () => void; appointments: Appointment[]
  filter: 'pending'|'accepted'|'rejected'|'all'
  setFilter: (f: 'pending'|'accepted'|'rejected'|'all') => void
  acting: string|null; onUpdate: (id: string, status: 'accepted'|'rejected'|'pending') => void; token: string
}
const ADMIN_SECTIONS = [
  { id: 'fahrstundler', label: 'Fahrschüler verwalten', icon: '👤' },
  { id: 'anfragen',     label: 'Fahrstunden-Anfragen',  icon: '🚗' },
  { id: 'sperren',      label: 'Tage sperren',           icon: '🚫' },
  { id: 'einstellung',  label: 'Kalender-Einstellungen', icon: '⚙️' },
] as const
type AdminSectionId = typeof ADMIN_SECTIONS[number]['id']

function AdminDrawer({ onClose, appointments, filter, setFilter, acting, onUpdate, token }: AdminDrawerProps) {
  const [active, setActive] = useState<AdminSectionId|null>(null)
  const pending = appointments.filter(a => a.status === 'pending').length
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201, width: 'min(480px,100vw)', background: '#17171c', borderLeft: '1px solid rgba(139,92,246,.2)', display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 48px rgba(0,0,0,.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 800, color: '#e8e8f0' }}>Admin-Bereich</p>
              <p style={{ margin: 0, fontSize: '.62rem', color: '#6b6b8a' }}>Nur für Administratoren</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', color: '#9090b8', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {ADMIN_SECTIONS.map(s => (
            <div key={s.id}>
              <button onClick={() => setActive(prev => prev === s.id ? null : s.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.9rem 1rem', borderRadius: '1rem', background: active === s.id ? 'rgba(139,92,246,.1)' : 'rgba(255,255,255,.03)', border: `1px solid ${active === s.id ? 'rgba(139,92,246,.3)' : 'rgba(255,255,255,.07)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: active === s.id ? 'rgba(139,92,246,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${active === s.id ? 'rgba(139,92,246,.3)' : 'rgba(255,255,255,.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{s.icon}</span>
                <span style={{ flex: 1, fontSize: '.83rem', fontWeight: 700, color: active === s.id ? '#a78bfa' : '#e8e8f0' }}>
                  {s.label}
                  {s.id === 'anfragen' && pending > 0 && (
                    <span style={{ marginLeft: 8, padding: '1px 7px', borderRadius: 100, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', fontSize: '.62rem', fontWeight: 800 }}>{pending}</span>
                  )}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active === s.id ? '#a78bfa' : '#6b6b8a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: active === s.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {active === s.id && (
                <div style={{ marginTop: '.5rem', paddingLeft: '.25rem' }}>
                  {s.id === 'fahrstundler' && <AdminFahrstundler token={token} />}
                  {s.id === 'anfragen'     && <AdminTermine appointments={appointments} filter={filter} setFilter={setFilter} acting={acting} onUpdate={onUpdate} />}
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

type UserRow = { userId: string; email: string; username: string; appApproved: boolean; fahrstundler: boolean; createdAt: string }

function AdminFahrstundler({ token }: { token: string }) {
  const [users, setUsers]   = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState<string|null>(null)
  const [search, setSearch]   = useState('')
  const [open, setOpen]       = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/fahrstundler', { headers: { authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d) }).finally(() => setLoading(false))
  }, [token])

  async function toggle(userId: string, cur: boolean) {
    setActing(userId)
    await fetch('/api/admin/fahrstundler', { method: cur ? 'DELETE' : 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ userId }) })
    setUsers(prev => prev.map(u => u.userId === userId ? { ...u, fahrstundler: !cur } : u))
    setActing(null)
  }

  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const cnt = users.filter(u => u.fahrstundler).length

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,.04),rgba(14,12,8,.95))', border: '1px solid rgba(34,197,94,.2)', borderRadius: '1.75rem', padding: '1.5rem 2rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: open ? '1.1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#22c55e,rgba(34,197,94,.3))' }} />
          <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 900, color: '#e8e8f0' }}>👤 Fahrschüler verwalten</p>
          <span style={{ padding: '2px 10px', borderRadius: 100, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', color: '#22c55e', fontSize: '.65rem', fontWeight: 800 }}>{cnt} freigegeben</span>
        </div>
        <button onClick={() => setOpen(v => !v)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, color: '#9090b8', fontSize: '.7rem', padding: '4px 12px', cursor: 'pointer' }}>{open ? '▲ Einklappen' : '▼ Anzeigen'}</button>
      </div>
      {open && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name oder E-Mail suchen…" style={{ width: '100%', boxSizing: 'border-box', padding: '.55rem .85rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 9, color: '#e8e8f0', fontSize: '.77rem', fontFamily: 'inherit', outline: 'none', marginBottom: '.85rem' }} />
          {loading ? <p style={{ textAlign: 'center', color: '#6b6b8a', fontSize: '.77rem', padding: '1rem 0' }}>Lädt…</p> : filtered.length === 0 ? <p style={{ textAlign: 'center', color: '#6b6b8a', fontSize: '.77rem', padding: '1rem 0' }}>Keine Nutzer gefunden.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {filtered.map(u => (
                <div key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap', padding: '.7rem 1rem', borderRadius: 10, background: u.fahrstundler ? 'rgba(34,197,94,.05)' : 'rgba(255,255,255,.025)', border: u.fahrstundler ? '1px solid rgba(34,197,94,.18)' : '1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: u.fahrstundler ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)', border: `1.5px solid ${u.fahrstundler ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 800, color: u.fahrstundler ? '#22c55e' : '#6b6b8a' }}>{u.username[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 700, color: '#e8e8f0' }}>{u.username}</p>
                    <p style={{ margin: 0, fontSize: '.65rem', color: '#6b6b8a' }}>{u.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                    {u.appApproved ? <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(var(--gold-rgb),.1)', border: '1px solid rgba(var(--gold-rgb),.25)', color: 'var(--gold)' }}>App ✓</span> : <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171' }}>App ✗</span>}
                    {u.fahrstundler && <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', color: '#22c55e' }}>Fahrschüler ✓</span>}
                  </div>
                  <button onClick={() => toggle(u.userId, u.fahrstundler)} disabled={acting === u.userId} style={{ padding: '5px 14px', borderRadius: 8, fontSize: '.7rem', fontWeight: 700, background: u.fahrstundler ? 'rgba(239,68,68,.08)' : 'rgba(34,197,94,.1)', border: u.fahrstundler ? '1px solid rgba(239,68,68,.25)' : '1px solid rgba(34,197,94,.3)', color: u.fahrstundler ? '#f87171' : '#22c55e', cursor: acting === u.userId ? 'default' : 'pointer', opacity: acting === u.userId ? .5 : 1, flexShrink: 0, whiteSpace: 'nowrap', transition: 'all .15s' }}>
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

function AdminTermine({ appointments, filter, setFilter, acting, onUpdate }: { appointments: Appointment[]; filter: 'pending'|'accepted'|'rejected'|'all'; setFilter: (f: 'pending'|'accepted'|'rejected'|'all') => void; acting: string|null; onUpdate: (id: string, status: 'accepted'|'rejected'|'pending') => void }) {
  const pending  = appointments.filter(a => a.status === 'pending')
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)
  const labels: Record<string,string> = { pending: 'Offen', accepted: 'Bestätigt', rejected: 'Abgelehnt', all: 'Alle' }
  const sc: Record<string,string>     = { pending: '#c9a227', accepted: '#22c55e', rejected: '#f87171' }
  const sl: Record<string,string>     = { pending: 'Ausstehend', accepted: 'Bestätigt', rejected: 'Abgelehnt' }
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,.04),rgba(14,12,8,.95))', border: '1px solid rgba(239,68,68,.2)', borderRadius: '1.75rem', padding: '1.5rem 2rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#ef4444,rgba(239,68,68,.3))' }} />
          <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 900, color: '#e8e8f0' }}>🚗 Fahrstunden-Anfragen</p>
          {pending.length > 0 && <span style={{ padding: '2px 10px', borderRadius: 100, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', fontSize: '.68rem', fontWeight: 800 }}>{pending.length} offen</span>}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['pending','accepted','rejected','all'] as const).map(f => {
            const c2 = f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length
            return <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: '.65rem', fontWeight: 700, border: filter === f ? '1px solid rgba(239,68,68,.35)' : '1px solid rgba(255,255,255,.07)', background: filter === f ? 'rgba(239,68,68,.1)' : 'rgba(255,255,255,.03)', color: filter === f ? '#f87171' : '#6b6b8a', cursor: 'pointer' }}>{labels[f]} ({c2})</button>
          })}
        </div>
      </div>
      {filtered.length === 0 ? <p style={{ textAlign: 'center', color: '#6b6b8a', fontSize: '.78rem', padding: '1.25rem 0' }}>Keine Anfragen in dieser Kategorie.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(a => {
            const ds = new Date(a.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
            const ts = `${a.start_time.slice(0,5)} – ${slotEnd(a.start_time, a.duration_min)} Uhr`
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '.85rem 1.1rem', borderRadius: 12, background: a.status === 'pending' ? 'rgba(var(--gold-rgb),.04)' : 'var(--surface-2)', border: a.status === 'pending' ? '1px solid rgba(var(--gold-rgb),.15)' : '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '.82rem', fontWeight: 800, color: '#e8e8f0', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    👤 {a.full_name ?? a.student_name}
                    {a.full_name && a.full_name !== a.student_name && <span style={{ fontSize: '.62rem', color: '#6b6b8a', fontWeight: 500 }}>(@{a.student_name})</span>}
                    {a.appointment_type === 'regeltermin' && <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: 'rgba(var(--gold-rgb),.1)', border: '1px solid rgba(var(--gold-rgb),.25)', color: 'var(--gold)' }}>🔁 Regeltermin</span>}
                  </p>
                  <p style={{ margin: 0, fontSize: '.72rem', color: '#9090b8' }}>{ds} · {ts} · {a.duration_min} Min.</p>
                  {a.note && <p style={{ margin: '2px 0 0', fontSize: '.67rem', color: '#6b6b8a', fontStyle: 'italic' }}>„{a.note}"</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: `${sc[a.status]}18`, color: sc[a.status] ?? '#6b6b8a', border: `1px solid ${sc[a.status]}30` }}>{sl[a.status] ?? a.status}</span>
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => onUpdate(a.id,'accepted')} disabled={acting===a.id} style={{ padding: '5px 12px', borderRadius: 7, fontSize: '.68rem', fontWeight: 700, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', color: '#22c55e', cursor: 'pointer', opacity: acting===a.id?.5:1 }}>✓ OK</button>
                      <button onClick={() => onUpdate(a.id,'rejected')} disabled={acting===a.id} style={{ padding: '5px 12px', borderRadius: 7, fontSize: '.68rem', fontWeight: 700, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', cursor: 'pointer', opacity: acting===a.id?.5:1 }}>✕</button>
                    </>
                  )}
                  {a.status !== 'pending' && <button onClick={() => onUpdate(a.id,'pending')} style={{ padding: '4px 9px', borderRadius: 6, fontSize: '.6rem', fontWeight: 600, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', color: '#6b6b8a', cursor: 'pointer' }}>↩</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AdminBlockedDays({ token }: { token: string }) {
  const [blocked, setBlocked] = useState<{ date: string; reason: string|null }[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(true)
  const [newDate, setNewDate]     = useState('')
  const [newReason, setNewReason] = useState('')
  const [acting, setActing]       = useState(false)

  useEffect(() => {
    fetch('/api/admin/blocked-days').then(r => r.json()).then((d: { date: string; reason: string|null }[]) => { if (Array.isArray(d)) setBlocked(d.sort((a,b) => a.date.localeCompare(b.date))) }).catch(()=>{}).finally(() => setLoading(false))
  }, [])

  async function add() {
    if (!newDate || acting) return; setActing(true)
    await fetch('/api/admin/blocked-days', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ date: newDate, reason: newReason.trim()||null }) })
    setBlocked(prev => [...prev, { date: newDate, reason: newReason.trim()||null }].sort((a,b) => a.date.localeCompare(b.date)))
    setNewDate(''); setNewReason(''); setActing(false)
  }
  async function remove(date: string) {
    setActing(true)
    await fetch('/api/admin/blocked-days', { method: 'DELETE', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ date }) })
    setBlocked(prev => prev.filter(b => b.date !== date)); setActing(false)
  }

  const fmt = (d: string) => new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'})
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,.03),rgba(14,12,8,.95))', border: '1px solid rgba(239,68,68,.15)', borderRadius: '1.75rem', padding: '1.5rem 2rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: open ? '1.1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#ef4444,rgba(239,68,68,.3))' }} />
          <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 900, color: '#e8e8f0' }}>🚫 Tage sperren</p>
          {blocked.length > 0 && <span style={{ padding: '2px 10px', borderRadius: 100, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', fontSize: '.65rem', fontWeight: 800 }}>{blocked.length} gesperrt</span>}
        </div>
        <button onClick={() => setOpen(v=>!v)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, color: '#9090b8', fontSize: '.7rem', padding: '4px 12px', cursor: 'pointer' }}>{open ? '▲ Einklappen':'▼ Anzeigen'}</button>
      </div>
      {open && (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '.85rem' }}>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min="2026-01-01" max="2026-12-31" style={{ padding: '.5rem .75rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, color: '#e8e8f0', fontSize: '.77rem', fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' }} />
            <input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Grund (z.B. Urlaub)" style={{ flex: 1, minWidth: 140, padding: '.5rem .75rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, color: '#e8e8f0', fontSize: '.77rem', fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={add} disabled={!newDate||acting} style={{ padding: '.5rem 1.1rem', borderRadius: 9, fontSize: '.75rem', fontWeight: 700, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', cursor: (!newDate||acting)?'default':'pointer', opacity: (!newDate||acting)?.5:1, whiteSpace: 'nowrap' }}>🚫 Sperren</button>
          </div>
          {loading ? <p style={{ textAlign: 'center', color: '#6b6b8a', fontSize: '.77rem', padding: '.5rem 0' }}>Lädt…</p> : blocked.length===0 ? <p style={{ color: '#6b6b8a', fontSize: '.75rem' }}>Keine gesperrten Tage.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {blocked.map(b => (
                <div key={b.date} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', padding: '.6rem .85rem', borderRadius: 9, background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '.78rem', fontWeight: 700, color: '#e8e8f0' }}>{fmt(b.date)}</p>
                    {b.reason && <p style={{ margin: 0, fontSize: '.65rem', color: '#f87171' }}>{b.reason}</p>}
                  </div>
                  <button onClick={() => remove(b.date)} disabled={acting} style={{ padding: '4px 12px', borderRadius: 7, fontSize: '.68rem', fontWeight: 700, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)', color: '#22c55e', cursor: acting?'default':'pointer', opacity: acting?.5:1 }}>✓ Freigeben</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SettingRow({ label, desc, enabled, saving, onToggle }: { label:string;desc:string;enabled:boolean;saving:boolean;onToggle:()=>void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '.75rem 1rem', borderRadius: 10, background: enabled?'rgba(139,92,246,.05)':'rgba(255,255,255,.025)', border: enabled?'1px solid rgba(139,92,246,.2)':'1px solid rgba(255,255,255,.06)' }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 700, color: '#e8e8f0' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '.65rem', color: '#6b6b8a' }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: enabled?'rgba(34,197,94,.1)':'rgba(239,68,68,.08)', color: enabled?'#22c55e':'#f87171', border: `1px solid ${enabled?'rgba(34,197,94,.25)':'rgba(239,68,68,.2)'}` }}>{enabled?'AN':'AUS'}</span>
        <button onClick={onToggle} disabled={saving} style={{ padding: '5px 16px', borderRadius: 8, fontSize: '.7rem', fontWeight: 700, background: enabled?'rgba(239,68,68,.08)':'rgba(139,92,246,.12)', border: enabled?'1px solid rgba(239,68,68,.25)':'1px solid rgba(139,92,246,.3)', color: enabled?'#f87171':'#a78bfa', cursor: saving?'default':'pointer', opacity: saving?.5:1, transition: 'all .15s' }}>{saving?'…':enabled?'Sperren':'Freigeben'}</button>
      </div>
    </div>
  )
}

function AdminSettings({ token }: { token: string }) {
  const [satEnabled,   setSatEnabled]   = useState<boolean|null>(null)
  const [multiEnabled, setMultiEnabled] = useState<boolean|null>(null)
  const [saving, setSaving] = useState<string|null>(null)
  const [open,   setOpen]   = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then((d: Record<string,string>) => { setSatEnabled(d.saturday_enabled==='true'); setMultiEnabled(d.multi_booking_enabled==='true') }).catch(()=>{})
  }, [])

  async function toggle(key: string, cur: boolean, setter: (v:boolean)=>void) {
    setSaving(key)
    await fetch('/api/admin/settings', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ key, value: String(!cur) }) })
    setter(!cur); setSaving(null)
  }

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,.04),rgba(14,12,8,.95))', border: '1px solid rgba(139,92,246,.2)', borderRadius: '1.75rem', padding: '1.5rem 2rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginBottom: open ? '1.1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg,#8b5cf6,rgba(139,92,246,.3))' }} />
          <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 900, color: '#e8e8f0' }}>⚙️ Kalender-Einstellungen</p>
        </div>
        <button onClick={() => setOpen(v=>!v)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, color: '#9090b8', fontSize: '.7rem', padding: '4px 12px', cursor: 'pointer' }}>{open?'▲ Einklappen':'▼ Anzeigen'}</button>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {satEnabled === null ? <p style={{ textAlign: 'center', color: '#6b6b8a', fontSize: '.75rem', padding: '.75rem 0' }}>Lädt…</p> : (
            <>
              <SettingRow label="Samstag freigeben" desc="Fahrschüler können Sa buchen · 12–15 Uhr & 19–23 Uhr" enabled={satEnabled} saving={saving==='saturday_enabled'} onToggle={() => toggle('saturday_enabled', satEnabled, setSatEnabled)} />
              <SettingRow label="Mehrfachtermine erlauben" desc="Mehr als 1 Termin pro Woche buchbar" enabled={multiEnabled??false} saving={saving==='multi_booking_enabled'} onToggle={() => multiEnabled!==null && toggle('multi_booking_enabled', multiEnabled, setMultiEnabled)} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
