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
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg tracking-tight">
          🚗 Fahrschule Theorie
        </Link>
        <div className="flex gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-white text-blue-800'
                  : 'hover:bg-blue-700'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
