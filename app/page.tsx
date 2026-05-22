import Link from 'next/link'
import { questions, getTopicStats } from '@/data/questions'

export default function HomePage() {
  const stats = getTopicStats()
  const totalQuestions = questions.length
  const topics = Object.entries(stats).sort((a, b) => b[1] - a[1])

  return (
    <div>
      {/* Hero */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #071209 0%, #0a1f10 40%, #0d2a14 100%)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 0 40px rgba(34,197,94,0.08)',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(240,180,41,0.06) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        <div className="relative">
          <div
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-widest uppercase"
            style={{
              background: 'var(--gold-glow)',
              color: 'var(--gold)',
              border: '1px solid rgba(240,180,41,0.3)',
            }}
          >
            Klasse B · Deutschland
          </div>
          <h1
            className="text-4xl font-bold mb-3 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, var(--text) 0%, var(--green) 60%, var(--gold) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Führerschein Theorie
          </h1>
          <p className="mb-7 text-base max-w-lg" style={{ color: 'var(--text-muted)' }}>
            Lerne alle Prüfungsfragen für Klasse B – mit Quiz-Modus und persönlichem Fortschrittstracking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/fragen"
              style={{
                background: 'linear-gradient(135deg, var(--green-dark) 0%, #0f5c2a 100%)',
                color: '#fff',
                border: '1px solid var(--green)',
                boxShadow: '0 0 20px var(--green-glow)',
              }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
            >
              Alle Fragen lernen →
            </Link>
            <Link
              href="/quiz"
              style={{
                background: 'linear-gradient(135deg, #3d2800 0%, #4a3200 100%)',
                color: 'var(--gold)',
                border: '1px solid rgba(240,180,41,0.4)',
                boxShadow: '0 0 20px var(--gold-glow)',
              }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
            >
              ✦ Quiz starten
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Fragen gesamt" value={String(totalQuestions)} icon="📋" gold />
        <StatCard label="Themengebiete" value={String(topics.length)} icon="📚" />
        <StatCard label="Max. Fehlerpunkte" value="10" icon="⚠️" />
        <StatCard label="Fragen im Test" value="30" icon="✍️" gold />
      </div>

      {/* Topics */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-muted)' }}>
          THEMENGEBIETE
        </h2>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {topics.map(([topic, count]) => (
          <Link
            key={topic}
            href={`/fragen?topic=${encodeURIComponent(topic)}`}
            className="topic-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                {topic}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--gold-glow)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(240,180,41,0.2)',
                }}
              >
                {count}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Info box */}
      <div
        className="mt-8 rounded-xl p-5"
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(240,180,41,0.2)',
          boxShadow: '0 0 20px rgba(240,180,41,0.04)',
        }}
      >
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
          <span>✦</span> Prüfungsformat
        </h3>
        <ul className="text-sm space-y-1.5" style={{ color: 'var(--text-muted)' }}>
          <li>· Prüfung besteht aus 30 Fragen (Grundstoff + Zusatzstoff)</li>
          <li>· Maximal 10 Fehlerpunkte erlaubt</li>
          <li>· Fragen mit 2–5 Fehlerpunkten gewichtet</li>
          <li>· Eine Frage mit 5 Fehlerpunkten direkt falsch → sofort nicht bestanden</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  gold,
}: {
  label: string
  value: string
  icon: string
  gold?: boolean
}) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${gold ? 'rgba(240,180,41,0.25)' : 'var(--border)'}`,
        boxShadow: gold ? '0 0 16px rgba(240,180,41,0.06)' : 'none',
      }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div
        className="text-2xl font-bold"
        style={{ color: gold ? 'var(--gold)' : 'var(--green)' }}
      >
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
    </div>
  )
}
