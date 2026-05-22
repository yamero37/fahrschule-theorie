'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Start' },
  { href: '/fragen', label: 'Alle Fragen' },
  { href: '/quiz', label: 'Quiz' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background: 'linear-gradient(90deg, #060e07 0%, #0a1a0c 50%, #060e07 100%)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="text-xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, var(--green) 0%, var(--gold) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🚗 Fahrschule Theorie
          </span>
        </Link>

        {/* Links */}
        <div className="flex gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, var(--green-dark) 0%, #0f5c2a 100%)',
                        color: '#fff',
                        border: '1px solid var(--green)',
                        boxShadow: '0 0 12px var(--green-glow)',
                      }
                    : {
                        color: 'var(--text-muted)',
                        border: '1px solid transparent',
                      }
                }
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:text-white"
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--surface-2)'
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
