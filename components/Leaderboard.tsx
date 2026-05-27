'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const RANKS = [
  { id: 'D',       name: 'Anfänger',        min: 0,    max: 99,       color: '#6b7280' },
  { id: 'C',       name: 'Amateur',         min: 100,  max: 299,      color: '#3b82f6' },
  { id: 'B',       name: 'Fortgeschritten', min: 300,  max: 599,      color: '#8b5cf6' },
  { id: 'A',       name: 'Profi',           min: 600,  max: 999,      color: '#c9a227' },
  { id: 'S',       name: 'Experte',         min: 1000, max: 1499,     color: '#f97316' },
  { id: 'SS',      name: 'Meister',         min: 1500, max: 1999,     color: '#ef4444' },
  { id: 'Legende', name: 'Legende',         min: 2000, max: Infinity, color: '#f59e0b' },
]

function getRank(points: number) {
  return RANKS.find(r => points >= r.min && points <= r.max) ?? RANKS[0]
}

const MEDAL = ['🥇', '🥈', '🥉']
const PODIUM_H = [160, 200, 130]

type Entry = { position: number; userId: string; displayName: string; points: number; avatarUrl?: string | null }

function Avatar({ url, name, size = 40 }: { url?: string | null; name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      border: '2px solid rgba(99,102,241,.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36 + 'px', fontWeight: 800, color: '#fff',
    }}>
      {url
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : name[0]?.toUpperCase()
      }
    </div>
  )
}

function RankBadge({ points }: { points: number }) {
  const rank = getRank(points)
  return (
    <span style={{
      fontSize: '.58rem', fontWeight: 900, padding: '2px 8px', borderRadius: 100,
      background: `${rank.color}15`, border: `1px solid ${rank.color}40`, color: rank.color,
      letterSpacing: '.04em', flexShrink: 0,
    }}>{rank.id}</span>
  )
}

export default function Leaderboard() {
  const [entries, setEntries]           = useState<Entry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 5000)
        const [res, sessionRes] = await Promise.all([
          fetch('/api/leaderboard', { signal: ctrl.signal }),
          supabase.auth.getSession(),
        ])
        clearTimeout(timer)
        const data = await res.json()
        setEntries(Array.isArray(data) ? data : [])
        setCurrentUserId(sessionRes.data.session?.user.id ?? null)
      } catch { /* timeout oder Fehler */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af', fontSize: '.85rem' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(99,102,241,.15)', borderTop: '3px solid #6366f1', margin: '0 auto .75rem', animation: 'lb-spin .8s linear infinite' }} />
      <style>{`@keyframes lb-spin{to{transform:rotate(360deg)}}`}</style>
      Lade Rangliste…
    </div>
  )

  if (entries.length === 0) return (
    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af', fontSize: '.85rem' }}>
      Noch keine Einträge vorhanden.
    </div>
  )

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  // Visual order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]]

  return (
    <div>
      {/* ── Podium ── */}
      <div style={{ background: '#fff', borderRadius: '1.5rem', border: '1px solid #e5e7eb', padding: '1.5rem 1rem 0', marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '.75rem' }}>
          {podiumOrder.map((entry, vi) => {
            if (!entry) return <div key={vi} style={{ flex: 1 }} />
            const isMe = entry.userId === currentUserId
            const rank = getRank(entry.points)
            const isFirst = vi === 1
            return (
              <div key={entry.userId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.45rem', maxWidth: 160 }}>
                <span style={{ fontSize: isFirst ? '1.6rem' : '1.3rem' }}>{MEDAL[entry.position - 1]}</span>
                <div style={{ position: 'relative' }}>
                  <Avatar url={entry.avatarUrl} name={entry.displayName} size={isFirst ? 56 : 44} />
                  {isMe && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' }} />
                  )}
                </div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '.78rem', color: isMe ? '#6366f1' : '#1a1a2e', textAlign: 'center', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.displayName}
                </p>
                <RankBadge points={entry.points} />
                {/* Podium block */}
                <div style={{
                  width: '100%', height: PODIUM_H[vi],
                  background: isFirst
                    ? 'linear-gradient(180deg,rgba(99,102,241,.15) 0%,rgba(99,102,241,.04) 100%)'
                    : 'linear-gradient(180deg,#f9fafb 0%,#f3f4f6 100%)',
                  border: isFirst ? '1px solid rgba(99,102,241,.2)' : '1px solid #e5e7eb',
                  borderBottom: 'none',
                  borderRadius: '.75rem .75rem 0 0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: isFirst ? '#6366f1' : '#1a1a2e' }}>#{entry.position}</span>
                  <span style={{ fontSize: '.68rem', color: '#9ca3af', fontWeight: 600 }}>{entry.points.toLocaleString('de')} Pkt</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Rest of list ── */}
      {rest.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {rest.map((entry, i) => {
            const isMe = entry.userId === currentUserId
            return (
              <div key={entry.userId} style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.7rem 1.1rem',
                borderBottom: i < rest.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: isMe ? 'rgba(99,102,241,.05)' : 'transparent',
              }}>
                <span style={{ width: 26, textAlign: 'center', fontSize: '.78rem', fontWeight: 700, color: '#9ca3af', flexShrink: 0 }}>#{entry.position}</span>
                <Avatar url={entry.avatarUrl} name={entry.displayName} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '.82rem', fontWeight: isMe ? 800 : 700, color: isMe ? '#6366f1' : '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.displayName}{isMe ? ' 👈 Du' : ''}
                  </p>
                </div>
                <RankBadge points={entry.points} />
                <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#6b7280', flexShrink: 0, minWidth: 55, textAlign: 'right' }}>
                  {entry.points.toLocaleString('de')} Pkt
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
