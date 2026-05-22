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
          minHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '5rem 1.5rem 4rem',
          position: 'relative',
          overflow: 'hidden',
          background: [
            'radial-gradient(ellipse 55% 55% at 50% 38%, rgba(201,162,39,0.1) 0%, transparent 60%)',
            'radial-gradient(ellipse 35% 30% at 50% 105%, rgba(201,162,39,0.07) 0%, transparent 55%)',
            '#080808',
          ].join(', '),
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: [
              'linear-gradient(rgba(201,162,39,0.025) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(201,162,39,0.025) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '100px 100px',
            pointerEvents: 'none',
          }}
        />

        {/* Bottom horizon line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.4) 30%, rgba(232,197,71,0.7) 50%, rgba(201,162,39,0.4) 70%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', maxWidth: '680px', width: '100%' }}>

          {/* Logo */}
          <div className="anim-1" style={{ marginBottom: '2rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Toldrive.jpeg"
              alt="TolDrive Logo"
              className="hero-logo"
              style={{
                width: 'clamp(200px, 35vw, 300px)',
                height: 'auto',
                margin: '0 auto',
                display: 'block',
                borderRadius: '12px',
              }}
            />
          </div>

          {/* Gold divider */}
          <div className="anim-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1.75rem' }}>
            <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.6rem', letterSpacing: '0.15em' }}>◆</span>
            <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
          </div>

          {/* Headline */}
          <h1
            className="anim-3 gold-shimmer"
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Bestehe deine Theorieprüfung beim ersten Versuch.
          </h1>

          {/* Tagline */}
          <p
            className="anim-4"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '0.75rem',
              opacity: 0.85,
            }}
          >
            Sicher. Kompetent. Vertrauen.
          </p>

          {/* Stats line */}
          <p
            className="anim-5"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '2.5rem',
            }}
          >
            {totalQuestions} Lernfragen &nbsp;·&nbsp; {topics.length} Themengebiete &nbsp;·&nbsp; Keine Anmeldung
          </p>

          {/* CTA Buttons */}
          <div
            className="anim-6"
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/fragen" className="btn-gold">
              Jetzt lernen →
            </Link>
            <Link href="/quiz" className="btn-ghost">
              Kostenlos starten
            </Link>
          </div>
        </div>
      </section>

      {/* ── Below-fold ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: String(totalQuestions), label: 'Lernfragen' },
              { value: String(topics.length),  label: 'Themengebiete' },
              { value: '10',                   label: 'Max. Fehlerpunkte' },
              { value: '30',                   label: 'Fragen im Test' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-xl p-5 flex flex-col items-center text-center"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <span className="text-3xl font-extrabold mb-1" style={{ color: 'var(--gold)' }}>
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
            <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }} />
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
                    border: '1px solid rgba(201,162,39,0.25)',
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
            style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}
          >
            <div>
              <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--gold)' }}>◆ Prüfungsformat</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--gold)' }}>·</span> 30 Fragen pro Prüfung</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--gold)' }}>·</span> Maximal 10 Fehlerpunkte erlaubt</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--gold)' }}>·</span> Fragen haben 2–5 Fehlerpunkte</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--gold)' }}>◆ So lernst du am besten</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--gold)' }}>·</span> Gehe alle Themen systematisch durch</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--gold)' }}>·</span> Markiere gelernte Fragen als erledigt</li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--gold)' }}>·</span> Teste dich täglich im Quiz-Modus</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
