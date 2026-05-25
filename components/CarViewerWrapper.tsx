'use client'

import dynamic from 'next/dynamic'

const CarViewer = dynamic(() => import('./CarViewer'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '520px',
      borderRadius: '1.25rem',
      background: 'linear-gradient(160deg, #05050e 0%, #0b0b1d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '0.75rem',
      color: 'rgba(255,255,255,0.35)',
      fontSize: '0.85rem',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.08)',
        borderTop: '3px solid rgba(255,255,255,0.45)',
        animation: 'spin 0.9s linear infinite',
      }} />
      3D-Modell wird geladen…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
})

export default function CarViewerWrapper() {
  return <CarViewer />
}
