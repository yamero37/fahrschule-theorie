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
// weekday index: 0=Mo … 5=Sa … 6=So
function weekDayOf(dateStr: string) { return (new Date(dateStr + 'T12:00:00').getDay() + 6) % 7 }

function weekRange(dateStr: string): { start: string; end: string } {
  const d = new Date(dateStr + 'T12:00:00')
  const dayIdx = (d.getDay() + 6) % 7
  const mon = new Date(d); mon.setDate(d.getDate() - dayIdx)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt = (x: Date) => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
  return { start: fmt(mon), end: fmt(sun) }
}

/* ── Niedersachsen public holidays 2026 ── */
// Easter Sunday 2026: April 5
const HOLIDAYS_2026 = new Set([
  '2026-01-01', // Neujahr
  '2026-04-03', // Karfreitag
  '2026-04-06', // Ostermontag
  '2026-05-01', // Tag der Arbeit
  '2026-05-14', // Christi Himmelfahrt
  '2026-05-25', // Pfingstmontag
  '2026-10-03', // Tag der deutschen Einheit
  '2026-10-31', // Reformationstag (Niedersachsen)
  '2026-12-25', // 1. Weihnachtstag
  '2026-12-26', // 2. Weihnachtstag
])

const HOLIDAY_NAMES: Record<string, string> = {
  '2026-01-01': 'Neujahr',
  '2026-04-03': 'Karfreitag',
  '2026-04-06': 'Ostermontag',
  '2026-05-01': 'Tag der Arbeit',
  '2026-05-14': 'Christi Himmelfahrt',
  '2026-05-25': 'Pfingstmontag',
  '2026-10-03': 'Tag der deutschen Einheit',
  '2026-10-31': 'Reformationstag',
  '2026-12-25': '1. Weihnachtstag',
  '2026-12-26': '2. Weihnachtstag',
}

/* ── Slot generation (all in minutes) ── */
function makeSlots(startMin: number, endMin: number, durMin: number): number[] {
  const out: number[] = []
  for (let t = startMin; t + durMin <= endMin; t += durMin) out.push(t)
  return out
}

// Normal single appointments — weekday-specific end times
function getNormalSlots(wd: number, durMin: number): { morning: number[]; evening: number[] | null } {
  if (wd === 5) {
    return {
      morning: makeSlots(12 * 60, 15 * 60, durMin),
      evening: makeSlots(19 * 60, 23 * 60, durMin),
    }
  }
  // Friday ends 20:30, all other weekdays end 22:00
  const endMin = wd === 4 ? 20 * 60 + 30 : 22 * 60
  return { morning: makeSlots(12 * 60, endMin, durMin), evening: null }
}

// Regeltermin slots — different window per weekday
const REGEL_RANGES: Record<number, [number, number]> = {
  0: [15 * 60,      17 * 60 + 30], // Monday    15:00–17:30
  1: [15 * 60,      17 * 60 + 30], // Tuesday   15:00–17:30
  2: [12 * 60 + 30, 17 * 60 + 30], // Wednesday 12:30–17:30
  3: [12 * 60,      22 * 60],       // Thursday  12:00–22:00
  4: [15 * 60,      20 * 60 + 30], // Friday    15:00–20:30
}

function getRegelSlots(wd: number, durMin: number): { morning: number[]; evening: number[] | null } {
  const range = REGEL_RANGES[wd]
  if (!range) return { morning: [], evening: null }
  return { morning: makeSlots(range[0], range[1], durMin), evening: null }
}

type Booked = { id: string; student_id: string; start_time: string; duration_min: number; status: string }
type Appointment = { id: string; date: string; start_time: string; duration_min: number; status: string; note?: string; appointment_type?: string }

function slotLabel(start: number, dur: number) {
  return `${minsToTime(start)} – ${minsToTime(start + dur)} Uhr`
}

function slotsOverlap(aS: number, aD: number, bS: number, bD: number) {
  return aS < bS + bD && aS + aD > bS
}

