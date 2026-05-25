import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? '78gC8gOZUblsoor482I7'
const MODEL_ID = 'eleven_multilingual_v2'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  console.log('[tars/speak] apiKey present:', !!apiKey, '| voiceId:', VOICE_ID)

  if (!apiKey) {
    console.error('[tars/speak] ELEVENLABS_API_KEY fehlt!')
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY nicht gesetzt' }, { status: 503 })
  }

  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'Kein Text' }, { status: 400 })

    console.log('[tars/speak] calling ElevenLabs, text length:', text.length)

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
            stability:         0.60,
            similarity_boost:  0.78,
            style:             0.20,
            use_speaker_boost: true,
          },
        }),
      }
    )

    console.log('[tars/speak] ElevenLabs status:', res.status)

    if (!res.ok) {
      const err = await res.text()
      console.error('[tars/speak] ElevenLabs error body:', err)
      return NextResponse.json({ error: 'ElevenLabs Fehler', detail: err }, { status: 502 })
    }

    return new Response(res.body, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[tars/speak] Exception:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
