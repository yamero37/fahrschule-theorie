'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { Question } from '@/types'

const EXAM_COUNT   = 30
const EXAM_MINUTES = 45
const MAX_PENALTY  = 10  // official pass threshold

function pickRandom(all: Question[], n: number): Question[] {
  const copy = [...all]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(n, copy.length))
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

type Phase = 'intro' | 'exam' | 'result'

export default function SimulationClient({ questions }: { questions: Question[] }) {
  const [phase, setPhase]   = useState<Phase>('intro')
  const [exam, setExam]     = useState<Question[]>([])
  const [index, setIndex]   = useState(0)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const [secs, setSecs]     = useState(EXAM_MINUTES * 60)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null }
  }, [])

  const finish = useCallback(() => {
    stopTimer()
    setPhase('result')
  }, [stopTimer])

  useEffect(() => {
    if (phase !== 'exam') return
    timer.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { finish(); return 0 }
        return s - 1
      })
    }, 1000)
    return stopTimer
  }, [phase, finish, stopTimer])

  function start() {
    const picked = pickRandom(questions, EXAM_COUNT)
    setExam(picked)
    setIndex(0)
    setChosen({})
    setSecs(EXAM_MINUTES * 60)
    setPhase('exam')
  }

  function select(qId: string, aId: string) {
    if (chosen[qId]) return
    setChosen(prev => ({ ...prev, [qId]: aId }))
  }

  function next() {
    if (index < exam.length - 1) setIndex(i => i + 1)
    else finish()
  }

  /* ── results calc ── */
  const penalty = exam.reduce((sum, q) => {
    const picked = chosen[q.id]
    if (!picked) return sum + q.points
    const correct = q.answers.find(a => a.correct)?.id
    return picked === correct ? sum : sum + q.points
  }, 0)

  const passed    = penalty <= MAX_PENALTY
  const answered  = Object.keys(chosen).length
  const correct   = exam.filter(q => chosen[q.id] === q.answers.find(a => a.correct)?.id).length
  const pct       = exam.length ? Math.round((correct / exam.length) * 100) : 0
  const timeUsed  = EXAM_MINUTES * 60 - secs
  const timedOut  = secs === 0 && phase === 'result'

  /* ══════════════════ INTRO ══════════════════ */
  if (phase === 'intro') return (
    <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <Link href="/dashboard" style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'var(--input-bg)', border: '1px solid var(--input-border)',
            color: 'var(--text-dim)', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          }}>←</Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>🎓 Prüfungssimulation</h1>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>Offizielle Bedingungen · TÜV-Modus</p>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
          {[
            { icon: '❓', label: 'Fragen', value: `${EXAM_COUNT}`, color: '#8b5cf6' },
            { icon: '⏱', label: 'Zeit',   value: `${EXAM_MINUTES} Min`, color: '#f97316' },
            { icon: '⚡', label: 'Bestehen', value: `≤${MAX_PENALTY} SP`, color: '#22c55e' },
            { icon: '🎯', label: 'Strafpunkte', value: 'Pro Fehler', color: '#06b6d4' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'transparent', border: `1px solid ${c.color}35`,
              borderRadius: '1rem', padding: '0.85rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                background: `${c.color}15`, border: `1px solid ${c.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>{c.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: c.color }}>{c.value}</p>
                <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)' }}>{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div style={{
          background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.25)',
          borderRadius: '1.1rem', padding: '1rem 1.1rem', marginBottom: '1.5rem',
        }}>
          <p style={{ margin: '0 0 0.7rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)' }}>📋 Prüfungsregeln</p>
          {[
            'Jede Frage kann nur einmal beantwortet werden – keine Änderung möglich',
            'Nicht beantwortete Fragen zählen als falsch (volle Strafpunkte)',
            'Bestanden bei maximal 10 Strafpunkten insgesamt',
            'Fragen werden zufällig aus dem gesamten Fragenkatalog ausgewählt',
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '0.45rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.7rem', flexShrink: 0, marginTop: '1px' }}>•</span>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r}</p>
            </div>
          ))}
        </div>

        <button
          onClick={start}
          style={{
            width: '100%', padding: '1rem', borderRadius: '100px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(var(--gold-rgb),0.4)',
          }}
        >
          🎓 Prüfung starten
        </button>
      </div>
    </div>
  )

  /* ══════════════════ EXAM ══════════════════ */
  if (phase === 'exam') {
    const q        = exam[index]
    const answered = !!chosen[q.id]
    const progress = Math.round(((index + 1) / exam.length) * 100)
    const urgent   = secs < 300

    return (
      <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1rem 1rem' }}>

          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1rem', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {index + 1} / {exam.length}
            </span>

            {/* Timer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '100px',
              background: urgent ? 'rgba(239,68,68,0.1)' : 'var(--input-bg)',
              border: `1px solid ${urgent ? 'rgba(239,68,68,0.35)' : 'var(--input-border)'}`,
            }}>
              <span style={{ fontSize: '0.7rem' }}>⏱</span>
              <span style={{ fontWeight: 900, fontSize: '0.9rem', color: urgent ? '#f87171' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                {fmt(secs)}
              </span>
            </div>

            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)' }}>
              {q.points} SP
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(var(--gold-rgb),0.1)', marginBottom: '1.25rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
          </div>

          {/* Question card */}
          <div style={{
            background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.28)',
            borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '0.75rem',
          }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              {q.topic}
            </p>
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.55 }}>
              {q.question}
            </p>
          </div>

          {/* Answers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {q.answers.map((a, i) => {
              const isChosen  = chosen[q.id] === a.id
              const isCorrect = a.correct
              const reveal    = answered

              let bg     = 'transparent'
              let border = 'rgba(var(--gold-rgb),0.2)'
              let color  = 'var(--text)'

              if (reveal && isCorrect) { bg = 'rgba(34,197,94,0.1)'; border = 'rgba(34,197,94,0.45)'; color = '#4ade80' }
              else if (reveal && isChosen && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.45)'; color = '#f87171' }
              else if (isChosen) { bg = 'rgba(var(--gold-rgb),0.1)'; border = 'rgba(var(--gold-rgb),0.45)' }

              return (
                <button
                  key={a.id}
                  onClick={() => select(q.id, a.id)}
                  disabled={answered}
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '0.85rem',
                    background: bg, border: `1px solid ${border}`, cursor: answered ? 'default' : 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800, color,
                  }}>
                    {reveal && isCorrect ? '✓' : reveal && isChosen && !isCorrect ? '✗' : ['A','B','C'][i]}
                  </span>
                  <span style={{ fontSize: '0.82rem', color, lineHeight: 1.45, fontWeight: isChosen || (reveal && isCorrect) ? 700 : 400 }}>
                    {a.text}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Next / Finish */}
          {answered && (
            <button
              onClick={next}
              style={{
                width: '100%', padding: '0.9rem', borderRadius: '100px',
                background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                color: '#fff', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(var(--gold-rgb),0.35)',
              }}
            >
              {index < exam.length - 1 ? 'Weiter →' : '🎓 Auswertung anzeigen'}
            </button>
          )}

          {/* Skip (unanswered) */}
          {!answered && (
            <button
              onClick={next}
              style={{
                width: '100%', padding: '0.7rem', borderRadius: '100px',
                background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.18)',
                color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer',
              }}
            >
              Überspringen (zählt als falsch)
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ══════════════════ RESULT ══════════════════ */
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Result hero */}
        <div style={{
          background: 'transparent',
          border: `1px solid ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: '1.5rem', padding: '1.75rem 1.5rem', marginBottom: '1rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>
            {timedOut ? '⏰' : passed ? '🎉' : '😔'}
          </div>
          <h1 style={{
            margin: '0 0 0.4rem', fontSize: '1.6rem', fontWeight: 900,
            color: passed ? '#4ade80' : '#f87171',
          }}>
            {timedOut ? 'Zeit abgelaufen' : passed ? 'Bestanden!' : 'Nicht bestanden'}
          </h1>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {passed
              ? 'Glückwunsch – du hast die Prüfungssimulation bestanden!'
              : `Leider nicht bestanden. Weiterüben und nochmal versuchen!`}
          </p>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem' }}>
            {[
              { label: 'Strafpunkte', value: `${penalty}`, sub: `/ ${MAX_PENALTY} max`, color: passed ? '#4ade80' : '#f87171' },
              { label: 'Richtig', value: `${correct}`, sub: `von ${exam.length}`, color: '#4ade80' },
              { label: 'Quote', value: `${pct}%`, sub: 'korrekt', color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.2)',
                borderRadius: '0.85rem', padding: '0.75rem 0.5rem',
              }}>
                <p style={{ margin: '0 0 2px', fontWeight: 900, fontSize: '1.2rem', color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>
                  {s.label}<br />{s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Question review */}
        <div style={{
          background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.2)',
          borderRadius: '1.1rem', marginBottom: '1rem', overflow: 'hidden',
        }}>
          <p style={{ margin: 0, padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text)', borderBottom: '1px solid rgba(var(--gold-rgb),0.12)' }}>
            📋 Übersicht
          </p>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {exam.map((q, i) => {
              const pick    = chosen[q.id]
              const correct = q.answers.find(a => a.correct)?.id
              const ok      = pick && pick === correct
              const skipped = !pick
              return (
                <div key={q.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                  padding: '0.6rem 1rem', borderBottom: '1px solid rgba(var(--gold-rgb),0.07)',
                }}>
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                    background: ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${ok ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', color: ok ? '#4ade80' : '#f87171', fontWeight: 800,
                  }}>
                    {ok ? '✓' : '✗'}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>F{i + 1}:</span>{' '}
                    {q.question.slice(0, 70)}{q.question.length > 70 ? '…' : ''}
                    {skipped && <span style={{ color: '#f87171', fontSize: '0.62rem' }}> (übersprungen)</span>}
                    {!ok && !skipped && <span style={{ color: '#f87171', fontSize: '0.62rem' }}> –{q.points} SP</span>}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={start}
            style={{
              flex: 1, padding: '0.9rem', borderRadius: '100px',
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
              color: '#fff', fontWeight: 800, fontSize: '0.88rem', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(var(--gold-rgb),0.35)',
            }}
          >
            🔁 Nochmal
          </button>
          <Link href="/dashboard" style={{
            flex: 1, padding: '0.9rem', borderRadius: '100px', textDecoration: 'none',
            background: 'var(--input-bg)', border: '1px solid var(--input-border)',
            color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ← Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
