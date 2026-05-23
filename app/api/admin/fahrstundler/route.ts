import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'spieletolga@gmail.com'

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return false
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.email === ADMIN_EMAIL
}

/* GET — alle User + wer Fahrstündler-Freigabe hat */
export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [usersResult, fahrstundlerResult] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from('fahrstundler_approvals').select('user_id'),
  ])

  const users = usersResult.data?.users ?? []
  const approved = new Set((fahrstundlerResult.data ?? []).map((r: { user_id: string }) => r.user_id))

  const list = users.map(u => ({
    userId: u.id,
    email: u.email ?? '',
    username: u.user_metadata?.username || u.email?.split('@')[0] || u.id,
    appApproved: !!u.app_metadata?.approved,
    fahrstundler: approved.has(u.id),
    createdAt: u.created_at,
  }))

  return NextResponse.json(list)
}

/* POST — Fahrstündler-Freigabe erteilen */
export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId fehlt' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('fahrstundler_approvals')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

/* DELETE — Fahrstündler-Freigabe entziehen */
export async function DELETE(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId fehlt' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('fahrstundler_approvals')
    .delete()
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
