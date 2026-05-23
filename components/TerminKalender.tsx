'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

/* ── helpers ── */
const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const DAYS_DE   = ['Mo','Di','Mi','Do','Fr','Sa','So']

function pad(n: number) { return n.toString().padStart(2, '0') }
function minsToTime(m: number) { return `${pad(Math.floor(m / 60))}:${pad(m % 60)}` }
function isoDate(y: number, mo: number, d: number) { return `${y}-${pad(mo + 1)}-${pad(d)}` }
function getDaysInMonth(y: number, mo: number) { return new Date(y, mo + 1, 0).getDate() }
function firstDayOfMonth(y: number, mo: number) { return (new Date(y, mo, 1).getDay() + 6) % 7 }
// weekday: 0=Mo … 5=Sa … 6=So
function weekDayOf(dateStr: string) { return (new Date(dateStr + 'T12:00:00').getDay() + 6) % 7 }

/* ISO week start (Monday) and end (Sunday) for a given date string */
function weekRange(dateStr: string): { start: string; end: string } {
  const d = new Date(dateStr + 'T12:00:00')
  const dayIdx = (d.getDay() + 6) % 7  // 0=Mo
  const mon = new Date(d); mon.setDate(d.getDate() - dayIdx)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt = (x: Date) => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
  return { start: fmt(mon), end: fmt(sun) }
}

/* Slot generation */
function makeSlots(startH: number, endH: number, durMin: number): number[] {
  const out: number[] = []
  for (let t = startH * 60; t + durMin <= endH * 60; t += 45) out.push(t)
  return out
}

function getSlotsForDay(isSaturday: boolean, durMin: number): { morning: number[]; evening: number[] | null } {
  if (isSaturday) {
    return {
      morning: makeSlots(12, 15, durMin),
      evening: makeSlots(19, 23, durMin),
    }
  }
  return { morning: makeSlots(12, 22, durMin), evening: null }
}

type Booked = { id: string; student_id: string; start_time: string; duration_min: number; status: string }
type Appointment = { id: string; date: string; start_time: string; duration_min: number; status: string; note?: string }

function slotLabel(start: number, dur: number) {
  return `${minsToTime(start)} – ${minsToTime(start + dur)} Uhr`
}

function slotsOverlap(aS: number, aD: number, bS: number, bD: number) {
  return aS < bS + bD && aS + aD > bS
}

