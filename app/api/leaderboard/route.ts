import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const maxDuration = 10

export async function GET() {
  try {
    const { data: stats, error } = await supabaseAdmin
      .from('user_stats')
      .select('user_id, points, avatar_url')
      .order('points', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json([])
    if (!stats || stats.length === 0) return NextResponse.json([])

    // listUsers kann langsam sein — parallel mit Timeout laufen lassen
    let users: { id: string; email?: string; user_metadata?: Record<string, string> }[] = []
    try {
      const result = await Promise.race([
        supabaseAdmin.auth.admin.listUsers(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]) as Awaited<ReturnType<typeof supabaseAdmin.auth.admin.listUsers>>
      users = result.data?.users ?? []
    } catch {
      // Falls listUsers zu langsam: user_ids als Displaynamen verwenden
    }

    const leaderboard = stats.map((s, i) => {
      const user = users.find(u => u.id === s.user_id)
      const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || `Spieler ${i + 1}`
      return { position: i + 1, userId: s.user_id, displayName, points: s.points, avatarUrl: (s as Record<string, unknown>).avatar_url as string | null ?? null }
    })

    return NextResponse.json(leaderboard)
  } catch {
    return NextResponse.json([])
  }
}
