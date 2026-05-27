'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/* ── Types ── */
type UserEntry = {
  userId: string; displayName: string; points: number
  avatarUrl?: string | null; lastSeen?: string | null
}
type Friendship = {
  id: string; user_id: string; friend_id: string; status: string
}
type Notification = {
  id: string; type: string; from_user_id: string; from_username: string; read: boolean; created_at: string
}

/* ── Ranks ── */
const RANKS = [
  { id: 'D',  min: 0,    max: 99,       color: '#6b7280' },
  { id: 'C',  min: 100,  max: 299,      color: '#3b82f6' },
  { id: 'B',  min: 300,  max: 599,      color: '#8b5cf6' },
  { id: 'A',  min: 600,  max: 999,      color: '#c9a227' },
  { id: 'S',  min: 1000, max: 1499,     color: '#f97316' },
  { id: 'SS', min: 1500, max: 1999,     color: '#ef4444' },
  { id: 'Legende', min: 2000, max: Infinity, color: '#f59e0b' },
]
function getRank(pts: number) { return RANKS.find(r => pts >= r.min && pts <= r.max) ?? RANKS[0] }

/* ── Online status ── */
function getOnlineStatus(lastSeen: string | null | undefined): { label: string; color: string; dot: string } {
  if (!lastSeen) return { label: 'Offline', color: '#9ca3af', dot: '#d1d5db' }
  const diff = Date.now() - new Date(lastSeen).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 6)  return { label: 'Online',            color: '#22c55e', dot: '#22c55e' }
  if (min < 60) return { label: `vor ${min} Min`,     color: '#f59e0b', dot: '#f59e0b' }
  const h = Math.floor(min / 60)
  if (h < 24)  return { label: `vor ${h} Std`,        color: '#9ca3af', dot: '#d1d5db' }
  const d = Math.floor(h / 24)
  return { label: `vor ${d} Tag${d > 1 ? 'en' : ''}`, color: '#9ca3af', dot: '#d1d5db' }
}

