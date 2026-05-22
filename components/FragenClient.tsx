'use client'

import { useState, useEffect } from 'react'
import type { Question, Topic } from '@/types'
import { TOPICS } from '@/types'

interface Props {
  questions: Question[]
}

export default function FragenClient({ questions }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | 'Alle'>('Alle')
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set())
  const [showOnlyUnlearned, setShowOnlyUnlearned] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('learnedIds') ?? '[]')
      setLearnedIds(new Set(stored))
    } catch { /* ignore */ }
  }, [])

  const toggleLearned = (id: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem('learnedIds', JSON.stringify([...next]))
      return next
    })
  }

  const filtered = questions.filter((q) => {
    if (selectedTopic !== 'Alle' && q.topic !== selectedTopic) return false
    if (showOnlyUnlearned && learnedIds.has(q.id)) return false
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const topicCounts: Record<string, number> = {}
  for (const q of questions) topicCounts[q.topic] = (topicCounts[q.topic] ?? 0) + 1

  const learnedPercent = questions.length > 0 ? Math.round((learnedIds.size / questions.length) * 100) : 0

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* ── Sidebar ── */}
      <aside className="lg:w-56 shrink-0">
        <div
          className="rounded-xl overflow-hidden sticky top-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Progress block */}
          <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Fortschritt</span>
              <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{learnedPercent}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${learnedPercent}%`,
                  background: 'linear-gradient(90deg, var(--green-dark), var(--gold))',
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
              {learnedIds.size} / {questions.length} gelernt
            </p>
          </div>

          {/* Filter */}
          <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={showOnlyUnlearned}
                onChange={(e) => setShowOnlyUnlearned(e.target.checked)}
                className="rounded"
                style={{ accentColor: 'var(--green)' }}
              />
              Nur ungelernte
            </label>
          </div>

          {/* Topics */}
          <div className="p-3">
            <p className="text-xs font-bold tracking-widest uppercase px-2 mb-2" style={{ color: 'var(--text-dim)' }}>
              Thema
            </p>
            <ul className="space-y-0.5">
              {(['Alle', ...TOPICS] as const).map((t) => {
                const active = selectedTopic === t
                const cnt = t === 'Alle' ? questions.length : (topicCounts[t] ?? 0)
                return (
                  <li key={t}>
                    <button
                      onClick={() => setSelectedTopic(t)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all"
                      style={
                        active
                          ? { background: 'var(--green-glow)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }
                          : { color: 'var(--text-muted)', border: '1px solid transparent' }
                      }
                    >
                      <span>{t}</span>
                      <span style={{ color: active ? 'var(--green)' : 'var(--text-dim)' }}>{cnt}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0">

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Frage suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--green)'
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--green-glow)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        <p className="text-xs mb-5 font-medium" style={{ color: 'var(--text-dim)' }}>
          {filtered.length} {filtered.length === 1 ? 'Frage' : 'Fragen'}
          {selectedTopic !== 'Alle' && <span style={{ color: 'var(--gold)' }}> · {selectedTopic}</span>}
        </p>

        <div className="space-y-3">
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              learned={learnedIds.has(q.id)}
              onToggleLearned={() => toggleLearned(q.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--text-dim)' }}>
              <p className="text-3xl mb-3">◎</p>
              <p className="text-sm">Keine Fragen gefunden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuestionCard({
  question: q,
  learned,
  onToggleLearned,
}: {
  question: Question
  learned: boolean
  onToggleLearned: () => void
}) {
  const [open, setOpen] = useState(false)

  const pointColor =
    q.points >= 5 ? '#f87171' : q.points === 4 ? '#fb923c' : 'var(--gold)'

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${open ? 'var(--border-light)' : 'var(--border)'}`,
        opacity: learned && !open ? 0.65 : 1,
      }}
    >
      {/* Question header */}
      <div
        className="p-5 cursor-pointer select-none flex items-start gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Left: point badge */}
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black mt-0.5"
          style={{
            background: `${pointColor}18`,
            color: pointColor,
            border: `1px solid ${pointColor}40`,
          }}
        >
          {q.points}
        </div>

        {/* Middle: question text + topic */}
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-dim)' }}>
            {q.topic} · {q.id}
          </p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text)' }}>
            {q.question}
          </p>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLearned() }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            title={learned ? 'Als ungelernt markieren' : 'Als gelernt markieren'}
            style={
              learned
                ? { background: 'rgba(34,197,94,0.15)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)' }
                : { background: 'var(--surface-2)', color: 'var(--text-dim)', border: '1px solid var(--border)' }
            }
          >
            {learned ? '✓' : '○'}
          </button>
          <span className="text-xs w-4 text-center" style={{ color: 'var(--text-dim)' }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Answers */}
      {open && (
        <div className="px-5 pb-5 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-bold tracking-widest uppercase pt-4 mb-3" style={{ color: 'var(--text-dim)' }}>
            Antwortmöglichkeiten
          </p>
          {q.answers.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3.5 rounded-xl text-sm"
              style={
                a.correct
                  ? { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
              }
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={
                  a.correct
                    ? { background: 'var(--green)', color: '#000' }
                    : { background: 'var(--border)', color: 'var(--text-dim)' }
                }
              >
                {a.id.toUpperCase()}
              </span>
              <span className="flex-1">{a.text}</span>
              {a.correct && (
                <span className="text-xs font-bold shrink-0" style={{ color: 'var(--green)' }}>Richtig</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
