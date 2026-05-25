import AuthGuard from '@/components/AuthGuard'
import SimulationClient from '@/components/SimulationClient'

export const metadata = { title: 'Fahrprüfungs-Simulation – TolDrive' }

export default function SimulationPage() {
  return (
    <AuthGuard>
      <SimulationClient />
    </AuthGuard>
  )
}
