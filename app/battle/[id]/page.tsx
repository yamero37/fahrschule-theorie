'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { questions as ALL_Q } from '@/data/questions'
import type { Question } from '@/types'

/* ── Constants ── */
const TOTAL_Q   = 10
const ANSWER_MS = 10_000  // 10s to answer
const RESULT_MS = 3_000   // 3s to show result
const ROUND_MS  = ANSWER_MS + RESULT_MS

/* ── Types ── */
type BattleStatus = 'waiting' | 'active' | 'finished'
type RoundPhase   = 'answer' | 'result'

interface Battle {
  id: string
  status: BattleStatus
  player1_id: string; player1_name: string
  player2_id: string | null; player2_name: string | null
  question_ids: string[] | null
  player1_points: number; player2_points: number
  player1_total_ms: number; player2_total_ms: number
  winner_id: string | null; draw: boolean
  started_at: string | null; finished_at: string | null
}

interface BattleAnswer {
  id: string
  battle_id: string
  question_index: number
  player_id: string
  answer_id: string | null
  is_correct: boolean
  response_ms: number
}

/* ── Helpers ── */
function getQuestions(ids: string[]): Question[] {
  const map = new Map(ALL_Q.map(q => [q.id, q]))
  return ids.map(id => map.get(id)).filter(Boolean) as Question[]
}

function calcWinner(answers: BattleAnswer[], p1: string, p2: string) {
  const pts = (pid: string) => answers.filter(a => a.player_id === pid && a.is_correct).length
  const ms  = (pid: string) => answers.filter(a => a.player_id === pid && a.is_correct).reduce((s, a) => s + a.response_ms, 0)
  const p1pts = pts(p1), p2pts = pts(p2)
  if (p1pts > p2pts) return { winner: p1, draw: false }
  if (p2pts > p1pts) return { winner: p2, draw: false }
  const p1ms = ms(p1), p2ms = ms(p2)
  if (p1ms < p2ms)   return { winner: p1, draw: false }
  if (p2ms < p1ms)   return { winner: p2, draw: false }
  return { winner: null, draw: true }
}

/* ── CSS ── */
const CSS = `
@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes pop     { 0%{transform:scale(.9);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
@keyframes timerBar {
  from { width: 100%; background: #22c55e; }
  60%  { background: #eab308; }
  100% { width: 0%;   background: #ef4444; }
}
.ans-btn {
  width:100%; padding:.85rem 1.1rem; border-radius:1rem; cursor:pointer;
  display:flex; align-items:center; gap:.75rem;
  background:var(--surface); border:1.5px solid var(--border);
  color:var(--text); font-size:.85rem; font-weight:600; text-align:left;
  transition:all .18s; position:relative; overflow:hidden;
}
.ans-btn:hover:not(:disabled) {
  border-color:rgba(var(--gold-rgb),.55);
  background:rgba(var(--gold-rgb),.05);
  transform:translateY(-1px);
  box-shadow:0 4px 14px rgba(var(--gold-rgb),.15);
}
.ans-btn:disabled { cursor:default; }
.ans-btn.selected-correct {
  background:rgba(34,197,94,.09); border-color:rgba(34,197,94,.5); color:#16a34a;
}
.ans-btn.selected-wrong {
  background:rgba(239,68,68,.07); border-color:rgba(239,68,68,.4); color:#dc2626;
}
.ans-btn.reveal-correct {
  background:rgba(34,197,94,.06); border-color:rgba(34,197,94,.3);
}
`

