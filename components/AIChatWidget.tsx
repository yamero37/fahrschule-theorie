'use client'

import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 100)
    }
  }, [messages, open])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Msg = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Fehler beim Laden der Antwort.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'absolute', bottom: '64px', right: 0,
          width: '340px', height: '500px',
          background: '#0e0c08',
          border: '1px solid rgba(201,162,39,0.25)',
          borderRadius: '1.25rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '0.85rem 1rem',
            borderBottom: '1px solid rgba(201,162,39,0.1)',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(201,162,39,0.04)',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>TolDrive KI</p>
              <p style={{ margin: 0, fontSize: '0.6rem', color: '#22c55e', fontWeight: 600 }}>● Führerschein Experte</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem',
                width: '26px', height: '26px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem',
              }}>
                <span style={{ fontSize: '2.5rem' }}>🚗</span>
                <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.7 }}>
                  Ich bin dein persönlicher Führerschein-Experte. Frag mich über Verkehrsregeln, Zeichen, Vorfahrt oder Prüfungsfragen!
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '0.25rem' }}>
                  {['Vorfahrtsregeln', 'Promillegrenzen', 'Parkverbote'].map(hint => (
                    <button
                      key={hint}
                      onClick={() => { setInput(hint); inputRef.current?.focus() }}
                      style={{
                        fontSize: '0.68rem', padding: '3px 10px', borderRadius: '20px',
                        background: 'rgba(201,162,39,0.08)', color: 'var(--gold)',
                        border: '1px solid rgba(201,162,39,0.2)', cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >{hint}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '0.5rem 0.85rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'rgba(201,162,39,0.14)' : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' ? '1px solid rgba(201,162,39,0.22)' : '1px solid rgba(255,255,255,0.07)',
                  fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex' }}>
                <div style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: '0.75rem', color: 'var(--text-dim)',
                }}>
                  Denke nach…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.6rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', gap: '6px',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Frage stellen…"
              maxLength={500}
              style={{
                flex: 1, padding: '0.6rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                color: 'var(--text)', outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.35)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                padding: '0.6rem 0.9rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))'
                  : 'rgba(255,255,255,0.04)',
                color: input.trim() && !loading ? '#000' : 'var(--text-dim)',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >↑</button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="KI Assistent"
        style={{
          width: '54px', height: '54px', borderRadius: '50%',
          background: open
            ? 'rgba(201,162,39,0.12)'
            : 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))',
          border: open ? '1px solid rgba(201,162,39,0.4)' : '2px solid transparent',
          color: open ? 'var(--gold)' : '#000',
          fontSize: open ? '1.1rem' : '1.5rem',
          cursor: 'pointer',
          boxShadow: open ? '0 0 0 1px rgba(201,162,39,0.2)' : '0 4px 20px rgba(201,162,39,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  )
}
