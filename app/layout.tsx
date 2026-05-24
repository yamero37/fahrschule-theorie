import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import ShootingStars from '@/components/ShootingStars'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'TolDrive – Führerschein Theorie',
  description: 'Alle Theoriefragen für die Führerscheinprüfung Klasse B – Lernen und Quiz-Modus',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable}>
      <head>
        {/* Apply saved theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('toldrive_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();` }} />
      </head>
      <body>
        <ShootingStars />
        <Navigation />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
