import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? '4tVWa6JWnwS0ZoCf6ZzP'
const MODEL_ID = 'eleven_multilingual_v2'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY nicht gesetzt' }, { status: 503 })
  }

  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'Kein Text' }, { status: 400 })

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method:  'POST',
        headers: {
          'xi-api-key':   apiKey,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability:        0.60,
            similarity_boost: 0.78,
            style:            0.20,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('ElevenLabs error:', res.status, err)
      return NextResponse.json({ error: 'ElevenLabs Fehler' }, { status: 502 })
    }

    // Audio-Stream direkt durchleiten
    return new Response(res.body, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('speak route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
