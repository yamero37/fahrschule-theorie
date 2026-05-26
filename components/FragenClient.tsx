'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import type { Question } from '@/types'
import { supabase } from '@/lib/supabase'

/* ── Konstanten ─────────────────────────────────────────── */
const CORRECT_KEY = 'fragenCorrectIds'
const WRONG_KEY   = 'fragenWrongIds'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface GroupDef { label: string; short: string; topics: string[]; color: string; icon: string }

const GROUPS: GroupDef[] = [
  { label: 'Lektion 1 & 2',    short: 'L 1–2',   topics: ['Lektion 1','Lektion 2'],    color: '#a78bfa', icon: '📖' },
  { label: 'Lektion 3 & 4',    short: 'L 3–4',   topics: ['Lektion 3','Lektion 4'],    color: '#60a5fa', icon: '📘' },
  { label: 'Lektion 5 & 6',    short: 'L 5–6',   topics: ['Lektion 5','Lektion 6'],    color: '#34d399', icon: '📗' },
  { label: 'Lektion 7 & 8',    short: 'L 7–8',   topics: ['Lektion 7','Lektion 8'],    color: '#fbbf24', icon: '📙' },
  { label: 'Lektion 9 & 10',   short: 'L 9–10',  topics: ['Lektion 9','Lektion 10'],   color: '#f97316', icon: '📕' },
  { label: 'Lektion 11 & 12',  short: 'L 11–12', topics: ['Lektion 11','Lektion 12'],  color: '#ec4899', icon: '📒' },
  { label: 'B1 – Sonderregeln',short: 'B1',      topics: ['B1'],                       color: '#06b6d4', icon: '⚠️' },
  { label: 'B2 – Technik',     short: 'B2',      topics: ['B2'],                       color: '#8b5cf6', icon: '🔧' },
]

type Phase = 'groups' | 'quiz' | 'summary'

/* ══════════════════════════════════════════════════════════ */
/*  Haupt-Komponente                                          */
/* ══════════════════════════════════════════════════════════ */

