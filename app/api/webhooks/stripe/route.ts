import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

// Wichtig: kein automatisches Body-Parsing — Stripe braucht den Roh-Text für die Signatur
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Signatur-Fehler:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Zahlung erfolgreich abgeschlossen
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Nur bei erfolgter Zahlung (nicht bei kostenlosen Trials etc.)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const userId = session.client_reference_id
    if (!userId) {
      console.error('[webhook] Kein client_reference_id in Session:', session.id)
      return NextResponse.json({ error: 'No user id' }, { status: 400 })
    }

    // Premium in user_stats setzen
    const { error } = await supabaseAdmin
      .from('user_stats')
      .upsert(
        { user_id: userId, is_premium: true },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('[webhook] Supabase-Fehler:', error.message)
      return NextResponse.json({ error: 'DB-Fehler' }, { status: 500 })
    }

    console.log(`[webhook] Premium aktiviert für User: ${userId}`)
  }

  return NextResponse.json({ received: true })
}
