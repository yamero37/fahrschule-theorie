import Link from 'next/link'

export default function AgbPage() {
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
        Allgemeine Geschäftsbedingungen (AGB)
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
        TolDrive · Tolga Arslan · Stand: Mai 2026
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          § 1 Geltungsbereich
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Käufe und die Nutzung der
          Lernplattform TolDrive (nachfolgend „Dienst"), betrieben von Tolga Arslan,
          Asternweg 10a, 28844 Weyhe (nachfolgend „Anbieter").
          Mit dem Kauf eines Premium-Zugangs erklärt sich der Nutzer mit diesen AGB einverstanden.
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          § 2 Leistungsbeschreibung
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          TolDrive ist eine digitale Lernplattform zur Vorbereitung auf die
          Führerschein-Theorieprüfung Klasse B. Der Anbieter bietet einen kostenpflichtigen
          <strong style={{ color: 'var(--text-h)' }}> Premium-Zugang</strong> an, der folgende
          Funktionen freischaltet:
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Zugang zu allen Theoriefragen (700 Fragen)</li>
            <li>Lernstatistiken und Fortschrittsverfolgung</li>
            <li>Prüfungssimulation im Echtmodus</li>
            <li>Alle weiteren Premium-Features der Plattform</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          § 3 Preise und Zahlung
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          <p>
            Der Premium-Zugang ist eine <strong style={{ color: 'var(--text-h)' }}>einmalige Zahlung</strong> ohne
            wiederkehrende Kosten. Der aktuelle Preis wird vor dem Kauf angezeigt.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Die Zahlung erfolgt über den Zahlungsdienstleister <strong style={{ color: 'var(--text-h)' }}>Stripe</strong>.
            Es werden Kreditkarte, PayPal und SEPA-Lastschrift akzeptiert.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Gemäß <strong style={{ color: 'var(--text-h)' }}>§ 19 UStG</strong> (Kleinunternehmerregelung) wird
            keine Umsatzsteuer berechnet. Es wird keine Mehrwertsteuer ausgewiesen.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f87171' }}>
          § 4 Widerrufsrecht — Ausschluss bei digitalen Inhalten ⚠️
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          <p>
            Der Nutzer hat grundsätzlich ein <strong style={{ color: 'var(--text-h)' }}>14-tägiges Widerrufsrecht</strong>.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            <strong style={{ color: '#f87171' }}>Das Widerrufsrecht erlischt jedoch vorzeitig</strong>, wenn
            der Anbieter mit der Ausführung des Vertrags begonnen hat und der Nutzer ausdrücklich
            zugestimmt hat, dass der Anbieter vor Ablauf der Widerrufsfrist mit der Ausführung beginnt,
            und bestätigt hat, dass er sein Widerrufsrecht mit Beginn der Ausführung verliert.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Mit dem Kauf des Premium-Zugangs und der entsprechenden Zustimmung beim Checkout erklärt
            der Nutzer ausdrücklich, dass er damit einverstanden ist, dass der Premium-Zugang sofort
            freigeschaltet wird, und bestätigt, dass er sein Widerrufsrecht damit verliert.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Rechtsgrundlage: <strong style={{ color: 'var(--text-h)' }}>§ 356 Abs. 5 BGB</strong> i.V.m.
            Art. 16 lit. m) der Verbraucherrechte-Richtlinie 2011/83/EU.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          § 5 Vertragslaufzeit und Kündigung
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Der Premium-Zugang ist ein einmaliger Kauf ohne Abonnement oder automatische Verlängerung.
          Der Zugang gilt dauerhaft für das erworbene Nutzerkonto, solange der Dienst TolDrive
          betrieben wird. Der Anbieter behält sich vor, den Dienst mit einer angemessenen
          Vorankündigungsfrist von mindestens 30 Tagen einzustellen.
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          § 6 Haftungsbeschränkung
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          TolDrive ist eine Lernhilfe und ersetzt keine offizielle Fahrschulausbildung.
          Der Anbieter übernimmt keine Garantie für das Bestehen der Führerscheinprüfung.
          Für die Aktualität und Vollständigkeit der Lerninhalte wird keine Haftung übernommen,
          soweit keine grobe Fahrlässigkeit oder Vorsatz vorliegt.
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          § 7 Nutzungsrechte
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Mit dem Kauf erhält der Nutzer ein nicht übertragbares, persönliches Nutzungsrecht
          für seinen Account. Die Weitergabe von Zugangsdaten oder die gewerbliche
          Weiterverwendung der Inhalte ist nicht gestattet.
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          § 8 Anwendbares Recht und Gerichtsstand
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für alle Streitigkeiten
          ist Weyhe, soweit der Nutzer Kaufmann ist oder keinen allgemeinen Gerichtsstand in
          Deutschland hat.
        </div>
      </section>

      <p style={{ marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Stand: Mai 2026 · Tolga Arslan, Weyhe
      </p>
    </div>
  )
}
