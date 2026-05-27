import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TolDrive – Führerschein Theorie',
    short_name: 'TolDrive',
    description: 'Alle Theoriefragen für die Führerscheinprüfung Klasse B',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f0eff7',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      {
        src: '/avatar.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/avatar.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
      {
        src: '/avatar.jpeg',
        sizes: 'any',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  }
}
