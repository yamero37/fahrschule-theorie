import LoginForm from '@/components/LoginForm'
import AuthRedirect from '@/components/AuthRedirect'

export const metadata = { title: 'TolDrive – Anmelden' }

export default function HomePage() {
  return (
    <>
      <AuthRedirect />
      <LoginForm />
    </>
  )
}
