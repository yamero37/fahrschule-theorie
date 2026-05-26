'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/* ── Data ──────────────────────────────────────────────── */

interface Question { text: string; options: string[]; correct: number }

const QUIZ_QUESTIONS: Question[] = [
  {
    text: 'An einer Kreuzung ohne Vorfahrtsschilder gilt:',
    options: ['Rechts vor Links', 'Links vor Rechts', 'Geradeaus hat Vorfahrt', 'Wer schneller ist'],
    correct: 0,
  },
  {
    text: 'Was bedeutet ein gelbes Rautenschild?',
    options: ['Du hast Vorfahrt', 'Vorfahrt gewähren', 'Anhalten', 'Einbahnstraße'],
    correct: 0,
  },
  {
    text: 'Das Zeichen „Vorfahrt gewähren" (Dreieck, Spitze unten) bedeutet:',
    options: ['Anderen den Vorrang lassen', 'Du hast Vorfahrt', 'Einfahrt verboten', 'Sperrfläche'],
    correct: 0,
  },
  {
    text: 'Du fährst auf einer Vorfahrtstraße. Was gilt an Einmündungen?',
    options: [
      'Du hast Vorfahrt gegenüber einmündenden Straßen',
      'Du musst immer anhalten',
      'Andere haben stets Vorfahrt',
      'Gilt nur tagsüber',
    ],
    correct: 0,
  },
  {
    text: 'Gilt „Rechts vor Links" auch auf Parkplätzen?',
    options: [
      'Nein – auf Parkplätzen gibt es keine feste Vorfahrtsregel',
      'Ja, immer und überall',
      'Nur für LKWs',
      'Nur bei Tageslicht',
    ],
    correct: 0,
  },
]

const BATTLE_QUESTIONS: Question[] = [
  {
    text: 'Du siehst eine gelbe Raute. Was bedeutet sie?',
    options: ['Du hast Vorfahrt', 'Vorfahrt gewähren', 'Achtung Kreuzung', 'Halt – Vorfahrt'],
    correct: 0,
  },
  {
    text: 'Von rechts kommt ein Auto, von links ein Fahrrad. Wer hat Vorfahrt?',
    options: ['Das Auto von rechts', 'Das Fahrrad von links', 'Du hast Vorfahrt', 'Der Schnellere'],
    correct: 0,
  },
  {
    text: 'Ein STOP-Schild bedeutet:',
    options: ['Anhalten und Vorfahrt gewähren', 'Nur langsam fahren', 'Du hast Vorfahrt', 'Wenden verboten'],
    correct: 0,
  },
]

const RANKS_PREVIEW = [
  { id: 'D',       name: 'Anfänger',        color: '#6b7280', pts: '0–99'        },
  { id: 'C',       name: 'Amateur',         color: '#3b82f6', pts: '100–299'     },
  { id: 'B',       name: 'Fortgeschritten', color: '#8b5cf6', pts: '300–599'     },
  { id: 'A',       name: 'Profi',           color: '#c9a227', pts: '600–999'     },
  { id: 'S',       name: 'Experte',         color: '#f97316', pts: '1.000–1.499' },
  { id: 'SS',      name: 'Meister',         color: '#ef4444', pts: '1.500–1.999' },
  { id: 'Legende', name: 'Legende',         color: '#ffd700', pts: '2.000+'      },
]

const INFO_FEATURES = [
  { icon: '🎬', title: 'Lernvideos',           soon: true  },
  { icon: '📚', title: 'Theoriefragen',         soon: false },
  { icon: '⚡', title: 'Quiz',                  soon: false },
  { icon: '⚔️', title: 'Battle gegen Freunde', soon: true  },
]

/* ── Types ─────────────────────────────────────────────── */

type Phase = 'info' | 'quiz' | 'battle' | 'complete'

interface BattleRound {
  userTime: number
  userCorrect: boolean
  aiTime: number
  aiCorrect: boolean
}

interface Props {
  username: string
  userId: string
  onComplete: (newPoints: number) => void
}

/* ── AI_THINK_TIME (ms) ─────────────────────────────────── */
const AI_THINK_MS = 10000

/* ── Main Component ────────────────────────────────────── */

