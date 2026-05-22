'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DemoCountdown from './DemoCountdown'

const links = [
  { href: '/', label: 'Start' },
  { href: '/fragen', label: 'Lernen' },
  { href: '/quiz', label: 'Quiz' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header
      style={{
        background: 'rgba(8,8,8,0.92)',
        borderBottom: '1px solid rgba(201,162,39,0.2)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Toldrive.jpeg"
            alt="TolDrive"
            style={{
              width: '34px',
              height: '34px',
              objectFit: 'cover',
              borderRadius: '7px',
              border: '1px solid rgba(201,162,39,0.35)',
            }}
          />
          <span
            className="font-black text-lg tracking-tight"
            style={{
              background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TolDrive
          </span>
        </Link>

        {/* Right side: nav + demo countdown */}
        <div className="flex items-center gap-3">

          <DemoCountdown />

          <nav className="flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={
                    active
                      ? { background: 'rgba(201,162,39,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.3)' }
                      : { color: 'var(--text-muted)', border: '1px solid transparent' }
                  }
                >
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
