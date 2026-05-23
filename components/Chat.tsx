'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ── Types ────────────────────────────────────────────── */

type Msg = { id: string; sender_id: string; sender_name: string; content: string; created_at: string }
type Profile = { user_id: string; display_name: string }
type Friendship = { id: string; requester_id: string; receiver_id: string; status: string; other: Profile }
type Room = { id: string; label: string; type: 'public' | 'dm' }

function dmRoomId(a: string, b: string) { return [a, b].sort().join('--') }

/* ── Component ────────────────────────────────────────── */

export default function Chat() {
  const router = useRouter()
  const [me, setMe] = useState<{ id: string; name: string } | null>(null)
  const [room, setRoom] = useState<Room>({ id: 'public', label: 'Öffentlicher Chat', type: 'public' })
  const [messages, setMessages] = useState<Msg[]>([])
  const [friends, setFriends] = useState<Friendship[]>([])
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([])
  const [input, setInput] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentIds, setSentIds] = useState<string[]>([]) // pending sent request user IDs
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ── Init ── */
  const loadFriends = useCallback(async (userId: string) => {
    const { data: fships } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

    if (!fships || fships.length === 0) { setFriends([]); setPendingReceived([]); return }

    const otherIds = fships.map(f => f.requester_id === userId ? f.receiver_id : f.requester_id)
    const { data: profilesData } = await supabase
      .from('profiles').select('user_id, display_name').in('user_id', otherIds)

    const pm: Record<string, Profile> = Object.fromEntries((profilesData ?? []).map(p => [p.user_id, p]))

    const accepted: Friendship[] = []
    const received: Friendship[] = []
    const sentList: string[] = []

    fships.forEach(f => {
      const otherId = f.requester_id === userId ? f.receiver_id : f.requester_id
      const other = pm[otherId] ?? { user_id: otherId, display_name: 'Unbekannt' }
      const fs: Friendship = { id: f.id, requester_id: f.requester_id, receiver_id: f.receiver_id, status: f.status, other }
      if (f.status === 'accepted') accepted.push(fs)
      else if (f.status === 'pending' && f.receiver_id === userId) received.push(fs)
      else if (f.status === 'pending' && f.requester_id === userId) sentList.push(otherId)
    })

    setFriends(accepted)
    setPendingReceived(received)
    setSentIds(sentList)
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const displayName = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Fahrschüler'

      // Upsert profile
      await supabase.from('profiles').upsert({ user_id: session.user.id, display_name: displayName }, { onConflict: 'user_id', ignoreDuplicates: true })

      setMe({ id: session.user.id, name: displayName })
      loadFriends(session.user.id)
    }
    init()
  }, [router, loadFriends])

  /* ── Messages + Realtime ── */
  useEffect(() => {
    if (!me) return
    setMessages([])

    if (channelRef.current) supabase.removeChannel(channelRef.current)

    supabase.from('messages').select('*').eq('room_id', room.id)
      .order('created_at', { ascending: true }).limit(80)
      .then(({ data }) => {
        if (data) setMessages(data)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 100)
      })

    const ch = supabase.channel(`chat-${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` }, p => {
        setMessages(prev => [...prev, p.new as Msg])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .subscribe()

    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [room, me])

  /* ── User search ── */
  useEffect(() => {
    if (!searchQ.trim() || !me) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('user_id, display_name')
        .ilike('display_name', `%${searchQ}%`).neq('user_id', me.id).limit(6)
      setSearchResults(data ?? [])
    }, 300)
    return () => clearTimeout(t)
  }, [searchQ, me])

  /* ── Actions ── */
  async function sendMessage() {
    if (!me || !input.trim() || sending) return
    const content = input.trim().slice(0, 500)
    setInput('')
    setSending(true)
    await supabase.from('messages').insert({ sender_id: me.id, sender_name: me.name, room_id: room.id, content })
    setSending(false)
    inputRef.current?.focus()
  }

  async function sendFriendRequest(receiverId: string) {
    if (!me) return
    await supabase.from('friendships').insert({ requester_id: me.id, receiver_id: receiverId, status: 'pending' })
    setSentIds(p => [...p, receiverId])
    setSearchQ('')
    setSearchResults([])
  }

  async function acceptRequest(id: string) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id)
    if (me) loadFriends(me.id)
  }

  async function declineRequest(id: string) {
    await supabase.from('friendships').delete().eq('id', id)
    if (me) loadFriends(me.id)
  }

  function openDM(f: Friendship) {
    if (!me) return
    setRoom({ id: dmRoomId(me.id, f.other.user_id), label: f.other.display_name, type: 'dm' })
  }

  if (!me) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Wird geladen…
      </div>
    )
  }

  /* ── Render ── */
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: '260px', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,10,0.9)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Logo area */}
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>Räume</p>
          <RoomItem
            label="🌍 Öffentlicher Chat"
            sub="Für alle sichtbar"
            active={room.id === 'public'}
            onClick={() => setRoom({ id: 'public', label: 'Öffentlicher Chat', type: 'public' })}
          />
        </div>

        {/* Scrollable section */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0.85rem' }}>

          {/* Pending requests */}
          {pendingReceived.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Freundschaftsanfragen ({pendingReceived.length})
              </p>
              {pendingReceived.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 9px', borderRadius: '9px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', marginBottom: '5px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold)', flexShrink: 0 }}>
                    {f.other.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontSize: '0.74rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.other.display_name}
                  </span>
                  <button onClick={() => acceptRequest(f.id)} title="Annehmen" style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</button>
                  <button onClick={() => declineRequest(f.id)} title="Ablehnen" style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✗</button>
                </div>
              ))}
            </div>
          )}

          {/* Friends */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Freunde {friends.length > 0 && `(${friends.length})`}
              </p>
              <button
                onClick={() => { setShowSearch(s => !s); setSearchQ(''); setSearchResults([]) }}
                style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '5px', background: showSearch ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.05)', color: showSearch ? 'var(--gold)' : 'var(--text-dim)', border: `1px solid ${showSearch ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', fontWeight: 700 }}>
                {showSearch ? '✕' : '+ Suchen'}
              </button>
            </div>

            {showSearch && (
              <div style={{ marginBottom: '0.75rem' }}>
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Name suchen…"
                  autoFocus
                  style={{
                    width: '100%', padding: '7px 10px', borderRadius: '8px', fontSize: '0.78rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {searchResults.map(u => {
                  const isAlready = friends.some(f => f.other.user_id === u.user_id)
                  const isSent = sentIds.includes(u.user_id)
                  return (
                    <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '7px', background: 'rgba(255,255,255,0.03)', marginTop: '4px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {u.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name}</span>
                      {isAlready && <span style={{ fontSize: '0.62rem', color: '#22c55e', fontWeight: 700 }}>✓ Freund</span>}
                      {!isAlready && isSent && <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>Gesendet</span>}
                      {!isAlready && !isSent && (
                        <button onClick={() => sendFriendRequest(u.user_id)} style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: '5px', background: 'rgba(201,162,39,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,162,39,0.25)', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                          + Anfrage
                        </button>
                      )}
                    </div>
                  )
                })}
                {searchQ.length > 0 && searchResults.length === 0 && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.5rem 0' }}>Niemanden gefunden</p>
                )}
              </div>
            )}

            {friends.length === 0 && !showSearch && (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0', lineHeight: 1.6 }}>
                Noch keine Freunde.<br />Nutze die Suche um welche zu finden.
              </p>
            )}

            {friends.map(f => {
              const rid = dmRoomId(me.id, f.other.user_id)
              return (
                <RoomItem
                  key={f.id}
                  label={f.other.display_name}
                  sub="Privat"
                  avatar={f.other.display_name.charAt(0).toUpperCase()}
                  active={room.id === rid}
                  onClick={() => openDM(f)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)',
        }}>
          {room.type === 'public' ? (
            <span style={{ fontSize: '1.15rem' }}>🌍</span>
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', flexShrink: 0 }}>
              {room.label.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>{room.label}</p>
            <p style={{ margin: 0, fontSize: '0.65rem', color: room.type === 'dm' ? 'var(--gold)' : '#22c55e', fontWeight: 600 }}>
              {room.type === 'dm' ? '🔒 Privat' : '🌍 Öffentlich — Für alle sichtbar'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-dim)' }}>
              <span style={{ fontSize: '2rem' }}>{room.type === 'public' ? '💬' : '🔒'}</span>
              <p style={{ fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.6 }}>
                {room.type === 'public' ? 'Noch keine Nachrichten — schreib die erste!' : `Starte ein privates Gespräch mit ${room.label}`}
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.sender_id === me.id
            const prevMsg = messages[i - 1]
            const showName = !isMe && prevMsg?.sender_id !== msg.sender_id
            const showTime = i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id

            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginTop: (showName || i === 0) ? '0.85rem' : '1px' }}>
                {showName && (
                  <span style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '3px', paddingLeft: '10px' }}>
                    {msg.sender_name}
                  </span>
                )}
                <div style={{
                  maxWidth: '65%', padding: '0.5rem 0.9rem',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isMe ? '1px solid rgba(201,162,39,0.22)' : '1px solid rgba(255,255,255,0.07)',
                  fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.55, wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
                {showTime && (
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginTop: '3px', paddingLeft: '8px', paddingRight: '8px' }}>
                    {new Date(msg.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '0.85rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,10,10,0.7)', display: 'flex', gap: '0.75rem', alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={room.type === 'dm' ? `Nachricht an ${room.label}…` : 'Nachricht an alle…'}
            maxLength={500}
            style={{
              flex: 1, padding: '0.75rem 1.1rem', borderRadius: '12px', fontSize: '0.85rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(201,162,39,0.35)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            style={{
              padding: '0.75rem 1.4rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700,
              background: input.trim() ? 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))' : 'rgba(255,255,255,0.04)',
              color: input.trim() ? '#000' : 'var(--text-dim)',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s', flexShrink: 0,
              boxShadow: input.trim() ? '0 0 16px rgba(201,162,39,0.25)' : 'none',
            }}
          >
            ↑ Senden
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Room Item ─────────────────────────────────────────── */

function RoomItem({ label, sub, avatar, active, onClick }: {
  label: string; sub?: string; avatar?: string; active: boolean; onClick: () => void
}) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '9px',
      padding: '7px 9px', borderRadius: '9px', cursor: 'pointer',
      background: active ? 'rgba(201,162,39,0.1)' : 'transparent',
      border: active ? '1px solid rgba(201,162,39,0.2)' : '1px solid transparent',
      marginBottom: '2px', transition: 'all 0.15s',
    }}>
      {avatar ? (
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, color: active ? 'var(--gold)' : 'var(--text-muted)', background: active ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${active ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
          {avatar}
        </div>
      ) : null}
      <div style={{ overflow: 'hidden' }}>
        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? 'var(--gold)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </p>
        {sub && <p style={{ margin: 0, fontSize: '0.6rem', color: active ? 'rgba(201,162,39,0.7)' : 'var(--text-dim)' }}>{sub}</p>}
      </div>
    </div>
  )
}
