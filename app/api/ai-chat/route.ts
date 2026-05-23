import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ content: 'KI nicht konfiguriert. Bitte ANTHROPIC_API_KEY setzen.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const { messages } = await req.json()

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Du bist ein Führerschein-Experte für Deutschland und hilfst Fahrschülern bei ihren Theoriefragen.
Antworte immer auf Deutsch, präzise und verständlich.
Erkläre Verkehrsregeln, Verkehrszeichen, Vorfahrt, Promillegrenzen, Sicherheitsabstände und andere relevante Themen.
Halte deine Antworten kurz und klar, außer wenn eine ausführlichere Erklärung notwendig ist.
Verwende keine Markdown-Formatierung in deinen Antworten.`,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const block = response.content[0]
    if (block.type !== 'text') return NextResponse.json({ content: 'Fehler' }, { status: 500 })

    return NextResponse.json({ content: block.text })
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ content: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.' }, { status: 500 })
  }
}
