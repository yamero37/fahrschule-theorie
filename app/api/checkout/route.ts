import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

// Preis in Cent — 9,99 € = 999
const PREMIUM_PRICE_CENTS = parseInt(process.env.PREMIUM_PRICE_CENTS ?? '999', 10)

export async function POST(req: NextRequest) {
  try {
    // Auth: Bearer-Token aus dem Header prüfen
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Ungültiger Token' }, { status: 401 })

    // Schon Premium? Dann kein neuer Checkout nötig
    const { data: stats } = await supabaseAdmin
      .from('user_stats').select('is_premium').eq('user_id', user.id).single()
    if (stats?.is_premium) {
      return NextResponse.json({ error: 'already_premium' }, { status: 409 })
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${process.env.VERCEL_URL}` ||
      'http://localhost:3000'
    ).replace(/\/$/, '')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: '💎 TolDrive Premium',
            description: 'Dauerhafter Premium-Zugang — alle Features freigeschaltet',
          },
          unit_amount: PREMIUM_PRICE_CENTS,
        },
        quantity: 1,
      }],
      mode: 'payment',
      client_reference_id: user.id,   // wird im Webhook genutzt
      customer_email: user.email ?? undefined,
      success_url: `${appUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard`,
      locale: 'de',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe-Fehler:', err)
    return NextResponse.json({ error: 'Checkout fehlgeschlagen' }, { status: 500 })
  }
}
