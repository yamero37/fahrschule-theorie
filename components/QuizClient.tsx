'use client'

import { useState, useEffect } from 'react'
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
    const pool =
      topic === 'Alle' ? questions : questions.filter((q) => q.topic === topic)
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

  if (!started) {
    return <QuizSetup topic={topic} setTopic={setTopic} count={count} setCount={setCount} onStart={startQuiz} questions={questions} />
  }

  if (finished) {
    return <QuizResult results={results} questions={quizQuestions} onRestart={() => setStarted(false)} />
  }

  const q = quizQuestions[currentIndex]
  const correctId = q.answers.find((a) => a.correct)?.id ?? ''
  const progress = ((currentIndex) / quizQuestions.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Frage {currentIndex + 1} von {quizQuestions.length}</span>
          <span className="font-medium text-blue-700">{q.topic}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{q.topic}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            q.points >= 5 ? 'bg-red-100 text-red-700' : q.points === 4 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {q.points} Fehlerpunkte
          </span>
        </div>
        <p className="text-gray-800 font-medium text-base leading-relaxed">{q.question}</p>
      </div>

      {/* Answers */}
      <div className="space-y-3 mb-6">
        {q.answers.map((a) => {
          let style = 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          if (confirmed) {
            if (a.id === correctId) style = 'bg-green-50 border-green-400'
            else if (a.id === selectedAnswer) style = 'bg-red-50 border-red-400'
            else style = 'bg-white border-gray-200 opacity-60'
          } else if (selectedAnswer === a.id) {
            style = 'bg-blue-50 border-blue-500'
          }

          return (
            <button
              key={a.id}
              disabled={confirmed}
              onClick={() => setSelectedAnswer(a.id)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-sm ${style}`}
            >
              <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                confirmed && a.id === correctId
                  ? 'bg-green-500 text-white'
                  : confirmed && a.id === selectedAnswer && a.id !== correctId
                  ? 'bg-red-500 text-white'
                  : selectedAnswer === a.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {a.id.toUpperCase()}
              </span>
              <span className="leading-relaxed">{a.text}</span>
              {confirmed && a.id === correctId && (
                <span className="ml-auto text-green-600 font-semibold shrink-0">✓</span>
              )}
              {confirmed && a.id === selectedAnswer && a.id !== correctId && (
                <span className="ml-auto text-red-500 font-semibold shrink-0">✗</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!confirmed ? (
          <button
            onClick={confirmAnswer}
            disabled={!selectedAnswer}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Antwort bestätigen
          </button>
        ) : (
          <button
            onClick={next}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            {currentIndex + 1 >= quizQuestions.length ? 'Ergebnis anzeigen' : 'Weiter →'}
          </button>
        )}
      </div>
    </div>
  )
}

function QuizSetup({
  topic,
  setTopic,
  count,
  setCount,
  onStart,
  questions,
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
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Quiz konfigurieren</h2>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Thema</label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic | 'Alle')}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Alle">Alle Themen</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Anzahl Fragen ({Math.min(count, pool.length)} von {pool.length} verfügbar)
        </label>
        <input
          type="range"
          min={5}
          max={Math.min(50, pool.length)}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5</span>
          <span className="font-bold text-blue-600">{Math.min(count, pool.length)}</span>
          <span>{Math.min(50, pool.length)}</span>
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={pool.length === 0}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40"
      >
        Quiz starten
      </button>
    </div>
  )
}

function QuizResult({
  results,
  questions,
  onRestart,
}: {
  results: { questionId: string; correct: boolean; points: number }[]
  questions: Question[]
  onRestart: () => void
}) {
  const totalQuestions = results.length
  const correctCount = results.filter((r) => r.correct).length
  const wrongPoints = results.filter((r) => !r.correct).reduce((sum, r) => sum + r.points, 0)
  const passed = wrongPoints <= 10

  const percentage = Math.round((correctCount / totalQuestions) * 100)

  return (
    <div className="max-w-lg mx-auto">
      <div className={`rounded-xl shadow p-8 text-center mb-6 ${passed ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
        <div className="text-5xl mb-4">{passed ? '🎉' : '📚'}</div>
        <h2 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
          {passed ? 'Bestanden!' : 'Nicht bestanden'}
        </h2>
        <p className="text-gray-600 mb-4">
          {passed
            ? 'Glückwunsch! Sie hätten die Prüfung bestanden.'
            : `${wrongPoints} Fehlerpunkte – mehr als 10 erlaubt.`}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <Stat label="Richtig" value={`${correctCount}/${totalQuestions}`} color="text-green-600" />
          <Stat label="Prozent" value={`${percentage}%`} color="text-blue-600" />
          <Stat label="Fehlerpunkte" value={String(wrongPoints)} color={wrongPoints > 10 ? 'text-red-600' : 'text-green-600'} />
        </div>
      </div>

      {/* Wrong answers */}
      {results.filter((r) => !r.correct).length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Falsch beantwortet:</h3>
          <div className="space-y-3">
            {results
              .filter((r) => !r.correct)
              .map((r) => {
                const q = questions.find((q) => q.id === r.questionId)
                if (!q) return null
                const correct = q.answers.find((a) => a.correct)
                return (
                  <div key={r.questionId} className="bg-red-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-gray-800 mb-1">{q.question}</p>
                    <p className="text-green-700">
                      ✓ {correct?.text}
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Neues Quiz
        </button>
        <Link
          href="/fragen"
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center"
        >
          Alle Fragen lernen
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
