import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const maxDuration = 10

export async function GET() {
  try {
    const { data: stats } = await supabaseAdmin
      .from('user_stats')
      .select('user_id, points')
      .order('points', { ascending: false })

    if (!stats || stats.length === 0) return NextResponse.json([])

    let users: { id: string; email?: string; user_metadata?: Record<string, string> }[] = []
    try {
      const result = await Promise.race([
        supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]) as Awaited<ReturnType<typeof supabaseAdmin.auth.admin.listUsers>>
      users = result.data?.users ?? []
    } catch {}

    const list = stats.map((s, i) => {
      const user = users.find(u => u.id === s.user_id)
      const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || `Spieler ${i + 1}`
      return { userId: s.user_id, displayName, points: s.points }
    })

    return NextResponse.json(list)
  } catch {
    return NextResponse.json([])
  }
}
