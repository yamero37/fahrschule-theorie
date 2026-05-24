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
}

type Group = {
  id: string
  name: string
  created_by: string
}

type Props = {
  userId: string
  username: string
}

/* ── helpers ── */

function timeLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

const INPUT_STYLE = {
  width: '100%', padding: '0.55rem 0.8rem', boxSizing: 'border-box' as const,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '8px', color: 'var(--text)', fontSize: '0.76rem',
  fontFamily: 'inherit', outline: 'none',
}

/* ── Chat messages list ── */

function MsgList({
  msgs, userId, bottomRef,
}: {
  msgs: Msg[]
  userId: string
  bottomRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div style={{
      height: '220px', overflowY: 'auto', padding: '0.75rem 1rem',
      display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      {msgs.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', margin: 'auto 0' }}>
          Noch keine Nachrichten. Sei der Erste! 👋
        </p>
      )}
      {msgs.map(m => {
        const mine = m.user_id === userId
        return (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
            {!mine && (
              <span style={{ fontSize: '0.58rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '2px', paddingLeft: '4px' }}>
                {m.username}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', flexDirection: mine ? 'row-reverse' : 'row' }}>
              <div style={{
                maxWidth: '80%', padding: '6px 10px', borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: mine ? 'rgba(201,162,39,0.18)' : 'rgba(255,255,255,0.06)',
                border: mine ? '1px solid rgba(201,162,39,0.3)' : '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.76rem', color: 'var(--text)', lineHeight: 1.45, wordBreak: 'break-word',
              }}>
                {m.message}
              </div>
              <span style={{ fontSize: '0.52rem', color: 'var(--text-dim)', flexShrink: 0 }}>{timeLabel(m.created_at)}</span>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

/* ── Send bar ── */

function SendBar({
  input, setInput, send, sending, placeholder = 'Nachricht…',
}: {
  input: string
  setInput: (v: string) => void
  send: () => void
  sending: boolean
  placeholder?: string
}) {
  return (
    <div style={{
      display: 'flex', gap: '6px', padding: '0.6rem 1rem 0.85rem',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        placeholder={placeholder}
        style={INPUT_STYLE}
      />
      <button
        onClick={send}
        disabled={sending || !input.trim()}
        style={{
          padding: '0 14px', borderRadius: '8px', flexShrink: 0,
          background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)',
          color: 'var(--gold)', fontSize: '0.8rem', cursor: 'pointer',
          opacity: sending || !input.trim() ? 0.45 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        ↑
      </button>
    </div>
  )
}

/* ── ChatBox ── */

export default function ChatBox({ userId, username }: Props) {
  const [tab, setTab] = useState<'public' | 'groups'>('public')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')

  // groups state
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [view, setView] = useState<'list' | 'chat' | 'new' | 'join'>('list')
  const [newGroupName, setNewGroupName] = useState('')
  const [joinId, setJoinId] = useState('')
  const [groupError, setGroupError] = useState('')

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const activeChannel = tab === 'public' ? 'public' : activeGroup?.id ?? null

  // scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  // subscribe to channel
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

  // load groups when switching to groups tab
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

  async function send() {
    if (!input.trim() || !activeChannel || sending) return
    setSending(true)
    const { error } = await supabase.from('chat_messages').insert({
      user_id: userId, username, message: input.trim(), channel: activeChannel,
    })
    if (error) setChatError(`Senden fehlgeschlagen: ${error.message}`)
    else setInput('')
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

      {/* ── Header ── */}
      <div style={{ padding: '1rem 1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: 'linear-gradient(180deg, var(--gold), rgba(201,162,39,0.3))' }} />
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>Live Chat</p>
          <span style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '0.58rem', color: '#22c55e', fontWeight: 700,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
            Live
          </span>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
          {(['public', 'groups'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'groups') { setView('list'); setActiveGroup(null) } }} style={{
              flex: 1, padding: '7px 4px', border: 'none', cursor: 'pointer',
              background: 'transparent',
              fontSize: '0.67rem', fontWeight: 700,
              color: tab === t ? 'var(--gold)' : 'var(--text-dim)',
              borderBottom: `2px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
              transition: 'all 0.15s', marginBottom: '-1px',
            }}>
              {t === 'public' ? '🌐 Öffentlich' : '👥 Gruppen'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error banner ── */}
      {chatError && (
        <div style={{ margin: '0.5rem 1rem', padding: '0.55rem 0.8rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.7rem', color: '#f87171' }}>
          ⚠ {chatError}
        </div>
      )}

      {/* ── Public tab ── */}
      {tab === 'public' && (
        <>
          <MsgList msgs={msgs} userId={userId} bottomRef={bottomRef} />
          <SendBar input={input} setInput={setInput} send={send} sending={sending} />
        </>
      )}

      {/* ── Groups tab ── */}
      {tab === 'groups' && (
        <>
          {/* Group list view */}
          {view === 'list' && (
            <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '280px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <button onClick={() => { setView('new'); setGroupError('') }} style={{
                  flex: 1, padding: '7px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                  background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.22)',
                  color: 'var(--gold)', cursor: 'pointer',
                }}>
                  + Neue Gruppe
                </button>
                <button onClick={() => { setView('join'); setGroupError('') }} style={{
                  flex: 1, padding: '7px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}>
                  🔗 Beitreten
                </button>
              </div>

              {groups.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', margin: 'auto 0' }}>
                  Noch keine Gruppen.<br />Erstelle eine oder tritt einer bei.
                </p>
              ) : groups.map(g => (
                <button key={g.id} onClick={() => { setActiveGroup(g); setView('chat') }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '0.65rem 0.75rem', borderRadius: '10px', width: '100%',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.06)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)',
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

          {/* New group view */}
          {view === 'new' && (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '280px' }}>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: '4px' }}>
                ← Zurück
              </button>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)' }}>Neue Gruppe erstellen</p>
              <input
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createGroup() }}
                placeholder="Gruppenname…"
                style={INPUT_STYLE}
              />
              {groupError && <p style={{ margin: 0, fontSize: '0.7rem', color: '#f87171' }}>{groupError}</p>}
              <button onClick={createGroup} style={{
                padding: '0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)',
                color: 'var(--gold)', cursor: 'pointer',
              }}>
                Gruppe erstellen
              </button>
              <p style={{ margin: 0, fontSize: '0.63rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                Nach dem Erstellen erhältst du eine Gruppen-ID, die du mit Freunden teilen kannst.
              </p>
            </div>
          )}

          {/* Join group view */}
          {view === 'join' && (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '280px' }}>
              <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: '4px' }}>
                ← Zurück
              </button>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)' }}>Gruppe beitreten</p>
              <input
                value={joinId}
                onChange={e => setJoinId(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') joinGroup() }}
                placeholder="Gruppen-ID einfügen…"
                style={INPUT_STYLE}
              />
              {groupError && <p style={{ margin: 0, fontSize: '0.7rem', color: '#f87171' }}>{groupError}</p>}
              <button onClick={joinGroup} style={{
                padding: '0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-muted)', cursor: 'pointer',
              }}>
                Beitreten
              </button>
            </div>
          )}

          {/* Group chat view */}
          {view === 'chat' && activeGroup && (
            <>
              <div style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => { setView('list'); setActiveGroup(null) }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                  ←
                </button>
                <p style={{ margin: 0, fontSize: '0.73rem', fontWeight: 700, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeGroup.name}
                </p>
                <button
                  onClick={() => { navigator.clipboard.writeText(activeGroup.id) }}
                  title="Gruppen-ID kopieren"
                  style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.6rem', padding: '3px 7px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  ID kopieren
                </button>
              </div>
              <MsgList msgs={msgs} userId={userId} bottomRef={bottomRef} />
              <SendBar input={input} setInput={setInput} send={send} sending={sending} placeholder="Gruppe schreiben…" />
            </>
          )}
        </>
      )}
    </div>
  )
}