export default function TutorialModal({ username, userId, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('info')
  const [infoStep, setInfoStep] = useState(0)

  // Quiz
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizPicked, setQuizPicked] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)

  // Battle
  const [battleIdx, setBattleIdx] = useState(0)
  const [battleRounds, setBattleRounds] = useState<BattleRound[]>([])
  const [userPicked, setUserPicked] = useState<number | null>(null)
  const [userMs, setUserMs] = useState(0)
  const [displayMs, setDisplayMs] = useState(0)
  const [aiDone, setAiDone] = useState(false)
  const [aiCorrect, setAiCorrect] = useState(false)
  const [roundDone, setRoundDone] = useState(false)
  const [battleDone, setBattleDone] = useState(false)

  const startRef = useRef(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const aiRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Completing
  const [completing, setCompleting] = useState(false)

  /* ── Total dots ────────────────────────────────────────── */
  // info(3) + quiz + battle + complete = 6 phases shown as dots
  const totalDots = 6
  const currentDot =
    phase === 'info' ? infoStep
    : phase === 'quiz' ? 3
    : phase === 'battle' ? 4
    : 5

  /* ── Start battle round ─────────────────────────────────── */
  const startBattleRound = useCallback(() => {
    setUserPicked(null)
    setUserMs(0)
    setDisplayMs(0)
    setAiDone(false)
    setRoundDone(false)
    startRef.current = Date.now()

    tickRef.current = setInterval(() => {
      setDisplayMs(Date.now() - startRef.current)
    }, 100)

    // AI answers after AI_THINK_MS, sometimes wrong
    aiRef.current = setTimeout(() => {
      const correct = Math.random() > 0.35
      setAiCorrect(correct)
      setAiDone(true)
    }, AI_THINK_MS)
  }, [])

  useEffect(() => {
    if (phase === 'battle') startBattleRound()
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      if (aiRef.current) clearTimeout(aiRef.current)
    }
  }, [phase, battleIdx, startBattleRound])

  // When both user and AI are done, finalize round
  useEffect(() => {
    if (userPicked !== null && aiDone && !roundDone) {
      if (tickRef.current) clearInterval(tickRef.current)
      setRoundDone(true)

      const round: BattleRound = {
        userTime: userMs,
        userCorrect: userPicked === BATTLE_QUESTIONS[battleIdx].correct,
        aiTime: AI_THINK_MS,
        aiCorrect,
      }
      setBattleRounds(prev => [...prev, round])

      if (battleIdx === BATTLE_QUESTIONS.length - 1) {
        setBattleDone(true)
      }
    }
  }, [userPicked, aiDone, roundDone, userMs, aiCorrect, battleIdx])

  function handleUserAnswer(idx: number) {
    if (userPicked !== null) return
    if (tickRef.current) clearInterval(tickRef.current)
    const elapsed = Date.now() - startRef.current
    setUserMs(elapsed)
    setUserPicked(idx)
    setDisplayMs(elapsed)
  }

  function nextBattleQuestion() {
    if (battleDone) { setPhase('complete'); return }
    setBattleIdx(i => i + 1)
    startBattleRound()
  }

  /* ── Complete tutorial ─────────────────────────────────── */
  async function handleComplete() {
    setCompleting(true)

    // Get current points first so we add 100, not overwrite
    const { data: existing } = await supabase
      .from('user_stats')
      .select('points')
      .eq('user_id', userId)
      .single()

    const newPoints = (existing?.points ?? 0) + 100

    await supabase.from('user_stats').upsert({
      user_id: userId,
      points: newPoints,
      tutorial_done: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    // Fallback: localStorage so tutorial never shows again even if DB column missing
    try { localStorage.setItem(`tutorial_done_${userId}`, '1') } catch {}

    onComplete(newPoints)
  }

  /* ── Battle score ──────────────────────────────────────── */
  function calcBattleWinner(rounds: BattleRound[]) {
    let user = 0, ai = 0
    rounds.forEach(r => {
      const uWin = r.userCorrect && (!r.aiCorrect || r.userTime < r.aiTime)
      const aWin = r.aiCorrect && (!r.userCorrect || r.aiTime <= r.userTime)
      if (uWin) user++
      else if (aWin) ai++
    })
    return { user, ai }
  }

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '500px',
        background: 'var(--surface)',
        border: '1px solid var(--card-border)',
        borderRadius: '1.25rem', padding: '2rem',
        boxShadow: 'var(--card-shadow)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.5rem' }}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <div key={i} style={{
              width: i === currentDot ? '20px' : '6px', height: '6px', borderRadius: '3px',
              background: i === currentDot ? 'var(--gold)' : i < currentDot ? 'rgba(var(--gold-rgb),0.4)' : 'var(--border)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* ── INFO PHASE ── */}
        {phase === 'info' && (
          <InfoScreen
            step={infoStep} username={username}
            onNext={() => {
              if (infoStep < 2) setInfoStep(s => s + 1)
              else setPhase('quiz')
            }}
            onBack={() => setInfoStep(s => s - 1)}
          />
        )}

        {/* ── QUIZ PHASE ── */}
        {phase === 'quiz' && (
          <QuizScreen
            question={QUIZ_QUESTIONS[quizIdx]}
            index={quizIdx}
            total={QUIZ_QUESTIONS.length}
            picked={quizPicked}
            score={quizScore}
            onPick={(i) => {
              if (quizPicked !== null) return
              setQuizPicked(i)
              if (i === QUIZ_QUESTIONS[quizIdx].correct) setQuizScore(s => s + 1)
            }}
            onNext={() => {
              if (quizIdx < QUIZ_QUESTIONS.length - 1) {
                setQuizIdx(i => i + 1)
                setQuizPicked(null)
              } else {
                setPhase('battle')
              }
            }}
          />
        )}

        {/* ── BATTLE PHASE ── */}
        {phase === 'battle' && !battleDone && (
          <BattleScreen
            question={BATTLE_QUESTIONS[battleIdx]}
            index={battleIdx}
            total={BATTLE_QUESTIONS.length}
            username={username}
            userPicked={userPicked}
            userMs={userMs}
            displayMs={displayMs}
            aiDone={aiDone}
            aiCorrect={aiCorrect}
            roundDone={roundDone}
            onPick={handleUserAnswer}
            onNext={nextBattleQuestion}
          />
        )}

        {/* ── BATTLE RESULT ── */}
        {phase === 'battle' && battleDone && (
          <BattleResult
            rounds={battleRounds}
            questions={BATTLE_QUESTIONS}
            username={username}
            winner={calcBattleWinner(battleRounds)}
            onNext={() => setPhase('complete')}
          />
        )}

        {/* ── COMPLETE PHASE ── */}
        {phase === 'complete' && (
          <CompleteScreen completing={completing} onComplete={handleComplete} />
        )}

      </div>
    </div>
  )
}

