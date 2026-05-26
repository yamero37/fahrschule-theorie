import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'spieletolga@gmail.com'

/* ── Format helpers ─────────────────────────────────────── */

function normalizePhone(raw: string): string {
  // Leerzeichen, Bindestriche, Klammern entfernen
  let p = raw.replace(/[\s\-\(\)\/]/g, '')
  // 0176... → +49176...
  if (p.startsWith('00')) p = '+' + p.slice(2)
  else if (p.startsWith('0'))  p = '+49' + p.slice(1)
  // 49176... (ohne +) → +49176...
  else if (/^49\d/.test(p))    p = '+' + p
  return p
}

const MONTHS_DE = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember',
]
const DAYS_DE = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${DAYS_DE[d.getDay()]}, ${d.getDate()}. ${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`
}

function formatTime(time: string): string {
  // "13:30:00" → "13:30"
  return time.slice(0, 5)
}

/* ── Admin check ────────────────────────────────────────── */

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.email === ADMIN_EMAIL
}

/* ── POST /api/whatsapp/send ────────────────────────────── */

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const WHATSAPP_TOKEN    = process.env.WHATSAPP_TOKEN
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID
  const WHATSAPP_TEMPLATE = process.env.WHATSAPP_TEMPLATE ?? 'termin_bestaetigt'

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    return NextResponse.json(
      { error: 'WhatsApp nicht konfiguriert – bitte WHATSAPP_TOKEN und WHATSAPP_PHONE_ID in Vercel setzen.' },
      { status: 503 }
    )
  }

  const { phone, name, date, time } = await req.json() as {
    phone: string; name: string; date: string; time: string
  }

  if (!phone || !name || !date || !time)
    return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 })

  const to          = normalizePhone(phone)
  const dateFormatted = formatDate(date)
  const timeFormatted = formatTime(time)

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: WHATSAPP_TEMPLATE,
      language: { code: 'de' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: name },
            { type: 'text', text: dateFormatted },
            { type: 'text', text: timeFormatted },
          ],
        },
      ],
    },
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  const data = await res.json()

  if (!res.ok) {
    console.error('WhatsApp API Fehler:', data)
    return NextResponse.json({ error: data?.error?.message ?? 'WhatsApp-Fehler', detail: data }, { status: 502 })
  }

  return NextResponse.json({ ok: true, messageId: data?.messages?.[0]?.id })
}
