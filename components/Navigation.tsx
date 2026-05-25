'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DemoCountdown from './DemoCountdown'
import FriendsPanel from './FriendsPanel'
import { supabase } from '@/lib/supabase'
import { getDemoExpiry } from '@/lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [userId, setUserId] = useState('')
  const [friendsOpen, setFriendsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // ALL hooks must be called unconditionally — early return only after this block
  useEffect(() => {
    async function check() {
      const isDemo = getDemoExpiry() !== null
      if (isDemo) { setLoggedIn(true); return }
      const { data } = await supabase.auth.getSession()
      const approved = !!data.session?.user.app_metadata?.approved
      setLoggedIn(approved)
      if (approved) setUserId(data.session!.user.id)
    }
    check()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check())
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFriendsOpen(false)
      }
    }
    if (friendsOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [friendsOpen])

  useEffect(() => { setFriendsOpen(false) }, [pathname])

  // Early return AFTER all hooks
  if (pathname === '/' || pathname === '/login') return null

  return (
    <header style={{
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
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
        position: 'relative',
      }}>

        {/* Logo */}
        <Link href={loggedIn ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.jpeg" alt="TolDrive" style={{
            width: '32px', height: '32px',
            objectFit: 'cover', borderRadius: '8px',
            border: '1.5px solid rgba(var(--gold-rgb),0.45)',
            boxShadow: '0 0 10px rgba(var(--gold-rgb),0.15)',
          }} />
          <span className="nav-title" style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.01em' }}>
            <span style={{ color: 'var(--text-h)' }}>Tol</span><span style={{
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Drive</span>
          </span>
        </Link>

        {/* Centered Dashboard link */}
        {loggedIn && (
          <Link href="/dashboard" style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            padding: '6px 20px', borderRadius: '8px',
            fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
            transition: 'all 0.15s',
            ...(pathname === '/dashboard'
              ? { background: 'rgba(var(--gold-rgb),0.12)', color: 'var(--gold)', border: '1px solid rgba(var(--gold-rgb),0.3)' }
              : { color: 'var(--text-muted)', border: '1px solid transparent' }
            ),
          }}>
            Dashboard
          </Link>
        )}

        {/* Right: demo countdown + friends icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DemoCountdown />

          {loggedIn && (
            <div style={{ position: 'relative' }} ref={wrapperRef}>
              <button
                onClick={() => setFriendsOpen(v => !v)}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: friendsOpen ? 'rgba(var(--gold-rgb),0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${friendsOpen ? 'rgba(var(--gold-rgb),0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: friendsOpen ? 'var(--gold)' : 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="Freunde & Community"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>

              {friendsOpen && (
                <FriendsPanel userId={userId} onClose={() => setFriendsOpen(false)} />
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