/* ── Info Screen ─────────────────────────────────────────── */

function InfoScreen({ step, username, onNext, onBack }: {
  step: number; username: string
  onNext: () => void; onBack: () => void
}) {
  const titles = ['Willkommen bei TolDrive! 🚗', 'Das Rangsystem 🏆', 'Deine Features 📋']

  return (
    <>
      <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        Schritt {step + 1} von 6
      </p>
      <h2 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '1.5rem' }}>
        {titles[step]}
      </h2>

      {step === 0 && (
        <div style={{ textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Toldrive.jpeg" alt="TolDrive" style={{ width: '72px', height: '72px', borderRadius: '10px', border: '1px solid rgba(var(--gold-rgb),0.4)', boxShadow: '0 0 16px rgba(var(--gold-rgb),0.2)', margin: '0 auto 1.25rem', display: 'block' }} />
          <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            Hey <strong style={{ color: 'var(--gold)' }}>{username}</strong>, schön dass du dabei bist!
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            TolDrive hilft dir, die Theorieprüfung beim <strong style={{ color: 'var(--text)' }}>ersten Versuch</strong> zu bestehen. Dieses Tutorial zeigt dir wie alles funktioniert.
          </p>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center', lineHeight: 1.6 }}>
            Sammle Punkte und steige im Rang auf:
          </p>
          {RANKS_PREVIEW.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: `${r.color}08`, border: `1px solid ${r.color}22`,
              borderRadius: '8px', padding: '7px 12px',
            }}>
              <span style={{ width: '32px', height: '26px', borderRadius: '10px', border: `2px solid ${r.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900, color: r.color, flexShrink: 0 }}>{r.id}</span>
              <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{r.name}</span>
              <span style={{ fontSize: '0.68rem', color: r.color, fontWeight: 600 }}>{r.pts}</span>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center', lineHeight: 1.6 }}>
            4 Bereiche warten auf dich:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {INFO_FEATURES.map(f => (
              <div key={f.title} style={{ background: 'var(--surface-2)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                {f.soon && <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.5rem', fontWeight: 700, color: 'var(--gold)', background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.2)', borderRadius: '20px', padding: '1px 6px' }}>Bald</span>}
                <div style={{ fontSize: '1.4rem', marginBottom: '5px' }}>{f.icon}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)' }}>{f.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
        {step > 0 && (
          <button onClick={onBack} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.65rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            ← Zurück
          </button>
        )}
        <button onClick={onNext} className="btn-gold" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', border: 'none', padding: '0.75rem' }}>
          {step === 2 ? 'Quiz starten →' : 'Weiter →'}
        </button>
      </div>
    </>
  )
}

/* ── Quiz Screen ─────────────────────────────────────────── */

function QuizScreen({ question, index, total, picked, score, onPick, onNext }: {
  question: Question; index: number; total: number
  picked: number | null; score: number
  onPick: (i: number) => void; onNext: () => void
}) {
  const answered = picked !== null

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Vorfahrt · Frage {index + 1}/{total}
        </p>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)' }}>{score}/{index + (answered ? 1 : 0)}</span>
      </div>

      {/* Progress */}
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((index + (answered ? 1 : 0)) / total) * 100}%`, background: 'var(--gold)', borderRadius: '2px', transition: 'width 0.4s' }} />
      </div>

      <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        {question.text}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
        {question.options.map((opt, i) => {
          let bg = 'var(--input-bg)'
          let border = 'var(--input-border)'
          let color = 'var(--text)'
          if (answered) {
            if (i === question.correct) { bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.4)'; color = '#22c55e' }
            else if (i === picked) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.4)'; color = '#ef4444' }
          }
          return (
            <button key={i} onClick={() => onPick(i)} disabled={answered} style={{
              padding: '0.75rem 1rem', borderRadius: '0.6rem', textAlign: 'left',
              background: bg, border: `1px solid ${border}`, color, fontSize: '0.82rem', fontWeight: 600,
              cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', flexShrink: 0, color }}>
                {answered && i === question.correct ? '✓' : answered && i === picked && i !== question.correct ? '✗' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <div style={{ marginBottom: '0.75rem', padding: '0.75rem', borderRadius: '0.6rem', background: picked === question.correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${picked === question.correct ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: picked === question.correct ? '#22c55e' : '#ef4444' }}>
          {picked === question.correct ? '✓ Richtig!' : `✗ Falsch — Richtig: ${question.options[question.correct]}`}
        </div>
      )}

      {answered && (
        <button onClick={onNext} className="btn-gold" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', border: 'none', padding: '0.75rem' }}>
          {index === 4 ? '⚔️ Zum KI-Battle →' : 'Nächste Frage →'}
        </button>
      )}
    </>
  )
}

/* ── Battle Screen ───────────────────────────────────────── */

function BattleScreen({ question, index, total, username, userPicked, userMs, displayMs, aiDone, aiCorrect, roundDone, onPick, onNext }: {
  question: Question; index: number; total: number; username: string
  userPicked: number | null; userMs: number; displayMs: number
  aiDone: boolean; aiCorrect: boolean; roundDone: boolean
  onPick: (i: number) => void; onNext: () => void
}) {
  const userCorrect = userPicked === question.correct
  const fmt = (ms: number) => (ms / 1000).toFixed(1) + 's'

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
          ⚔️ KI-Battle · Runde {index + 1}/{total}
        </span>
      </div>

      {/* VS Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center', marginBottom: '1.25rem' }}>

        {/* User */}
        <div style={{ textAlign: 'center', background: userPicked !== null ? (userCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)') : 'rgba(var(--gold-rgb),0.06)', border: `1px solid ${userPicked !== null ? (userCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)') : 'rgba(var(--gold-rgb),0.2)'}`, borderRadius: '10px', padding: '10px 6px' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>👤</div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px', margin: '0 auto 4px' }}>{username}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: userPicked !== null ? (userCorrect ? '#22c55e' : '#ef4444') : 'var(--gold)' }}>
            {userPicked !== null ? (userCorrect ? '✓ ' : '✗ ') : ''}{fmt(userPicked !== null ? userMs : displayMs)}
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-dim)' }}>VS</div>

        {/* AI Robot */}
        <div style={{ textAlign: 'center', background: aiDone ? (aiCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)') : 'rgba(100,100,120,0.08)', border: `1px solid ${aiDone ? (aiCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)') : 'rgba(120,120,140,0.2)'}`, borderRadius: '10px', padding: '10px 6px', position: 'relative' }}>
          {/* Robot face: TolDrive logo + robot elements */}
          <div style={{ position: 'relative', width: '40px', height: '40px', margin: '0 auto 4px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Toldrive.jpeg" alt="TolBot" style={{ width: '40px', height: '40px', borderRadius: '6px', border: `2px solid ${aiDone ? (aiCorrect ? '#22c55e' : '#ef4444') : '#4b5563'}`, filter: aiDone ? 'none' : 'grayscale(0.3)' }} />
            <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '0.75rem', background: 'var(--surface)', borderRadius: '50%', lineHeight: 1 }}>🤖</span>
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>TolBot KI</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: aiDone ? (aiCorrect ? '#22c55e' : '#ef4444') : '#6b7280' }}>
            {aiDone ? (aiCorrect ? '✓ 10.0s' : '✗ 10.0s') : '🤔 …'}
          </div>
        </div>
      </div>

      {/* Question */}
      <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.5, marginBottom: '1rem', textAlign: 'center' }}>
        {question.text}
      </h2>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
        {question.options.map((opt, i) => {
          let bg = 'var(--input-bg)'
          let border = 'var(--input-border)'
          let color = 'var(--text)'
          if (roundDone) {
            if (i === question.correct) { bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.4)'; color = '#22c55e' }
            else if (userPicked === i) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.35)'; color = '#ef4444' }
          }
          return (
            <button key={i} onClick={() => onPick(i)} disabled={userPicked !== null} style={{
              padding: '0.6rem 0.75rem', borderRadius: '0.6rem', textAlign: 'left',
              background: bg, border: `1px solid ${border}`, color, fontSize: '0.75rem', fontWeight: 600,
              cursor: userPicked !== null ? 'default' : 'pointer', transition: 'all 0.2s', lineHeight: 1.4,
            }}>
              {opt}
            </button>
          )
        })}
      </div>

      {roundDone && (
        <button onClick={onNext} className="btn-gold" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', border: 'none', padding: '0.7rem', fontSize: '0.85rem' }}>
          {index === BATTLE_QUESTIONS.length - 1 ? 'Ergebnis sehen →' : 'Nächste Runde →'}
        </button>
      )}
    </>
  )
}

/* ── Battle Result ───────────────────────────────────────── */

function BattleResult({ rounds, questions, username, winner, onNext }: {
  rounds: BattleRound[]; questions: Question[]; username: string
  winner: { user: number; ai: number }; onNext: () => void
}) {
  const userWon = winner.user > winner.ai

  return (
    <>
      <h2 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.5rem' }}>
        Battle Ergebnis ⚔️
      </h2>

      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: userWon ? '#22c55e' : 'var(--text-muted)' }}>{winner.user}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{username}</div>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 900 }}>:</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: !userWon ? '#22c55e' : 'var(--text-muted)' }}>{winner.ai}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>TolBot KI</div>
        </div>
      </div>

      {/* Winner Banner */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '0.75rem', borderRadius: '0.75rem', background: userWon ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${userWon ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
        <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{userWon ? '🏆' : '🤖'}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: userWon ? '#22c55e' : '#ef4444' }}>
          {userWon ? `${username} gewinnt!` : 'TolBot gewinnt – beim nächsten Mal!'}
        </div>
      </div>

      {/* Round details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
        {rounds.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '6px 10px', background: 'var(--surface-2)', borderRadius: '6px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-dim)', minWidth: '16px' }}>R{i + 1}</span>
            <span style={{ flex: 1, color: 'var(--text-dim)', fontSize: '0.65rem' }}>{questions[i].text.slice(0, 35)}…</span>
            <span style={{ color: r.userCorrect ? '#22c55e' : '#ef4444', fontWeight: 700 }}>Du: {(r.userTime / 1000).toFixed(1)}s {r.userCorrect ? '✓' : '✗'}</span>
            <span style={{ color: r.aiCorrect ? '#22c55e' : '#ef4444', fontWeight: 700 }}>KI: {r.aiCorrect ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="btn-gold" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', border: 'none', padding: '0.75rem' }}>
        Weiter zum Abschluss →
      </button>
    </>
  )
}

/* ── Complete Screen ─────────────────────────────────────── */

function CompleteScreen({ completing, onComplete }: { completing: boolean; onComplete: () => void }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.75rem' }}>
        Tutorial abgeschlossen!
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Du hast alle 5 Vorfahrt-Fragen beantwortet und das KI-Battle bestritten. Dafür erhältst du:
      </p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(var(--gold-rgb),0.08)', border: '1px solid rgba(var(--gold-rgb),0.35)', borderRadius: '12px', padding: '14px 28px', marginBottom: '1.75rem', boxShadow: '0 0 24px rgba(var(--gold-rgb),0.15)' }}>
        <span style={{ fontSize: '1.6rem' }}>⭐</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold)' }}>+100 Punkte</span>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Du startest jetzt als <strong style={{ color: '#3b82f6' }}>Rang C – Amateur</strong>.<br />
        Lerne weiter um höher aufzusteigen!
      </p>
      <button onClick={onComplete} disabled={completing} className="btn-gold" style={{ width: '100%', textAlign: 'center', cursor: completing ? 'not-allowed' : 'pointer', border: 'none', padding: '0.8rem', opacity: completing ? 0.7 : 1 }}>
        {completing ? 'Wird gespeichert…' : '🚀 Los geht\'s!'}
      </button>
    </div>
  )
}
