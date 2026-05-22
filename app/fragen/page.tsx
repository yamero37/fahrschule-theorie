import { questions } from '@/data/questions'
import FragenClient from '@/components/FragenClient'
import AuthGuard from '@/components/AuthGuard'

export const metadata = { title: 'Lernen – TolDrive' }

export default function FragenPage() {
  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Alle Fragen</h1>
        <FragenClient questions={questions} />
      </div>
    </AuthGuard>
  )
}
