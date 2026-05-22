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
          <span
            className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black"
            style={{ background: 'linear-gradient(135deg, var(--green-dark), var(--green))', color: '#000' }}
          >
            T
          </span>
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
