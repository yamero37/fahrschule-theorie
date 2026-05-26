'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'spieletolga@gmail.com'

type Appointment = {
  id: string
  student_id: string
  student_name: string
  date: string
  start_time: string
  duration_min: number
  status: string
  note?: string
  created_at: string
}

function pad(n: number) { return n.toString().padStart(2, '0') }
function minsToTime(m: number) { return `${pad(Math.floor(m / 60))}:${pad(m % 60)}` }

function StatusBadge({ s }: { s: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string; border: string }> = {
    pending:  { label: 'Ausstehend', bg: 'rgba(var(--gold-rgb),0.1)', color: 'var(--gold)',   border: 'rgba(var(--gold-rgb),0.3)' },
    accepted: { label: 'BestÃ¤tigt',  bg: 'rgba(34,197,94,0.08)', color: '#22c55e',       border: 'rgba(34,197,94,0.25)' },
    rejected: { label: 'Abgelehnt', bg: 'rgba(239,68,68,0.08)', color: '#f87171',       border: 'rgba(239,68,68,0.25)' },
  }
  const c = cfg[s] ?? cfg.pending
  return (
    <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

export default function AdminTerminePage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.replace('/dashboard')
        return
      }
      loadAppointments()
    })
  }, [router])

  async function loadAppointments() {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    setAppointments(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'accepted' | 'rejected' | 'pending') {
    setActing(id)
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setActing(null)
  }

  const pending = appointments.filter(a => a.status === 'pending')
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(var(--gold-rgb),0.15)', borderTop: '3px solid var(--gold)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Fahrstunden-Anfragen
            </h1>
            {pending.length > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.72rem', fontWeight: 800 }}>
                {pending.length} offen
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin-Ansicht Â· Nur fÃ¼r Fahrlehrer Tolga</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
          {(['pending', 'accepted', 'rejected', 'all'] as const).map(f => {
            const labels = { pending: 'Ausstehend', accepted: 'BestÃ¤tigt', rejected: 'Abgelehnt', all: 'Alle' }
            const count = f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                border: filter === f ? '1px solid rgba(var(--gold-rgb),0.3)' : '1px solid var(--border)',
                background: filter === f ? 'rgba(var(--gold-rgb),0.1)' : 'var(--input-bg)',
                color: filter === f ? 'var(--gold)' : 'var(--text-dim)',
                cursor: 'pointer',
              }}>
                {labels[f]} ({count})
              </button>
            )
          })}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontSize: '0.8rem',
              background: 'var(--surface-2)', borderRadius: '1rem', border: '1px solid var(--border)',
            }}>
              Keine EintrÃ¤ge.
            </div>
          )}
          {filtered.map(a => {
            const [h, m] = a.start_time.split(':').map(Number)
            const startMins = h * 60 + m
            const endMins = startMins + a.duration_min
            const dateStr = new Date(a.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
                background: a.status === 'pending' ? 'rgba(var(--gold-rgb),0.04)' : 'var(--surface)',
                border: a.status === 'pending' ? '1px solid rgba(var(--gold-rgb),0.18)' : '1px solid var(--border)',
                borderRadius: '1rem', padding: '1rem 1.25rem',
              }}>
                {/* Date + time */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.1rem' }}>ðŸš—</span>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>{dateStr}</p>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.7rem' }}>
                    {minsToTime(startMins)} â€“ {minsToTime(endMins)} Uhr Â· {a.duration_min} Min.
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '0.73rem', color: 'var(--gold)', fontWeight: 700, paddingLeft: '1.7rem' }}>
                    ðŸ‘¤ {a.student_name}
                  </p>
                  {a.note && (
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)', fontStyle: 'italic', paddingLeft: '1.7rem' }}>
                      â€ž{a.note}"
                    </p>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '0.6rem', color: 'var(--text-dim)', paddingLeft: '1.7rem' }}>
                    Anfrage: {new Date(a.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} Uhr
                  </p>
                </div>

                {/* Status + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <StatusBadge s={a.status} />
                  {a.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => updateStatus(a.id, 'accepted')}
                        disabled={acting === a.id}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                          color: '#22c55e', cursor: 'pointer', opacity: acting === a.id ? 0.5 : 1,
                        }}
                      >
                        âœ“ BestÃ¤tigen
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, 'rejected')}
                        disabled={acting === a.id}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
                          color: '#f87171', cursor: 'pointer', opacity: acting === a.id ? 0.5 : 1,
                        }}
                      >
                        âœ• Ablehnen
                      </button>
                    </div>
                  )}
                  {a.status !== 'pending' && (
                    <button
                      onClick={() => updateStatus(a.id, 'pending')}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 600,
                        background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                        color: 'var(--text-dim)', cursor: 'pointer',
                      }}
                    >
                      ZurÃ¼cksetzen
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

