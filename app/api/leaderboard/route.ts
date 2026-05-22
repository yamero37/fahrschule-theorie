import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data: stats, error } = await supabaseAdmin
    .from('user_stats')
    .select('user_id, points')
    .order('points', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!stats || stats.length === 0) return NextResponse.json([])

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

  const leaderboard = stats.map((s, i) => {
    const user = users.find(u => u.id === s.user_id)
    const email = user?.email ?? ''
    const displayName = user?.user_metadata?.username || email.split('@')[0] || 'Unbekannt'
    return {
      position: i + 1,
      userId: s.user_id,
      displayName,
      points: s.points,
    }
  })

  return NextResponse.json(leaderboard)
}
