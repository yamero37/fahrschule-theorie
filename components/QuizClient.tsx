'use client'

import { useState } from 'react'
import type { Question, Topic } from '@/types'
import { TOPICS } from '@/types'
import Link from 'next/link'

interface Props {
  questions: Question[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizClient({ questions }: Props) {
  const [topic, setTopic] = useState<Topic | 'Alle'>('Alle')
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [results, setResults] = useState<{ questionId: string; correct: boolean; points: number }[]>([])
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const [count, setCount] = useState(30)

  const startQuiz = () => {
    const pool = topic === 'Alle' ? questions : questions.filter((q) => q.topic === topic)
    const picked = shuffle(pool).slice(0, Math.min(count, pool.length))
    setQuizQuestions(picked)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setConfirmed(false)
    setResults([])
    setFinished(false)
    setStarted(true)
  }

  const confirmAnswer = () => {
    if (!selectedAnswer || confirmed) return
    setConfirmed(true)
    const q = quizQuestions[currentIndex]
    const correctId = q.answers.find((a) => a.correct)?.id ?? ''
    setResults((prev) => [
      ...prev,
      { questionId: q.id, correct: selectedAnswer === correctId, points: q.points },
    ])
  }

  const next = () => {
    if (currentIndex + 1 >= quizQuestions.length) {
      setFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setConfirmed(false)
    }
  }

  if (!started) return <QuizSetup topic={topic} setTopic={setTopic} count={count} setCount={setCount} onStart={startQuiz} questions={questions} />
  if (finished) return <QuizResult results={results} questions={quizQuestions} onRestart={() => setStarted(false)} />

  const q = quizQuestions[currentIndex]
  const correctId = q.answers.find((a) => a.correct)?.id ?? ''
  const progress = (currentIndex / quizQuestions.length) * 100
  const wrongSoFar = results.filter((r) => !r.correct).reduce((s, r) => s + r.points, 0)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          <span>Frage {currentIndex + 1} / {quizQuestions.length}</span>
          <span style={{ color: wrongSoFar > 7 ? '#f87171' : 'var(--gold)' }}>
            {wrongSoFar} Fehlerpunkte
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--green-dark), var(--gold))',
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 0 24px rgba(34,197,94,0.05)',
        }}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'var(--green-glow)',
              color: 'var(--green)',
              border: '1px solid rgba(34,197,94,0.25)',
            }}
          >
            {q.topic}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'var(--gold-glow)',
              color: 'var(--gold)',
              border: '1px solid rgba(240,180,41,0.25)',
            }}
          >
            {q.points} Fehlerpunkte
          </span>
        </div>
        <p className="font-semibold text-base leading-relaxed" style={{ color: 'var(--text)' }}>
          {q.question}
        </p>
      </div>

      {/* Answers */}
      <div className="space-y-2.5 mb-6">
        {q.answers.map((a) => {
          let style: React.CSSProperties = {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }
          if (!confirmed && selectedAnswer === a.id) {
            style = {
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid var(--green)',
              color: 'var(--text)',
              boxShadow: '0 0 12px var(--green-glow)',
              cursor: 'pointer',
            }
          }
          if (confirmed) {
            if (a.id === correctId) {
              style = {
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.5)',
                color: '#86efac',
                cursor: 'default',
              }
            } else if (a.id === selectedAnswer) {
              style = {
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
                cursor: 'default',
                opacity: 0.9,
              }
            } else {
              style = {
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                cursor: 'default',
                opacity: 0.5,
              }
            }
          }

          return (
            <button
              key={a.id}
              disabled={confirmed}
              onClick={() => setSelectedAnswer(a.id)}
              className="w-full text-left flex items-start gap-3 p-4 rounded-xl transition-all duration-150 text-sm"
              style={style}
            >
              <span
                className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={
                  confirmed && a.id === correctId
                    ? { background: 'var(--green)', color: '#000' }
                    : confirmed && a.id === selectedAnswer && a.id !== correctId
                    ? { background: '#ef4444', color: '#fff' }
                    : selectedAnswer === a.id
                    ? { background: 'var(--green-dark)', color: '#fff' }
                    : { background: 'var(--border)', color: 'var(--text-dim)' }
                }
              >
                {a.id.toUpperCase()}
              </span>
              <span className="flex-1 leading-relaxed">{a.text}</span>
              {confirmed && a.id === correctId && (
                <span className="font-bold shrink-0" style={{ color: 'var(--green)' }}>✓</span>
              )}
              {confirmed && a.id === selectedAnswer && a.id !== correctId && (
                <span className="font-bold shrink-0" style={{ color: '#ef4444' }}>✗</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Action button */}
      {!confirmed ? (
        <button
          onClick={confirmAnswer}
          disabled={!selectedAnswer}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={
            selectedAnswer
              ? {
                  background: 'linear-gradient(135deg, var(--green-dark) 0%, #0a4a20 100%)',
                  color: '#fff',
                  border: '1px solid var(--green)',
                  boxShadow: '0 0 20px var(--green-glow)',
                }
              : {
                  background: 'var(--surface-2)',
                  color: 'var(--text-dim)',
                  border: '1px solid var(--border)',
                  cursor: 'not-allowed',
                }
          }
        >
          Antwort bestätigen
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #3d2800 0%, #4a3200 100%)',
            color: 'var(--gold)',
            border: '1px solid rgba(240,180,41,0.4)',
            boxShadow: '0 0 20px var(--gold-glow)',
          }}
        >
          {currentIndex + 1 >= quizQuestions.length ? '✦ Ergebnis anzeigen' : 'Weiter →'}
        </button>
      )}
    </div>
  )
}

