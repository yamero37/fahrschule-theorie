'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Start', icon: '⌂' },
  { href: '/fragen', label: 'Lernen', icon: '◎' },
  { href: '/quiz', label: 'Quiz', icon: '◆' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="TolDrive Logo"
            width={36}
            height={36}
            className="rounded-full"
            style={{ border: '2px solid var(--green-dark)' }}
          />
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
            TolDrive
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={
                  active
                    ? { background: 'var(--green-glow)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.25)' }
                    : { color: 'var(--text-muted)', border: '1px solid transparent' }
                }
              >
                <span className="text-xs">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

      </div>
    </header>
  )
}
