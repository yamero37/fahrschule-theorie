import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const SYSTEM = `Du bist Tars, ein freundlicher KI-Fahrprüfer beim TÜV in Deutschland.
Du führst gerade eine Fahrprüfungs-Simulation durch.

Persönlichkeit:
- Professionell, locker, leicht humorvoll
- Förmliche Anrede (Sie)
- Kurze natürliche Sätze – kein Behördendeutsch
- Geh auf das ein was der Prüfling sagt – wie ein echter Mensch

Ablauf der Konversation (phase gibt an wo wir sind):
- "intro": Stelle dich als Tars vor und frage nach dem Namen des Prüflings
- "name": Du kennst jetzt den Namen – begrüße die Person persönlich und bitte freundlich um Ausweis und Führerschein
- "id_ok": Ausweis war OK – locker die Stimmung auf, frage ob die Person bereit ist für die Prüfung
- "ready": Reagiere auf die Antwort zur Bereitschaft – kündige dann die technischen Fragen am Fahrzeug an

Wichtig:
- Antworte auf Deutsch
- Maximal 2 Sätze
- Gehe auf das ein was die Person gesagt hat – reagiere menschlich
- Keine Emojis, keine Aufzählungen
- Antworte NUR mit dem gesprochenen Text, kein JSON`

export async function POST(req: NextRequest) {
  try {
    const { messages, phase } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey.length < 30) {
      return NextResponse.json({ message: getFallback(phase) })
    }

    const client = new Anthropic({ apiKey })

    // Phase-Hinweis als letzter System-Kontext
    const phaseHint = getPhaseHint(phase)
    const fullMessages = phaseHint
      ? [...messages, { role: 'user' as const, content: `[Kontext: ${phaseHint}]` }]
      : messages

    const msg = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 180,
      system:     SYSTEM,
      messages:   fullMessages,
    })

    const text = (msg.content[0] as { type: 'text'; text: string }).text.trim()
    return NextResponse.json({ message: text })

  } catch (err) {
    console.error('[tars/chat] error:', err)
    return NextResponse.json({ message: 'Einen Moment bitte.' })
  }
}

function getPhaseHint(phase?: string): string {
  switch (phase) {
    case 'intro':   return 'Starte das Gespräch – stelle dich vor und frage nach dem Namen'
    case 'name':    return 'Du hast den Namen gehört – begrüße die Person und bitte um Ausweis'
    case 'id_ok':   return 'Ausweis war in Ordnung – frag jetzt ob die Person bereit ist'
    case 'ready':   return 'Leite jetzt zu den technischen Fragen am Fahrzeug über'
    default:        return ''
  }
}

function getFallback(phase?: string): string {
  switch (phase) {
    case 'intro':  return 'Guten Tag! Mein Name ist Tars, ich bin Ihr Fahrprüfer heute. Wie ist Ihr Name?'
    case 'name':   return 'Schön Sie kennenzulernen. Dann brauche ich bitte kurz Ihren Ausweis.'
    case 'id_ok':  return 'Alles korrekt. Na, ein bisschen aufgeregt? Sind Sie bereit für die Prüfung?'
    case 'ready':  return 'Sehr gut! Na gut, dann starten wir mal mit den technischen Fragen.'
    default:       return 'Verstanden.'
  }
}