/* ── Avatar ── */
function Avatar({ url, name, size = 34 }: { url?: string | null; name: string; size?: number }) {
  const rank = getRank(0)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: `${rank.color}20`, border: `1.5px solid ${rank.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38 + 'px', fontWeight: 800, color: rank.color }}>
      {url
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : name[0]?.toUpperCase()}
    </div>
  )
}

/* ── Section Header (collapsible) ── */
function SectionHeader({ label, count, open, onToggle, accent }: { label: string; count: number; open: boolean; onToggle: () => void; accent?: string }) {
  return (
    <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .1rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid #f3f4f6' : 'none', marginBottom: open ? '.4rem' : 0 }}>
      <span style={{ fontSize: '.55rem', color: '#9ca3af', transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>▶</span>
      <span style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: accent ?? '#6b7280', flex: 1, textAlign: 'left' }}>{label}</span>
      {count > 0 && <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 100, background: accent ? `${accent}18` : '#f3f4f6', color: accent ?? '#6b7280', border: `1px solid ${accent ? accent + '35' : '#e5e7eb'}` }}>{count}</span>}
    </button>
  )
}

/* ── Main Panel ── */
export default function FriendsPanel({ userId, username, onClose, onUnread }: {
  userId: string; username: string; onClose: () => void; onUnread?: (n: number) => void
}) {
  const [allUsers,     setAllUsers]     = useState<UserEntry[]>([])
  const [friendships,  setFriendships]  = useState<Friendship[]>([])
  const [notifications,setNotifications] = useState<Notification[]>([])
  const [loading,      setLoading]      = useState(true)
  const [acting,       setActing]       = useState<string | null>(null)
  const [search,       setSearch]       = useState('')
  const [openFriends,  setOpenFriends]  = useState(true)
  const [openAll,      setOpenAll]      = useState(false)

  /* load data */
  const loadFriendships = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('friendships').select('*').or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    if (data) setFriendships(data)
  }, [userId])

  const loadNotifications = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).eq('read', false).order('created_at', { ascending: false })
    if (data) {
      setNotifications(data)
      onUnread?.(data.length)
    }
  }, [userId, onUnread])

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => { setAllUsers(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
    loadFriendships()
    loadNotifications()
  }, [loadFriendships, loadNotifications])

  /* Realtime: notifications */
  useEffect(() => {
    if (!userId) return
    const ch = supabase.channel(`notifs:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        loadNotifications()
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId, loadNotifications])

  /* Realtime: friendships */
  useEffect(() => {
    if (!userId) return
    const ch = supabase.channel(`fs:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        loadFriendships()
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId, loadFriendships])

  /* mark notifications read on open */
  useEffect(() => {
    if (!userId || notifications.length === 0) return
    supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false).then(() => {
      setNotifications([])
      onUnread?.(0)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getFriendStatus(targetId: string): 'none' | 'pending_sent' | 'pending_received' | 'friends' {
    const f = friendships.find(x => (x.user_id === userId && x.friend_id === targetId) || (x.friend_id === userId && x.user_id === targetId))
    if (!f) return 'none'
    if (f.status === 'accepted') return 'friends'
    if (f.user_id === userId) return 'pending_sent'
    return 'pending_received'
  }

  async function sendRequest(target: UserEntry) {
    setActing(target.userId)
    const { data } = await supabase.from('friendships').insert({ user_id: userId, friend_id: target.userId, status: 'pending' }).select().single()
    if (data) {
      setFriendships(prev => [...prev, data])
      // Send notification to target
      await supabase.from('notifications').insert({ user_id: target.userId, type: 'friend_request', from_user_id: userId, from_username: username })
    }
    setActing(null)
  }

  async function acceptRequest(target: UserEntry) {
    setActing(target.userId)
    const f = friendships.find(x => x.user_id === target.userId && x.friend_id === userId)
    if (f) {
      const { data } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', f.id).select().single()
      if (data) {
        setFriendships(prev => prev.map(x => x.id === data.id ? data : x))
        // Notify sender that request was accepted
        await supabase.from('notifications').insert({ user_id: target.userId, type: 'friend_accepted', from_user_id: userId, from_username: username })
      }
    }
    setActing(null)
  }

  async function removeRelation(targetId: string) {
    setActing(targetId)
    const f = friendships.find(x => (x.user_id === userId && x.friend_id === targetId) || (x.friend_id === userId && x.user_id === targetId))
    if (f) {
      await supabase.from('friendships').delete().eq('id', f.id)
      setFriendships(prev => prev.filter(x => x.id !== f.id))
    }
    setActing(null)
  }

  const others          = allUsers.filter(u => u.userId !== userId)
  const friends         = others.filter(u => getFriendStatus(u.userId) === 'friends')
  const pendingReceived = others.filter(u => getFriendStatus(u.userId) === 'pending_received')
  const allFiltered     = others.filter(u => !search || u.displayName.toLowerCase().includes(search.toLowerCase()))

  // sort friends: online first
  const sortedFriends = [...friends].sort((a, b) => {
    const aMin = a.lastSeen ? Math.floor((Date.now() - new Date(a.lastSeen).getTime()) / 60000) : 9999
    const bMin = b.lastSeen ? Math.floor((Date.now() - new Date(b.lastSeen).getTime()) / 60000) : 9999
    return aMin - bMin
  })

  const pendingNotifs = notifications.filter(n => n.type === 'friend_request')
  const acceptedNotifs = notifications.filter(n => n.type === 'friend_accepted')

  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '.85rem 1rem .65rem', background: 'linear-gradient(135deg,#1a1a2e,#2d1b69)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{ fontSize: '.82rem', fontWeight: 800, color: '#fff' }}>Freunde</span>
          {notifications.length > 0 && (
            <span style={{ fontSize: '.55rem', fontWeight: 900, padding: '1px 6px', borderRadius: 100, background: '#ef4444', color: '#fff' }}>{notifications.length}</span>
          )}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: '1rem', padding: '2px', lineHeight: 1 }}>✕</button>
      </div>

      {/* Notification banners */}
      {(pendingNotifs.length > 0 || acceptedNotifs.length > 0) && (
        <div style={{ padding: '.5rem .85rem', background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
          {pendingNotifs.length > 0 && (
            <p style={{ margin: 0, fontSize: '.7rem', color: '#ef4444', fontWeight: 700 }}>
              🔔 {pendingNotifs.length === 1 ? `${pendingNotifs[0].from_username} möchte dein Freund sein` : `${pendingNotifs.length} neue Freundschaftsanfragen`}
            </p>
          )}
          {acceptedNotifs.length > 0 && (
            <p style={{ margin: '.2rem 0 0', fontSize: '.7rem', color: '#22c55e', fontWeight: 700 }}>
              ✓ {acceptedNotifs[0].from_username} hat deine Anfrage angenommen
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '.75rem .9rem' }}>

        {/* ── FREUNDE section ── */}
        <SectionHeader label="Freunde" count={sortedFriends.length + pendingReceived.length} open={openFriends} onToggle={() => setOpenFriends(v => !v)} accent={pendingReceived.length > 0 ? '#ef4444' : '#6366f1'} />

        {openFriends && (
          <div style={{ marginBottom: '.75rem' }}>
            {/* Pending received requests */}
            {pendingReceived.map(u => (
              <UserRow key={u.userId} user={u} status="pending_received" acting={acting === u.userId}
                onAccept={() => acceptRequest(u)} onRemove={() => removeRelation(u.userId)} onAdd={() => {}} />
            ))}
            {pendingReceived.length > 0 && sortedFriends.length > 0 && <div style={{ height: 1, background: '#f3f4f6', margin: '.4rem 0' }} />}

            {sortedFriends.length === 0 && pendingReceived.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '.72rem', padding: '.85rem 0' }}>
                Noch keine Freunde 👀<br />
                <span style={{ fontSize: '.65rem' }}>Klappe „Alle Nutzer" auf und füge welche hinzu</span>
              </p>
            ) : sortedFriends.map(u => (
              <UserRow key={u.userId} user={u} status="friends" acting={acting === u.userId}
                onAccept={() => {}} onAdd={() => {}} onRemove={() => removeRelation(u.userId)} />
            ))}
          </div>
        )}

        {/* ── ALLE NUTZER section ── */}
        <SectionHeader label="Alle Nutzer" count={others.length} open={openAll} onToggle={() => setOpenAll(v => !v)} />

        {openAll && (
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nutzer suchen…"
              style={{ width: '100%', padding: '.45rem .7rem', boxSizing: 'border-box', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '.6rem', color: '#1a1a2e', fontSize: '.74rem', fontFamily: 'inherit', outline: 'none', marginBottom: '.5rem' }} />
            {loading ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '.72rem', padding: '.75rem 0' }}>Lädt…</p>
            ) : allFiltered.map(u => (
              <UserRow key={u.userId} user={u} status={getFriendStatus(u.userId)} acting={acting === u.userId}
                onAdd={() => sendRequest(u)} onAccept={() => acceptRequest(u)} onRemove={() => removeRelation(u.userId)} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

/* ── User Row ── */
function UserRow({ user, status, acting, onAdd, onAccept, onRemove }: {
  user: UserEntry; status: 'none' | 'pending_sent' | 'pending_received' | 'friends'
  acting: boolean; onAdd: () => void; onAccept: () => void; onRemove: () => void
}) {
  const rank   = getRank(user.points)
  const online = getOnlineStatus(user.lastSeen)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.42rem 0', borderBottom: '1px solid #f9fafb' }}>
      {/* Avatar + online dot */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: `${rank.color}20`, border: `1.5px solid ${rank.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.82rem', fontWeight: 800, color: rank.color }}>
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : user.displayName[0]?.toUpperCase()}
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: online.dot, border: '1.5px solid #fff' }} />
      </div>

      {/* Name + status */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '.77rem', fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</p>
        <p style={{ margin: 0, fontSize: '.6rem', fontWeight: 600, color: online.color }}>{online.label}</p>
      </div>

      {/* Action */}
      {acting ? (
        <span style={{ fontSize: '.6rem', color: '#9ca3af' }}>…</span>
      ) : status === 'none' ? (
        <button onClick={onAdd} style={{ padding: '3px 9px', borderRadius: 6, fontSize: '.62rem', fontWeight: 700, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.25)', color: '#6366f1', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>+ Anfrage</button>
      ) : status === 'pending_sent' ? (
        <span style={{ fontSize: '.6rem', color: '#9ca3af', flexShrink: 0 }}>Ausstehend</span>
      ) : status === 'pending_received' ? (
        <div style={{ display: 'flex', gap: '.3rem', flexShrink: 0 }}>
          <button onClick={onAccept} style={{ padding: '3px 8px', borderRadius: 6, fontSize: '.62rem', fontWeight: 700, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', color: '#22c55e', cursor: 'pointer', whiteSpace: 'nowrap' }}>✓ Annehmen</button>
          <button onClick={onRemove} style={{ padding: '3px 7px', borderRadius: 6, fontSize: '.62rem', fontWeight: 700, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', cursor: 'pointer' }}>✕</button>
        </div>
      ) : (
        <button onClick={onRemove} style={{ padding: '3px 8px', borderRadius: 6, fontSize: '.62rem', fontWeight: 700, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)', color: '#f87171', cursor: 'pointer', flexShrink: 0 }}>Entfernen</button>
      )}
    </div>
  )
}
