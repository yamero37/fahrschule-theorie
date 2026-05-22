import { questions } from '@/data/questions'
import FragenClient from '@/components/FragenClient'

export const metadata = { title: 'Lernen – TolDrive' }

export default function FragenPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Alle Fragen</h1>
      <FragenClient questions={questions} />
    </div>
  )
}
