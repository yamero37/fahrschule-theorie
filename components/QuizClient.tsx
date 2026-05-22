'use client'

import { useState } from 'react'
import type { Question, Topic } from '@/types'
import { TOPICS } from '@/types'
import Link from 'next/link'

interface Props { questions: Question[] }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizClient({ questions }: Props) {
  const [topic, setTopic]         = useState<Topic | 'Alle'>('Alle')
  const [quizQs, setQuizQs]       = useState<Question[]>([])
  const [idx, setIdx]             = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [results, setResults]     = useState<{ id: string; correct: boolean; points: number }[]>([])
  const [finished, setFinished]   = useState(false)
  const [started, setStarted]     = useState(false)
  const [count, setCount]         = useState(30)

  const start = () => {
    const pool = topic === 'Alle' ? questions : questions.filter((q) => q.topic === topic)
    setQuizQs(shuffle(pool).slice(0, Math.min(count, pool.length)))
    setIdx(0); setSelected(null); setConfirmed(false)
    setResults([]); setFinished(false); setStarted(true)
  }

  const confirm = () => {
    if (!selected || confirmed) return
    setConfirmed(true)
    const q = quizQs[idx]
    const correctId = q.answers.find((a) => a.correct)?.id ?? ''
    setResults((p) => [...p, { id: q.id, correct: selected === correctId, points: q.points }])
  }

  const next = () => {
    if (idx + 1 >= quizQs.length) { setFinished(true); return }
    setIdx((i) => i + 1); setSelected(null); setConfirmed(false)
  }

  if (!started)  return <Setup topic={topic} setTopic={setTopic} count={count} setCount={setCount} onStart={start} questions={questions} />
  if (finished)  return <Result results={results} questions={quizQs} onRestart={() => setStarted(false)} />

  const q = quizQs[idx]
  const correctId = q.answers.find((a) => a.correct)?.id ?? ''
  const wrongPts  = results.filter((r) => !r.correct).reduce((s, r) => s + r.points, 0)
  const progress  = ((idx) / quizQs.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Top bar */}
      <div
        className="rounded-xl px-5 py-3 flex items-center justify-between"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Frage {idx + 1} / {quizQs.length}
          </span>
          <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--green-dark), var(--gold))' }}
            />
          </div>
        </div>
        <div
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            background: wrongPts > 7 ? 'rgba(248,113,113,0.1)' : 'var(--gold-glow)',
            color: wrongPts > 7 ? '#f87171' : 'var(--gold)',
            border: `1px solid ${wrongPts > 7 ? 'rgba(248,113,113,0.3)' : 'rgba(240,180,41,0.3)'}`,
          }}
        >
          {wrongPts} / 10 Fehlerpunkte
        </div>
      </div>

      {/* Question */}
      <div
        className="rounded-2xl p-7"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
      >
        <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-dim)' }}>
          {q.topic} · {q.points} Fehlerpunkte
        </p>
        <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>
          {q.question}
        </p>
      </div>

      {/* Answers */}
      <div className="space-y-2.5">
        {q.answers.map((a) => {
          let style: React.CSSProperties
          if (!confirmed) {
            style = selected === a.id
              ? { background: 'rgba(34,197,94,0.08)', border: '1px solid var(--green)', color: 'var(--text)', boxShadow: '0 0 0 3px var(--green-glow)', cursor: 'pointer' }
              : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer' }
          } else {
            if (a.id === correctId)
              style = { background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.45)', color: '#86efac', cursor: 'default' }
            else if (a.id === selected)
              style = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', cursor: 'default' }
            else
              style = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)', opacity: 0.45, cursor: 'default' }
          }

          return (
            <button
              key={a.id}
              disabled={confirmed}
              onClick={() => setSelected(a.id)}
              className="w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all duration-150 text-sm"
              style={style}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={
                  confirmed && a.id === correctId
                    ? { background: 'var(--green)', color: '#000' }
                    : confirmed && a.id === selected && a.id !== correctId
                    ? { background: '#ef4444', color: '#fff' }
                    : selected === a.id
                    ? { background: 'var(--green-dark)', color: '#fff' }
                    : { background: 'var(--border)', color: 'var(--text-dim)' }
                }
              >
                {a.id.toUpperCase()}
              </span>
              <span className="flex-1 leading-relaxed">{a.text}</span>
              {confirmed && a.id === correctId && <span style={{ color: 'var(--green)' }} className="font-bold shrink-0">✓</span>}
              {confirmed && a.id === selected && a.id !== correctId && <span style={{ color: '#ef4444' }} className="font-bold shrink-0">✗</span>}
            </button>
          )
        })}
      </div>

      {/* Action */}
      {!confirmed ? (
        <button
          onClick={confirm}
          disabled={!selected}
          className="w-full py-4 rounded-xl font-bold text-sm transition-all"
          style={
            selected
              ? { background: 'linear-gradient(135deg, var(--green-dark), #0f5c2a)', color: '#fff', border: '1px solid var(--green)', boxShadow: '0 4px 20px var(--green-glow)' }
              : { background: 'var(--surface-2)', color: 'var(--text-dim)', border: '1px solid var(--border)', cursor: 'not-allowed' }
          }
        >
          Antwort bestätigen
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2a1e00, #3d2c00)', color: 'var(--gold)', border: '1px solid rgba(240,180,41,0.4)', boxShadow: '0 4px 20px var(--gold-glow)' }}
        >
          {idx + 1 >= quizQs.length ? '✦ Ergebnis anzeigen' : 'Weiter →'}
        </button>
      )}
    </div>
  )
}

