import Link from 'next/link'

export default function DatenschutzPage() {
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
        Datenschutzerklärung
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
        Gemäß DSGVO (EU) 2016/679
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          1. Verantwortlicher
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))' }}>
          Tolga Arslan<br />
          Asternweg 10a, 28844 Weyhe<br />
          E-Mail:{' '}
          <a href="mailto:fahrlehrertolga@gmail.com" style={{ color: 'var(--gold)' }}>
            fahrlehrertolga@gmail.com
          </a>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          2. Welche Daten wir erheben
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong style={{ color: 'var(--text-h)' }}>Registrierungsdaten:</strong> E-Mail-Adresse und Passwort (verschlüsselt gespeichert)</li>
            <li><strong style={{ color: 'var(--text-h)' }}>Lernfortschritt:</strong> Anzahl beantworteter Fragen, Quizergebnisse, Punkte</li>
            <li><strong style={{ color: 'var(--text-h)' }}>Chat-Nachrichten:</strong> Textnachrichten im Live-Chat (öffentlich für alle Nutzer)</li>
            <li><strong style={{ color: 'var(--text-h)' }}>Zahlungsdaten:</strong> Werden ausschließlich von Stripe verarbeitet — wir speichern keine Kreditkartendaten</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          3. Zweck der Datenverarbeitung
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Wir verarbeiten deine Daten ausschließlich zur Bereitstellung des Dienstes TolDrive
          (Lernplattform für die Führerschein-Theorieprüfung), zur Abwicklung von Zahlungen
          sowie zur Kommunikation mit dir bei Supportanfragen.
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          4. Auftragsverarbeiter (Drittanbieter)
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          <p style={{ marginBottom: '0.75rem' }}>Wir nutzen folgende externe Dienste:</p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <strong style={{ color: 'var(--text-h)' }}>Supabase (Supabase Inc., USA)</strong><br />
              Datenbank und Authentifizierung. Datenschutzerklärung:{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
                supabase.com/privacy
              </a>
            </li>
            <li>
              <strong style={{ color: 'var(--text-h)' }}>Stripe (Stripe, Inc., USA)</strong><br />
              Zahlungsabwicklung. Datenschutzerklärung:{' '}
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
                stripe.com/de/privacy
              </a>
            </li>
            <li>
              <strong style={{ color: 'var(--text-h)' }}>Vercel (Vercel Inc., USA)</strong><br />
              Hosting und Bereitstellung der Website. Datenschutzerklärung:{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
                vercel.com/legal/privacy-policy
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          5. Deine Rechte (DSGVO)
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Du hast das Recht auf:
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Für Anfragen wende dich an:{' '}
            <a href="mailto:fahrlehrertolga@gmail.com" style={{ color: 'var(--gold)' }}>
              fahrlehrertolga@gmail.com
            </a>
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          6. Cookies & lokaler Speicher
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Wir verwenden <strong style={{ color: 'var(--text-h)' }}>keine Tracking-Cookies</strong>.
          Wir nutzen ausschließlich technisch notwendigen lokalen Speicher (localStorage) deines Browsers
          für Einstellungen wie Theme-Präferenzen und Lernfortschritt. Diese Daten verlassen nicht deinen Browser.
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-h)' }}>
          7. Beschwerderecht
        </h2>
        <div style={{ lineHeight: '1.8', color: 'var(--text-body, var(--text-muted))', fontSize: '0.9rem' }}>
          Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
          Die zuständige Behörde für Niedersachsen ist der{' '}
          <a href="https://www.lfd.niedersachsen.de" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>
            Landesbeauftragte für den Datenschutz Niedersachsen
          </a>.
        </div>
      </section>

      <p style={{ marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Stand: Mai 2026
      </p>
    </div>
  )
}
