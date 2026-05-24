'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Msg = {
  id: string
  user_id: string
  username: string
  message: string
  channel: string
  created_at: string
  is_admin?: boolean
  is_premium?: boolean
}

type Group = {
  id: string
  name: string
  created_by: string
}

type Props = {
  userId: string
  username: string
  isAdmin?: boolean
  isPremium?: boolean
}

function timeLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

/* ── Role badge ── */
function RoleBadge({ isAdmin, isPremium }: { isAdmin?: boolean; isPremium?: boolean }) {
  if (isAdmin) return (
    <span style={{
      fontSize: '0.48rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px',
      background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.4)',
      color: '#c4b5fd', letterSpacing: '0.04em',
    }}>ADMIN</span>
  )
  if (isPremium) return (
    <span style={{
      fontSize: '0.48rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px',
      background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
      color: '#fbbf24', letterSpacing: '0.04em',
    }}>⭐ PREMIUM</span>
  )
  return null
}

/* ── Message list ── */
function MsgList({ msgs, userId, bottomRef, typingUsers }: {
  msgs: Msg[]
  userId: string
  bottomRef: React.RefObject<HTMLDivElement | null>
  typingUsers: string[]
}) {
  return (
    <div style={{ height: '240px', overflowY: 'auto', padding: '0.75rem 1rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {msgs.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', margin: 'auto 0' }}>
          Noch keine Nachrichten. Sei der Erste! 👋
        </p>
      )}
      {msgs.map(m => {
        const mine = m.user_id === userId
        const adminMsg = !!m.is_admin
        const premiumMsg = !!m.is_premium && !m.is_admin

        return (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
            {/* Name + badge row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px',
              paddingLeft: mine ? 0 : '4px', paddingRight: mine ? '4px' : 0,
              flexDirection: mine ? 'row-reverse' : 'row',
            }}>
              <span style={{
                fontSize: '0.6rem', fontWeight: 800,
                color: adminMsg ? '#a78bfa' : mine ? 'var(--gold)' : 'var(--text-muted)',
              }}>
                {adminMsg ? 'Admin' : m.username}
              </span>
              <RoleBadge isAdmin={adminMsg} isPremium={premiumMsg} />
            </div>

            {/* Bubble + time */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', flexDirection: mine ? 'row-reverse' : 'row' }}>
              <div style={{
                maxWidth: '80%', padding: '7px 11px',
                borderRadius: mine ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                background: adminMsg
                  ? 'rgba(139,92,246,0.13)'
                  : mine
                    ? 'rgba(var(--gold-rgb),0.18)'
                    : 'rgba(255,255,255,0.06)',
                border: adminMsg
                  ? '1px solid rgba(139,92,246,0.35)'
                  : mine
                    ? '1px solid rgba(var(--gold-rgb),0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.76rem', color: 'var(--text)', lineHeight: 1.5, wordBreak: 'break-word',
              }}>
                {m.message}
              </div>
              <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', flexShrink: 0 }}>{timeLabel(m.created_at)}</span>
            </div>
          </div>
        )
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '4px', paddingBottom: '2px' }}>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: 'var(--gold)', opacity: 0.6,
                animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                display: 'inline-block',
              }} />
            ))}
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            {typingUsers.length === 1
              ? `${typingUsers[0]} schreibt…`
              : `${typingUsers.length} Personen schreiben…`}
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

/* ── Send bar ── */
function SendBar({ input, onChange, send, sending, placeholder = 'Nachricht…' }: {
  input: string
  onChange: (v: string) => void
  send: () => void
  sending: boolean
  placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', gap: '6px', padding: '0.55rem 1rem 0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <input
        value={input}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        placeholder={placeholder}
        style={{
          flex: 1, padding: '0.55rem 0.8rem', boxSizing: 'border-box' as const,
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          borderRadius: '8px', color: 'var(--text)', fontSize: '0.76rem',
          fontFamily: 'inherit', outline: 'none',
        }}
      />
      <button
        onClick={send}
        disabled={sending || !input.trim()}
        style={{
          padding: '0 14px', borderRadius: '8px', flexShrink: 0,
          background: 'rgba(var(--gold-rgb),0.15)', border: '1px solid rgba(var(--gold-rgb),0.3)',
          color: 'var(--gold)', fontSize: '0.9rem', cursor: 'pointer',
          opacity: sending || !input.trim() ? 0.4 : 1,
          transition: 'opacity 0.15s',
        }}
      >↑</button>
    </div>
  )
}