function StatusBadge({ s }: { s: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string; border: string }> = {
    pending:  { label: 'Ausstehend', bg: 'rgba(201,162,39,0.1)', color: 'var(--gold)',   border: 'rgba(201,162,39,0.3)' },
    accepted: { label: 'Bestätigt',  bg: 'rgba(34,197,94,0.08)', color: '#22c55e',       border: 'rgba(34,197,94,0.25)' },
    rejected: { label: 'Abgelehnt', bg: 'rgba(239,68,68,0.08)', color: '#f87171',       border: 'rgba(239,68,68,0.25)' },
  }
  const c = cfg[s] ?? cfg.pending
  return (
    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

/* ── Slot button ── */
function SlotBtn({ start, dur, booked, mine, selected, onClick }: {
  start: number; dur: number; booked: boolean; mine: boolean; selected: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={booked} style={{
      padding: '8px 6px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 600, textAlign: 'center',
      border: selected ? '1.5px solid var(--gold)' : mine ? '1px solid rgba(34,197,94,0.4)' : booked ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.08)',
      background: selected ? 'rgba(201,162,39,0.15)' : mine ? 'rgba(34,197,94,0.08)' : booked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
      color: selected ? 'var(--gold)' : mine ? '#22c55e' : booked ? '#1e1a0a' : 'var(--text-muted)',
      cursor: booked ? 'default' : 'pointer', transition: 'all 0.1s',
    }}>
      {minsToTime(start)}
      {mine && <span style={{ display: 'block', fontSize: '0.52rem', marginTop: '1px', color: '#22c55e' }}>Dein Termin</span>}
      {booked && !mine && <span style={{ display: 'block', fontSize: '0.52rem', marginTop: '1px', color: '#2a2520' }}>Belegt</span>}
    </button>
  )
}

/* ── Main component ── */

export default function TerminKalender({ userId, username }: { userId: string; username: string }) {
  const YEAR = 2026
  const todayIso = isoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  const [month, setMonth] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [duration, setDuration] = useState<45 | 90>(45)
  const [bookedSlots, setBookedSlots] = useState<Booked[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [step, setStep] = useState<'pick' | 'success'>('pick')
  const [submitting, setSubmitting] = useState(false)
  const [myAppts, setMyAppts] = useState<Appointment[]>([])
  const [showMyAppts, setShowMyAppts] = useState(false)
  const [weekError, setWeekError] = useState('')

  // Admin settings
  const [saturdayEnabled, setSaturdayEnabled] = useState(false)
  const [multiBookingEnabled, setMultiBookingEnabled] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  /* load admin settings */
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        setSaturdayEnabled(d.saturday_enabled === 'true')
        setMultiBookingEnabled(d.multi_booking_enabled === 'true')
        setSettingsLoaded(true)
      })
      .catch(() => setSettingsLoaded(true))
  }, [])

  /* load booked slots when date changes */
  useEffect(() => {
    if (!selectedDate) { setBookedSlots([]); return }
    setSelectedSlot(null)
    setWeekError('')
    supabase
      .from('appointments')
      .select('id, student_id, start_time, duration_min, status')
      .eq('date', selectedDate)
      .neq('status', 'rejected')
      .then(({ data }) => setBookedSlots(data ?? []))
  }, [selectedDate])

  /* load my appointments */
  useEffect(() => {
    if (!userId) return
    supabase
      .from('appointments')
      .select('id, date, start_time, duration_min, status, note')
      .eq('student_id', userId)
      .order('date', { ascending: true })
      .then(({ data }) => setMyAppts(data ?? []))
  }, [userId, step])

  function isBooked(slotStart: number, dur: number) {
    return bookedSlots.some(b => {
      const [h, m] = b.start_time.split(':').map(Number)
      return slotsOverlap(slotStart, dur, h * 60 + m, b.duration_min)
    })
  }

  function isMySlot(slotStart: number) {
    return bookedSlots.some(b => {
      const [h, m] = b.start_time.split(':').map(Number)
      return b.student_id === userId && h * 60 + m === slotStart
    })
  }

  async function checkWeekLimit(date: string): Promise<boolean> {
    if (multiBookingEnabled) return true
    const { start, end } = weekRange(date)
    const { data } = await supabase
      .from('appointments')
      .select('id')
      .eq('student_id', userId)
      .neq('status', 'rejected')
      .gte('date', start)
      .lte('date', end)
    const count = (data ?? []).length
    if (count >= 1) {
      setWeekError('Du hast bereits einen Termin in dieser Woche. Dein Fahrlehrer kann mehrere Termine freischalten.')
      return false
    }
    return true
  }

  async function handleSlotClick(start: number) {
    if (!selectedDate) return
    if (selectedSlot === start) { setSelectedSlot(null); setWeekError(''); return }
    setWeekError('')
    const ok = await checkWeekLimit(selectedDate)
    if (ok) setSelectedSlot(start)
  }

  async function submitBooking() {
    if (!selectedDate || selectedSlot === null || submitting) return
    setSubmitting(true)
    const ok = await checkWeekLimit(selectedDate)
    if (!ok) { setSubmitting(false); return }
    const { error } = await supabase.from('appointments').insert({
      student_id: userId,
      student_name: username,
      date: selectedDate,
      start_time: minsToTime(selectedSlot),
      duration_min: duration,
      status: 'pending',
      note: note.trim() || null,
    })
    setSubmitting(false)
    if (!error) { setStep('success') }
  }

  /* Calendar grid */
  const daysInMonth = getDaysInMonth(YEAR, month)
  const firstDay    = firstDayOfMonth(YEAR, month)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isSat = selectedDate ? weekDayOf(selectedDate) === 5 : false
  const { morning: morningSlots, evening: eveningSlots } = getSlotsForDay(isSat, duration)

  /* ── Success ── */
  if (step === 'success') return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ margin: '0 0 0.5rem', color: '#22c55e', fontWeight: 900 }}>Anfrage gesendet!</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Dein Fahrlehrer wird deinen Termin bald bestätigen.
      </p>
      <button onClick={() => { setStep('pick'); setSelectedDate(null) }} style={{
        padding: '0.75rem 2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
        background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.35)',
        color: 'var(--gold)', cursor: 'pointer',
      }}>
        Weiteren Termin buchen
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* My appointments */}
      {myAppts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => setShowMyAppts(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0.65rem 1.25rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-muted)', cursor: 'pointer',
          }}>
            📋 Meine Termine ({myAppts.length}) <span>{showMyAppts ? '▲' : '▼'}</span>
          </button>
          {showMyAppts && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {myAppts.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
                  padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                      {new Date(a.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {slotLabel(parseInt(a.start_time) * 60 + parseInt(a.start_time.split(':')[1]), a.duration_min)} · {a.duration_min} Min.
                    </p>
                  </div>
                  <StatusBadge s={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }} className="termin-grid">

        {/* ── Calendar ── */}
        <div style={{ background: 'rgba(14,12,8,0.9)', border: '1px solid rgba(201,162,39,0.18)', borderRadius: '1.25rem', padding: '1.25rem' }}>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={() => setMonth(m => Math.max(0, m - 1))} disabled={month === 0}
              style={{ background: 'none', border: 'none', color: month === 0 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: month === 0 ? 'default' : 'pointer', fontSize: '1.1rem', padding: '4px 8px' }}>‹</button>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)' }}>{MONTHS_DE[month]} {YEAR}</p>
            <button onClick={() => setMonth(m => Math.min(11, m + 1))} disabled={month === 11}
              style={{ background: 'none', border: 'none', color: month === 11 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: month === 11 ? 'default' : 'pointer', fontSize: '1.1rem', padding: '4px 8px' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
            {DAYS_DE.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, padding: '4px 0',
                color: i === 5 ? (saturdayEnabled ? 'var(--gold)' : '#2e2510') : i < 5 ? 'var(--gold)' : 'var(--text-dim)',
                letterSpacing: '0.05em',
              }}>
                {d}{i === 5 && !saturdayEnabled && ' 🔒'}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />
              const wd = idx % 7 // 0=Mo…5=Sa…6=So
              const isSunday = wd === 6
              const isSaturday = wd === 5
              const isDisabled = isSunday || (isSaturday && !saturdayEnabled)
              const dateStr = isoDate(YEAR, month, day)
              const isPast = dateStr < todayIso
              const isSelected = dateStr === selectedDate

              return (
                <button key={idx}
                  onClick={() => { if (!isDisabled && !isPast) setSelectedDate(dateStr) }}
                  disabled={isDisabled || isPast}
                  style={{
                    aspectRatio: '1', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600,
                    border: isSelected ? '1.5px solid var(--gold)' : '1px solid transparent',
                    background: isSelected ? 'rgba(201,162,39,0.18)' : isDisabled || isPast ? 'transparent' : 'rgba(255,255,255,0.03)',
                    color: isSelected ? 'var(--gold)' : isDisabled || isPast ? '#2a2520' : isSaturday && saturdayEnabled ? 'rgba(201,162,39,0.7)' : 'var(--text-muted)',
                    cursor: isDisabled || isPast ? 'default' : 'pointer',
                    transition: 'all 0.1s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '0.85rem', display: 'flex', gap: '10px', fontSize: '0.57rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
            <span>🟡 Mo–Fr verfügbar</span>
            {saturdayEnabled && <span style={{ color: 'rgba(201,162,39,0.7)' }}>⚡ Sa: 12–15 & 19–23 Uhr</span>}
            {!saturdayEnabled && <span>🔒 Sa gesperrt</span>}
          </div>
        </div>

        {/* ── Time slots ── */}
        <div>
          {!selectedDate ? (
            <div style={{ background: 'rgba(14,12,8,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              Wähle links ein Datum.
            </div>
          ) : (
            <div style={{ background: 'rgba(14,12,8,0.9)', border: '1px solid rgba(201,162,39,0.18)', borderRadius: '1.25rem', padding: '1.25rem' }}>

              <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Termin für</p>
              <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)' }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}
                {isSat && <span style={{ marginLeft: '8px', fontSize: '0.62rem', color: 'rgba(201,162,39,0.8)', fontWeight: 700 }}>Samstag-Zeiten</span>}
              </p>

              {/* Duration toggle */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
                {([45, 90] as const).map(d => (
                  <button key={d} onClick={() => { setDuration(d); setSelectedSlot(null) }} style={{
                    flex: 1, padding: '7px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700,
                    border: duration === d ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    background: duration === d ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.03)',
                    color: duration === d ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer',
                  }}>
                    {d} Min
                  </button>
                ))}
              </div>

              {/* Morning slots */}
              {isSat && <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Vormittag · 12:00–15:00</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: isSat && eveningSlots ? '0.85rem' : '1rem' }}>
                {morningSlots.map(start => (
                  <SlotBtn key={start} start={start} dur={duration}
                    booked={isBooked(start, duration)} mine={isMySlot(start)}
                    selected={selectedSlot === start}
                    onClick={() => handleSlotClick(start)}
                  />
                ))}
              </div>

              {/* Evening slots (Saturday only) */}
              {isSat && eveningSlots && (
                <>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Abend · 19:00–23:00</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '1rem' }}>
                    {eveningSlots.map(start => (
                      <SlotBtn key={start} start={start} dur={duration}
                        booked={isBooked(start, duration)} mine={isMySlot(start)}
                        selected={selectedSlot === start}
                        onClick={() => handleSlotClick(start)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Week error */}
              {weekError && (
                <div style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '8px', padding: '0.6rem 0.85rem', marginBottom: '0.75rem' }}>
                  ⚠ {weekError}
                </div>
              )}

              {/* Booking form */}
              {selectedSlot !== null && !weekError && (
                <>
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.63rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Ausgewählt: {slotLabel(selectedSlot, duration)}
                  </p>
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Anmerkung (optional)…" rows={2}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.76rem', fontFamily: 'inherit', outline: 'none', resize: 'none', marginBottom: '0.75rem' }}
                  />
                  <button onClick={submitBooking} disabled={submitting} style={{
                    width: '100%', padding: '0.8rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    color: '#0a0800', border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1,
                  }}>
                    {submitting ? 'Wird gesendet…' : '🚗 Fahrstunde anfragen'}
                  </button>
                </>
              )}

              {!settingsLoaded && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.5rem' }}>Lädt…</p>}
            </div>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 640px) { .termin-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
