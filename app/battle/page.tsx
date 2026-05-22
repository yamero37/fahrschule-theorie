import Link from 'next/link'

export const metadata = { title: 'Battle – TolDrive' }

export default function BattlePage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.75rem' }}>Battle gegen Freunde</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Dieser Bereich wird bald verfügbar sein.
        </p>
        <Link href="/dashboard" className="btn-ghost" style={{ textAlign: 'center' }}>← Zurück zum Dashboard</Link>
      </div>
    </div>
  )
}
