'use client'

import { useState, useEffect, useCallback } from 'react'

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata: { username?: string }
}

function onlineStatus(lastSignIn: string | null): { label: string; color: string } {
  if (!lastSignIn) return { label: 'Nie', color: 'var(--text-dim)' }
  const diff = Date.now() - new Date(lastSignIn).getTime()
  const minutes = diff / 60000
  if (minutes < 30) return { label: 'Online', color: '#22c55e' }
  if (minutes < 60 * 24) return { label: 'Heute', color: '#c9a227' }
  const days = Math.floor(diff / 86400000)
  return { label: `vor ${days}d`, color: 'var(--text-dim)' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', username: '' })
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token')
    if (saved) setToken(saved)
  }, [])

  const loadUsers = useCallback(async (tok: string) => {
    setLoading(true)
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${tok}` },
    })
    const data = await res.json()
    if (data.users) setUsers(data.users)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (token) loadUsers(token)
  }, [token, loadUsers])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (data.ok) {
      sessionStorage.setItem('admin_token', data.token)
      setToken(data.token)
    } else {
      setAuthError('Falsches Passwort')
    }
  }

  async function handleDelete(id: string) {
    if (!token) return
    setDeleteId(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id))
    }
    setDeleteId(null)
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setAddError('')
    setAddLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newUser),
    })
    const data = await res.json()
    setAddLoading(false)
    if (data.error) {
      setAddError(data.error)
    } else {
      setShowAdd(false)
      setNewUser({ email: '', password: '', username: '' })
      loadUsers(token)
    }
  }

  const onlineCount = users.filter(u => {
    if (!u.last_sign_in_at) return false
    return Date.now() - new Date(u.last_sign_in_at).getTime() < 30 * 60000
  }).length

  /* ── Login Screen ── */
  if (!token) {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{
          width: '100%', maxWidth: '360px', padding: '2.5rem',
          background: 'var(--surface)',
          border: '1px solid rgba(201,162,39,0.25)',
          borderRadius: '1rem',
          boxShadow: '0 0 40px rgba(201,162,39,0.08)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔐</div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>TolDrive · Nur für Administratoren</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Passwort</label>
              <input
                type="password"
                className="form-input"
                placeholder="Admin-Passwort eingeben"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              {authError && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.4rem' }}>{authError}</p>
              )}
            </div>
            <button type="submit" className="btn-gold" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', border: 'none' }}>
              Anmelden
            </button>
          </form>
        </div>
      </div>
    )
  }

  /* ── Admin Dashboard ── */
  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>TolDrive Nutzerverwaltung</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatBadge label="Gesamt" value={users.length} />
            <StatBadge label="Online" value={onlineCount} green />
            <button
              onClick={() => { sessionStorage.removeItem('admin_token'); setToken(null) }}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer',
              }}
            >
              Abmelden
            </button>
          </div>
        </div>

        {/* Add User Toggle */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="btn-ghost"
            style={{ padding: '8px 18px', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid rgba(201,162,39,0.3)' }}
          >
            {showAdd ? '✕ Abbrechen' : '+ Nutzer hinzufügen'}
          </button>
        </div>

        {/* Add User Form */}
        {showAdd && (
          <div style={{
            background: 'var(--surface)', border: '1px solid rgba(201,162,39,0.2)',
            borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem',
          }}>
            <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">Benutzername</label>
                <input className="form-input" placeholder="max_muster" value={newUser.username}
                  onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">E-Mail</label>
                <input className="form-input" type="email" placeholder="max@example.de" value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Passwort</label>
                <input className="form-input" type="password" placeholder="Mindestens 6 Zeichen" value={newUser.password}
                  onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn-gold"
                  style={{ width: '100%', textAlign: 'center', cursor: 'pointer', border: 'none', opacity: addLoading ? 0.7 : 1 }}
                  disabled={addLoading}>
                  {addLoading ? 'Erstelle...' : 'Erstellen'}
                </button>
              </div>
            </form>
            {addError && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.75rem' }}>{addError}</p>}
          </div>
        )}

        {/* Users Table */}
        <div style={{
          background: 'var(--surface)', border: '1px solid rgba(201,162,39,0.18)',
          borderRadius: '0.75rem', overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Lade Nutzer...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Noch keine registrierten Nutzer
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
                    {['Status', 'Benutzername', 'E-Mail', 'Registriert', 'Zuletzt aktiv', ''].map(h => (
                      <th key={h} style={{
                        padding: '0.85rem 1rem', textAlign: 'left',
                        color: 'var(--text-muted)', fontWeight: 700,
                        fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const status = onlineStatus(user.last_sign_in_at)
                    const username = user.user_metadata?.username || '—'
                    return (
                      <tr key={user.id} style={{
                        borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.72rem', fontWeight: 700,
                            color: status.color,
                          }}>
                            <span style={{
                              width: '7px', height: '7px', borderRadius: '50%',
                              background: status.color, display: 'inline-block', flexShrink: 0,
                            }} />
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text)', fontWeight: 600 }}>{username}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(user.created_at)}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deleteId === user.id}
                            style={{
                              padding: '5px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                              border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer',
                              opacity: deleteId === user.id ? 0.5 : 1, transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                          >
                            {deleteId === user.id ? '...' : 'Löschen'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reload */}
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button
            onClick={() => token && loadUsers(token)}
            style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600,
              background: 'transparent', color: 'var(--text-muted)',
              border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            }}
          >
            Aktualisieren
          </button>
        </div>

      </div>
    </div>
  )
}

function StatBadge({ label, value, green }: { label: string; value: number; green?: boolean }) {
  return (
    <div style={{
      padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
      background: green ? 'rgba(34,197,94,0.1)' : 'rgba(201,162,39,0.08)',
      color: green ? '#22c55e' : 'var(--gold)',
      border: `1px solid ${green ? 'rgba(34,197,94,0.25)' : 'rgba(201,162,39,0.2)'}`,
    }}>
      {value} {label}
    </div>
  )
}
