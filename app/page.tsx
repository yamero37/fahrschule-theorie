import Link from 'next/link'
import { questions, getTopicStats } from '@/data/questions'

export const metadata = { title: 'TolDrive – Führerschein Theorie' }

export default function HomePage() {
  const stats = getTopicStats()
  const totalQuestions = questions.length
  const topics = Object.entries(stats).sort((a, b) => b[1] - a[1])

  return (
    <div>

      {/* ── Cinematic Hero ─────────────────────────────────────── */}
      <section
        style={{
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '5rem 1.5rem 5rem',
          position: 'relative',
          overflow: 'hidden',
          background: [
            'radial-gradient(ellipse 160% 45% at 50% 108%, rgba(255,120,0,0.22) 0%, rgba(210,80,0,0.07) 38%, transparent 58%)',
            'radial-gradient(ellipse 45% 55% at 6% 100%, rgba(34,197,94,0.18) 0%, transparent 45%)',
            'radial-gradient(ellipse 35% 40% at 94% 96%, rgba(240,180,41,0.1) 0%, transparent 42%)',
            'linear-gradient(180deg, #000000 0%, #010902 65%, #000000 100%)',
          ].join(', '),
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: [
              'linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '90px 90px',
            pointerEvents: 'none',
          }}
        />

        {/* Horizon glow line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.35) 25%, rgba(255,160,40,0.5) 50%, rgba(34,197,94,0.35) 75%, transparent 100%)',
          }}
        />

        <div style={{ position: 'relative', maxWidth: '720px', width: '100%' }}>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '1.75rem',
            }}
          >
            Klasse B · Theorieprüfung · Deutschland
          </p>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5.5vw, 3.6rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              color: '#edf7ee',
              marginBottom: '1.5rem',
              letterSpacing: '-0.025em',
            }}
          >
            Bestehe deine Theorieprüfung{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, var(--green) 0%, var(--gold) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              beim ersten Versuch.
            </span>
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: 'rgba(106,171,121,0.75)',
              marginBottom: '2.75rem',
              lineHeight: 1.6,
            }}
          >
            {totalQuestions} Lernfragen &middot; {topics.length} Themengebiete &middot; Keine Anmeldung nötig
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/fragen"
              className="hero-btn-primary"
              style={{
                padding: '0.9rem 2.2rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                background: 'linear-gradient(135deg, #16a34a 0%, #0e6b30 100%)',
                color: '#fff',
                border: '1px solid rgba(34,197,94,0.55)',
                boxShadow: '0 0 32px rgba(34,197,94,0.28), 0 4px 20px rgba(0,0,0,0.5)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Jetzt lernen →
            </Link>
            <Link
              href="/quiz"
              style={{
                padding: '0.9rem 2.2rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                background: 'rgba(255,255,255,0.04)',
                color: '#ddeedd',
                border: '1px solid rgba(232,245,233,0.18)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                textDecoration: 'none',
                display: 'inline-block',
                backdropFilter: 'blur(4px)',
              }}
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats + Topics + Info ──────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: String(totalQuestions), label: 'Lernfragen', accent: 'green' },
              { value: String(topics.length), label: 'Themengebiete', accent: 'gold' },
              { value: '10', label: 'Max. Fehlerpunkte', accent: 'green' },
              { value: '30', label: 'Fragen im Test', accent: 'gold' },
            ].map(({ value, label, accent }) => (
              <div
                key={label}
                className="rounded-xl p-5 flex flex-col items-center text-center"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${accent === 'gold' ? 'rgba(240,180,41,0.15)' : 'rgba(34,197,94,0.15)'}`,
                }}
              >
                <span
                  className="text-3xl font-extrabold mb-1"
                  style={{ color: accent === 'gold' ? 'var(--gold)' : 'var(--green)' }}
                >
                  {value}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Topics */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              Themengebiete
            </h2>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map(([topic, count]) => (
              <Link
                key={topic}
                href={`/fragen?topic=${encodeURIComponent(topic)}`}
                className="topic-card rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{topic}</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full ml-3 shrink-0"
                  style={{
                    background: 'var(--gold-glow)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(240,180,41,0.2)',
                  }}
                >
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Prüfungsinfo */}
        <section>
          <div
            className="rounded-xl p-6 grid sm:grid-cols-2 gap-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div>
              <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--gold)' }}>
                ✦ Prüfungsformat
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--green)' }}>·</span> 30 Fragen pro Prüfung</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--green)' }}>·</span> Maximal 10 Fehlerpunkte erlaubt</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--green)' }}>·</span> Fragen haben 2–5 Fehlerpunkte</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--gold)' }}>
                ✦ So lernst du am besten
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--green)' }}>·</span> Gehe alle Themen systematisch durch</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--green)' }}>·</span> Markiere gelernte Fragen als erledigt</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--green)' }}>·</span> Teste dich täglich im Quiz-Modus</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
