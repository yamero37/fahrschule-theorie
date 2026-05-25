'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Question, Topic } from '@/types'
import { TOPICS } from '@/types'
import { supabase } from '@/lib/supabase'

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

interface Props { questions: Question[] }

export default function FragenClient({ questions }: Props) {
  const [selectedTopic, setSelectedTopic]         = useState<Topic | 'Alle'>('Alle')
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false)
  const [showOnlyWrong, setShowOnlyWrong]         = useState(false)
  const [search, setSearch]                       = useState('')
  const [correctIds, setCorrectIds]               = useState<Set<string>>(new Set())
  const [wrongIds, setWrongIds]                   = useState<Set<string>>(new Set())
  const [userId, setUserId]                       = useState('')

  useEffect(() => {
    try {
      setCorrectIds(new Set(JSON.parse(localStorage.getItem(CORRECT_KEY) ?? '[]')))
      setWrongIds(new Set(JSON.parse(localStorage.getItem(WRONG_KEY) ?? '[]')))
    } catch {}
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id) })
  }, [])

  const onCorrect = async (qId: string) => {
    const firstTime = !correctIds.has(qId)
    if (firstTime) {
      const next = new Set(correctIds); next.add(qId)
      setCorrectIds(next)
      localStorage.setItem(CORRECT_KEY, JSON.stringify([...next]))
    }
    // Remove from wrong list
    if (wrongIds.has(qId)) {
      const nw = new Set(wrongIds); nw.delete(qId)
      setWrongIds(nw)
      localStorage.setItem(WRONG_KEY, JSON.stringify([...nw]))
    }
    // +2 Punkte in Supabase (nur beim ersten Mal)
    if (firstTime && userId) {
      try {
        const { data: stats } = await supabase
          .from('user_stats').select('points').eq('user_id', userId).single()
        await supabase.from('user_stats')
          .upsert({ user_id: userId, points: (stats?.points ?? 0) + 2 }, { onConflict: 'user_id' })
      } catch {}
    }
  }

  const onWrong = (qId: string) => {
    if (correctIds.has(qId)) return
    const next = new Set(wrongIds); next.add(qId)
    setWrongIds(next)
    localStorage.setItem(WRONG_KEY, JSON.stringify([...next]))
  }

  const topicCounts: Record<string, number> = {}
  for (const q of questions) topicCounts[q.topic] = (topicCounts[q.topic] ?? 0) + 1

  const filtered = questions.filter(q => {
    if (selectedTopic !== 'Alle' && q.topic !== selectedTopic) return false
    if (showOnlyUnlearned && correctIds.has(q.id)) return false
    if (showOnlyWrong && !wrongIds.has(q.id)) return false
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const correctPct = questions.length > 0
    ? Math.round((correctIds.size / questions.length) * 100) : 0

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.25rem 1rem 84px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.1rem' }}>
        <Link href="/dashboard" style={{
          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          color: 'var(--text-dim)', fontSize: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
        }}>←</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
            📚 Theoriefragen
          </h1>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {correctIds.size} / {questions.length} richtig · {correctPct}%
          </p>
        </div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)', padding: '3px 9px', borderRadius: '100px' }}>
          700 Fragen
        </div>
      </div>

      {/* ── Fortschrittsbalken ── */}
      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(var(--gold-rgb),0.1)', overflow: 'hidden', marginBottom: '1.1rem' }}>
        <div style={{
          width: `${correctPct}%`, height: '100%', borderRadius: '2px',
          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
          transition: 'width 0.6s ease',
        }} />
      </div>

      {/* ── Suche ── */}
      <input
        type="text"
        placeholder="🔍  Frage suchen…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', boxSizing: 'border-box',
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          color: 'var(--text)', fontSize: '0.85rem', outline: 'none', marginBottom: '0.75rem',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.45)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--input-border)'}
      />

      {/* ── Themen-Chips ── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        {(['Alle', ...TOPICS] as const).map(t => {
          const active = selectedTopic === t
          const cnt = t === 'Alle' ? questions.length : (topicCounts[t] ?? 0)
          return (
            <button key={t} onClick={() => setSelectedTopic(t)} style={{
              padding: '3px 9px', borderRadius: '100px', fontSize: '0.6rem', fontWeight: 700,
              cursor: 'pointer',
              background: active ? 'rgba(var(--gold-rgb),0.14)' : 'var(--input-bg)',
              border: active ? '1px solid rgba(var(--gold-rgb),0.4)' : '1px solid var(--input-border)',
              color: active ? 'var(--gold)' : 'var(--text-muted)',
            }}>{t} ({cnt})</button>
          )
        })}
      </div>

      {/* ── Filter-Buttons ── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        <button onClick={() => { setShowOnlyUnlearned(v => !v); setShowOnlyWrong(false) }} style={{
          padding: '3px 10px', borderRadius: '100px', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
          background: showOnlyUnlearned ? 'rgba(34,197,94,0.1)' : 'var(--input-bg)',
          border: showOnlyUnlearned ? '1px solid rgba(34,197,94,0.35)' : '1px solid var(--input-border)',
          color: showOnlyUnlearned ? '#22c55e' : 'var(--text-muted)',
        }}>○ Noch nicht richtig ({questions.length - correctIds.size})</button>
        <button onClick={() => { setShowOnlyWrong(v => !v); setShowOnlyUnlearned(false) }} style={{
          padding: '3px 10px', borderRadius: '100px', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
          background: showOnlyWrong ? 'rgba(239,68,68,0.1)' : 'var(--input-bg)',
          border: showOnlyWrong ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--input-border)',
          color: showOnlyWrong ? '#f87171' : 'var(--text-muted)',
        }}>✗ Falsch beantwortet ({wrongIds.size})</button>
      </div>

      <p style={{ fontSize: '0.63rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
        {filtered.length} Fragen
      </p>

      {/* ── Fragenliste ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {filtered.map(q => (
          <QuestionCard
            key={q.id}
            question={q}
            alreadyCorrect={correctIds.has(q.id)}
            onCorrect={() => onCorrect(q.id)}
            onWrong={() => onWrong(q.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.75rem' }}>◎</p>
            <p style={{ fontSize: '0.85rem' }}>Keine Fragen gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────── */
/*  QuestionCard                               */
/* ─────────────────────────────────────────── */

function QuestionCard({
  question: q,
  alreadyCorrect,
  onCorrect,
  onWrong,
}: {
  question: Question
  alreadyCorrect: boolean
  onCorrect: () => void
  onWrong: () => void
}) {
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  // Antworten einmalig beim Mount mischen
  const shuffled = useMemo(() => shuffle(q.answers), [q.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const answered      = selected !== null
  const correctAnswer = q.answers.find(a => a.correct)!
  const gotItRight    = selected === correctAnswer.id

  const handleSelect = (id: string) => {
    if (answered) return
    setSelected(id)
    if (id === correctAnswer.id) onCorrect()
    else onWrong()
  }

  const ptColor = q.points >= 5 ? '#f87171' : q.points === 4 ? '#fb923c' : 'var(--gold)'

  return (
    <div style={{
      borderRadius: '1.1rem', overflow: 'hidden',
      background: 'transparent',
      border: `1px solid ${
        open
          ? answered
            ? gotItRight ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.35)'
            : 'rgba(var(--gold-rgb),0.35)'
          : 'rgba(var(--gold-rgb),0.18)'
      }`,
      opacity: alreadyCorrect && !open ? 0.65 : 1,
      transition: 'border-color 0.2s, opacity 0.2s',
    }}>

      {/* ── Kopfzeile ── */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          padding: '0.8rem 0.9rem', cursor: 'pointer',
          display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
        }}
      >
        {/* Punkte-Badge */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
          background: `${ptColor}18`, color: ptColor, border: `1px solid ${ptColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.62rem', fontWeight: 900,
        }}>{q.points}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            {q.topic} · {q.id}
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.5, fontWeight: 600 }}>
            {q.question}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, paddingTop: '2px' }}>
          {alreadyCorrect && (
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 900,
            }}>✓</span>
          )}
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* ── Antworten ── */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(var(--gold-rgb),0.1)', padding: '0.8rem 0.9rem' }}>
          {!answered && (
            <p style={{
              margin: '0 0 0.6rem', fontSize: '0.58rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)',
            }}>Wähle die richtige Antwort aus</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {shuffled.map(a => {
              // Styling je nach Status
              let bg         = 'transparent'
              let border     = 'rgba(var(--gold-rgb),0.18)'
              let textColor  = 'var(--text-muted)'
              let iconSymbol = a.id.toUpperCase()
              let iconBg     = 'rgba(var(--gold-rgb),0.07)'
              let iconColor  = 'var(--text-dim)'

              if (answered) {
                if (a.correct) {
                  bg = 'rgba(34,197,94,0.07)'; border = 'rgba(34,197,94,0.38)'
                  textColor = '#86efac'; iconSymbol = '✓'
                  iconBg = 'rgba(34,197,94,0.18)'; iconColor = '#22c55e'
                } else if (a.id === selected) {
                  bg = 'rgba(239,68,68,0.07)'; border = 'rgba(239,68,68,0.38)'
                  textColor = '#fca5a5'; iconSymbol = '✗'
                  iconBg = 'rgba(239,68,68,0.18)'; iconColor = '#ef4444'
                }
              }

              return (
                <button
                  key={a.id}
                  onClick={() => handleSelect(a.id)}
                  disabled={answered}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '0.65rem 0.8rem', borderRadius: '9px',
                    cursor: answered ? 'default' : 'pointer',
                    background: bg, border: `1px solid ${border}`,
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!answered) e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.07)' }}
                  onMouseLeave={e => { if (!answered) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                    background: iconBg, color: iconColor, border: `1px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 900,
                  }}>{iconSymbol}</span>
                  <span style={{ flex: 1, fontSize: '0.78rem', color: textColor, lineHeight: 1.45 }}>
                    {a.text}
                  </span>
                  {answered && a.correct && !alreadyCorrect && selected === a.id && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22c55e', flexShrink: 0 }}>
                      +2 ⭐
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Feedback ── */}
          {answered && (
            <div style={{
              marginTop: '0.6rem', padding: '0.55rem 0.8rem', borderRadius: '9px',
              display: 'flex', alignItems: 'center', gap: '7px',
              background: gotItRight ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${gotItRight ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              fontSize: '0.75rem', fontWeight: 700,
              color: gotItRight ? '#86efac' : '#fca5a5',
            }}>
              {gotItRight
                ? alreadyCorrect
                  ? '✓  Richtig! (Punkte wurden bereits gewertet)'
                  : '✓  Richtig! +2 Punkte werden gutgeschrieben.'
                : '✗  Falsch – die richtige Antwort ist grün markiert.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
