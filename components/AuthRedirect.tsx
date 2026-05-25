'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthorized } from '@/lib/auth'

export default function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Kleines Delay: verhindert dass direkt nach Logout wieder redirected wird,
    // während der Supabase-Client die Session noch im Speicher hält.
    const t = setTimeout(() => {
      isAuthorized().then(ok => {
        if (ok) router.replace('/dashboard')
      })
    }, 150)
    return () => clearTimeout(t)
  }, [router])

  return null
}
