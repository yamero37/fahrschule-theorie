import Link from 'next/link'
import { questions, getTopicStats } from '@/data/questions'

export const metadata = { title: 'TolDrive – Führerschein Theorie' }

export default function HomePage() {
  const stats = getTopicStats()
  const totalQuestions = questions.length
  const topics = Object.entries(stats).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-12">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-6">
        <div
          className="rounded-2xl p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #071209 0%, #0c2010 60%, #0a1a0c 100%)',
            border: '1px solid var(--border-light)',
          }}
        >
          {/* Subtle glow orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '240px', height: '240px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(240,180,41,0.07) 0%, transparent 70%)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-40px', left: '10%',
              width: '180px', height: '180px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
            }} />
          </div>

          <div className="relative max-w-xl">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--gold)' }}>
              Führerschein Klasse B · Deutschland
            </p>
            <h1 className="text-4xl font-extrabold leading-tight mb-4" style={{ color: 'var(--text)' }}>
              Bereit für die{' '}
              <span style={{
                background: 'linear-gradient(90deg, var(--green) 0%, var(--gold) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Theorieprüfung?
              </span>
            </h1>
            <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Lerne alle Fragen in deinem Tempo, teste dich im Quiz-Modus und behalte deinen Fortschritt im Blick.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/fragen"
                className="px-7 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, var(--green-dark), #0f5c2a)',
                  color: '#fff',
                  border: '1px solid var(--green)',
                  boxShadow: '0 4px 24px var(--green-glow)',
                }}
              >
                Jetzt lernen →
              </Link>
              <Link
                href="/quiz"
                className="px-7 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #2a1e00, #3d2c00)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(240,180,41,0.35)',
                  boxShadow: '0 4px 24px var(--gold-glow)',
                }}
              >
                ✦ Quiz starten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
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

      {/* ── Topics ───────────────────────────────────────────── */}
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
              className="topic-card rounded-xl px-5 py-4 flex items-center justify-between group"
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

      {/* ── Prüfungsinfo ─────────────────────────────────────── */}
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
  )
}
