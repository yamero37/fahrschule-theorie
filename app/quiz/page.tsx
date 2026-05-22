import { questions } from '@/data/questions'
import QuizClient from '@/components/QuizClient'
import AuthGuard from '@/components/AuthGuard'

export const metadata = { title: 'Quiz – TolDrive' }

export default function QuizPage() {
  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Quiz-Modus</h1>
        <QuizClient questions={questions} />
      </div>
    </AuthGuard>
  )
}
