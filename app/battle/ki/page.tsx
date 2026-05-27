'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { questions as ALL_Q } from '@/data/questions'
import type { Question } from '@/types'

/* ── Constants ── */
const TOTAL_Q   = 10
const ANSWER_MS = 10_000
const RESULT_MS = 3_000
const ROUND_MS  = ANSWER_MS + RESULT_MS

/* ── KI difficulty profiles ── */
const KI_PROFILES = {
  leicht:  { name: 'KI Rookie',   accuracy: 0.55, minMs: 4500, maxMs: 8500, emoji: '🟢' },
  mittel:  { name: 'KI Pro',      accuracy: 0.72, minMs: 2800, maxMs: 6500, emoji: '🟡' },
  schwer:  { name: 'KI Meister',  accuracy: 0.88, minMs: 1200, maxMs: 4000, emoji: '🔴' },
}
type Difficulty = keyof typeof KI_PROFILES

/* ── Types ── */
type RoundPhase = 'answer' | 'result'
type Screen     = 'select' | 'countdown' | 'game' | 'finished'

interface KiAnswer {
  questionIndex: number
  answerId: string
  isCorrect: boolean
  responseMs: number
}

/* ── Helpers ── */
function pickRandomQuestions(): Question[] {
  const copy = [...ALL_Q]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, TOTAL_Q)
}

function kiDecide(q: Question, accuracy: number, minMs: number, maxMs: number): Omit<KiAnswer, 'questionIndex'> {
  const correct = Math.random() < accuracy
  const correctAns = q.answers.find(a => a.correct)!
  const wrongAns   = q.answers.filter(a => !a.correct)
  const chosen     = correct ? correctAns : wrongAns[Math.floor(Math.random() * wrongAns.length)]
  const responseMs = Math.floor(minMs + Math.random() * (maxMs - minMs))
  return { answerId: chosen.id, isCorrect: correct, responseMs }
}

/* ── CSS ── */
const CSS = `
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes pop    { 0%{transform:scale(.9);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes countdown { from{transform:scale(1.4);opacity:0} to{transform:scale(1);opacity:1} }
.diff-btn {
  flex:1; padding:1rem .75rem; border-radius:1.1rem; cursor:pointer;
  border:2px solid var(--border); background:var(--surface);
  transition:all .18s; text-align:center;
}
.diff-btn:hover  { transform:translateY(-2px); box-shadow:0 6px 18px rgba(var(--gold-rgb),.14); }
.diff-btn.active { border-color:var(--gold); background:rgba(var(--gold-rgb),.07); box-shadow:0 0 0 3px rgba(var(--gold-rgb),.12); }
.ans-btn {
  width:100%; padding:.85rem 1.1rem; border-radius:1rem; cursor:pointer;
  display:flex; align-items:center; gap:.75rem;
  background:var(--surface); border:1.5px solid var(--border);
  color:var(--text); font-size:.85rem; font-weight:600; text-align:left;
  transition:all .18s;
}
.ans-btn:hover:not(:disabled) { border-color:rgba(var(--gold-rgb),.55); background:rgba(var(--gold-rgb),.05); transform:translateY(-1px); }
.ans-btn:disabled { cursor:default; }
.ans-btn.correct { background:rgba(34,197,94,.09); border-color:rgba(34,197,94,.5); }
.ans-btn.wrong   { background:rgba(239,68,68,.07);  border-color:rgba(239,68,68,.4); }
.ans-btn.reveal  { background:rgba(34,197,94,.06);  border-color:rgba(34,197,94,.3); }
`

