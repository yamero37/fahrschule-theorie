'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LayoutPage() {
  const router = useRouter()

  // Theme switching has been removed — only one theme exists now.
  // Redirect back to settings.
  useEffect(() => {
    router.replace('/einstellungen')
  }, [router])

  return null
}