function StatusBadge({ s }: { s: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string; border: string }> = {
    pending:  { label: 'Ausstehend', bg: 'rgba(var(--gold-rgb),0.1)',  color: 'var(--gold)', border: 'rgba(var(--gold-rgb),0.3)' },
    accepted: { label: 'Bestätigt',  bg: 'rgba(34,197,94,0.08)', color: '#22c55e',     border: 'rgba(34,197,94,0.25)' },
    rejected: { label: 'Abgelehnt', bg: 'rgba(239,68,68,0.08)', color: '#f87171',     border: 'rgba(239,68,68,0.25)' },
  }
  const c = cfg[s] ?? cfg.pending
  return (
    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

/* ── Slot button ── */
function SlotBtn({ start, dur, booked, accepted, mine, mineAccepted, selected, onClick }: {
  start: number; dur: number; booked: boolean; accepted: boolean
  mine: boolean; mineAccepted: boolean; selected: boolean; onClick: () => void
}) {
  const bg = selected       ? 'rgba(var(--gold-rgb),0.15)'
    : mineAccepted          ? 'rgba(34,197,94,0.15)'
    : mine                  ? 'rgba(34,197,94,0.08)'
    : accepted              ? 'rgba(var(--gold-rgb),0.08)'
    : booked                ? 'var(--surface-2)'
    :                         'var(--input-bg)'

  const border = selected   ? '1.5px solid var(--gold)'
    : mineAccepted          ? '1px solid rgba(34,197,94,0.5)'
    : mine                  ? '1px solid rgba(34,197,94,0.4)'
    : accepted              ? '1px solid rgba(var(--gold-rgb),0.25)'
    : booked                ? '1px solid var(--border)'
    :                         '1px solid var(--border-light)'

  const color = selected    ? 'var(--gold)'
    : mineAccepted          ? '#22c55e'
    : mine                  ? '#22c55e'
    : accepted              ? 'rgba(var(--gold-rgb),0.65)'
    : booked                ? 'var(--text-dim)'
    :                         'var(--text-muted)'

  return (
    <button onClick={onClick} disabled={booked} className="slot-btn" style={{
      padding: '8px 6px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 600, textAlign: 'center',
      border, background: bg, color, cursor: booked ? 'default' : 'pointer', transition: 'all 0.1s',
      width: '100%',
    }}>
      {minsToTime(start)}
      {mineAccepted          && <span style={{ display: 'block', fontSize: '0.52rem', marginTop: '1px', color: '#22c55e' }}>✓ Bestätigt</span>}
      {mine && !mineAccepted && <span style={{ display: 'block', fontSize: '0.52rem', marginTop: '1px', color: '#22c55e' }}>Dein Termin</span>}
      {accepted && !mine     && <span style={{ display: 'block', fontSize: '0.52rem', marginTop: '1px', color: 'rgba(var(--gold-rgb),0.7)' }}>Bestätigt</span>}
      {booked && !accepted && !mine && <span style={{ display: 'block', fontSize: '0.52rem', marginTop: '1px', color: 'var(--text-dim)' }}>Belegt</span>}
    </button>
  )
}

/* ── Main component ── */
export default function TerminKalender({ userId, username }: { userId: string; username: string }) {
  const YEAR = 2026
  const todayIso = isoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  const [month, setMonth] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const duration = 90
  const [bookedSlots, setBookedSlots] = useState<Booked[]>([])
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'pick' | 'success'>('pick')
  const [submitting, setSubmitting] = useState(false)
  const [myAppts, setMyAppts] = useState<Appointment[]>([])
  const [showMyAppts, setShowMyAppts] = useState(false)
  const [weekError, setWeekError] = useState('')
  const [apptMode, setApptMode] = useState<'single' | 'regeltermin'>('single')
  const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set())
  const [saturdayEnabled, setSaturdayEnabled] = useState(false)
  const [multiBookingEnabled, setMultiBookingEnabled] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  /* Profildaten aus localStorage vorausfüllen */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('termin_profile')
      if (saved) {
        const p = JSON.parse(saved)
        if (p.firstName) setFirstName(p.firstName)
        if (p.lastName)  setLastName(p.lastName)
        if (p.phone)     setPhone(p.phone)
      }
    } catch {}
  }, [])

  /* load settings + blocked days */
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(r => r.json()).catch(() => ({})),
      fetch('/api/admin/blocked-days').then(r => r.json()).catch(() => []),
    ]).then(([settings, blocked]) => {
      setSaturdayEnabled(settings.saturday_enabled === 'true')
      setMultiBookingEnabled(settings.multi_booking_enabled === 'true')
      setBlockedDays(new Set((blocked as { date: string }[]).map(b => b.date)))
      setSettingsLoaded(true)
    })
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
      .select('id, date, start_time, duration_min, status, note, appointment_type')
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

  function isAccepted(slotStart: number, dur: number) {
    return bookedSlots.some(b => {
      const [h, m] = b.start_time.split(':').map(Number)
      return b.status === 'accepted' && slotsOverlap(slotStart, dur, h * 60 + m, b.duration_min)
    })
  }

  function isMySlot(slotStart: number) {
    return bookedSlots.some(b => {
      const [h, m] = b.start_time.split(':').map(Number)
      return b.student_id === userId && h * 60 + m === slotStart
    })
  }

  function isMySlotAccepted(slotStart: number) {
    return bookedSlots.some(b => {
      const [h, m] = b.start_time.split(':').map(Number)
      return b.student_id === userId && h * 60 + m === slotStart && b.status === 'accepted'
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
    if ((data ?? []).length >= 1) {
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
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return
    setSubmitting(true)
    const ok = await checkWeekLimit(selectedDate)
    if (!ok) { setSubmitting(false); return }
    const { error } = await supabase.from('appointments').insert({
      student_id: userId,
      student_name: username,
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim(),
      date: selectedDate,
      start_time: minsToTime(selectedSlot),
      duration_min: duration,
      status: 'pending',
      note: note.trim() || null,
      appointment_type: apptMode,
    })
    setSubmitting(false)
    if (!error) {
      // Profildaten für nächstes Mal speichern
      try { localStorage.setItem('termin_profile', JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() })) } catch {}
      setStep('success')
    }
  }

  /* Calendar grid */
  const daysInMonth = getDaysInMonth(YEAR, month)
  const firstDay    = firstDayOfMonth(YEAR, month)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const wd = selectedDate ? weekDayOf(selectedDate) : -1
  const isSat = wd === 5
  const { morning: morningSlots, evening: eveningSlots } = apptMode === 'regeltermin'
    ? getRegelSlots(wd, duration)
    : getNormalSlots(wd, duration)

  /* ── Success screen ── */
  if (step === 'success') return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ margin: '0 0 0.5rem', color: '#22c55e', fontWeight: 900 }}>Anfrage gesendet!</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Dein Fahrlehrer wird deinen Termin bald bestätigen.
      </p>
      <button onClick={() => { setStep('pick'); setSelectedDate(null); setFirstName(''); setLastName(''); setNote('') }} style={{
        padding: '0.75rem 2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
        background: 'rgba(var(--gold-rgb),0.15)', border: '1px solid rgba(var(--gold-rgb),0.35)',
        color: 'var(--gold)', cursor: 'pointer',
      }}>
        Weiteren Termin buchen
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
        {(['single', 'regeltermin'] as const).map(m => (
          <button key={m} onClick={() => { setApptMode(m); setSelectedSlot(null); setWeekError('') }} style={{
            flex: 1, padding: '9px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700,
            border: apptMode === m ? '1px solid rgba(var(--gold-rgb),0.4)' : `1px solid var(--border)`,
            background: apptMode === m ? 'rgba(var(--gold-rgb),0.12)' : 'var(--input-bg)',
            color: apptMode === m ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer',
          }}>
            {m === 'single' ? '📅 Einzeltermin' : '🔁 Regeltermin (wöchentlich)'}
          </button>
        ))}
      </div>

      {apptMode === 'regeltermin' && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(var(--gold-rgb),0.05)', border: '1px solid rgba(var(--gold-rgb),0.15)', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--gold)' }}>Regeltermin</strong> — wiederkehrender wöchentlicher Termin. Verfügbare Zeiten: <br />
          Mo / Di: 15:00–17:30 · Mi: 12:30–17:30 · Do: 12:00–22:00 · Fr: 15:00–20:30 Uhr
        </div>
      )}

      {/* My appointments */}
      {myAppts.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => setShowMyAppts(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0.65rem 1.25rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700,
            background: 'var(--input-bg)', border: '1px solid var(--input-border)',
            color: 'var(--text-muted)', cursor: 'pointer',
          }}>
            📋 Meine Termine ({myAppts.length}) <span>{showMyAppts ? '▲' : '▼'}</span>
          </button>
          {showMyAppts && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {myAppts.map(a => {
                const [h, m2] = a.start_time.split(':').map(Number)
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
                    padding: '0.75rem 1rem', borderRadius: '10px',
                    background: 'var(--input-bg)', border: '1px solid var(--border)',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {new Date(a.date + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {a.appointment_type === 'regeltermin' && (
                          <span style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: 700, background: 'rgba(var(--gold-rgb),0.1)', padding: '1px 7px', borderRadius: '100px', border: '1px solid rgba(var(--gold-rgb),0.2)' }}>🔁 Regeltermin</span>
                        )}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {slotLabel(h * 60 + m2, a.duration_min)} · {a.duration_min} Min.
                      </p>
                    </div>
                    <StatusBadge s={a.status} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }} className="termin-grid">

        {/* ── Calendar ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(var(--gold-rgb),0.18)', borderRadius: '1.25rem', padding: '1.25rem' }}>

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
                textAlign: 'center', fontSize: '0.6rem', fontWeight: 700, padding: '4px 0', letterSpacing: '0.05em',
                color: i === 5 ? (saturdayEnabled ? 'var(--gold)' : '#2e2510') : i < 5 ? 'var(--gold)' : 'var(--text-dim)',
              }}>
                {d}{i === 5 && !saturdayEnabled && ' 🔒'}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />
              const wd2 = idx % 7 // 0=Mo…5=Sa…6=So
              const isSunday   = wd2 === 6
              const isSaturday = wd2 === 5
              const dateStr  = isoDate(YEAR, month, day)
              const isPast   = dateStr < todayIso
              const isHoliday = HOLIDAYS_2026.has(dateStr)
              const isBlocked = blockedDays.has(dateStr)
              const noRegel   = apptMode === 'regeltermin' && isSaturday
              const isDisabled = isSunday || (isSaturday && !saturdayEnabled) || isPast || isHoliday || isBlocked || noRegel
              const isSelected = dateStr === selectedDate

              const mark = isHoliday ? '🎉' : isBlocked ? '🚫' : null
              const title = isHoliday ? HOLIDAY_NAMES[dateStr] : isBlocked ? 'Gesperrt' : undefined

              return (
                <button key={idx}
                  onClick={() => { if (!isDisabled) setSelectedDate(dateStr) }}
                  disabled={isDisabled}
                  title={title}
                  style={{
                    aspectRatio: '1', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600,
                    border: isSelected ? '1.5px solid var(--gold)' : isHoliday ? '1px solid rgba(var(--gold-rgb),0.12)' : '1px solid transparent',
                    background: isSelected ? 'rgba(var(--gold-rgb),0.18)' : isHoliday ? 'rgba(var(--gold-rgb),0.04)' : isBlocked ? 'rgba(239,68,68,0.04)' : isDisabled ? 'transparent' : 'var(--input-bg)',
                    color: isSelected ? 'var(--gold)' : isDisabled ? '#2a2520' : isSaturday && saturdayEnabled ? 'rgba(var(--gold-rgb),0.7)' : 'var(--text-muted)',
                    cursor: isDisabled ? 'default' : 'pointer',
                    transition: 'all 0.1s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                  }}
                >
                  {day}
                  {mark && <span style={{ fontSize: '0.35rem', lineHeight: 1.2 }}>{mark}</span>}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '0.85rem', display: 'flex', gap: '8px', fontSize: '0.57rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
            <span>🟡 Mo–Fr</span>
            {saturdayEnabled ? <span style={{ color: 'rgba(var(--gold-rgb),0.7)' }}>⚡ Sa</span> : <span>🔒 Sa gesperrt</span>}
            <span>🎉 Feiertag</span>
            {blockedDays.size > 0 && <span>🚫 Gesperrt</span>}
          </div>
        </div>

        {/* ── Time slots panel ── */}
        <div>
          {!selectedDate ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              Wähle links ein Datum.
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(var(--gold-rgb),0.18)', borderRadius: '1.25rem', padding: '1.25rem' }}>

              <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Termin für</p>
              <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)' }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}
                {isSat && <span style={{ marginLeft: '8px', fontSize: '0.62rem', color: 'rgba(var(--gold-rgb),0.8)', fontWeight: 700 }}>Samstag-Zeiten</span>}
              </p>

              {/* Duration info */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', padding: '5px 12px', borderRadius: '100px', background: 'rgba(var(--gold-rgb),0.08)', border: '1px solid rgba(var(--gold-rgb),0.2)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)' }}>⏱ 90 Minuten pro Fahrstunde</span>
              </div>

              {/* Slots */}
              {morningSlots.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>
                  Keine verfügbaren Zeiten für diesen Tag.
                </p>
              ) : (
                <>
                  {isSat && <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Vormittag · 12:00–15:00</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: isSat && eveningSlots ? '0.85rem' : '1rem' }}>
                    {morningSlots.map(start => (
                      <SlotBtn key={start} start={start} dur={duration}
                        booked={isBooked(start, duration)} accepted={isAccepted(start, duration)}
                        mine={isMySlot(start)} mineAccepted={isMySlotAccepted(start)}
                        selected={selectedSlot === start} onClick={() => handleSlotClick(start)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Evening slots (Saturday only) */}
              {isSat && eveningSlots && eveningSlots.length > 0 && (
                <>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Abend · 19:00–23:00</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '1rem' }}>
                    {eveningSlots.map(start => (
                      <SlotBtn key={start} start={start} dur={duration}
                        booked={isBooked(start, duration)} accepted={isAccepted(start, duration)}
                        mine={isMySlot(start)} mineAccepted={isMySlotAccepted(start)}
                        selected={selectedSlot === start} onClick={() => handleSlotClick(start)}
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
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.63rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Ausgewählt: {slotLabel(selectedSlot, duration)}
                  </p>

                  {/* Persönliche Daten */}
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Deine Kontaktdaten
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      placeholder="Vorname *"
                      style={{ padding: '0.5rem 0.65rem', background: 'var(--input-bg)', border: `1px solid var(--border)`, borderRadius: '8px', color: 'var(--text)', fontSize: '0.75rem', fontFamily: 'inherit', outline: 'none' }}
                    />
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      placeholder="Nachname *"
                      style={{ padding: '0.5rem 0.65rem', background: 'var(--input-bg)', border: `1px solid var(--border)`, borderRadius: '8px', color: 'var(--text)', fontSize: '0.75rem', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Telefonnummer * (z.B. 0176 12345678)"
                    type="tel"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.65rem', background: 'var(--input-bg)', border: `1px solid var(--border)`, borderRadius: '8px', color: 'var(--text)', fontSize: '0.75rem', fontFamily: 'inherit', outline: 'none', marginBottom: '4px' }}
                  />
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    Nur für deinen Fahrlehrer sichtbar · wird für Rückfragen gespeichert.
                  </p>

                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Anmerkung (optional)…" rows={2}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', background: 'var(--input-bg)', border: `1px solid var(--border)`, borderRadius: '8px', color: 'var(--text)', fontSize: '0.76rem', fontFamily: 'inherit', outline: 'none', resize: 'none', marginBottom: '0.75rem' }}
                  />
                  <button onClick={submitBooking}
                    disabled={submitting || !firstName.trim() || !lastName.trim() || !phone.trim()}
                    style={{
                      width: '100%', padding: '0.8rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800,
                      background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                      color: '#0a0800', border: 'none',
                      cursor: (submitting || !firstName.trim() || !lastName.trim() || !phone.trim()) ? 'default' : 'pointer',
                      opacity: (submitting || !firstName.trim() || !lastName.trim() || !phone.trim()) ? 0.6 : 1,
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
