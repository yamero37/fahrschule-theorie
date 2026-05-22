import { questions } from '@/data/questions'
import QuizClient from '@/components/QuizClient'

export const metadata = { title: 'Quiz – TolDrive' }

export default function QuizPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Quiz-Modus</h1>
      <QuizClient questions={questions} />
    </div>
  )
}
