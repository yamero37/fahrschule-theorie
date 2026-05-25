import { questions } from '@/data/questions'
import FragenClient from '@/components/FragenClient'
import AuthGuard from '@/components/AuthGuard'

export const metadata = { title: 'Theoriefragen – TolDrive' }

export default function FragenPage() {
  return (
    <AuthGuard>
      <FragenClient questions={questions} />
    </AuthGuard>
  )
}
