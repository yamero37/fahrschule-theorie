'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const RANKS = [
  { id: 'D',       min: 0,    max: 99,       color: '#6b7280' },
  { id: 'C',       min: 100,  max: 299,      color: '#3b82f6' },
  { id: 'B',       min: 300,  max: 599,      color: '#8b5cf6' },
  { id: 'A',       min: 600,  max: 999,      color: '#c9a227' },
  { id: 'S',       min: 1000, max: 1499,     color: '#f97316' },
  { id: 'SS',      min: 1500, max: 1999,     color: '#ef4444' },
  { id: 'Legende', min: 2000, max: Infinity, color: '#ffd700' },
]

function getRank(points: number) {
  return RANKS.find(r => points >= r.min && points <= r.max) ?? RANKS[0]
}

const MEDAL = ['🥇', '🥈', '🥉']

type Entry = { position: number; userId: string; displayName: string; points: number }

export default function Leaderboard() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [res, sessionRes] = await Promise.all([
        fetch('/api/leaderboard'),
        supabase.auth.getSession(),
      ])
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
      setCurrentUserId(sessionRes.data.session?.user.id ?? null)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Lade Rangliste…
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Noch keine Einträge vorhanden.
      </div>
    )
  }

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>

      {/* Podium — top 3 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
          if (!entry) return <div key={visualIdx} style={{ flex: 1 }} />
          const heights = [140, 180, 120]
          const isMe = entry.userId === currentUserId
          const rank = getRank(entry.points)
          return (
            <div key={entry.userId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ fontSize: '1.6rem' }}>{MEDAL[entry.position - 1]}</div>
              <div style={{
                fontWeight: 800, fontSize: '0.85rem', color: isMe ? 'var(--gold)' : 'var(--text)',
                textAlign: 'center', maxWidth: '90px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entry.displayName}
              </div>
              <span style={{
                padding: '2px 8px', borderRadius: '12px', fontSize: '0.6rem', fontWeight: 800,
                border: `1px solid ${rank.color}60`,
                background: `${rank.color}15`,
                color: rank.color,
              }}>
                {rank.id}
              </span>
              <div style={{
                width: '100%', height: `${heights[visualIdx]}px`,
                background: visualIdx === 1
                  ? 'linear-gradient(180deg, rgba(201,162,39,0.25) 0%, rgba(201,162,39,0.06) 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: isMe
                  ? '1px solid rgba(201,162,39,0.5)'
                  : `1px solid ${visualIdx === 1 ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '0.75rem 0.75rem 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '4px',
              }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: visualIdx === 1 ? 'var(--gold)' : 'var(--text)' }}>
                  #{entry.position}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {entry.points} Pkt
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Rest of the list */}
      {rest.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(201,162,39,0.12)',
          borderRadius: '1rem',
          overflow: 'hidden',
        }}>
          {rest.map((entry, i) => {
            const isMe = entry.userId === currentUserId
            const rank = getRank(entry.points)
            return (
              <div key={entry.userId} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.85rem 1.25rem',
                borderBottom: i < rest.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: isMe ? 'rgba(201,162,39,0.06)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                <span style={{ width: '28px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', flexShrink: 0 }}>
                  #{entry.position}
                </span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 700,
                    color: isMe ? 'var(--gold)' : 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                  }}>
                    {entry.displayName} {isMe && <span style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 600 }}>(Du)</span>}
                  </span>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.6rem', fontWeight: 800, flexShrink: 0,
                  border: `1px solid ${rank.color}60`,
                  background: `${rank.color}15`,
                  color: rank.color,
                }}>
                  {rank.id}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0, minWidth: '60px', textAlign: 'right' }}>
                  {entry.points} Pkt
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
