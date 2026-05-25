import Link from 'next/link'

export default function ImpressumPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <Link href="/dashboard" style={{
        color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem',
        display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '2rem',
        opacity: 0.8,
      }}>
        ← Zurück
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-h)' }}>
        Impressum
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
        Angaben gemäß § 5 TMG
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          Verantwortlicher
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))' }}>
          <strong style={{ color: 'var(--text-h)' }}>Tolga Arslan</strong><br />
          Asternweg 10a<br />
          28844 Weyhe<br />
          Deutschland
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          Kontakt
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))' }}>
          E-Mail:{' '}
          <a href="mailto:fahrlehrertolga@gmail.com" style={{ color: 'var(--gold)' }}>
            fahrlehrertolga@gmail.com
          </a>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))' }}>
          Tolga Arslan<br />
          Asternweg 10a<br />
          28844 Weyhe
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          Haftungsausschluss
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          <strong style={{ color: 'var(--text-h)' }}>Haftung für Inhalte:</strong><br />
          Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt.
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir keine Gewähr.
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich.<br /><br />

          <strong style={{ color: 'var(--text-h)' }}>Haftung für Links:</strong><br />
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          Urheberrecht
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </div>
      </section>
    </div>
  )
}