// ── Setup screen ──────────────────────────────────────────────────────────────
function Setup({ topic, setTopic, count, setCount, onStart, questions }: {
  topic: Topic | 'Alle'
  setTopic: (t: Topic | 'Alle') => void
  count: number
  setCount: (n: number) => void
  onStart: () => void
  questions: Question[]
}) {
  const pool = topic === 'Alle' ? questions : questions.filter((q) => q.topic === topic)
  const max  = Math.min(50, pool.length)
  const actual = Math.min(count, pool.length)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div
        className="rounded-2xl p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
      >
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Quiz einrichten</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Wähle Thema und Anzahl der Fragen</p>

        {/* Topic */}
        <div className="mb-6">
          <label className="block text-xs font-bold tracking-widest uppercase mb-2.5" style={{ color: 'var(--gold)' }}>
            Thema
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as Topic | 'Alle')}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none appearance-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <option value="Alle">Alle Themen ({questions.length} Fragen)</option>
            {TOPICS.map((t) => {
              const n = questions.filter((q) => q.topic === t).length
              return <option key={t} value={t}>{t} ({n} Fragen)</option>
            })}
          </select>
        </div>

        {/* Count */}
        <div className="mb-8">
          <label className="block text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--gold)' }}>
            Anzahl Fragen
          </label>
          <div className="text-center mb-4">
            <span className="text-5xl font-extrabold" style={{ color: 'var(--green)' }}>{actual}</span>
          </div>
          <input
            type="range" min={5} max={max} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full" style={{ accentColor: 'var(--green)' }}
          />
          <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
            <span>5 min</span><span>{max} max</span>
          </div>
        </div>

        <button
          onClick={onStart}
          disabled={pool.length === 0}
          className="w-full py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--green-dark), #0f5c2a)', color: '#fff', border: '1px solid var(--green)', boxShadow: '0 4px 24px var(--green-glow)' }}
        >
          ✦ Quiz starten
        </button>
      </div>

      {/* Info */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--gold)' }}>Prüfungsformat</p>
        <ul className="text-xs space-y-1.5" style={{ color: 'var(--text-muted)' }}>
          <li>· 30 Fragen · max. 10 Fehlerpunkte erlaubt</li>
          <li>· Fragen mit 5 Fehlerpunkten direkt falsch = nicht bestanden</li>
        </ul>
      </div>
    </div>
  )
}

// ── Result screen ─────────────────────────────────────────────────────────────
function Result({ results, questions, onRestart }: {
  results: { id: string; correct: boolean; points: number }[]
  questions: Question[]
  onRestart: () => void
}) {
  const total      = results.length
  const correct    = results.filter((r) => r.correct).length
  const wrongPts   = results.filter((r) => !r.correct).reduce((s, r) => s + r.points, 0)
  const passed     = wrongPts <= 10
  const pct        = Math.round((correct / total) * 100)
  const wrongItems = results.filter((r) => !r.correct)

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Score card */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: passed ? 'linear-gradient(135deg, #06120a, #0a2010)' : 'linear-gradient(135deg, #120606, #200a0a)',
          border: `1px solid ${passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
          boxShadow: passed ? '0 0 40px rgba(34,197,94,0.08)' : '0 0 40px rgba(239,68,68,0.08)',
        }}
      >
        <div className="text-5xl mb-5">{passed ? '🏆' : '📚'}</div>
        <h2 className="text-2xl font-extrabold mb-2" style={{ color: passed ? 'var(--green)' : '#f87171' }}>
          {passed ? 'Bestanden!' : 'Nicht bestanden'}
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {passed ? 'Glückwunsch – du hättest die Prüfung bestanden!' : `${wrongPts} Fehlerpunkte – maximal 10 erlaubt`}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Richtig', value: `${correct}/${total}`, color: 'var(--green)' },
            { label: 'Prozent', value: `${pct}%`, color: 'var(--gold)' },
            { label: 'Fehlerpunkte', value: String(wrongPts), color: wrongPts > 10 ? '#f87171' : 'var(--green)' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-3"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
            >
              <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wrong answers */}
      {wrongItems.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
              Falsch beantwortet ({wrongItems.length})
            </p>
          </div>
          <div className="p-4 space-y-3">
            {wrongItems.map((r) => {
              const q = questions.find((q) => q.id === r.id)
              if (!q) return null
              const ans = q.answers.find((a) => a.correct)
              return (
                <div
                  key={r.id}
                  className="rounded-lg p-4 text-sm"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>{q.question}</p>
                  <p className="text-xs" style={{ color: 'var(--green)' }}>✓ {ans?.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, var(--green-dark), #0f5c2a)', color: '#fff', border: '1px solid var(--green)', boxShadow: '0 4px 16px var(--green-glow)' }}
        >
          Neues Quiz
        </button>
        <Link
          href="/fragen"
          className="flex-1 py-3.5 rounded-xl font-bold text-sm text-center hover:opacity-90 transition-all"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          Lernen
        </Link>
      </div>
    </div>
  )
}
