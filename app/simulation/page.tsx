import AuthGuard from '@/components/AuthGuard'
import SimulationClient from '@/components/SimulationClient'
import { questions } from '@/data/questions'

export const metadata = { title: 'Prüfungssimulation – TolDrive' }

export default function SimulationPage() {
  return (
    <AuthGuard>
      <SimulationClient questions={questions} />
    </AuthGuard>
  )
}