export default function FragenClient({ questions }: { questions: Question[] }) {
  const [phase, setPhase]               = useState<Phase>('groups')
  const [activeGroup, setActiveGroup]   = useState<GroupDef | null>(null)
  const [quizQs, setQuizQs]             = useState<Question[]>([])
  const [currentIdx, setCurrentIdx]     = useState(0)
  const [selected, setSelected]         = useState<string | null>(null)
  const [results, setResults]           = useState<{ qId: string; correct: boolean }[]>([])
  const [correctIds, setCorrectIds]     = useState<Set<string>>(new Set())
  const [wrongIds, setWrongIds]         = useState<Set<string>>(new Set())
  const [userId, setUserId]             = useState('')
  const [advPct, setAdvPct]             = useState(0)   // 0→100 auto-advance bar
  const advTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Sofort aus localStorage laden (schnell)
    let localCorrect: string[] = []
    try {
      localCorrect = JSON.parse(localStorage.getItem(CORRECT_KEY) ?? '[]')
      setCorrectIds(new Set(localCorrect))
      setWrongIds(new Set(JSON.parse(localStorage.getItem(WRONG_KEY) ?? '[]')))
    } catch {}

    // Dann aus Supabase laden und zusammenführen (geräteübergreifend)
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      try {
        const { data: s } = await supabase
          .from('user_stats')
          .select('correct_ids')
          .eq('user_id', data.user.id)
          .single()
        if (s?.correct_ids?.length) {
          const merged = new Set([...localCorrect, ...s.correct_ids])
          setCorrectIds(merged)
          localStorage.setItem(CORRECT_KEY, JSON.stringify([...merged]))
        }
      } catch {}
    })
  }, [])

  const clearTimers = () => {
    if (advTimer.current)    clearTimeout(advTimer.current)
    if (advInterval.current) clearInterval(advInterval.current)
  }
  useEffect(() => clearTimers, [])

  /* ── Gruppe starten ── */
  // skipDone=true → bereits richtig beantwortete überspringen (Standard)
  // skipDone=false → alle Fragen zeigen (Wiederholen)
  const startGroup = (group: GroupDef, onlyWrong = false, skipDone = true) => {
    let qs = questions.filter(q => group.topics.includes(q.topic))
    if (onlyWrong) qs = qs.filter(q => wrongIds.has(q.id))
    else if (skipDone) qs = qs.filter(q => !correctIds.has(q.id))
    if (!qs.length) {
      // Alle erledigt → mit allen Fragen nochmal (Wiederholen)
      startGroup(group, false, false)
      return
    }
    setActiveGroup(group)
    setQuizQs(shuffle(qs))
    setCurrentIdx(0); setSelected(null); setResults([]); setAdvPct(0)
    setPhase('quiz')
  }

  /* ── Antwort wählen ── */
  const handleAnswer = async (answerId: string) => {
    if (selected !== null) return
    setSelected(answerId)
    const q = quizQs[currentIdx]
    const correct = q.answers.find(a => a.correct)!
    const isRight = answerId === correct.id
    setResults(r => [...r, { qId: q.id, correct: isRight }])

    // Tages-Zähler erhöhen (jede Antwort zählt)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const dayKey = `fragenDaily_${today}`
      const n = parseInt(localStorage.getItem(dayKey) ?? '0', 10)
      localStorage.setItem(dayKey, String(n + 1))
    } catch {}

    if (isRight) {
      const firstTime = !correctIds.has(q.id)
      if (firstTime) {
        const n = new Set(correctIds); n.add(q.id); setCorrectIds(n)
        localStorage.setItem(CORRECT_KEY, JSON.stringify([...n]))
        if (userId) {
          try {
            const { data: s } = await supabase.from('user_stats').select('points, correct_ids').eq('user_id', userId).single()
            await supabase.from('user_stats').upsert({
              user_id: userId,
              points: (s?.points ?? 0) + 2,
              correct_ids: [...n],
            }, { onConflict: 'user_id' })
          } catch {}
        }
      }
      if (wrongIds.has(q.id)) {
        const nw = new Set(wrongIds); nw.delete(q.id); setWrongIds(nw)
        localStorage.setItem(WRONG_KEY, JSON.stringify([...nw]))
      }
    } else {
      if (!correctIds.has(q.id)) {
        const n = new Set(wrongIds); n.add(q.id); setWrongIds(n)
        localStorage.setItem(WRONG_KEY, JSON.stringify([...n]))
      }
    }

    // Auto-advance bar (fills over delay ms)
    const delay = isRight ? 1300 : 2200
    setAdvPct(0)
    const steps = 40
    const stepMs = delay / steps
    let step = 0
    advInterval.current = setInterval(() => {
      step++; setAdvPct(Math.min(100, (step / steps) * 100))
      if (step >= steps) clearInterval(advInterval.current!)
    }, stepMs)
    advTimer.current = setTimeout(() => advance(), delay)
  }

  /* ── Zur nächsten Frage ── */
  const advance = () => {
    clearTimers(); setAdvPct(0)
    setCurrentIdx(i => {
      const next = i + 1
      if (next >= quizQs.length) { setPhase('summary'); return i }
      setSelected(null)
      return next
    })
  }

  /* ── Gruppen-Stats ── */
  const stats = (g: GroupDef) => {
    const qs = questions.filter(q => g.topics.includes(q.topic))
    const ok = qs.filter(q => correctIds.has(q.id)).length
    const remaining = qs.length - ok
    return { total: qs.length, ok, wrong: qs.filter(q => wrongIds.has(q.id)).length, pct: qs.length ? Math.round((ok / qs.length) * 100) : 0, remaining }
  }

  const totalCorrect = questions.filter(q => correctIds.has(q.id)).length
  const totalPct     = Math.round((totalCorrect / questions.length) * 100)

  /* ══════════════════════════════════════════════════════════
     SCREEN 1 — Gruppenauswahl
  ══════════════════════════════════════════════════════════ */
  if (phase === 'groups') {
    const wrongTotal = questions.filter(q => wrongIds.has(q.id)).length
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.25rem 1rem 84px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.1rem' }}>
          <Link href="/dashboard" style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'var(--input-bg)', border: '1px solid var(--input-border)',
            color: 'var(--text-dim)', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          }}>←</Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>📚 Theoriefragen</h1>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)' }}>
              {totalCorrect} / {questions.length} richtig · {totalPct}%
            </p>
          </div>
        </div>

        {/* Gesamtfortschritt */}
        <div style={{
          background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.25)',
          borderRadius: '1.1rem', padding: '0.9rem 1rem', marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)' }}>Gesamtfortschritt</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gold)' }}>{totalPct}%</span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(var(--gold-rgb),0.1)', overflow: 'hidden' }}>
            <div style={{ width: `${totalPct}%`, height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))', transition: 'width 0.6s' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.6rem', color: '#22c55e' }}>✓ {totalCorrect} richtig</span>
            <span style={{ fontSize: '0.6rem', color: '#f87171' }}>✗ {wrongIds.size} falsch</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>◎ {questions.length - totalCorrect - wrongIds.size} offen</span>
          </div>
        </div>

        {/* Falsch-wiederholen Button */}
        {wrongTotal > 0 && (
          <button
            onClick={() => {
              // Alle falsch beantworteten aller Gruppen in einem run
              const wrongQs = questions.filter(q => wrongIds.has(q.id))
              if (!wrongQs.length) return
              setActiveGroup({ label: 'Falsch beantwortet', short: 'Falsch', topics: [], color: '#ef4444', icon: '🔁' })
              setQuizQs(shuffle(wrongQs))
              setCurrentIdx(0); setSelected(null); setResults([]); setAdvPct(0)
              setPhase('quiz')
            }}
            style={{
              width: '100%', marginBottom: '1rem', padding: '0.85rem 1rem',
              borderRadius: '1.1rem', cursor: 'pointer', textAlign: 'left',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>🔁</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem', color: '#f87171' }}>Falsch beantwortet wiederholen</p>
              <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)' }}>{wrongTotal} Fragen falsch beantwortet</p>
            </div>
            <span style={{ color: '#f87171', fontSize: '1rem' }}>→</span>
          </button>
        )}

        {/* Gruppen-Grid */}
        <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: '0 0 0.6rem' }}>
          Lernbereich wählen
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.6rem' }}>
          {GROUPS.map(g => {
            const s = stats(g)
            const allDone = s.remaining === 0
            return (
              <button
                key={g.label}
                onClick={() => startGroup(g)}
                style={{
                  textAlign: 'left', padding: '0.9rem', borderRadius: '1.1rem', cursor: 'pointer',
                  background: allDone ? 'rgba(34,197,94,0.06)' : 'transparent',
                  border: `1px solid ${allDone ? 'rgba(34,197,94,0.35)' : `${g.color}35`}`,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = allDone ? 'rgba(34,197,94,0.1)' : `${g.color}0d`
                  e.currentTarget.style.borderColor = allDone ? 'rgba(34,197,94,0.6)' : `${g.color}60`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = allDone ? 'rgba(34,197,94,0.06)' : 'transparent'
                  e.currentTarget.style.borderColor = allDone ? 'rgba(34,197,94,0.35)' : `${g.color}35`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '9px',
                    background: allDone ? 'rgba(34,197,94,0.15)' : `${g.color}18`,
                    border: `1px solid ${allDone ? 'rgba(34,197,94,0.35)' : `${g.color}30`}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  }}>{allDone ? '✅' : g.icon}</div>
                  {allDone ? (
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 7px', borderRadius: '100px' }}>
                      Fertig 🎉
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: g.color, background: `${g.color}15`, border: `1px solid ${g.color}25`, padding: '2px 7px', borderRadius: '100px' }}>
                      {s.remaining} offen
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.2 }}>{g.label}</p>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                  {allDone ? '🔁 Nochmal wiederholen' : `${s.remaining} von ${s.total} ausstehend`}
                </p>
                {/* Mini-Fortschrittsbalken */}
                <div style={{ height: '3px', borderRadius: '2px', background: allDone ? 'rgba(34,197,94,0.15)' : `${g.color}18`, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: allDone ? '#22c55e' : g.color, borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.55rem', color: '#22c55e' }}>✓ {s.ok}</span>
                  {s.wrong > 0 && <span style={{ fontSize: '0.55rem', color: '#f87171' }}>✗ {s.wrong}</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     SCREEN 2 — Quiz (Einzelfrage)
  ══════════════════════════════════════════════════════════ */
  if (phase === 'quiz' && activeGroup) {
    const q        = quizQs[currentIdx]
    const answered = selected !== null
    const correct  = q.answers.find(a => a.correct)!
    const isRight  = selected === correct.id
    const shuffled = shuffle(q.answers) // stable per question: see note below
    const ptColor  = q.points >= 5 ? '#f87171' : q.points === 4 ? '#fb923c' : 'var(--gold)'
    const alreadyCorrect = correctIds.has(q.id)

    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.25rem 1rem 84px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <button
            onClick={() => { clearTimers(); setPhase('groups') }}
            style={{
              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
              background: 'var(--input-bg)', border: '1px solid var(--input-border)',
              color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >←</button>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.65rem', color: activeGroup.color, fontWeight: 700 }}>
              {activeGroup.icon} {activeGroup.label}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>
              Frage {currentIdx + 1} / {quizQs.length}
            </p>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: '100px', fontSize: '0.6rem', fontWeight: 700,
            background: `${activeGroup.color}15`, border: `1px solid ${activeGroup.color}30`, color: activeGroup.color,
          }}>
            {Math.round(((currentIdx) / quizQs.length) * 100)}%
          </div>
        </div>

        {/* Fortschrittsbalken (Session) */}
        <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(var(--gold-rgb),0.1)', overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{
            width: `${((currentIdx) / quizQs.length) * 100}%`,
            height: '100%', borderRadius: '2px',
            background: `linear-gradient(90deg, ${activeGroup.color}99, ${activeGroup.color})`,
            transition: 'width 0.4s',
          }} />
        </div>

        {/* Fragenkarte */}
        <div style={{
          background: 'transparent', border: `1px solid ${answered ? (isRight ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.35)') : 'rgba(var(--gold-rgb),0.28)'}`,
          borderRadius: '1.25rem', padding: '1.1rem 1.1rem 0.9rem', marginBottom: '0.75rem',
          transition: 'border-color 0.25s',
        }}>
          {/* Punkte-Badge + Topic */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{
              padding: '2px 8px', borderRadius: '6px',
              background: `${ptColor}18`, color: ptColor, border: `1px solid ${ptColor}35`,
              fontSize: '0.58rem', fontWeight: 900,
            }}>{q.points} Pkt</div>
            <span style={{ fontSize: '0.58rem', color: 'var(--text-dim)' }}>{q.topic} · {q.id}</span>
            {alreadyCorrect && (
              <span style={{
                marginLeft: 'auto', width: '18px', height: '18px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900,
              }}>✓</span>
            )}
          </div>

          {/* Fragetext */}
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.55 }}>
            {q.question}
          </p>
        </div>

        {/* Antwort-Buttons */}
        <QuizAnswers
          answers={shuffled}
          selected={selected}
          correctId={correct.id}
          onSelect={handleAnswer}
          firstTime={!alreadyCorrect}
        />

        {/* Feedback + Auto-Advance */}
        {answered && (
          <div style={{ marginTop: '0.75rem' }}>
            {/* Feedback-Banner */}
            <div style={{
              padding: '0.7rem 0.9rem', borderRadius: '10px',
              background: isRight ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
              border: `1px solid ${isRight ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isRight ? '#86efac' : '#fca5a5' }}>
                {isRight
                  ? (alreadyCorrect ? '✓ Richtig! (Punkte bereits erhalten)' : '✓ Richtig! +2 Punkte')
                  : '✗ Falsch — die richtige Antwort ist grün markiert.'}
              </span>
              {currentIdx + 1 < quizQs.length ? (
                <button onClick={advance} style={{
                  padding: '5px 12px', borderRadius: '100px', flexShrink: 0, cursor: 'pointer',
                  background: isRight ? 'rgba(34,197,94,0.2)' : 'var(--input-bg)',
                  border: `1px solid ${isRight ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                  color: isRight ? '#22c55e' : 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700,
                }}>Weiter →</button>
              ) : (
                <button onClick={advance} style={{
                  padding: '5px 12px', borderRadius: '100px', flexShrink: 0, cursor: 'pointer',
                  background: 'rgba(var(--gold-rgb),0.15)', border: '1px solid rgba(var(--gold-rgb),0.35)',
                  color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700,
                }}>Ergebnis →</button>
              )}
            </div>

            {/* Auto-Advance Ladebalken */}
            <div style={{ height: '2px', borderRadius: '1px', background: 'rgba(var(--gold-rgb),0.1)', overflow: 'hidden', marginTop: '6px' }}>
              <div style={{
                width: `${advPct}%`, height: '100%', borderRadius: '1px',
                background: isRight ? '#22c55e' : '#ef4444',
                transition: 'width 0.05s linear',
              }} />
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     SCREEN 3 — Zusammenfassung
  ══════════════════════════════════════════════════════════ */
  if (phase === 'summary' && activeGroup) {
    const rightCount = results.filter(r => r.correct).length
    const wrongCount = results.length - rightCount
    const pct        = Math.round((rightCount / results.length) * 100)
    const passed     = pct >= 75

    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.25rem 1rem 84px' }}>
        {/* Hero */}
        <div style={{
          textAlign: 'center', padding: '2rem 1.5rem',
          background: 'transparent', border: `1px solid ${passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
          borderRadius: '1.5rem', marginBottom: '1rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{passed ? '🎉' : '📚'}</div>
          <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>
            {passed ? 'Gut gemacht!' : 'Weiter üben!'}
          </h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {activeGroup.icon} {activeGroup.label}
          </p>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Richtig', value: rightCount, color: '#22c55e' },
              { label: 'Falsch',  value: wrongCount, color: '#f87171' },
              { label: 'Quote',   value: `${pct}%`,  color: 'var(--gold)' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '0.65rem', borderRadius: '0.85rem',
                background: 'rgba(var(--gold-rgb),0.05)', border: '1px solid rgba(var(--gold-rgb),0.12)',
              }}>
                <p style={{ margin: '0 0 0.15rem', fontSize: '1.1rem', fontWeight: 900, color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)' }}>{s.label}</p>
              </div>
            ))}
          </div>
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Verbleibende Fragen (noch nicht richtig beantwortet) */}
            {(() => {
              const remaining = questions.filter(q => activeGroup.topics.includes(q.topic) && !correctIds.has(q.id)).length
              return remaining > 0 ? (
                <button onClick={() => startGroup(activeGroup)} style={{
                  padding: '0.6rem 1.2rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                  background: `linear-gradient(135deg, ${activeGroup.color}cc, ${activeGroup.color})`,
                  color: '#fff', border: 'none',
                }}>▶ {remaining} verbleibend</button>
              ) : null
            })()}
            <button onClick={() => startGroup(activeGroup, false, false)} style={{
              padding: '0.6rem 1.2rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              background: 'transparent', border: `1px solid ${activeGroup.color}50`, color: activeGroup.color,
            }}>🔄 Alle wiederholen</button>
            {wrongCount > 0 && (
              <button onClick={() => startGroup(activeGroup, true)} style={{
                padding: '0.6rem 1.2rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171',
              }}>✗ Falsche ({wrongCount}) wiederholen</button>
            )}
            <button onClick={() => setPhase('groups')} style={{
              padding: '0.6rem 1.2rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-muted)',
            }}>← Zurück</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/* ══════════════════════════════════════════════════════════
   QuizAnswers — stabile Shuffle-Antworten pro Frage
══════════════════════════════════════════════════════════ */
function QuizAnswers({
  answers, selected, correctId, onSelect, firstTime,
}: {
  answers: Question['answers']
  selected: string | null
  correctId: string
  onSelect: (id: string) => void
  firstTime: boolean
}) {
  // useMemo damit beim Rendern die Reihenfolge gleich bleibt
  const shuffled = useMemo(() => shuffle(answers), [answers]) // eslint-disable-line react-hooks/exhaustive-deps
  const answered  = selected !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {shuffled.map((a, idx) => {
        let bg        = 'transparent'
        let border    = 'rgba(var(--gold-rgb),0.2)'
        let txtColor  = 'var(--text-muted)'
        let sym       = String.fromCharCode(65 + idx) // A B C D
        let symBg     = 'rgba(var(--gold-rgb),0.08)'
        let symColor  = 'var(--text-dim)'

        if (answered) {
          if (a.correct) {
            bg = 'rgba(34,197,94,0.07)'; border = 'rgba(34,197,94,0.4)'
            txtColor = '#86efac'; sym = '✓'; symBg = 'rgba(34,197,94,0.2)'; symColor = '#22c55e'
          } else if (a.id === selected) {
            bg = 'rgba(239,68,68,0.07)'; border = 'rgba(239,68,68,0.4)'
            txtColor = '#fca5a5'; sym = '✗'; symBg = 'rgba(239,68,68,0.2)'; symColor = '#ef4444'
          }
        }

        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            disabled={answered}
            style={{
              width: '100%', textAlign: 'left', padding: '0.75rem 0.9rem', borderRadius: '10px',
              cursor: answered ? 'default' : 'pointer', background: bg, border: `1px solid ${border}`,
              display: 'flex', alignItems: 'flex-start', gap: '0.65rem', transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (!answered) e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.07)' }}
            onMouseLeave={e => { if (!answered) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{
              width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
              background: symBg, color: symColor, border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.62rem', fontWeight: 900,
            }}>{sym}</span>
            <span style={{ flex: 1, fontSize: '0.82rem', color: txtColor, lineHeight: 1.5 }}>{a.text}</span>
            {answered && a.correct && firstTime && selected === a.id && (
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#22c55e', flexShrink: 0, alignSelf: 'center' }}>+2 ⭐</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
