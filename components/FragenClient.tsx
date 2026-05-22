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
    } catch {
      // ignore
    }
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

  const learnedPercent = Math.round((learnedIds.size / questions.length) * 100)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="lg:w-60 shrink-0">
        <div
          className="rounded-xl p-4 sticky top-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: 'var(--gold)' }}
          >
            Themen
          </p>
          <ul className="space-y-0.5">
            {(['Alle', ...TOPICS] as const).map((t) => {
              const active = selectedTopic === t
              const cnt = t === 'Alle' ? questions.length : (topicCounts[t] ?? 0)
              return (
                <li key={t}>
                  <button
                    onClick={() => setSelectedTopic(t)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center justify-between"
                    style={
                      active
                        ? {
                            background: 'linear-gradient(90deg, var(--green-dark) 0%, #0a4020 100%)',
                            color: '#fff',
                            border: '1px solid var(--green)',
                            boxShadow: '0 0 10px var(--green-glow)',
                          }
                        : {
                            color: 'var(--text-muted)',
                            border: '1px solid transparent',
                          }
                    }
                  >
                    <span>{t}</span>
                    <span
                      className="text-xs ml-2 font-bold"
                      style={{ color: active ? '#86efac' : 'var(--text-dim)' }}
                    >
                      {cnt}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Progress */}
          <div
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <label className="flex items-center gap-2 text-sm cursor-pointer mb-3" style={{ color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={showOnlyUnlearned}
                onChange={(e) => setShowOnlyUnlearned(e.target.checked)}
                className="rounded"
              />
              Nur ungelernte
            </label>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-dim)' }}>
              <span>{learnedIds.size} gelernt</span>
              <span style={{ color: 'var(--gold)' }}>{learnedPercent}%</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${learnedPercent}%`,
                  background: 'linear-gradient(90deg, var(--green-dark), var(--gold))',
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Frage suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--green-dark)'
              e.currentTarget.style.boxShadow = '0 0 12px var(--green-glow)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
          {filtered.length} Fragen
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
            <p className="text-center py-16" style={{ color: 'var(--text-dim)' }}>
              Keine Fragen gefunden.
            </p>
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

  const pointStyle =
    q.points >= 5
      ? { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.3)' }
      : q.points === 4
      ? { bg: 'rgba(251,146,60,0.1)', color: '#fb923c', border: 'rgba(251,146,60,0.3)' }
      : { bg: 'var(--gold-glow)', color: 'var(--gold)', border: 'rgba(240,180,41,0.3)' }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${learned ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
        opacity: learned ? 0.75 : 1,
        boxShadow: open ? '0 0 20px var(--green-glow)' : 'none',
      }}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'var(--green-glow)',
                  color: 'var(--green)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                {q.topic}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: pointStyle.bg,
                  color: pointStyle.color,
                  border: `1px solid ${pointStyle.border}`,
                }}
              >
                {q.points} Fehlerpunkte
              </span>
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {q.id}
              </span>
            </div>
            <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text)' }}>
              {q.question}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLearned() }}
              title={learned ? 'Als ungelernt markieren' : 'Als gelernt markieren'}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
              style={
                learned
                  ? { background: 'rgba(34,197,94,0.15)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.4)' }
                  : { background: 'var(--surface-2)', color: 'var(--text-dim)', border: '1px solid var(--border)' }
              }
            >
              {learned ? '✓' : '○'}
            </button>
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {open ? '▲' : '▼'}
            </span>
          </div>
        </div>
      </div>

      {/* Answers */}
      {open && (
        <div
          className="px-4 pb-4 pt-0 space-y-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="pt-3" />
          {q.answers.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3 rounded-lg text-sm"
              style={
                a.correct
                  ? {
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#86efac',
                    }
                  : {
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }
              }
            >
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
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
                <span className="font-bold shrink-0" style={{ color: 'var(--green)' }}>
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