/* ════════════════════════════════════════════════════════════ */
export default function KiBattle() {
  const router = useRouter()
  const [userId,    setUserId]    = useState('')
  const [username,  setUsername]  = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [loading,   setLoading]   = useState(true)

  /* ── Game setup ── */
  const [difficulty, setDifficulty] = useState<Difficulty>('mittel')
  const [screen,     setScreen]     = useState<Screen>('select')
  const [countdownN, setCountdownN] = useState(3)

  /* ── Game state ── */
  const [questions,   setQuestions]   = useState<Question[]>([])
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [roundPhase,  setRoundPhase]  = useState<RoundPhase>('answer')
  const [timeLeft,    setTimeLeft]    = useState(ANSWER_MS / 1000)
  const [elapsedInRound, setElapsedInRound] = useState(0)

  /* ── Answers ── */
  const [myAnswers,  setMyAnswers]  = useState<KiAnswer[]>([])
  const [kiAnswers,  setKiAnswers]  = useState<KiAnswer[]>([])
  const [chosenId,   setChosenId]   = useState<string | null>(null)

  /* ── Refs ── */
  const startMsRef    = useRef<number>(0)
  const answeredRef   = useRef<Set<number>>(new Set())
  const kiScheduleRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const gameStartedRef = useRef(false)

  /* ── Load user ── */
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/'); return }
      setUserId(session.user.id)
      setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Du')
      const { data } = await supabase.from('user_stats').select('is_premium').eq('user_id', session.user.id).single()
      setIsPremium(!!data?.is_premium)
      setLoading(false)
    })
  }, [router])

  /* ── Start game ── */
  const startGame = useCallback(() => {
    if (gameStartedRef.current) return
    gameStartedRef.current = true

    const qs = pickRandomQuestions()
    setQuestions(qs)
    setMyAnswers([])
    setKiAnswers([])
    answeredRef.current.clear()
    kiScheduleRef.current.forEach(t => clearTimeout(t))
    kiScheduleRef.current.clear()

    // Countdown 3 → 2 → 1 → Go
    setScreen('countdown')
    setCountdownN(3)
    let c = 3
    const iv = setInterval(() => {
      c--
      if (c > 0) { setCountdownN(c) }
      else {
        clearInterval(iv)
        const now = Date.now()
        startMsRef.current = now
        setScreen('game')
        scheduleKiAnswers(qs, KI_PROFILES[difficulty], now)
      }
    }, 1000)
  }, [difficulty])

  /* ── Schedule all KI answers upfront ── */
  function scheduleKiAnswers(qs: Question[], profile: typeof KI_PROFILES[Difficulty], startMs: number) {
    qs.forEach((q, i) => {
      const decision = kiDecide(q, profile.accuracy, profile.minMs, profile.maxMs)
      const fireAt   = i * ROUND_MS + decision.responseMs
      const delay    = fireAt - (Date.now() - startMs)
      if (delay > 0) {
        const t = setTimeout(() => {
          setKiAnswers(prev => [...prev, { questionIndex: i, ...decision }])
        }, delay)
        kiScheduleRef.current.set(i, t)
      }
    })
  }

  /* ── Timer loop ── */
  useEffect(() => {
    if (screen !== 'game') return
    const tick = () => {
      const elapsed    = Date.now() - startMsRef.current
      const totalGameMs = TOTAL_Q * ROUND_MS

      if (elapsed >= totalGameMs) { setScreen('finished'); return }

      const qi       = Math.floor(elapsed / ROUND_MS)
      const qElapsed = elapsed % ROUND_MS
      setCurrentQIdx(qi)
      setElapsedInRound(qElapsed)

      if (qElapsed < ANSWER_MS) {
        setRoundPhase('answer')
        setTimeLeft(Math.max(0, Math.ceil((ANSWER_MS - qElapsed) / 1000)))
      } else {
        setRoundPhase('result')
        setTimeLeft(0)
      }
    }
    tick()
    const iv = setInterval(tick, 100)
    return () => clearInterval(iv)
  }, [screen])

  /* ── Reset chosen on new question ── */
  useEffect(() => { setChosenId(null) }, [currentQIdx])

  /* ── Submit answer ── */
  const submitAnswer = useCallback((answerId: string) => {
    if (answeredRef.current.has(currentQIdx)) return
    answeredRef.current.add(currentQIdx)
    setChosenId(answerId)
    const q = questions[currentQIdx]
    const correct = q?.answers.find(a => a.id === answerId)?.correct ?? false
    setMyAnswers(prev => [...prev, {
      questionIndex: currentQIdx,
      answerId,
      isCorrect: correct,
      responseMs: Math.min(elapsedInRound, ANSWER_MS),
    }])
  }, [currentQIdx, questions, elapsedInRound])

  /* ── Cleanup on unmount ── */
  useEffect(() => () => {
    kiScheduleRef.current.forEach(t => clearTimeout(t))
  }, [])

  /* ══════════════════════════════ RENDER ══════════════════════════════ */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <style>{CSS}</style>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(var(--gold-rgb),.15)', borderTop: '3px solid var(--gold)', animation: 'spin .8s linear infinite' }} />
    </div>
  )

  /* ── NOT PREMIUM ── */
  if (!isPremium) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 400, textAlign: 'center', animation: 'fadeUp .4s ease both' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
        <h2 style={{ margin: '0 0 .5rem', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>Premium-Feature</h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          KI-Battle ist exklusiv für Premium-Nutzer. Upgrade dein Konto und tritt gegen die KI an!
        </p>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '.85rem 2rem', borderRadius: '1rem', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,.3)' }}>
          💎 Jetzt upgraden
        </button>
      </div>
    </div>
  )

  const ki = KI_PROFILES[difficulty]

  /* ── DIFFICULTY SELECT ── */
  if (screen === 'select') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem 6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 460, width: '100%', animation: 'fadeUp .5s ease both' }}>
        <div style={{ background: 'var(--surface)', borderRadius: '1.5rem', border: '1px solid rgba(var(--gold-rgb),.18)', padding: '2rem 1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(var(--gold-rgb),.12),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '.6rem' }}>🤖</div>
            <h1 style={{ margin: '0 0 .35rem', fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>KI-Battle</h1>
            <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--text-muted)' }}>
              10 Fragen · 10 Sekunden · Gegen eine KI antreten
            </p>
          </div>

          <p style={{ margin: '0 0 .75rem', fontSize: '.7rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Schwierigkeitsgrad</p>
          <div style={{ display: 'flex', gap: '.65rem', marginBottom: '1.5rem' }}>
            {(Object.entries(KI_PROFILES) as [Difficulty, typeof KI_PROFILES[Difficulty]][]).map(([key, p]) => (
              <button
                key={key}
                className={`diff-btn${difficulty === key ? ' active' : ''}`}
                onClick={() => setDifficulty(key)}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '.35rem' }}>{p.emoji}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 800, color: difficulty === key ? 'var(--gold)' : 'var(--text)', marginBottom: '.2rem' }}>{p.name}</div>
                <div style={{ fontSize: '.6rem', color: 'var(--text-dim)' }}>
                  {Math.round(p.accuracy * 100)}% Trefferquote
                </div>
              </button>
            ))}
          </div>

          {/* KI info card */}
          <div style={{ background: 'rgba(var(--gold-rgb),.05)', border: '1px solid rgba(var(--gold-rgb),.15)', borderRadius: '1rem', padding: '.85rem 1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(var(--gold-rgb),.1)', border: '1.5px solid rgba(var(--gold-rgb),.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                🤖
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 700, color: 'var(--text)' }}>{ki.name}</p>
                <p style={{ margin: 0, fontSize: '.62rem', color: 'var(--text-dim)' }}>
                  Antwortet in {(ki.minMs / 1000).toFixed(1)}–{(ki.maxMs / 1000).toFixed(1)}s · {Math.round(ki.accuracy * 100)}% Genauigkeit
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            style={{ width: '100%', padding: '1rem', borderRadius: '1rem', background: 'linear-gradient(135deg,#4f46e5,#6366f1,#8b5cf6)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '.95rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,.35)', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,.35)' }}
          >
            ⚔️ Battle starten
          </button>
        </div>
      </div>
    </div>
  )

  /* ── COUNTDOWN ── */
  if (screen === 'countdown') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{CSS}</style>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 .5rem', fontSize: '.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Du vs. {ki.name}
        </p>
        <div key={countdownN} style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1, animation: 'countdown .5s ease both' }}>
          {countdownN}
        </div>
        <p style={{ margin: '.5rem 0 0', fontSize: '.85rem', color: 'var(--text-dim)' }}>Battle startet…</p>
      </div>
    </div>
  )

  /* ── FINISHED ── */
  if (screen === 'finished') {
    const myPts  = myAnswers.filter(a => a.isCorrect).length
    const kiPts  = kiAnswers.filter(a => a.isCorrect).length
    const myMs   = myAnswers.filter(a => a.isCorrect).reduce((s, a) => s + a.responseMs, 0)
    const kiMs   = kiAnswers.filter(a => a.isCorrect).reduce((s, a) => s + a.responseMs, 0)
    const iWon   = myPts > kiPts || (myPts === kiPts && myMs < kiMs)
    const isDraw = myPts === kiPts && myMs === kiMs

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 420, width: '100%', animation: 'pop .4s ease both' }}>
          {/* Banner */}
          <div style={{
            background: isDraw ? 'linear-gradient(135deg,rgba(var(--gold-rgb),.12),rgba(var(--gold-rgb),.06))'
              : iWon ? 'linear-gradient(135deg,rgba(34,197,94,.12),rgba(34,197,94,.06))'
              : 'linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.04))',
            border: `1px solid ${isDraw ? 'rgba(var(--gold-rgb),.3)' : iWon ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.3)'}`,
            borderRadius: '1.5rem', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '.5rem' }}>{isDraw ? '🤝' : iWon ? '🏆' : '💀'}</div>
            <h1 style={{ margin: '0 0 .3rem', fontSize: '1.6rem', fontWeight: 900, color: isDraw ? 'var(--gold)' : iWon ? '#16a34a' : '#dc2626' }}>
              {isDraw ? 'Unentschieden!' : iWon ? 'Du hast gewonnen!' : 'KI hat gewonnen!'}
            </h1>
            <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-muted)' }}>
              {myPts === kiPts && !isDraw
                ? `Gleiche Punkte – ${iWon ? `du warst ${((kiMs - myMs)/1000).toFixed(1)}s schneller` : `KI war ${((myMs - kiMs)/1000).toFixed(1)}s schneller`}`
                : `${myPts} : ${kiPts} Punkte`
              }
            </p>
          </div>

          {/* Scores */}
          <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
            {[
              { name: `${username} (Du)`, pts: myPts, ms: myMs, me: true },
              { name: ki.name + ' ' + ki.emoji, pts: kiPts, ms: kiMs, me: false },
            ].map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.65rem .85rem', borderRadius: '.85rem', marginBottom: '.5rem', background: p.me ? 'rgba(var(--gold-rgb),.06)' : 'var(--surface-2)', border: `1px solid ${p.me ? 'rgba(var(--gold-rgb),.18)' : 'var(--border)'}` }}>
                <div>
                  <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 700, color: 'var(--text)' }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: '.62rem', color: 'var(--text-dim)' }}>Ø {p.pts > 0 ? ((p.ms / p.pts) / 1000).toFixed(1) : '–'}s / richtige Antwort</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{p.pts}</p>
                  <p style={{ margin: 0, fontSize: '.58rem', color: 'var(--text-dim)' }}>/ {TOTAL_Q}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Question dots */}
          <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', border: '1px solid var(--border)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 .75rem', fontSize: '.68rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Fragen-Übersicht</p>
            <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
              {Array.from({ length: TOTAL_Q }, (_, i) => {
                const myA = myAnswers.find(a => a.questionIndex === i)
                return (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, background: myA?.isCorrect ? 'rgba(34,197,94,.1)' : myA ? 'rgba(239,68,68,.08)' : 'var(--surface-2)', border: `1.5px solid ${myA?.isCorrect ? 'rgba(34,197,94,.35)' : myA ? 'rgba(239,68,68,.3)' : 'var(--border)'}`, color: myA?.isCorrect ? '#16a34a' : myA ? '#dc2626' : 'var(--text-dim)' }}>
                    {myA?.isCorrect ? '✓' : myA ? '✗' : '–'}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.65rem' }}>
            <button onClick={() => { gameStartedRef.current = false; setScreen('select'); setCurrentQIdx(0); setRoundPhase('answer'); setTimeLeft(10) }} style={{ flex: 1, padding: '.85rem', borderRadius: '1rem', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(99,102,241,.3)' }}>
              🔄 Nochmal
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ flex: 1, padding: '.85rem', borderRadius: '1rem', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              🏠 Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── ACTIVE GAME ── */
  const q       = questions[currentQIdx]
  const myA     = myAnswers.find(a => a.questionIndex === currentQIdx)
  const kiA     = kiAnswers.find(a => a.questionIndex === currentQIdx)
  const hasAnswered = !!myA || answeredRef.current.has(currentQIdx)
  const isResult   = roundPhase === 'result'
  const myPtsLive  = myAnswers.filter(a => a.isCorrect).length
  const kiPtsLive  = kiAnswers.filter(a => a.isCorrect).length
  const timerColor = timeLeft > 6 ? '#22c55e' : timeLeft > 3 ? '#eab308' : '#ef4444'
  const timerPct   = (timeLeft / (ANSWER_MS / 1000)) * 100

  if (!q) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1rem 1rem 5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{CSS}</style>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Scoreboard */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '.75rem 1rem', marginBottom: '.85rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '.7rem', fontWeight: 700, color: 'var(--gold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>{myPtsLive}</p>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '.06em', marginBottom: 2 }}>Frage {currentQIdx + 1}/{TOTAL_Q}</div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isResult ? 'rgba(var(--gold-rgb),.08)' : `conic-gradient(${timerColor} ${timerPct}%, rgba(var(--gold-rgb),.08) 0%)`, border: `2px solid ${isResult ? 'rgba(var(--gold-rgb),.2)' : timerColor + '55'}`, fontSize: '.85rem', fontWeight: 900, color: isResult ? 'var(--gold)' : timerColor }}>
              {isResult ? '⚡' : timeLeft}
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{ki.name}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>{kiPtsLive}</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '.3rem', marginBottom: '.85rem', justifyContent: 'center' }}>
          {Array.from({ length: TOTAL_Q }, (_, i) => {
            const done = i < currentQIdx
            const active = i === currentQIdx
            const a = myAnswers.find(m => m.questionIndex === i)
            return <div key={i} style={{ height: 5, borderRadius: 3, flex: active ? 2 : 1, background: done ? (a?.isCorrect ? '#22c55e' : '#ef4444') : active ? 'var(--gold)' : 'var(--border)', transition: 'all .3s', opacity: active ? 1 : done ? 0.8 : 0.4 }} />
          })}
        </div>

        {/* KI status */}
        {!isResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.45rem .85rem', borderRadius: '.75rem', marginBottom: '.75rem', background: kiA ? 'rgba(34,197,94,.07)' : 'rgba(var(--gold-rgb),.05)', border: `1px solid ${kiA ? 'rgba(34,197,94,.25)' : 'rgba(var(--gold-rgb),.12)'}` }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: kiA ? '#22c55e' : 'var(--gold)', animation: kiA ? 'none' : 'pulse 1.5s ease infinite', flexShrink: 0 }} />
            <span style={{ fontSize: '.68rem', fontWeight: 600, color: kiA ? '#16a34a' : 'var(--text-muted)' }}>
              {kiA ? `${ki.name} hat geantwortet` : `${ki.name} überlegt…`}
            </span>
          </div>
        )}

        {/* Question */}
        <div key={currentQIdx} style={{ background: 'var(--surface)', borderRadius: '1.25rem', border: '1px solid rgba(var(--gold-rgb),.15)', padding: '1.4rem 1.35rem', marginBottom: '.85rem', boxShadow: '0 2px 16px rgba(0,0,0,.06)', animation: 'fadeUp .3s ease both' }}>
          <p style={{ margin: '0 0 .35rem', fontSize: '.62rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--gold-rgb),.7)' }}>{q.topic}</p>
          <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.55 }}>{q.question}</p>
        </div>

        {/* Answers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', animation: 'fadeUp .35s ease .05s both' }}>
          {q.answers.map((ans, i) => {
            const letter = ['A','B','C','D'][i]
            const isChosen  = chosenId === ans.id || myA?.answerId === ans.id
            const isCorrect = ans.correct
            let cls = 'ans-btn'
            if (isResult || hasAnswered) {
              if (isCorrect) cls += ' reveal'
              if (isChosen && isCorrect) cls = 'ans-btn correct'
              if (isChosen && !isCorrect) cls += ' wrong'
            }
            return (
              <button key={ans.id} className={cls} disabled={hasAnswered || isResult} onClick={() => submitAnswer(ans.id)}>
                <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 900, background: (isResult||hasAnswered) && isCorrect ? 'rgba(34,197,94,.15)' : (isResult||hasAnswered) && isChosen && !isCorrect ? 'rgba(239,68,68,.12)' : isChosen ? 'rgba(var(--gold-rgb),.12)' : 'var(--surface-2)', color: (isResult||hasAnswered) && isCorrect ? '#16a34a' : (isResult||hasAnswered) && isChosen && !isCorrect ? '#dc2626' : isChosen ? 'var(--gold)' : 'var(--text-dim)', border: '1px solid var(--border)' }}>
                  {(isResult||hasAnswered) && isCorrect ? '✓' : (isResult||hasAnswered) && isChosen && !isCorrect ? '✗' : letter}
                </span>
                <span style={{ flex: 1, lineHeight: 1.45 }}>{ans.text}</span>
                {(isResult||hasAnswered) && kiA?.answerId === ans.id && (
                  <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--text-dim)', flexShrink: 0, padding: '2px 6px', background: 'var(--surface-2)', borderRadius: 6, border: '1px solid var(--border)' }}>🤖</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Result banner */}
        {isResult && (
          <div style={{ marginTop: '.85rem', padding: '.85rem 1rem', borderRadius: '1rem', background: myA?.isCorrect ? 'rgba(34,197,94,.08)' : hasAnswered ? 'rgba(239,68,68,.07)' : 'rgba(var(--gold-rgb),.06)', border: `1px solid ${myA?.isCorrect ? 'rgba(34,197,94,.3)' : hasAnswered ? 'rgba(239,68,68,.25)' : 'rgba(var(--gold-rgb),.2)'}`, animation: 'fadeUp .25s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '.82rem', fontWeight: 800, color: myA?.isCorrect ? '#16a34a' : hasAnswered ? '#dc2626' : 'var(--gold)' }}>
                  {myA?.isCorrect ? '✅ Richtig!' : hasAnswered ? '❌ Falsch' : '⏰ Zeit abgelaufen'}
                </p>
                <p style={{ margin: 0, fontSize: '.65rem', color: 'var(--text-dim)' }}>
                  {kiA ? kiA.isCorrect ? `🤖 KI: ✅ ${(kiA.responseMs/1000).toFixed(1)}s` : '🤖 KI: ❌ Falsch' : '🤖 KI: keine Antwort'}
                </p>
              </div>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-dim)', textAlign: 'right' }}>
                Nächste Frage<br />
                <span style={{ color: 'var(--gold)' }}>
                  {currentQIdx + 1 < TOTAL_Q ? `in ${Math.max(0, Math.ceil((ROUND_MS - elapsedInRound)/1000))}s` : 'Ergebnis…'}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isResult && !hasAnswered && timeLeft <= 3 && timeLeft > 0 && (
          <div style={{ marginTop: '.75rem', padding: '.5rem .85rem', borderRadius: '.75rem', background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', textAlign: 'center', fontSize: '.72rem', fontWeight: 700, color: '#ef4444' }}>
            ⚠ Noch {timeLeft} Sekunde{timeLeft !== 1 ? 'n' : ''}!
          </div>
        )}

      </div>
    </div>
  )
}