/* ════════════════════════════════════════════════════════ */
export default function BattleGame() {
  const { id: battleId } = useParams<{ id: string }>()
  const router = useRouter()

  /* ── Auth ── */
  const [userId,   setUserId]   = useState('')
  const [username, setUsername] = useState('')

  /* ── Battle state ── */
  const [battle,   setBattle]   = useState<Battle | null>(null)
  const [answers,  setAnswers]  = useState<BattleAnswer[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  /* ── Timer state ── */
  const [currentQIdx,   setCurrentQIdx]   = useState(0)
  const [roundPhase,    setRoundPhase]    = useState<RoundPhase>('answer')
  const [timeLeft,      setTimeLeft]      = useState(ANSWER_MS / 1000)
  const [elapsedInRound, setElapsedInRound] = useState(0)
  const [gameOver,      setGameOver]      = useState(false)

  /* ── Per-question UI state ── */
  const [chosen,  setChosen]  = useState<string | null>(null)  // answer_id I picked

  /* ── Refs ── */
  const answeredRef = useRef<Set<number>>(new Set())  // question indices we've submitted
  const finishedRef = useRef(false)

  /* ── 1. Load user ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/'); return }
      setUserId(session.user.id)
      setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Du')
    })
  }, [router])

  /* ── 2. Load battle + subscribe ── */
  useEffect(() => {
    if (!battleId) return

    supabase.from('battles').select('*').eq('id', battleId).single()
      .then(({ data }) => { if (data) setBattle(data as Battle) })

    const ch = supabase.channel(`battle-${battleId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'battles',
        filter: `id=eq.${battleId}`,
      }, ({ new: row }) => setBattle(row as Battle))
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'battle_answers',
        filter: `battle_id=eq.${battleId}`,
      }, ({ new: row }) => setAnswers(prev => {
        const exists = prev.some(a => a.id === (row as BattleAnswer).id)
        return exists ? prev : [...prev, row as BattleAnswer]
      }))
      .subscribe()

    // Load existing answers
    supabase.from('battle_answers').select('*').eq('battle_id', battleId)
      .then(({ data }) => data && setAnswers(data as BattleAnswer[]))

    return () => { supabase.removeChannel(ch) }
  }, [battleId])

  /* ── 3. Build question list once battle is active ── */
  useEffect(() => {
    if (battle?.status === 'active' && battle.question_ids) {
      setQuestions(getQuestions(battle.question_ids))
    }
  }, [battle?.status, battle?.question_ids])

  /* ── 4. Timer loop ── */
  useEffect(() => {
    if (!battle?.started_at || battle.status !== 'active') return

    const startMs = new Date(battle.started_at).getTime()

    const tick = () => {
      const elapsed = Date.now() - startMs
      const totalGameMs = TOTAL_Q * ROUND_MS

      if (elapsed >= totalGameMs) {
        setGameOver(true)
        return
      }

      const qi     = Math.floor(elapsed / ROUND_MS)
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
  }, [battle?.started_at, battle?.status])

  /* ── 5. Reset chosen answer on new question ── */
  useEffect(() => { setChosen(null) }, [currentQIdx])

  /* ── 6. Finish game — save results once ── */
  useEffect(() => {
    if (!gameOver || finishedRef.current || !battle || !userId) return
    finishedRef.current = true

    const p1 = battle.player1_id
    const p2 = battle.player2_id!
    const allAnswers = answers

    const pts = (pid: string) => allAnswers.filter(a => a.player_id === pid && a.is_correct).length
    const totalMs = (pid: string) => allAnswers.filter(a => a.player_id === pid && a.is_correct).reduce((s, a) => s + a.response_ms, 0)

    const { winner, draw } = calcWinner(allAnswers, p1, p2)

    // Only player1 writes the final result to avoid race condition
    if (userId === p1) {
      supabase.from('battles').update({
        status: 'finished',
        player1_points: pts(p1),
        player2_points: pts(p2),
        player1_total_ms: totalMs(p1),
        player2_total_ms: totalMs(p2),
        winner_id: winner,
        draw,
        finished_at: new Date().toISOString(),
      }).eq('id', battleId).then(() => {})
    }
  }, [gameOver, battle, answers, userId, battleId])

  /* ── 7. Submit answer ── */
  const submitAnswer = useCallback(async (answerId: string) => {
    if (!userId || !battleId || answeredRef.current.has(currentQIdx)) return
    answeredRef.current.add(currentQIdx)
    setChosen(answerId)

    const q = questions[currentQIdx]
    if (!q) return
    const correct = q.answers.find(a => a.id === answerId)?.correct ?? false

    await supabase.from('battle_answers').insert({
      battle_id: battleId,
      question_index: currentQIdx,
      player_id: userId,
      answer_id: answerId,
      is_correct: correct,
      response_ms: Math.min(elapsedInRound, ANSWER_MS),
    })
  }, [userId, battleId, currentQIdx, questions, elapsedInRound])

  /* ══════════════════════════════ RENDER ══════════════════════════════ */

  if (!battle) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(var(--gold-rgb),.15)', borderTop: '3px solid var(--gold)', animation: 'spin .8s linear infinite' }} />
        <style>{CSS}</style>
      </div>
    )
  }

  const isP1  = battle.player1_id === userId
  const oppId = isP1 ? battle.player2_id : battle.player1_id
  const oppName = isP1 ? (battle.player2_name ?? '…') : battle.player1_name

  /* ── WAITING ── */
  if (battle.status === 'waiting') {
    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/battle/${battleId}` : ''
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <style>{CSS}</style>
        <div style={{ textAlign: 'center', maxWidth: 400, animation: 'fadeUp .5s ease both' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s ease infinite' }}>⏳</div>
          <h2 style={{ margin: '0 0 .5rem', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>Warte auf Gegner…</h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '.82rem', color: 'var(--text-muted)' }}>Teile den Link um einen Freund einzuladen</p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '.85rem', padding: '.65rem 1rem', marginBottom: '.75rem', fontSize: '.72rem', color: 'var(--text-dim)', wordBreak: 'break-all' }}>
            {inviteUrl}
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(inviteUrl) }}
            style={{ width: '100%', padding: '.75rem', borderRadius: '.85rem', background: 'rgba(var(--gold-rgb),.1)', border: '1px solid rgba(var(--gold-rgb),.25)', color: 'var(--gold)', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', marginBottom: '1rem' }}
          >
            🔗 Link kopieren
          </button>
          <button
            onClick={() => router.push('/battle')}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '.78rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    )
  }

  /* ── FINISHED ── */
  if (battle.status === 'finished' || gameOver) {
    const p1 = battle.player1_id
    const p2 = battle.player2_id!

    const myPts  = answers.filter(a => a.player_id === userId && a.is_correct).length
    const oppPts = answers.filter(a => a.player_id === oppId && a.is_correct).length
    const myMs   = answers.filter(a => a.player_id === userId && a.is_correct).reduce((s, a) => s + a.response_ms, 0)
    const oppMs  = answers.filter(a => a.player_id === oppId  && a.is_correct).reduce((s, a) => s + a.response_ms, 0)

    const { winner, draw } = calcWinner(answers, p1, p2)
    const iWon  = winner === userId
    const isDraw = draw || (winner === null && !draw && myPts === oppPts)

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 420, width: '100%', animation: 'pop .4s ease both' }}>

          {/* Result banner */}
          <div style={{
            background: isDraw ? 'linear-gradient(135deg,rgba(var(--gold-rgb),.15),rgba(var(--gold-rgb),.08))'
              : iWon ? 'linear-gradient(135deg,rgba(34,197,94,.15),rgba(34,197,94,.08))'
              : 'linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.05))',
            border: `1px solid ${isDraw ? 'rgba(var(--gold-rgb),.3)' : iWon ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.3)'}`,
            borderRadius: '1.5rem', padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '.5rem' }}>
              {isDraw ? '🤝' : iWon ? '🏆' : '💀'}
            </div>
            <h1 style={{
              margin: '0 0 .3rem', fontSize: '1.6rem', fontWeight: 900,
              color: isDraw ? 'var(--gold)' : iWon ? '#16a34a' : '#dc2626',
            }}>
              {isDraw ? 'Unentschieden!' : iWon ? 'Du hast gewonnen!' : 'Niederlage'}
            </h1>
            {!isDraw && (
              <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-muted)' }}>
                {iWon
                  ? myPts > oppPts ? `${myPts} : ${oppPts} Punkte`
                    : `Gleiche Punkte – aber du warst ${((oppMs - myMs) / 1000).toFixed(1)}s schneller`
                  : myPts < oppPts ? `${myPts} : ${oppPts} Punkte`
                    : `Gleiche Punkte – ${((myMs - oppMs) / 1000).toFixed(1)}s langsamer`
                }
              </p>
            )}
          </div>

          {/* Scoreboard */}
          <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 1rem', fontSize: '.68rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Ergebnis</p>
            {[
              { name: username + ' (Du)', pts: myPts, ms: myMs, me: true },
              { name: oppName, pts: oppPts, ms: oppMs, me: false },
            ].map(p => (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.65rem .85rem', borderRadius: '.85rem', marginBottom: '.5rem',
                background: p.me ? 'rgba(var(--gold-rgb),.06)' : 'var(--surface-2)',
                border: `1px solid ${p.me ? 'rgba(var(--gold-rgb),.18)' : 'var(--border)'}`,
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 700, color: 'var(--text)' }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: '.62rem', color: 'var(--text-dim)' }}>
                    Ø {p.pts > 0 ? ((p.ms / p.pts) / 1000).toFixed(1) : '–'}s pro richtiger Antwort
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{p.pts}</p>
                  <p style={{ margin: 0, fontSize: '.58rem', color: 'var(--text-dim)' }}>/ {TOTAL_Q}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Question breakdown */}
          <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', border: '1px solid var(--border)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 .75rem', fontSize: '.68rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Fragen-Übersicht</p>
            <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
              {Array.from({ length: TOTAL_Q }, (_, i) => {
                const myA  = answers.find(a => a.player_id === userId  && a.question_index === i)
                const oppA = answers.find(a => a.player_id === oppId   && a.question_index === i)
                return (
                  <div key={i} title={`Frage ${i + 1}`} style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.65rem', fontWeight: 800,
                    background: myA?.is_correct ? 'rgba(34,197,94,.1)' : myA ? 'rgba(239,68,68,.08)' : 'var(--surface-2)',
                    border: `1.5px solid ${myA?.is_correct ? 'rgba(34,197,94,.35)' : myA ? 'rgba(239,68,68,.3)' : 'var(--border)'}`,
                    color: myA?.is_correct ? '#16a34a' : myA ? '#dc2626' : 'var(--text-dim)',
                  }}>
                    {myA?.is_correct ? '✓' : myA ? '✗' : '–'}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.65rem' }}>
            <button
              onClick={() => router.push('/battle')}
              style={{ flex: 1, padding: '.85rem', borderRadius: '1rem', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(99,102,241,.3)' }}
            >
              🔄 Nochmal spielen
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ flex: 1, padding: '.85rem', borderRadius: '1rem', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              🏠 Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── ACTIVE GAME ── */
  if (battle.status !== 'active' || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <style>{CSS}</style>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(var(--gold-rgb),.15)', borderTop: '3px solid var(--gold)', animation: 'spin .8s linear infinite' }} />
      </div>
    )
  }

  const q        = questions[currentQIdx]
  const myAnswer = answers.find(a => a.player_id === userId && a.question_index === currentQIdx)
  const oppAnswer = answers.find(a => a.player_id === oppId && a.question_index === currentQIdx)
  const hasAnswered = !!myAnswer || answeredRef.current.has(currentQIdx)
  const isResult = roundPhase === 'result'

  const myPtsLive  = answers.filter(a => a.player_id === userId && a.is_correct).length
  const oppPtsLive = answers.filter(a => a.player_id === oppId  && a.is_correct).length

  const timerPct = (timeLeft / (ANSWER_MS / 1000)) * 100
  const timerColor = timeLeft > 6 ? '#22c55e' : timeLeft > 3 ? '#eab308' : '#ef4444'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1rem 1rem 5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{CSS}</style>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* ── Scoreboard bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          background: 'var(--surface)', borderRadius: '1rem',
          border: '1px solid var(--border)', padding: '.75rem 1rem',
          marginBottom: '.85rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)',
        }}>
          {/* Me */}
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '.7rem', fontWeight: 700, color: 'var(--gold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>{myPtsLive}</p>
          </div>
          {/* Center */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '.62rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '.06em', marginBottom: '2px' }}>
              Frage {currentQIdx + 1} / {TOTAL_Q}
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isResult ? 'rgba(var(--gold-rgb),.08)' : `conic-gradient(${timerColor} ${timerPct}%, rgba(var(--gold-rgb),.08) 0%)`,
              border: `2px solid ${isResult ? 'rgba(var(--gold-rgb),.2)' : timerColor + '55'}`,
              fontSize: '.85rem', fontWeight: 900, color: isResult ? 'var(--gold)' : timerColor,
              transition: 'color .3s',
            }}>
              {isResult ? '⚡' : timeLeft}
            </div>
          </div>
          {/* Opponent */}
          <div style={{ flex: 1, textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{oppName}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>{oppPtsLive}</p>
          </div>
        </div>

        {/* ── Progress dots ── */}
        <div style={{ display: 'flex', gap: '.3rem', marginBottom: '.85rem', justifyContent: 'center' }}>
          {Array.from({ length: TOTAL_Q }, (_, i) => {
            const done = i < currentQIdx
            const active = i === currentQIdx
            const myA = answers.find(a => a.player_id === userId && a.question_index === i)
            return (
              <div key={i} style={{
                height: 5, borderRadius: 3,
                flex: active ? 2 : 1,
                background: done
                  ? (myA?.is_correct ? '#22c55e' : '#ef4444')
                  : active ? 'var(--gold)' : 'var(--border)',
                transition: 'all .3s',
                opacity: active ? 1 : done ? 0.8 : 0.4,
              }} />
            )
          })}
        </div>

        {/* ── Opponent status ── */}
        {!isResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            padding: '.45rem .85rem', borderRadius: '.75rem', marginBottom: '.75rem',
            background: oppAnswer ? 'rgba(34,197,94,.07)' : 'rgba(var(--gold-rgb),.05)',
            border: `1px solid ${oppAnswer ? 'rgba(34,197,94,.25)' : 'rgba(var(--gold-rgb),.12)'}`,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: oppAnswer ? '#22c55e' : 'var(--gold)',
              animation: oppAnswer ? 'none' : 'pulse 1.5s ease infinite',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '.68rem', fontWeight: 600, color: oppAnswer ? '#16a34a' : 'var(--text-muted)' }}>
              {oppAnswer ? `${oppName} hat geantwortet` : `${oppName} überlegt…`}
            </span>
          </div>
        )}

        {/* ── Question card ── */}
        <div key={currentQIdx} style={{
          background: 'var(--surface)', borderRadius: '1.25rem',
          border: '1px solid rgba(var(--gold-rgb),.15)',
          padding: '1.4rem 1.35rem', marginBottom: '.85rem',
          boxShadow: '0 2px 16px rgba(0,0,0,.06)',
          animation: 'fadeUp .3s ease both',
        }}>
          <p style={{ margin: '0 0 .35rem', fontSize: '.62rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(var(--gold-rgb),.7)' }}>
            {q.topic}
          </p>
          <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.55 }}>
            {q.question}
          </p>
        </div>

        {/* ── Answer buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', animation: 'fadeUp .35s ease .05s both' }}>
          {q.answers.map((ans, i) => {
            const letter = ['A', 'B', 'C', 'D'][i]
            const isChosen  = chosen === ans.id || myAnswer?.answer_id === ans.id
            const isCorrect = ans.correct
            let btnClass = 'ans-btn'
            if (isResult || hasAnswered) {
              if (isCorrect) btnClass += ' reveal-correct'
              else if (isChosen && !isCorrect) btnClass += ' selected-wrong'
              if (isChosen && isCorrect) btnClass = 'ans-btn selected-correct'
            }

            return (
              <button
                key={ans.id}
                className={btnClass}
                disabled={hasAnswered || isResult}
                onClick={() => submitAnswer(ans.id)}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.72rem', fontWeight: 900,
                  background: isResult && isCorrect ? 'rgba(34,197,94,.15)'
                    : isResult && isChosen && !isCorrect ? 'rgba(239,68,68,.12)'
                    : isChosen ? 'rgba(var(--gold-rgb),.12)' : 'var(--surface-2)',
                  color: isResult && isCorrect ? '#16a34a'
                    : isResult && isChosen && !isCorrect ? '#dc2626'
                    : isChosen ? 'var(--gold)' : 'var(--text-dim)',
                  border: '1px solid var(--border)',
                }}>
                  {(isResult || hasAnswered) && isCorrect ? '✓' : (isResult || hasAnswered) && isChosen && !isCorrect ? '✗' : letter}
                </span>
                <span style={{ flex: 1, lineHeight: 1.45 }}>{ans.text}</span>
                {/* Show opponent chose this */}
                {(isResult || hasAnswered) && oppAnswer?.answer_id === ans.id && (
                  <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--text-dim)', flexShrink: 0, padding: '2px 6px', background: 'var(--surface-2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    {oppName[0]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Result phase banner ── */}
        {isResult && (
          <div style={{
            marginTop: '.85rem', padding: '.85rem 1rem', borderRadius: '1rem',
            background: myAnswer?.is_correct ? 'rgba(34,197,94,.08)' : hasAnswered ? 'rgba(239,68,68,.07)' : 'rgba(var(--gold-rgb),.06)',
            border: `1px solid ${myAnswer?.is_correct ? 'rgba(34,197,94,.3)' : hasAnswered ? 'rgba(239,68,68,.25)' : 'rgba(var(--gold-rgb),.2)'}`,
            animation: 'fadeUp .25s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{
                  margin: '0 0 2px', fontSize: '.82rem', fontWeight: 800,
                  color: myAnswer?.is_correct ? '#16a34a' : hasAnswered ? '#dc2626' : 'var(--gold)',
                }}>
                  {myAnswer?.is_correct ? '✅ Richtig!' : hasAnswered ? '❌ Falsch' : '⏰ Zeit abgelaufen'}
                </p>
                <p style={{ margin: 0, fontSize: '.65rem', color: 'var(--text-dim)' }}>
                  {oppAnswer
                    ? oppAnswer.is_correct
                      ? `${oppName}: ✅ ${(oppAnswer.response_ms / 1000).toFixed(1)}s`
                      : `${oppName}: ❌ Falsch`
                    : `${oppName}: noch keine Antwort`
                  }
                </p>
              </div>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-dim)', textAlign: 'right' }}>
                Nächste Frage<br />
                <span style={{ color: 'var(--gold)' }}>
                  {currentQIdx + 1 < TOTAL_Q ? `in ${Math.max(0, Math.ceil((ROUND_MS - elapsedInRound) / 1000))}s` : 'Ergebnis…'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* No answer timeout warning */}
        {!isResult && !hasAnswered && timeLeft <= 3 && timeLeft > 0 && (
          <div style={{ marginTop: '.75rem', padding: '.5rem .85rem', borderRadius: '.75rem', background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', textAlign: 'center', fontSize: '.72rem', fontWeight: 700, color: '#ef4444' }}>
            ⚠ Noch {timeLeft} Sekunde{timeLeft !== 1 ? 'n' : ''}!
          </div>
        )}

      </div>
    </div>
  )
}
