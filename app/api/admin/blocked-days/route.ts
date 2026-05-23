import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'spieletolga@gmail.com'

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.email === ADMIN_EMAIL
}

export async function GET() {
  const { data } = await supabaseAdmin.from('admin_blocked_days').select('date, reason').order('date')
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { date, reason } = await req.json()
  await supabaseAdmin.from('admin_blocked_days')
    .upsert({ date, reason: reason || null }, { onConflict: 'date' })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { date } = await req.json()
  await supabaseAdmin.from('admin_blocked_days').delete().eq('date', date)
  return NextResponse.json({ ok: true })
}
