import { questions } from '@/data/questions'
import FragenClient from '@/components/FragenClient'

export const metadata = { title: 'Alle Fragen – Fahrschule Theorie' }

export default function FragenPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Alle Fragen</h1>
      <FragenClient questions={questions} />
    </div>
  )
}
