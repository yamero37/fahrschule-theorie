import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const FALLBACK_CORRECT = [
  'Ausgezeichnet! Das ist die richtige Antwort. Weiter so!',
  'Sehr gut! Das haben Sie sich gut gemerkt.',
  'Perfekt! Das ist korrekt – sehr schön.',
  'Richtig! Das zeigt echtes Fachwissen.',
]
const FALLBACK_WRONG = [
  'Nicht ganz. Aber wichtig ist, dass Sie es jetzt wissen!',
  'Knapp daneben. Denken Sie daran für die Prüfung.',
  'Das stimmt leider nicht ganz – schauen wir uns die richtige Antwort an.',
  'Fast. Merken Sie sich die richtige Antwort gut.',
]

export async function POST(req: NextRequest) {
  try {
    const { question, correctAnswer, userAnswer, isCorrect, category } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    const useFallback = !apiKey || apiKey.includes('deinkey') || apiKey.length < 30

    if (useFallback) {
      const pool = isCorrect ? FALLBACK_CORRECT : FALLBACK_WRONG
      const idx   = Math.floor(Math.random() * pool.length)
      const extra = !isCorrect ? ` Korrekt wäre: „${correctAnswer}".` : ''
      return NextResponse.json({ feedback: pool[idx] + extra })
    }

    const client = new Anthropic({ apiKey })

    const prompt = `Du bist Tars, ein freundlicher, professioneller Fahrprüfer.
Der Fahrschüler hat diese Frage ${isCorrect ? 'korrekt' : 'falsch'} beantwortet.

Kategorie: ${category}
Frage: "${question}"
Richtige Antwort: "${correctAnswer}"
Antwort des Schülers: "${userAnswer}"

${isCorrect
  ? 'Gib eine kurze lobende Bestätigung (1–2 Sätze). Erkläre kurz warum das wichtig ist.'
  : 'Korrigiere freundlich und erkläre in einem Satz die richtige Antwort.'}

Regeln: max. 120 Zeichen, Deutsch, kein "Ich" am Anfang, bleibe als Tars im Charakter.`

    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages:   [{ role: 'user', content: prompt }],
    })

    const text = (msg.content[0] as { type: 'text'; text: string }).text.trim()
    return NextResponse.json({ feedback: text })

  } catch (err) {
    console.error('Tars API error:', err)
    return NextResponse.json({ feedback: 'Interessant! Weiter zur nächsten Frage.' })
  }
}
