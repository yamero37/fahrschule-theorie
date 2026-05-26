'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'

/* ── Toggle Switch ── */
function Toggle({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <div style={{
      width: '44px', height: '25px', borderRadius: '13px', position: 'relative', flexShrink: 0,
      background: on ? 'var(--gold)' : 'var(--input-bg)',
      border: `1.5px solid ${on ? 'var(--gold)' : 'var(--border)'}`,
      opacity: disabled ? 0.45 : 1,
      transition: 'background 0.2s, border 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: '3px',
        left: on ? 'calc(100% - 22px)' : '3px',
        width: '17px', height: '17px', borderRadius: '50%',
        background: on ? '#0a0800' : 'var(--text-dim)',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </div>
  )
}

/* ── Section wrapper ── */
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem' }}>{icon}</span>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{title}</span>
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: '1.1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

/* ── Plain display row ── */
function InfoRow({ label, desc, value }: { label: string; desc: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', gap: '1rem', borderBottom: '1px solid var(--divider-color)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.63rem', color: 'var(--text-dim)', marginTop: '1px' }}>{desc}</p>
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, color: 'var(--text-muted)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  )
}

/* ── Main ── */
export default function EinstellungenPage() {
  const router = useRouter()
  const [username, setUsername]   = useState('')
  const [email, setEmail]         = useState('')
  const [userId, setUserId]       = useState('')
  const [loading, setLoading]     = useState(true)

  /* ── Avatar ── */
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarErr, setAvatarErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  /* ── Notifications ── */
  const [notifOn, setNotifOn]               = useState(false)
  const [notifPerm, setNotifPerm]           = useState<NotificationPermission>('default')

  /* ── Password ── */
  const [pwOpen, setPwOpen]         = useState(false)
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwMsg, setPwMsg]           = useState('')
  const [pwErr, setPwErr]           = useState('')
  const [resetSent, setResetSent]   = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/'); return }
      const uid = session.user.id
      setUserId(uid)
      setUsername(session.user.user_metadata?.username || session.user.email?.split('@')[0] || '')
      setEmail(session.user.email || '')

      const { data: stats } = await supabase.from('user_stats').select('avatar_url').eq('user_id', uid).single()
      if (stats?.avatar_url) setAvatarUrl(stats.avatar_url)

      setLoading(false)
    })

    try {
      setNotifOn(localStorage.getItem('notif_appointments') === 'true')
      if (typeof Notification !== 'undefined') setNotifPerm(Notification.permission)
    } catch {}
  }, [router])

  /* ── Upload avatar ── */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!userId) { setAvatarErr('Nicht eingeloggt. Bitte Seite neu laden.'); return }

    setAvatarErr('')
    if (file.size > 2 * 1024 * 1024) { setAvatarErr('Bild darf max. 2 MB groß sein.'); return }
    setUploading(true)

    try {
      const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${userId}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (upErr) {
        console.error('Avatar upload error:', upErr)
        setAvatarErr('Upload fehlgeschlagen: ' + upErr.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = publicUrl + '?t=' + Date.now()

      const { error: dbErr } = await supabase
        .from('user_stats')
        .upsert({ user_id: userId, avatar_url: url }, { onConflict: 'user_id' })

      if (dbErr) {
        console.error('Avatar DB error:', dbErr)
        setAvatarErr('Gespeichert, aber DB-Fehler: ' + dbErr.message)
      } else {
        setAvatarUrl(url)
      }
    } catch (err: unknown) {
      console.error('Avatar unexpected error:', err)
      setAvatarErr('Unerwarteter Fehler. Bitte erneut versuchen.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  /* ── Toggle notifications ── */
  async function toggleNotif() {
    if (typeof Notification === 'undefined') return
    if (notifPerm === 'denied') return // blocked in browser

    if (notifOn) {
      localStorage.setItem('notif_appointments', 'false')
      setNotifOn(false)
      return
    }

    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
    const granted = perm === 'granted'
    localStorage.setItem('notif_appointments', granted ? 'true' : 'false')
    setNotifOn(granted)

    if (granted) {
      new Notification('TolDrive Benachrichtigungen', {
        body: 'Du wirst jetzt über bestätigte Termine informiert 🔔',
        icon: '/favicon.ico',
      })
    }
  }

  /* ── Change password ── */
  async function changePassword() {
    setPwErr('')
    if (!newPw) { setPwErr('Bitte neues Passwort eingeben.'); return }
    if (newPw.length < 6) { setPwErr('Mindestens 6 Zeichen.'); return }
    if (newPw !== confirmPw) { setPwErr('Passwörter stimmen nicht überein.'); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwLoading(false)
    if (error) { setPwErr(error.message); return }
    setPwMsg('✓ Passwort erfolgreich geändert!')
    setNewPw(''); setConfirmPw('')
    setTimeout(() => { setPwMsg(''); setPwOpen(false) }, 2500)
  }

  async function sendResetEmail() {
    if (!email || resetSent) return
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/einstellungen`,
    })
    setResetSent(true)
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(var(--gold-rgb),0.15)', borderTop: '3px solid var(--gold)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const notifDesc = notifPerm === 'denied'
    ? 'In Browser-Einstellungen blockiert'
    : notifOn
      ? 'Aktiv · du wirst bei Terminbestätigung benachrichtigt'
      : 'Terminerinnerungen wenn Termin bestätigt wird'

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '84px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <button onClick={() => router.back()} style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'var(--input-bg)', border: '1px solid var(--input-border)',
            color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>Einstellungen</h1>
            <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-dim)' }}>Dein Konto verwalten</p>
          </div>
        </div>

        {/* ── Profil ── */}
        <Section title="Profil" icon="👤">

          {/* Avatar upload */}
          <label
            htmlFor="avatar-input"
            style={{
              padding: '1.1rem 1rem', borderBottom: '1px solid var(--divider-color)',
              display: 'flex', alignItems: 'center', gap: '1rem',
              cursor: uploading ? 'default' : 'pointer',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                background: 'rgba(var(--gold-rgb),0.08)',
                border: '2px solid rgba(var(--gold-rgb),0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '1.6rem' }}>👤</span>
                }
              </div>
              {/* Camera badge */}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '24px', height: '24px', borderRadius: '50%',
                background: uploading ? 'var(--border)' : 'var(--gold)',
                border: '2px solid var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                pointerEvents: 'none',
              }}>
                {uploading ? '⏳' : '📷'}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Profilbild</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.63rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {uploading
                  ? 'Wird hochgeladen…'
                  : 'Tippen um Bild auszuwählen · max. 2 MB'}
              </p>
              {avatarErr && <p style={{ margin: '4px 0 0', fontSize: '0.63rem', color: '#f87171' }}>{avatarErr}</p>}
            </div>

            <input
              id="avatar-input"
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>

          <InfoRow label="Benutzername" desc="Dein angezeigter Name in der App" value={username} />
          <InfoRow label="E-Mail" desc="Deine Anmeldedaten" value={email} />
        </Section>

        {/* ── App ── */}
        <Section title="App" icon="📱">

          {/* Notifications row */}
          <div
            onClick={notifPerm !== 'denied' ? toggleNotif : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem', gap: '1rem',
              borderBottom: '1px solid var(--divider-color)',
              cursor: notifPerm === 'denied' ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (notifPerm !== 'denied') (e.currentTarget as HTMLDivElement).style.background = 'rgba(var(--gold-rgb),0.04)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>🔔</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>Benachrichtigungen</p>
                <p style={{ margin: '1px 0 0', fontSize: '0.63rem', color: notifPerm === 'denied' ? '#f87171' : 'var(--text-dim)' }}>
                  {notifDesc}
                </p>
              </div>
            </div>
            <Toggle on={notifOn} disabled={notifPerm === 'denied'} />
          </div>

          <InfoRow label="Sprache" desc="App-Sprache" value="Deutsch" />
        </Section>

        {/* ── Konto ── */}
        <Section title="Konto" icon="🔐">

          {/* Password change — expandable */}
          <div>
            <div
              onClick={() => { setPwOpen(v => !v); setPwErr(''); setPwMsg(''); setResetSent(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.85rem 1rem', gap: '1rem', cursor: 'pointer',
                borderBottom: pwOpen ? '1px solid var(--divider-color)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(var(--gold-rgb),0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>Passwort ändern</p>
                <p style={{ margin: '1px 0 0', fontSize: '0.63rem', color: 'var(--text-dim)' }}>Neues Passwort setzen</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', transition: 'transform 0.2s', display: 'inline-block', transform: pwOpen ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>

            {pwOpen && (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Neues Passwort (min. 6 Zeichen)"
                  style={inputStyle}
                />
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') changePassword() }}
                  placeholder="Passwort bestätigen"
                  style={inputStyle}
                />

                {pwErr && <p style={{ margin: 0, fontSize: '0.7rem', color: '#f87171' }}>⚠ {pwErr}</p>}
                {pwMsg && <p style={{ margin: 0, fontSize: '0.7rem', color: '#22c55e' }}>{pwMsg}</p>}

                <button
                  onClick={changePassword}
                  disabled={pwLoading}
                  style={{
                    padding: '0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                    background: 'rgba(var(--gold-rgb),0.12)', border: '1px solid rgba(var(--gold-rgb),0.28)',
                    color: 'var(--gold)', cursor: pwLoading ? 'default' : 'pointer',
                    opacity: pwLoading ? 0.6 : 1,
                  }}
                >
                  {pwLoading ? 'Wird gespeichert…' : 'Passwort ändern'}
                </button>

                {/* Forgot password */}
                <div style={{ borderTop: '1px solid var(--divider-color)', paddingTop: '8px', marginTop: '2px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '0.63rem', color: 'var(--text-dim)' }}>
                    Passwort vergessen?
                  </p>
                  {resetSent
                    ? <p style={{ margin: 0, fontSize: '0.7rem', color: '#22c55e' }}>✓ E-Mail gesendet! Prüfe dein Postfach.</p>
                    : (
                      <button
                        onClick={sendResetEmail}
                        style={{
                          padding: '0.55rem 0.9rem', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 600,
                          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                          color: 'var(--text-muted)', cursor: 'pointer',
                        }}
                      >
                        Reset-E-Mail senden →
                      </button>
                    )
                  }
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ── Abmelden ── */}
        <div style={{ marginTop: '0.5rem' }}>
          <button
            onClick={async () => { await signOut(); window.location.href = '/' }}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '1rem',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.13)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)' }}
          >
            Abmelden
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '1.5rem', opacity: 0.5 }}>
          TolDrive · Version 1.0
        </p>

      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.55rem 0.8rem',
  background: 'var(--input-bg)', border: '1px solid var(--input-border)',
  borderRadius: '8px', color: 'var(--text)', fontSize: '0.76rem',
  fontFamily: 'inherit', outline: 'none',
}
