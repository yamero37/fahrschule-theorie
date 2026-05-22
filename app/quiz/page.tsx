import { questions } from '@/data/questions'
import QuizClient from '@/components/QuizClient'

export const metadata = { title: 'Quiz – Fahrschule Theorie' }

export default function QuizPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quiz-Modus</h1>
      <QuizClient questions={questions} />
    </div>
  )
}
