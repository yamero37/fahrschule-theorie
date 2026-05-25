import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { question, correctAnswer, userAnswer, category } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    const useFallback = !apiKey || apiKey.includes('deinkey') || apiKey.length < 30

    if (useFallback) {
      return NextResponse.json({ correct: false, feedback: 'Antwort gespeichert.' })
    }

    const client = new Anthropic({ apiKey })

    const prompt = `Du bist Tars, ein freundlicher Fahrprüfer in Deutschland.
Bewerte die folgende Schüler-Antwort auf eine Technik-Frage.

Kategorie: ${category}
Frage: "${question}"
Musterlösung: "${correctAnswer}"
Antwort des Schülers: "${userAnswer}"

Ist die Antwort inhaltlich korrekt oder annähernd korrekt?
Antworte NUR mit gültigem JSON, keine anderen Zeichen davor oder danach:
{"correct": true, "feedback": "Kurze Bestätigung (1 Satz) als Tars"}
oder
{"correct": false, "feedback": "Kurze freundliche Korrektur (1 Satz) als Tars"}`

    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw  = (msg.content[0] as { type: 'text'; text: string }).text.trim()
    const json = JSON.parse(raw)
    return NextResponse.json({ correct: !!json.correct, feedback: json.feedback ?? 'Verstanden.' })

  } catch (err) {
    console.error('Tars API error:', err)
    return NextResponse.json({ correct: false, feedback: 'Antwort gespeichert.' })
  }
}
