'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DemoCountdown from './DemoCountdown'
import { supabase } from '@/lib/supabase'
import { getDemoExpiry } from '@/lib/auth'

const GUEST_LINKS = [
  { href: '/', label: 'Start' },
]

const AUTH_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/unterricht', label: 'Unterricht' },
  { href: '/fragen', label: 'Lernen' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/rangliste', label: 'Rangliste' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function check() {
      const isDemo = getDemoExpiry() !== null
      if (isDemo) { setLoggedIn(true); return }
      const { data } = await supabase.auth.getSession()
      setLoggedIn(!!data.session?.user.app_metadata?.approved)
    }
    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check())
    return () => subscription.unsubscribe()
  }, [])

  const links = loggedIn ? AUTH_LINKS : [...GUEST_LINKS, ...AUTH_LINKS]

  return (
    <header style={{
      background: 'rgba(8,8,8,0.92)',
      borderBottom: '1px solid rgba(201,162,39,0.2)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>

        {/* Logo */}
        <Link href={loggedIn ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Toldrive.jpeg" alt="TolDrive" style={{
            width: '30px', height: '30px',
            objectFit: 'cover', borderRadius: '6px',
            border: '1px solid rgba(201,162,39,0.35)',
          }} />
          <span className="nav-title" style={{
            fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.01em',
            background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            TolDrive
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DemoCountdown />

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {links.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  ...(active
                    ? { background: 'rgba(201,162,39,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.3)' }
                    : { color: 'var(--text-muted)', border: '1px solid transparent' }
                  ),
                }}>
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

      </div>
    </header>
  )
}