/* ── ChatBox ── */
export default function ChatBox({ userId, username, isAdmin = false, isPremium = false }: Props) {
  const [tab, setTab] = useState<'public' | 'groups'>('public')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [view, setView] = useState<'list' | 'chat' | 'new' | 'join'>('list')
  const [newGroupName, setNewGroupName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [groupError, setGroupError] = useState('')

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const presenceRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeChannel = tab === 'public' ? 'public' : activeGroup?.id ?? null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typingUsers])

  /* ── Messages subscription ── */
  useEffect(() => {
    if (!activeChannel) { setMsgs([]); return }
    let cancelled = false

    supabase
      .from('chat_messages')
      .select('*')
      .eq('channel', activeChannel)
      .order('created_at', { ascending: true })
      .limit(60)
      .then(({ data, error }) => {
        if (!cancelled) {
          if (error) setChatError(`DB-Fehler: ${error.message}`)
          else { setChatError(''); if (data) setMsgs(data) }
        }
      })

    const ch = supabase
      .channel(`chat:${activeChannel}:${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `channel=eq.${activeChannel}`,
      }, payload => {
        if (!cancelled) setMsgs(prev => [...prev, payload.new as Msg])
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(ch)
    }
  }, [activeChannel])

  /* ── Typing presence ── */
  useEffect(() => {
    if (!activeChannel || !userId) return

    const ch = supabase.channel(`presence:${activeChannel}`, {
      config: { presence: { key: userId } },
    })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<{ username: string; isTyping: boolean }>()
      const typing = Object.values(state)
        .flat()
        .filter(u => u.isTyping && u.username !== username)
        .map(u => u.username)
      setTypingUsers(typing)
    })

    ch.subscribe()
    presenceRef.current = ch

    return () => {
      supabase.removeChannel(ch)
      presenceRef.current = null
    }
  }, [activeChannel, userId, username])

  /* ── Load groups ── */
  useEffect(() => {
    if (tab !== 'groups' || !userId) return
    supabase
      .from('chat_group_members')
      .select('chat_groups(id, name, created_by)')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          const gs = data
            .map((d: Record<string, unknown>) => d.chat_groups as Group | null)
            .filter((g): g is Group => !!g)
          setGroups(gs)
        }
      })
  }, [tab, userId])

  /* ── Typing handler ── */
  function handleTyping(val: string) {
    setInput(val)
    if (presenceRef.current) {
      presenceRef.current.track({ username, isTyping: true })
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      if (presenceRef.current) presenceRef.current.track({ username, isTyping: false })
    }, 2000)
  }

  /* ── Send ── */
  async function send() {
    if (!input.trim() || !activeChannel || sending) return
    setSending(true)
    if (presenceRef.current) presenceRef.current.track({ username, isTyping: false })
    if (typingTimer.current) clearTimeout(typingTimer.current)

    const baseMsg = { user_id: userId, username, message: input.trim(), channel: activeChannel }

    let result = await supabase.from('chat_messages').insert({
      ...baseMsg, is_admin: isAdmin, is_premium: isPremium,
    })

    // Spalten noch nicht in DB? Fallback ohne diese Felder
    if (result.error?.message?.includes('is_admin') || result.error?.message?.includes('is_premium')) {
      result = await supabase.from('chat_messages').insert(baseMsg)
    }

    if (result.error) setChatError(`Senden fehlgeschlagen: ${result.error.message}`)
    else { setInput(''); setChatError('') }
    setSending(false)
  }

  async function createGroup() {
    if (!newGroupName.trim()) return
    setGroupError('')
    const { data, error } = await supabase
      .from('chat_groups')
      .insert({ name: newGroupName.trim(), created_by: userId })
      .select().single()
    if (error || !data) { setGroupError('Fehler beim Erstellen.'); return }
    await supabase.from('chat_group_members').insert({ group_id: data.id, user_id: userId })
    setGroups(prev => [...prev, data])
    setActiveGroup(data)
    setNewGroupName('')
    setView('chat')
  }

  async function joinGroup() {
    if (!joinId.trim()) return
    setGroupError('')
    const { data: grp, error } = await supabase
      .from('chat_groups').select('*').eq('id', joinId.trim()).single()
    if (error || !grp) { setGroupError('Gruppe nicht gefunden.'); return }
    await supabase.from('chat_group_members')
      .upsert({ group_id: grp.id, user_id: userId }, { onConflict: 'group_id,user_id' })
    setGroups(prev => prev.find(g => g.id === grp.id) ? prev : [...prev, grp])
    setActiveGroup(grp)
    setJoinId('')
    setView('chat')
  }

  return (
    <div style={{
      background: 'transparent',
      border: '1px solid rgba(var(--gold-rgb),0.28)',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: 'linear-gradient(180deg, var(--gold), rgba(var(--gold-rgb),0.25))' }} />
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>Live Chat</p>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.58rem', color: '#22c55e', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
            Live
          </span>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
          {(['public', 'groups'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'groups') { setView('list'); setActiveGroup(null) } }} style={{
              flex: 1, padding: '7px 4px', border: 'none', cursor: 'pointer',
              background: 'transparent', fontSize: '0.67rem', fontWeight: 700,
              color: tab === t ? 'var(--gold)' : 'var(--text-dim)',
              borderBottom: `2px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
              transition: 'all 0.15s', marginBottom: '-1px',
            }}>
              {t === 'public' ? '🌐 Öffentlich' : '👥 Gruppen'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {chatError && (
        <div style={{ margin: '0.5rem 1rem', padding: '0.55rem 0.8rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.7rem', color: '#f87171' }}>
          ⚠ {chatError}
        </div>
      )}

      {/* Public tab */}
      {tab === 'public' && (
        <>
          <MsgList msgs={msgs} userId={userId} bottomRef={bottomRef} typingUsers={typingUsers} />
          <SendBar input={input} onChange={handleTyping} send={send} sending={sending} />
        </>
      )}

      {/* Groups tab */}
      {tab === 'groups' && (
        <>
          {view === 'list' && (
            <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '280px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <button onClick={() => { setView('new'); setGroupError('') }} style={{
                  flex: 1, padding: '7px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                  background: 'rgba(var(--gold-rgb),0.08)', border: '1px solid rgba(var(--gold-rgb),0.22)',
                  color: 'var(--gold)', cursor: 'pointer',
                }}>+ Neue Gruppe</button>
                <button onClick={() => { setView('join'); setGroupError('') }} style={{
                  flex: 1, padding: '7px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                  background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}>🔗 Beitreten</button>
              </div>
              {groups.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', margin: 'auto 0' }}>
                  Noch keine Gruppen.<br />Erstelle eine oder tritt einer bei.
                </p>
              ) : groups.map(g => (
                <button key={g.id} onClick={() => { setActiveGroup(g); setView('chat') }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '0.65rem 0.75rem', borderRadius: '10px', width: '100%',
                  background: 'transparent', border: '1px solid rgba(var(--gold-rgb),0.18)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.06)'; e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(var(--gold-rgb),0.18)' }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                  }}>👥</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{g.name}</p>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                      {g.created_by === userId ? 'Deine Gruppe' : 'Mitglied'}
                    </p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: '0.8rem' }}>→</span>
                </button>
              ))}
            </div>
          )}

          {view === 'new' && (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '280px' }}>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>← Zurück</button>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)' }}>Neue Gruppe erstellen</p>
              <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') createGroup() }} placeholder="Gruppenname…"
                style={{ width: '100%', padding: '0.55rem 0.8rem', boxSizing: 'border-box' as const, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.76rem', fontFamily: 'inherit', outline: 'none' }} />
              {groupError && <p style={{ margin: 0, fontSize: '0.7rem', color: '#f87171' }}>{groupError}</p>}
              <button onClick={createGroup} style={{ padding: '0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, background: 'rgba(var(--gold-rgb),0.12)', border: '1px solid rgba(var(--gold-rgb),0.28)', color: 'var(--gold)', cursor: 'pointer' }}>
                Gruppe erstellen
              </button>
              <p style={{ margin: 0, fontSize: '0.63rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>Nach dem Erstellen erhältst du eine Gruppen-ID zum Teilen.</p>
            </div>
          )}

          {view === 'join' && (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '280px' }}>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>← Zurück</button>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)' }}>Gruppe beitreten</p>
              <input value={joinId} onChange={e => setJoinId(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') joinGroup() }} placeholder="Gruppen-ID einfügen…"
                style={{ width: '100%', padding: '0.55rem 0.8rem', boxSizing: 'border-box' as const, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.76rem', fontFamily: 'inherit', outline: 'none' }} />
              {groupError && <p style={{ margin: 0, fontSize: '0.7rem', color: '#f87171' }}>{groupError}</p>}
              <button onClick={joinGroup} style={{ padding: '0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Beitreten
              </button>
            </div>
          )}

          {view === 'chat' && activeGroup && (
            <>
              <div style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => { setView('list'); setActiveGroup(null) }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>←</button>
                <p style={{ margin: 0, fontSize: '0.73rem', fontWeight: 700, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeGroup.name}</p>
                <button onClick={() => { navigator.clipboard.writeText(activeGroup.id) }} title="Gruppen-ID kopieren"
                  style={{ background: 'rgba(var(--gold-rgb),0.08)', border: '1px solid rgba(var(--gold-rgb),0.2)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.6rem', padding: '3px 7px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  ID kopieren
                </button>
              </div>
              <MsgList msgs={msgs} userId={userId} bottomRef={bottomRef} typingUsers={typingUsers} />
              <SendBar input={input} onChange={handleTyping} send={send} sending={sending} placeholder="Gruppe schreiben…" />
            </>
          )}
        </>
      )}

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