function QuizSetup({
  topic, setTopic, count, setCount, onStart, questions,
}: {
  topic: Topic | 'Alle'
  setTopic: (t: Topic | 'Alle') => void
  count: number
  setCount: (n: number) => void
  onStart: () => void
  questions: Question[]
}) {
  const pool = topic === 'Alle' ? questions : questions.filter((q) => q.topic === topic)

  return (
    <div
      className="max-w-md mx-auto rounded-2xl p-8"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 0 40px rgba(34,197,94,0.05)',
      }}
    >
      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>
        Quiz konfigurieren
      </h2>
      <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
        Wähle Thema und Anzahl der Fragen
      </p>

      <div className="mb-5">
        <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
          Thema
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic | 'Alle')}
          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all appearance-none"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          <option value="Alle">Alle Themen</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="mb-7">
        <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
          Anzahl Fragen
        </label>
        <div
          className="flex items-center justify-center text-3xl font-bold mb-3"
          style={{ color: 'var(--green)' }}
        >
          {Math.min(count, pool.length)}
        </div>
        <input
          type="range"
          min={5}
          max={Math.min(50, pool.length)}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-green-500"
          style={{ accentColor: 'var(--green)' }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
          <span>5</span>
          <span>{Math.min(50, pool.length)} max</span>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={pool.length === 0}
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, var(--green-dark) 0%, #0a4a20 100%)',
          color: '#fff',
          border: '1px solid var(--green)',
          boxShadow: '0 0 24px var(--green-glow)',
        }}
      >
        ✦ Quiz starten
      </button>
    </div>
  )
}

function QuizResult({
  results, questions, onRestart,
}: {
  results: { questionId: string; correct: boolean; points: number }[]
  questions: Question[]
  onRestart: () => void
}) {
  const total = results.length
  const correct = results.filter((r) => r.correct).length
  const wrongPoints = results.filter((r) => !r.correct).reduce((s, r) => s + r.points, 0)
  const passed = wrongPoints <= 10
  const pct = Math.round((correct / total) * 100)

  return (
    <div className="max-w-lg mx-auto">
      {/* Result hero */}
      <div
        className="rounded-2xl p-8 text-center mb-5"
        style={{
          background: passed
            ? 'linear-gradient(135deg, #071a0c 0%, #0a2a12 100%)'
            : 'linear-gradient(135deg, #1a0707 0%, #2a0a0a 100%)',
          border: `1px solid ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          boxShadow: passed ? '0 0 40px rgba(34,197,94,0.1)' : '0 0 40px rgba(239,68,68,0.1)',
        }}
      >
        <div className="text-5xl mb-4">{passed ? '🏆' : '📚'}</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: passed ? 'var(--green)' : '#f87171' }}
        >
          {passed ? 'Bestanden!' : 'Nicht bestanden'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {passed
            ? 'Glückwunsch – du hättest die Prüfung bestanden!'
            : `${wrongPoints} Fehlerpunkte – maximal 10 erlaubt.`}
        </p>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Richtig" value={`${correct}/${total}`} color="var(--green)" />
          <Stat label="Prozent" value={`${pct}%`} color="var(--gold)" />
          <Stat
            label="Fehlerpunkte"
            value={String(wrongPoints)}
            color={wrongPoints > 10 ? '#f87171' : 'var(--green)'}
          />
        </div>
      </div>

      {/* Wrong answers */}
      {results.filter((r) => !r.correct).length > 0 && (
        <div
          className="rounded-xl p-5 mb-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--gold)' }}>
            Falsch beantwortet
          </h3>
          <div className="space-y-3">
            {results.filter((r) => !r.correct).map((r) => {
              const q = questions.find((q) => q.id === r.questionId)
              if (!q) return null
              const correct = q.answers.find((a) => a.correct)
              return (
                <div
                  key={r.questionId}
                  className="rounded-lg p-3 text-sm"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <p className="font-medium mb-1.5" style={{ color: 'var(--text)' }}>{q.question}</p>
                  <p style={{ color: 'var(--green)' }}>✓ {correct?.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--green-dark), #0a4a20)',
            color: '#fff',
            border: '1px solid var(--green)',
            boxShadow: '0 0 16px var(--green-glow)',
          }}
        >
          Neues Quiz
        </button>
        <Link
          href="/fragen"
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-center transition-all"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          Fragen lernen
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
    >
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{label}</p>
    </div>
  )
}
