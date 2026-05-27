'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { questions as ALL_Q } from '@/data/questions'

const TOTAL_Q = 10

function pickRandomIds(): string[] {
  const copy = [...ALL_Q]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, TOTAL_Q).map(q => q.id)
}

type Phase = 'idle' | 'searching' | 'waiting' | 'error'

type RecentBattle = {
  id: string
  player1_id: string; player1_name: string
  player2_id: string | null; player2_name: string | null
  player1_points: number; player2_points: number
  winner_id: string | null; draw: boolean
  finished_at: string | null
}

const CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.battle-btn {
  width:100%; padding:1rem; border-radius:1rem; font-size:.95rem; font-weight:800;
  cursor:pointer; border:none; transition:all .2s;
  background:linear-gradient(135deg,#4f46e5,#6366f1,#8b5cf6);
  color:#fff; letter-spacing:.02em;
  box-shadow:0 4px 20px rgba(99,102,241,.35);
}
.battle-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,102,241,.45); }
.battle-btn:disabled { opacity:.5; cursor:default; transform:none; }
.cancel-btn {
  width:100%; padding:.75rem; border-radius:.85rem; font-size:.82rem; font-weight:700;
  cursor:pointer; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.2);
  color:#f87171; transition:all .15s; margin-top:.75rem;
}
.cancel-btn:hover { background:rgba(239,68,68,.14); }
.recent-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:.75rem 1rem; border-bottom:1px solid var(--border);
  font-size:.78rem; transition:background .15s;
}
.recent-row:last-child { border-bottom:none; }
.recent-row:hover { background:rgba(var(--gold-rgb),.04); }
`

export default function BattleLobby() {
  const router = useRouter()
  const [userId, setUserId]     = useState('')
  const [username, setUsername] = useState('')
  const [phase, setPhase]       = useState<Phase>('idle')
  const [myBattleId, setMyBattleId] = useState<string | null>(null)
  const [recentBattles, setRecentBattles] = useState<RecentBattle[]>([])
  const [copied, setCopied]     = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/'); return }
      const uid  = session.user.id
      const name = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Spieler'
      setUserId(uid); setUsername(name)
      supabase.from('battles')
        .select('id,player1_id,player1_name,player2_id,player2_name,player1_points,player2_points,winner_id,draw,finished_at')
        .or(`player1_id.eq.${uid},player2_id.eq.${uid}`)
        .eq('status', 'finished')
        .order('finished_at', { ascending: false })
        .limit(5)
        .then(({ data }) => data && setRecentBattles(data as RecentBattle[]))
    })
  }, [router])

  // Subscribe to own battle while waiting
  useEffect(() => {
    if (phase !== 'waiting' || !myBattleId) return
    channelRef.current = supabase.channel(`lobby-${myBattleId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'battles',
        filter: `id=eq.${myBattleId}`,
      }, (payload) => {
        if (payload.new.status === 'active') router.push(`/battle/${myBattleId}`)
      })
      .subscribe()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [phase, myBattleId, router])

  const findOpponent = useCallback(async () => {
    if (!userId || !username || phase !== 'idle') return
    setPhase('searching')

    // Try to join an existing waiting battle
    const { data: candidates } = await supabase
      .from('battles').select('id')
      .eq('status', 'waiting').neq('player1_id', userId)
      .order('created_at', { ascending: true }).limit(5)

    if (candidates && candidates.length > 0) {
      const { error } = await supabase.from('battles').update({
        player2_id: userId, player2_name: username,
        question_ids: pickRandomIds(), status: 'active',
        started_at: new Date().toISOString(),
      }).eq('id', candidates[0].id).eq('status', 'waiting')
      if (!error) { router.push(`/battle/${candidates[0].id}`); return }
    }

    // Create own battle and wait
    const { data: nb, error } = await supabase.from('battles').insert({
      player1_id: userId, player1_name: username,
    }).select('id').single()

    if (error || !nb) { setPhase('error'); return }
    setMyBattleId(nb.id)
    setPhase('waiting')
  }, [userId, username, phase, router])

  const cancel = useCallback(async () => {
    if (myBattleId) {
      await supabase.from('battles').delete().eq('id', myBattleId).eq('status', 'waiting')
    }
    setMyBattleId(null); setPhase('idle')
  }, [myBattleId])

  const copyLink = () => {
    if (!myBattleId) return
    navigator.clipboard.writeText(`${window.location.origin}/battle/${myBattleId}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem 6rem' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: '480px', margin: '0 auto', animation: 'fadeUp .5s ease both' }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'var(--surface)', borderRadius: '1.5rem',
          border: '1px solid rgba(var(--gold-rgb),.18)',
          padding: '2rem 1.5rem', marginBottom: '1.25rem', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(var(--gold-rgb),.12),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>⚔️</div>
          <h1 style={{ margin: '0 0 .4rem', fontSize: '1.45rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-.01em' }}>
            Battle gegen Freunde
          </h1>
          <p style={{ margin: '0 0 1.5rem', fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
            10 Zufallsfragen · 10 Sekunden pro Frage · Wer schneller & richtiger antwortet, gewinnt
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { icon: '❓', label: '10 Fragen' },
              { icon: '⏱', label: '10 Sek / Frage' },
              { icon: '⚡', label: 'Live-Duell' },
            ].map(b => (
              <span key={b.label} style={{
                fontSize: '.68rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100,
                background: 'rgba(var(--gold-rgb),.08)', color: 'var(--gold)',
                border: '1px solid rgba(var(--gold-rgb),.2)',
              }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>

          {/* ── Buttons ── */}
          {phase === 'idle' && (
            <button className="battle-btn" onClick={findOpponent}>
              🎯 Zufälligen Gegner suchen
            </button>
          )}

          {phase === 'searching' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', padding: '.9rem', background: 'rgba(var(--gold-rgb),.05)', borderRadius: '1rem', border: '1px solid rgba(var(--gold-rgb),.15)' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(var(--gold-rgb),.2)', borderTop: '2.5px solid var(--gold)', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--gold)' }}>Gegner wird gesucht…</span>
            </div>
          )}

          {phase === 'waiting' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem', padding: '.9rem', background: 'rgba(var(--gold-rgb),.05)', borderRadius: '1rem', border: '1px solid rgba(var(--gold-rgb),.15)', marginBottom: '.75rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 1.5s ease infinite' }} />
                  <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text)' }}>Warte auf Gegner…</span>
                </div>
                <p style={{ fontSize: '.72rem', color: 'var(--text-dim)', marginBottom: '.75rem' }}>
                  Teile den Link um einen Freund direkt einzuladen:
                </p>
                <button
                  onClick={copyLink}
                  style={{
                    width: '100%', padding: '.65rem', borderRadius: '.75rem', fontSize: '.78rem', fontWeight: 700,
                    background: copied ? 'rgba(34,197,94,.1)' : 'rgba(var(--gold-rgb),.08)',
                    border: `1px solid ${copied ? 'rgba(34,197,94,.3)' : 'rgba(var(--gold-rgb),.25)'}`,
                    color: copied ? '#22c55e' : 'var(--gold)', cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  {copied ? '✓ Link kopiert!' : '🔗 Battle-Link kopieren'}
                </button>
              </div>
              <button className="cancel-btn" onClick={cancel}>✕ Abbrechen</button>
            </>
          )}

          {phase === 'error' && (
            <>
              <p style={{ color: '#f87171', fontSize: '.82rem', marginBottom: '.75rem' }}>⚠ Fehler — bitte erneut versuchen.</p>
              <button className="battle-btn" onClick={() => setPhase('idle')}>Erneut versuchen</button>
            </>
          )}
        </div>

        {/* ── Regeln ── */}
        <div style={{
          background: 'var(--surface)', borderRadius: '1.25rem',
          border: '1px solid var(--border)', padding: '1.1rem 1.25rem',
          marginBottom: '1.25rem',
        }}>
          <p style={{ margin: '0 0 .75rem', fontSize: '.7rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>📋 Regeln</p>
          {[
            '10 zufällige Fragen aus dem gesamten Fragenpool',
            'Für jede richtige Antwort gibt es 1 Punkt',
            'Du hast 10 Sekunden pro Frage',
            'Bei Gleichstand gewinnt der Schnellere',
            'Keine Antwort = 0 Punkte für diese Frage',
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', gap: '.6rem', marginBottom: '.45rem', fontSize: '.78rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              {rule}
            </div>
          ))}
        </div>

        {/* ── Recent Battles ── */}
        {recentBattles.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: '1.25rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '.85rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '.7rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>🕹 Letzte Battles</p>
            </div>
            {recentBattles.map(b => {
              const isP1 = b.player1_id === userId
              const me   = isP1 ? b.player1_name : (b.player2_name ?? '?')
              const opp  = isP1 ? (b.player2_name ?? '?') : b.player1_name
              const myPts  = isP1 ? b.player1_points : b.player2_points
              const oppPts = isP1 ? b.player2_points : b.player1_points
              const won  = b.winner_id === userId
              const draw = b.draw
              return (
                <div key={b.id} className="recent-row">
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.8rem' }}>{me}</span>
                    <span style={{ color: 'var(--text-dim)', margin: '0 .4rem' }}>vs</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '.8rem' }}>{opp}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{myPts} : {oppPts}</span>
                    <span style={{
                      fontSize: '.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100,
                      background: draw ? 'rgba(var(--gold-rgb),.1)' : won ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.08)',
                      color: draw ? 'var(--gold)' : won ? '#22c55e' : '#f87171',
                      border: `1px solid ${draw ? 'rgba(var(--gold-rgb),.25)' : won ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.2)'}`,
                    }}>
                      {draw ? 'Unentschieden' : won ? '🏆 Gewonnen' : '💀 Verloren'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
