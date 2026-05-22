import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Fahrschule Theorie – Lernplattform',
  description: 'Alle Theoriefragen für die Führerscheinprüfung (Klasse B) – Lernen und Quiz-Modus',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Navigation />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
