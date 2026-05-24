import Leaderboard from '@/components/Leaderboard'

export default function RanglistePage() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Online Rangsystem
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            ðŸ† Rangliste
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Wer hat die meisten Punkte gesammelt?
          </p>
        </div>

        <Leaderboard />
      </div>
    </div>
  )
}

