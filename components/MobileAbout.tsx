export default function MobileAbout() {
  return (
    <section className="mobile-about" style={{
      background: 'var(--bg)',
      padding: '3rem 1.5rem 4rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
      borderTop: '1px solid rgba(var(--gold-rgb),0.15)',
    }}>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '320px' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
        <span style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>◆</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
      </div>

      {/* Avatar */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/avatar.jpeg" alt="Tolga" style={{
        width: '110px', height: '110px',
        objectFit: 'cover', objectPosition: 'center top',
        borderRadius: '50%',
        border: '2px solid rgba(var(--gold-rgb),0.7)',
        boxShadow: '0 0 20px rgba(var(--gold-rgb),0.35), 0 0 40px rgba(var(--gold-rgb),0.12)',
        background: '#fff',
      }} />

      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/Toldrive.jpeg" alt="TolDrive" style={{
        width: '80px', height: '80px',
        objectFit: 'cover',
        borderRadius: '12px',
        border: '1px solid rgba(var(--gold-rgb),0.4)',
        boxShadow: '0 0 14px rgba(var(--gold-rgb),0.2)',
      }} />

      <span style={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'rgba(var(--gold-rgb),0.8)',
        textAlign: 'center',
      }}>
        Dein Fahrlehrer
      </span>

      {/* Text */}
      <p style={{
        fontSize: '0.88rem',
        color: 'rgba(245,234,208,0.65)',
        lineHeight: 1.75,
        textAlign: 'center',
        maxWidth: '340px',
        margin: 0,
      }}>
        Hey, ich bin Tolga, 28 Jahre alt und seit über 6 Jahren leidenschaftlicher Fahrlehrer.
        <br /><br />
        Mit dieser Seite möchte ich Menschen wie dir helfen, motivieren und auf dem Weg zum Führerschein unterstützen.
        <br /><br />
        Ich weiß aus eigener Erfahrung, dass die Theorie manchmal anstrengend und langweilig wirken kann – genau deshalb habe ich diese Plattform erstellt. Mein Ziel ist es, dir die Theorie einfacher, verständlicher und motivierender zu machen, damit du dranbleibst und deine Prüfung erfolgreich bestehst.
        <br /><br />
        Egal ob Lernvideos, Tipps oder Theoriefragen – hier findest du alles, was dir hilft, Schritt für Schritt deinem Führerschein näherzukommen. 🚗
      </p>

      {/* Social Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <a
          href="https://www.instagram.com/tolga_ar/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.85rem', fontWeight: 700,
            color: 'var(--gold)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            textShadow: '0 0 10px rgba(var(--gold-rgb),0.6), 0 0 20px rgba(var(--gold-rgb),0.3)',
            padding: '0.6rem 1.4rem',
            border: '1px solid rgba(var(--gold-rgb),0.3)',
            borderRadius: '2rem',
            background: 'rgba(var(--gold-rgb),0.05)',
          }}
        >
          📷 @tolga_ar
        </a>
        <a
          href="https://www.tiktok.com/@fahrlehrertolga"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.85rem', fontWeight: 700,
            color: 'var(--gold)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            textShadow: '0 0 10px rgba(var(--gold-rgb),0.6), 0 0 20px rgba(var(--gold-rgb),0.3)',
            padding: '0.6rem 1.4rem',
            border: '1px solid rgba(var(--gold-rgb),0.3)',
            borderRadius: '2rem',
            background: 'rgba(var(--gold-rgb),0.05)',
          }}
        >
          🎵 @fahrlehrertolga
        </a>
      </div>

    </section>
  )
}
