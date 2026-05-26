'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type UserEntry = { userId: string; displayName: string; points: number }
type Friendship = { id: string; user_id: string; friend_id: string; status: string }

const RANKS = [
  { id: 'D', min: 0,    max: 99,       color: '#6b7280' },
  { id: 'C', min: 100,  max: 299,      color: '#3b82f6' },
  { id: 'B', min: 300,  max: 599,      color: '#8b5cf6' },
  { id: 'A', min: 600,  max: 999,      color: '#c9a227' },
  { id: 'S', min: 1000, max: 1499,     color: '#f97316' },
  { id: 'SS', min: 1500, max: 1999,    color: '#ef4444' },
  { id: 'Legende', min: 2000, max: Infinity, color: '#ffd700' },
]
function getRank(pts: number) { return RANKS.find(r => pts >= r.min && pts <= r.max) ?? RANKS[0] }

export default function FriendsPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'friends' | 'all'>('all')
  const [allUsers, setAllUsers] = useState<UserEntry[]>([])
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [search, setSearch] = useState('')
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => { setAllUsers(Array.isArray(d) ? d : []); setLoadingUsers(false) })
      .catch(() => setLoadingUsers(false))
  }, [])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .then(({ data }) => { if (data) setFriendships(data) })
  }, [userId])

  function getFriendStatus(targetId: string): 'none' | 'pending_sent' | 'pending_received' | 'friends' {
    const f = friendships.find(
      x => (x.user_id === userId && x.friend_id === targetId) ||
           (x.friend_id === userId && x.user_id === targetId)
    )
    if (!f) return 'none'
    if (f.status === 'accepted') return 'friends'
    if (f.user_id === userId) return 'pending_sent'
    return 'pending_received'
  }

  async function addFriend(targetId: string) {
    setActing(targetId)
    const { data } = await supabase.from('friendships').insert({
      user_id: userId, friend_id: targetId, status: 'pending',
    }).select().single()
    if (data) setFriendships(prev => [...prev, data])
    setActing(null)
  }

  async function acceptFriend(targetId: string) {
    setActing(targetId)
    const f = friendships.find(x => x.user_id === targetId && x.friend_id === userId)
    if (f) {
      const { data } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', f.id).select().single()
      if (data) setFriendships(prev => prev.map(x => x.id === data.id ? data : x))
    }
    setActing(null)
  }

  async function removeFriend(targetId: string) {
    setActing(targetId)
    const f = friendships.find(
      x => (x.user_id === userId && x.friend_id === targetId) ||
           (x.friend_id === userId && x.user_id === targetId)
    )
    if (f) {
      await supabase.from('friendships').delete().eq('id', f.id)
      setFriendships(prev => prev.filter(x => x.id !== f.id))
    }
    setActing(null)
  }

  const others = allUsers.filter(u => u.userId !== userId)
  const filtered = others.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase())
  )

  const friends = others.filter(u => getFriendStatus(u.userId) === 'friends')
  const pendingReceived = others.filter(u => getFriendStatus(u.userId) === 'pending_received')

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: '300px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px var(--border)',
      backdropFilter: 'blur(20px)',
      zIndex: 200,
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ padding: '0.85rem 1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>Community</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem', padding: '2px', lineHeight: 1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {([['all', 'Alle Nutzer'], ['friends', 'Freunde']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: '0.67rem', fontWeight: 700,
              color: tab === t ? 'var(--gold)' : 'var(--text-dim)',
              borderBottom: `2px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
              transition: 'all 0.15s', marginBottom: '-1px',
            }}>
              {label}
              {t === 'friends' && friends.length > 0 && (
                <span style={{ marginLeft: '5px', fontSize: '0.55rem', background: 'rgba(var(--gold-rgb),0.15)', color: 'var(--gold)', borderRadius: '100px', padding: '1px 5px' }}>
                  {friends.length}
                </span>
              )}
              {t === 'friends' && pendingReceived.length > 0 && (
                <span style={{ marginLeft: '4px', fontSize: '0.55rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '100px', padding: '1px 5px' }}>
                  +{pendingReceived.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.75rem 1rem' }}>

        {/* ALL USERS TAB */}
        {tab === 'all' && (
          <>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nutzer suchen…"
              style={{
                width: '100%', padding: '0.5rem 0.75rem', boxSizing: 'border-box',
                background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                borderRadius: '8px', color: 'var(--text)', fontSize: '0.74rem',
                fontFamily: 'inherit', outline: 'none', marginBottom: '0.65rem',
              }}
            />
            {loadingUsers ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', padding: '1rem 0' }}>Lädt…</p>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', padding: '1rem 0' }}>Keine Nutzer gefunden.</p>
            ) : filtered.map(u => (
              <UserRow
                key={u.userId}
                user={u}
                status={getFriendStatus(u.userId)}
                acting={acting === u.userId}
                onAdd={() => addFriend(u.userId)}
                onAccept={() => acceptFriend(u.userId)}
                onRemove={() => removeFriend(u.userId)}
              />
            ))}
          </>
        )}

        {/* FRIENDS TAB */}
        {tab === 'friends' && (
          <>
            {/* Pending requests */}
            {pendingReceived.length > 0 && (
              <>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171' }}>
                  Anfragen ({pendingReceived.length})
                </p>
                {pendingReceived.map(u => (
                  <UserRow
                    key={u.userId}
                    user={u}
                    status="pending_received"
                    acting={acting === u.userId}
                    onAdd={() => addFriend(u.userId)}
                    onAccept={() => acceptFriend(u.userId)}
                    onRemove={() => removeFriend(u.userId)}
                  />
                ))}
                <div style={{ height: '1px', background: 'var(--divider-color)', margin: '0.65rem 0' }} />
              </>
            )}

            {friends.length === 0 && pendingReceived.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', padding: '1.5rem 0' }}>
                Noch keine Freunde.<br />Geh zu „Alle Nutzer" um welche hinzuzufügen.
              </p>
            ) : (
              <>
                {friends.length > 0 && (
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Freunde ({friends.length})
                  </p>
                )}
                {friends.map(u => (
                  <UserRow
                    key={u.userId}
                    user={u}
                    status="friends"
                    acting={acting === u.userId}
                    onAdd={() => addFriend(u.userId)}
                    onAccept={() => acceptFriend(u.userId)}
                    onRemove={() => removeFriend(u.userId)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── User Row ── */

function UserRow({
  user, status, acting, onAdd, onAccept, onRemove,
}: {
  user: UserEntry
  status: 'none' | 'pending_sent' | 'pending_received' | 'friends'
  acting: boolean
  onAdd: () => void
  onAccept: () => void
  onRemove: () => void
}) {
  const rank = getRank(user.points)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '0.5rem 0', borderBottom: '1px solid var(--divider-color)',
    }}>
      {/* Avatar placeholder */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: `${rank.color}18`, border: `1.5px solid ${rank.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 800, color: rank.color,
      }}>
        {user.displayName[0]?.toUpperCase()}
      </div>

      {/* Name + rank */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.76rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.displayName}
        </p>
        <p style={{ margin: 0, fontSize: '0.58rem', color: rank.color, fontWeight: 600 }}>
          {rank.id} · {user.points} Pkt.
        </p>
      </div>

      {/* Action button */}
      {acting ? (
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>…</span>
      ) : status === 'none' ? (
        <button onClick={onAdd} style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
          background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)',
          color: 'var(--gold)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          + Hinzufügen
        </button>
      ) : status === 'pending_sent' ? (
        <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', flexShrink: 0 }}>Ausstehend</span>
      ) : status === 'pending_received' ? (
        <button onClick={onAccept} style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          color: '#22c55e', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          Annehmen
        </button>
      ) : (
        <button onClick={onRemove} style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#f87171', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          Entfernen
        </button>
      )}
    </div>
  )
}
