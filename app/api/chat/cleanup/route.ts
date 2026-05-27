import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const maxDuration = 10

async function runCleanup(req: NextRequest) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  // Also allow direct calls with the same secret for manual triggers
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('channel', 'public')

    if (error) {
      console.error('[chat/cleanup] Supabase error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[chat/cleanup] Public chat cleared at', new Date().toISOString())
    return NextResponse.json({ success: true, clearedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[chat/cleanup] Unexpected error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Vercel Cron calls GET
export async function GET(req: NextRequest) {
  return runCleanup(req)
}

// Allow manual POST trigger (e.g. from admin panel)
export async function POST(req: NextRequest) {
  return runCleanup(req)
}
