import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const maxDuration = 10

async function runCleanup() {
  const { error } = await supabaseAdmin
    .from('chat_messages')
    .delete()
    .eq('channel', 'public')

  if (error) {
    console.error('[chat/cleanup]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[chat/cleanup] cleared at', new Date().toISOString())
  return NextResponse.json({ success: true, clearedAt: new Date().toISOString() })
}

export async function GET() { return runCleanup() }
export async function POST() { return runCleanup() }
