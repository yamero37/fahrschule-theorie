'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthorized } from '@/lib/auth'

export default function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    isAuthorized().then(ok => {
      if (ok) router.replace('/dashboard')
    })
  }, [router])

  return null
}
