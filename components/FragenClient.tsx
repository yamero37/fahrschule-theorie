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
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
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
  for (const q of questions) {
    topicCounts[q.topic] = (topicCounts[q.topic] ?? 0) + 1
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="lg:w-56 shrink-0">
        <div className="bg-white rounded-xl shadow p-4 sticky top-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Themen</p>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setSelectedTopic('Alle')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  selectedTopic === 'Alle' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Alle ({questions.length})
              </button>
            </li>
            {TOPICS.map((t) => (
              <li key={t}>
                <button
                  onClick={() => setSelectedTopic(t)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    selectedTopic === t ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {t} ({topicCounts[t] ?? 0})
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUnlearned}
                onChange={(e) => setShowOnlyUnlearned(e.target.checked)}
                className="rounded"
              />
              Nur ungelernte
            </label>
            <p className="text-xs text-gray-400 mt-2">
              {learnedIds.size} / {questions.length} gelernt
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(learnedIds.size / questions.length) * 100}%` }}
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
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <p className="text-sm text-gray-500 mb-4">{filtered.length} Fragen</p>

        <div className="space-y-4">
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              learned={learnedIds.has(q.id)}
              onToggleLearned={() => toggleLearned(q.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-400 text-center py-12">Keine Fragen gefunden.</p>
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
    q.points >= 5
      ? 'bg-red-100 text-red-700'
      : q.points === 4
      ? 'bg-orange-100 text-orange-700'
      : 'bg-yellow-100 text-yellow-700'

  return (
    <div
      className={`bg-white rounded-xl shadow transition-all border-l-4 ${
        learned ? 'border-green-400 opacity-70' : 'border-blue-400'
      }`}
    >
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                {q.topic}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${pointColor}`}>
                {q.points} Fehlerpunkte
              </span>
              <span className="text-xs text-gray-400">{q.id}</span>
            </div>
            <p className="font-medium text-gray-800 text-sm leading-relaxed">{q.question}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleLearned()
              }}
              title={learned ? 'Als ungelernt markieren' : 'Als gelernt markieren'}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors ${
                learned
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {learned ? '✓' : '○'}
            </button>
            <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-2">
          {q.answers.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                a.correct
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  a.correct ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {a.id.toUpperCase()}
              </span>
              <span>{a.text}</span>
              {a.correct && (
                <span className="ml-auto text-green-600 font-semibold shrink-0">✓ Richtig</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
