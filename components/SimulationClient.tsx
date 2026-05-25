'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

/* ─── Types ────────────────────────────────────────────────── */
type P1Phase   = 'scene' | 'approaching' | 'stopped' | 'speaking' | 'ready'
type MainPhase = 'phase1' | 'phase2'
type P2Phase   = 'intro' | 'intro_typing' | 'question' | 'feedback' | 'complete'
type InputMode = 'text' | 'voice'
type CarPos    = 'front' | 'side' | 'rear'

interface Question {
  id:          string
  category:    string
  question:    string
  options:     string[]   // kept for correctAnswer reference
  correctIdx:  number
  hint:        string
  pos:         CarPos
  posLabel:    string
}

interface AnswerRecord {
  question:      string
  correctAnswer: string
  userAnswer:    string
  correct:       boolean
  feedback:      string
  hint:          string
}

/* ─── Question Bank ────────────────────────────────────────── */
const ALL_QUESTIONS: Question[] = [
  {
    id: 'reifen_wichtig', category: 'Reifen',
    question: 'Was ist bei der Sichtkontrolle der Reifen zu beachten?',
    options: [
      'Farbe und Marke des Reifens',
      'Profiltiefe, Luftdruck und sichtbare Schäden',
      'Ob der Reifen neu oder gebraucht ist',
      'Die Seriennummer auf der Felge',
    ],
    correctIdx: 1,
    hint: 'Profiltiefe mind. 1,6 mm, Luftdruck laut Herstellerangabe, keine Risse oder Beulen – das sind die drei Kernpunkte.',
    pos: 'side', posLabel: 'SEITE • Reifen',
  },
  {
    id: 'reflektor_ort', category: 'Beleuchtung',
    question: 'Wo befinden sich die Reflektoren am Fahrzeug?',
    options: [
      'Nur vorne am Stoßfänger',
      'Links und rechts am Heck des Fahrzeugs',
      'An allen vier Türen',
      'Nur an den Seiten',
    ],
    correctIdx: 1,
    hint: 'Rote Reflektoren sitzen links und rechts am Heck – sie werfen das Licht nachfolgender Fahrzeuge zurück.',
    pos: 'rear', posLabel: 'HECK • Reflektoren',
  },
  {
    id: 'motoroel_pruefen', category: 'Motoröl',
    question: 'Wie prüfen Sie korrekt den Motorölstand?',
    options: [
      'Motor warm laufen lassen, sofort messen',
      'Motor abgestellt, Fahrzeug eben, Messstab ablesen',
      'Einfach Öl nachfüllen bis es überläuft',
      'Nur beim Ölwechsel in der Werkstatt',
    ],
    correctIdx: 1,
    hint: 'Motor kalt und abgestellt, Fahrzeug auf ebenem Untergrund: Messstab entnehmen, abwischen, erneut eintauchen, ablesen.',
    pos: 'front', posLabel: 'FRONT • Motoröl',
  },
  {
    id: 'kuehlwasser_gefahr', category: 'Kühlwasser',
    question: 'Was ist beim Öffnen des Kühlwasserdeckels unbedingt zu beachten?',
    options: [
      'Immer mit heißem Motor öffnen für genaue Messung',
      'Nie bei warmem Motor öffnen – Verbrühungsgefahr!',
      'Deckel immer mit Werkzeug öffnen',
      'Kühlwasser kann bedenkenlos jederzeit geöffnet werden',
    ],
    correctIdx: 1,
    hint: 'Bei heißem Motor steht der Kühlkreislauf unter Druck – beim Öffnen kann kochendes Kühlwasser herausspritzen.',
    pos: 'front', posLabel: 'FRONT • Kühlwasser',
  },
  {
    id: 'bremslicht_test', category: 'Beleuchtung',
    question: 'Wie testen Sie selbst ob die Bremslichter funktionieren?',
    options: [
      'Das ist nur in der Werkstatt möglich',
      'Bremse drücken, Reflektion an Wand oder Garage prüfen',
      'Bei 100 km/h stark bremsen und beobachten',
      'Bremslichter müssen nie geprüft werden',
    ],
    correctIdx: 1,
    hint: 'Bremse treten und die Reflektion an einer Wand oder Garagentor beobachten – oder eine zweite Person bittten.',
    pos: 'rear', posLabel: 'HECK • Bremslichter',
  },
  {
    id: 'scheibenwasser_check', category: 'Scheibenwischer',
    question: 'Was gehört zur Kontrolle der Scheibenwaschanlage?',
    options: [
      'Nur die Wischergummis tauschen',
      'Wasserstand prüfen und Düsen auf korrekte Ausrichtung testen',
      'Scheibenwischer täglich wechseln',
      'Leitungswasser ohne Zusätze reicht immer',
    ],
    correctIdx: 1,
    hint: 'Waschwasserstand prüfen (im Winter mit Frostschutz), Düsen auf die Scheibe ausrichten, Wischergummis auf Schlieren testen.',
    pos: 'front', posLabel: 'FRONT • Scheibenwasser',
  },
  {
    id: 'nebel_wann', category: 'Beleuchtung',
    question: 'Wann darf die Nebelschlussleuchte am Heck eingeschaltet werden?',
    options: [
      'Bei jedem Regen',
      'Nur auf der Autobahn',
      'Nur bei Sichtweite unter 50 Meter',
      'Immer bei Dunkelheit',
    ],
    correctIdx: 2,
    hint: 'Nebelschlussleuchte nur bei Sichtweite unter 50 m – sonst blendet sie nachfolgende Fahrer erheblich.',
    pos: 'rear', posLabel: 'HECK • Nebelschluss',
  },
  {
    id: 'tuev_sticker', category: 'HU / TÜV',
    question: 'Was zeigt der TÜV-Sticker am Kennzeichen an?',
    options: [
      'Das Baujahr des Fahrzeugs',
      'Wann der letzte Ölwechsel war',
      'Monat und Jahr der nächsten Hauptuntersuchung',
      'Die Anzahl der bisherigen Inspektionen',
    ],
    correctIdx: 2,
    hint: 'Der Sticker zeigt Monat (Zahlen außen am Rand) und Jahr (Zahl in der Mitte) der nächsten fälligen HU.',
    pos: 'rear', posLabel: 'HECK • TÜV-Sticker',
  },
  {
    id: 'kennzeichen_pflicht', category: 'Kennzeichen',
    question: 'Was muss beim Kennzeichen stets gewährleistet sein?',
    options: [
      'Es muss poliert und glänzend sein',
      'Es muss gut lesbar, unbeschädigt und beleuchtet sein',
      'Es darf beliebig gestaltet werden',
      'Nur das hintere Kennzeichen ist Pflicht',
    ],
    correctIdx: 1,
    hint: 'Das Kennzeichen muss gut lesbar, vollständig und sauber sein – sowie hinten beleuchtet. Verdecken ist verboten.',
    pos: 'rear', posLabel: 'HECK • Kennzeichen',
  },
  {
    id: 'reifen_profil_wert', category: 'Reifen',
    question: 'Was ist die gesetzliche Mindestprofiltiefe für Pkw-Reifen in Deutschland?',
    options: ['0,8 mm', '1,6 mm', '2,4 mm', '3,2 mm'],
    correctIdx: 1,
    hint: 'Gesetzlich: 1,6 mm – Experten empfehlen jedoch mindestens 3–4 mm für optimale Sicherheit bei Nässe.',
    pos: 'side', posLabel: 'SEITE • Reifenprofil',
  },
  {
    id: 'nebel_vorne', category: 'Beleuchtung',
    question: 'Was sagt das Nebellicht vorne (Nebelscheinwerfer) aus?',
    options: [
      'Darf immer bei schlechtem Wetter eingeschaltet werden',
      'Darf bei unsichtigem Wetter (Nebel, Schneefall) eingeschaltet werden',
      'Ist nur für die Autobahn zugelassen',
      'Muss bei jeder Nachtfahrt leuchten',
    ],
    correctIdx: 1,
    hint: 'Nebelscheinwerfer vorne: bei Nebel, starkem Schneefall oder Regen erlaubt – nicht bei normaler Dunkelheit.',
    pos: 'front', posLabel: 'FRONT • Nebelscheinwerfer',
  },
  {
    id: 'bremsflüssigkeit', category: 'Bremsen',
    question: 'Warum muss Bremsflüssigkeit regelmäßig gewechselt werden?',
    options: [
      'Sie verfärbt sich mit der Zeit bunt',
      'Sie zieht Wasser an und verliert dadurch ihren Siedepunkt',
      'Sie wird bei Kälte zu dünn',
      'Der Gesetzgeber schreibt es ohne besonderen Grund vor',
    ],
    correctIdx: 1,
    hint: 'Bremsflüssigkeit ist hygroskopisch – sie zieht Wasser an. Dadurch sinkt der Siedepunkt und es entstehen Dampfblasen → Bremsversagen.',
    pos: 'rear', posLabel: 'HECK • Bremsen',
  },
]

const QUESTIONS_PER_ROUND = 3

/* ─── Texts ────────────────────────────────────────────────── */
const GREETING = 'Hallo, ich heiße Tars und ich bin dein heutiger Prüfer.'
const P2_INTRO  = 'Sehr gut! Dann gehen wir jetzt zum Fahrzeug. Ich werde dir einige technische Fragen stellen.'

/* ─── Static stars ─────────────────────────────────────────── */
const STARS = [
  {x:14,y:6,r:1,o:0.5},{x:38,y:14,r:1.5,o:0.7},{x:62,y:4,r:1,o:0.45},{x:90,y:18,r:1,o:0.6},
  {x:118,y:8,r:2,o:0.8},{x:145,y:22,r:1,o:0.4},{x:170,y:11,r:1.5,o:0.65},{x:198,y:5,r:1,o:0.5},
  {x:226,y:19,r:1,o:0.55},{x:255,y:9,r:1.5,o:0.7},{x:282,y:24,r:1,o:0.45},{x:310,y:6,r:2,o:0.75},
  {x:338,y:16,r:1,o:0.5},{x:365,y:8,r:1.5,o:0.6},{x:385,y:20,r:1,o:0.4},
  {x:22,y:38,r:1,o:0.35},{x:58,y:44,r:1.5,o:0.6},{x:96,y:32,r:1,o:0.5},{x:134,y:48,r:1,o:0.45},
  {x:172,y:36,r:1.5,o:0.65},{x:210,y:42,r:1,o:0.4},{x:248,y:30,r:2,o:0.7},{x:286,y:46,r:1,o:0.5},
  {x:324,y:38,r:1.5,o:0.55},{x:362,y:44,r:1,o:0.4},
]

/* ─── Helpers ──────────────────────────────────────────────── */
function shufflePick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}


/* ─── TarsPosition for Phase 2 ────────────────────────────── */
function tarsP2Style(pos: CarPos): React.CSSProperties {
  const leftMap: Record<CarPos, string> = { front: '55%', side: '65%', rear: '77%' }
  return {
    position: 'absolute',
    left: leftMap[pos],
    bottom: '53%',
    width: '90px',
    transformOrigin: 'bottom center',
    transform: 'translateX(-50%) scale(0.82)',
    opacity: 1,
    transition: 'left 0.7s cubic-bezier(0.4,0,0.2,1)',
    pointerEvents: 'none',
    zIndex: 50,
  }
}

/* ══════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════ */
export default function SimulationClient() {
  /* ── Phase 1 state ── */
  const [phase,  setPhase]  = useState<P1Phase>('scene')
  const [typed,  setTyped]  = useState(0)

  /* ── Main phase ── */
  const [mainPhase, setMainPhase] = useState<MainPhase>('phase1')

  /* ── Phase 2 state ── */
  const [p2Phase,     setP2Phase]     = useState<P2Phase>('intro')
  const [p2Typed,     setP2Typed]     = useState(0)
  const [questions,   setQuestions]   = useState<Question[]>([])
  const [currentQ,    setCurrentQ]    = useState(0)
  const [answers,     setAnswers]     = useState<AnswerRecord[]>([])
  const [score,       setScore]       = useState(0)
  const [inputMode,   setInputMode]   = useState<InputMode>('text')
  const [userInput,   setUserInput]   = useState('')
  const [isListening, setIsListening] = useState(false)
  const [aiFeedback,  setAiFeedback]  = useState('')
  const [fbTyped,     setFbTyped]     = useState(0)
  const [loadingFb,   setLoadingFb]   = useState(false)
  const [ttsOn,       setTtsOn]       = useState(true)
  const [voiceError,  setVoiceError]  = useState('')

  const recognitionRef = useRef<any>(null)
  const panelRef       = useRef<HTMLDivElement>(null)
  const audioRef       = useRef<HTMLAudioElement | null>(null)

  /* ─── TTS: ElevenLabs (primär) + Browser-Fallback ──────── */
  const speakBrowser = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const doSpeak = () => {
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang  = 'de-DE'; utt.rate = 0.80; utt.pitch = 1.05; utt.volume = 1.0
      const voices = window.speechSynthesis.getVoices()
      const best =
        voices.find(v => v.name === 'Google Deutsch') ??
        voices.find(v => /Anna|Yannick|Petra|Hans/.test(v.name) && v.lang.startsWith('de')) ??
        voices.find(v => v.lang === 'de-DE' && !v.name.includes('Microsoft')) ??
        voices.find(v => v.lang.startsWith('de'))
      if (best) utt.voice = best
      window.speechSynthesis.speak(utt)
    }
    if (window.speechSynthesis.getVoices().length > 0) doSpeak()
    else { window.speechSynthesis.onvoiceschanged = () => { doSpeak(); window.speechSynthesis.onvoiceschanged = null }; setTimeout(doSpeak, 350) }
  }, [])

  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!ttsOn) return
    // laufendes Audio stoppen
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()

    try {
      const res = await fetch('/api/tars/speak', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.warn('[TTS] ElevenLabs fehlgeschlagen:', res.status, errData)
        throw new Error('ElevenLabs nicht verfügbar')
      }
      const blob  = await res.blob()
      const url   = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      await new Promise<void>((resolve) => {
        audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; resolve() }
        audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; resolve() }
        audio.play().catch(() => resolve())
      })
    } catch (e) {
      console.warn('[TTS] Fallback auf Browser-TTS:', e)
      speakBrowser(text)
    }
  }, [ttsOn, speakBrowser])

  /* ─── Phase 1 timers ──────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setPhase('approaching'), 900)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (phase !== 'approaching') return
    const t = setTimeout(() => setPhase('stopped'), 3200)
    return () => clearTimeout(t)
  }, [phase])
  useEffect(() => {
    if (phase !== 'stopped') return
    const t = setTimeout(() => setPhase('speaking'), 500)
    return () => clearTimeout(t)
  }, [phase])
  useEffect(() => {
    if (phase !== 'speaking') return
    if (ttsOn) { setPhase('ready'); return }
    if (typed >= GREETING.length) { setPhase('ready'); return }
    const ch = GREETING[typed]
    const delay = ch === '.' ? 320 : ch === ',' ? 160 : 42
    const t = setTimeout(() => setTyped(i => i + 1), delay)
    return () => clearTimeout(t)
  }, [phase, typed, ttsOn])

  /* ─── Phase 2 intro typewriter ────────────────────────── */
  useEffect(() => {
    if (mainPhase !== 'phase2' || p2Phase !== 'intro_typing') return
    if (ttsOn) { setP2Phase('intro'); return }
    if (p2Typed >= P2_INTRO.length) { setP2Phase('intro'); return }
    const ch = P2_INTRO[p2Typed]
    const delay = ch === '.' ? 300 : ch === ',' ? 150 : 38
    const t = setTimeout(() => setP2Typed(i => i + 1), delay)
    return () => clearTimeout(t)
  }, [mainPhase, p2Phase, p2Typed, ttsOn])

  /* ─── Phase 2 feedback typewriter ────────────────────── */
  useEffect(() => {
    if (p2Phase !== 'feedback' || !aiFeedback || loadingFb) return
    if (ttsOn) { setFbTyped(aiFeedback.length); return }
    if (fbTyped >= aiFeedback.length) return
    const ch = aiFeedback[fbTyped]
    const delay = ch === '.' ? 220 : ch === ',' ? 120 : 30
    const t = setTimeout(() => setFbTyped(i => i + 1), delay)
    return () => clearTimeout(t)
  }, [p2Phase, aiFeedback, fbTyped, loadingFb, ttsOn])

  /* ─── Scroll panel into view when question changes ────── */
  useEffect(() => {
    if (p2Phase === 'question' || p2Phase === 'feedback') {
      setTimeout(() => panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    }
  }, [currentQ, p2Phase])

  /* ─── Start Phase 2 ────────────────────────────────────── */
  const startPhase2 = () => {
    speakText(P2_INTRO)
    setMainPhase('phase2')
    setP2Phase('intro_typing')
    setP2Typed(0)
  }

  /* ─── Start questions ──────────────────────────────────── */
  const startQuestions = () => {
    const picked = shufflePick(ALL_QUESTIONS, QUESTIONS_PER_ROUND)
    setQuestions(picked)
    setCurrentQ(0)
    setScore(0)
    setAnswers([])
    setAiFeedback('')
    setFbTyped(0)
    setUserInput('')
    setP2Phase('question')
    speakText(picked[0].question)
  }

  /* ─── Submit free-text answer ──────────────────────────── */
  const submitAnswer = async (text: string) => {
    if (!text.trim() || p2Phase !== 'question') return
    const q = questions[currentQ]
    setUserInput('')
    setVoiceError('')
    setLoadingFb(true)
    setAiFeedback('')
    setFbTyped(0)
    setP2Phase('feedback')

    try {
      const res  = await fetch('/api/tars', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          question:      q.question,
          correctAnswer: q.options[q.correctIdx],
          userAnswer:    text,
          category:      q.category,
        }),
      })
      const data = await res.json()
      const correct = !!data.correct
      const feedback = data.feedback ?? (correct ? 'Richtig!' : `Korrekte Antwort: „${q.options[q.correctIdx]}"`)
      if (correct) setScore(s => s + 1)
      setAnswers(prev => [...prev, {
        question:      q.question,
        correctAnswer: q.options[q.correctIdx],
        userAnswer:    text,
        correct,
        feedback,
        hint:          q.hint,
      }])
      setAiFeedback(feedback)
      setLoadingFb(false)
      speakText(feedback)
    } catch {
      const fallback = `Antwort gespeichert.`
      setAnswers(prev => [...prev, {
        question:      q.question,
        correctAnswer: q.options[q.correctIdx],
        userAnswer:    text,
        correct:       false,
        feedback:      fallback,
        hint:          q.hint,
      }])
      setAiFeedback(fallback)
      setLoadingFb(false)
    }
  }

  /* ─── Next question ────────────────────────────────────── */
  const nextQuestion = () => {
    const next = currentQ + 1
    if (next >= questions.length) {
      setP2Phase('complete')
      window.speechSynthesis?.cancel()
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    } else {
      setCurrentQ(next)
      setAiFeedback('')
      setFbTyped(0)
      setUserInput('')
      setVoiceError('')
      setP2Phase('question')
      speakText(questions[next].question)
    }
  }

  /* ─── Voice input (auto-submit after recognition) ──────── */
  const startVoice = () => {
    setVoiceError('')
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setVoiceError('Spracherkennung wird von diesem Browser nicht unterstützt.'); return }
    const rec = new SR()
    rec.lang            = 'de-DE'
    rec.interimResults  = false
    rec.maxAlternatives = 1
    recognitionRef.current = rec
    rec.onstart  = () => setIsListening(true)
    rec.onend    = () => setIsListening(false)
    rec.onerror  = (e: any) => {
      setIsListening(false)
      setVoiceError(e.error === 'not-allowed' ? 'Mikrofon-Zugriff verweigert.' : 'Fehler bei der Aufnahme.')
    }
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setUserInput(transcript)
      submitAnswer(transcript)
    }
    rec.start()
  }
  const stopVoice = () => { recognitionRef.current?.stop() }

  /* ─── Restart ──────────────────────────────────────────── */
  const restart = () => {
    setMainPhase('phase2')
    setP2Phase('intro_typing')
    setP2Typed(0)
    setCurrentQ(0)
    setScore(0)
    setAnswers([])
    setAiFeedback('')
    setFbTyped(0)
    setLoadingFb(false)
    setUserInput('')
    setVoiceError('')
  }

  /* ── Derived values ── */
  const charVisible   = phase !== 'scene'
  const isApproaching = phase === 'approaching'
  const showDialogue  = phase === 'speaking' || phase === 'ready'
  const q = questions[currentQ]

  const p1TarsStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    bottom: '20%',
    width: '90px',
    transformOrigin: 'bottom center',
    transform: charVisible
      ? 'translateX(-50%) scale(1) translateY(0px)'
      : 'translateX(-50%) scale(0.07) translateY(-120px)',
    opacity: charVisible ? 1 : 0,
    transition: isApproaching
      ? 'transform 3.2s cubic-bezier(0.15,0,0.35,1), opacity 0.3s ease'
      : 'none',
    pointerEvents: 'none',
    zIndex: 50,
  }

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(180deg,#020810 0%,#060e1e 30%,#0a1628 60%,#0d2035 100%)',
      overflow: 'hidden', fontFamily: 'inherit',
    }}>

      {/* Back */}
      <Link href="/dashboard" style={{
        position: 'absolute', top: '1rem', left: '1rem', zIndex: 200,
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.55)', fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
      }}>←</Link>

      {/* TTS toggle */}
      <button onClick={() => setTtsOn(v => !v)} title={ttsOn ? 'Ton aus' : 'Ton an'} style={{
        position: 'absolute', top: '1rem', right: mainPhase === 'phase2' ? '1rem' : '8rem', zIndex: 200,
        width: '36px', height: '36px', borderRadius: '10px',
        background: ttsOn ? 'rgba(20,100,190,0.2)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${ttsOn ? 'rgba(96,180,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
        color: ttsOn ? '#60b4ff' : 'rgba(255,255,255,0.3)', fontSize: '1rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {ttsOn ? '🔊' : '🔇'}
      </button>

      {/* Label */}
      {mainPhase === 'phase1' && (
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem', zIndex: 200,
          padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(20,100,190,0.2)', border: '1px solid rgba(20,100,190,0.35)',
          fontSize: '0.58rem', fontWeight: 800, color: '#60b4ff', letterSpacing: '0.1em',
        }}>⚠ PRÜFUNGSMODUS</div>
      )}

      {/* Phase 2: score counter */}
      {mainPhase === 'phase2' && p2Phase !== 'complete' && questions.length > 0 && (
        <div style={{
          position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          padding: '4px 12px', borderRadius: '8px',
          background: 'rgba(20,100,190,0.2)', border: '1px solid rgba(20,100,190,0.35)',
          fontSize: '0.62rem', fontWeight: 800, color: '#60b4ff', letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}>
          {score} / {Math.min(currentQ, questions.length)} richtig · Frage {Math.min(currentQ+1, questions.length)}/{questions.length}
        </div>
      )}

      {/* Stars */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'55%', pointerEvents:'none' }}>
        {STARS.map((s,i) => (
          <circle key={i} cx={`${(s.x/390)*100}%`} cy={`${(s.y/160)*100}%`} r={s.r} fill="white" opacity={s.o}>
            <animate attributeName="opacity" values={`${s.o};${s.o*0.25};${s.o}`}
              dur={`${2.2+(i%6)*0.55}s`} repeatCount="indefinite"/>
          </circle>
        ))}
      </svg>

      {/* Moon */}
      <div style={{
        position:'absolute', top:'6%', right:'10%',
        width:'44px', height:'44px', borderRadius:'50%',
        background:'radial-gradient(circle at 35% 35%,#f2eacc,#c8b840)',
        boxShadow:'0 0 36px 10px rgba(235,220,140,0.22)',
      }}/>

      {/* Scene SVG */}
      <svg viewBox="0 0 390 420" preserveAspectRatio="xMidYMax meet"
        style={{ position:'absolute', bottom:'6%', left:0, width:'100%', pointerEvents:'none' }}>
        <defs>
          <linearGradient id="sg"  x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#10202e"/>
            <stop offset="100%" stopColor="#080f1a"/>
          </linearGradient>
          <linearGradient id="sr" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#18263a"/>
            <stop offset="100%" stopColor="#0c1828"/>
          </linearGradient>
          <radialGradient id="bl" cx="50%" cy="0%" r="80%">
            <stop offset="0%"   stopColor="rgba(20,100,190,0.12)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* City silhouette */}
        <path d="M0,200 L0,230 L20,230 L20,210 L35,210 L35,195 L50,195 L50,220 L70,220 L70,205
                 L80,205 L80,180 L90,180 L90,215 L105,215 L105,200 L120,200 L120,225 L140,225
                 L140,190 L150,190 L150,175 L160,175 L160,195 L175,195 L175,210 L190,210
                 L190,185 L200,185 L200,230 L390,230 L390,200 L370,200 L370,215 L355,215
                 L355,195 L340,195 L340,210 L325,210 L325,180 L310,180 L310,210 L295,210
                 L295,195 L280,195 L280,215 L265,215 L265,200 L250,200 L250,220 L235,220
                 L235,205 L220,205 L220,190 Z" fill="#0a1625"/>

        <rect x="0" y="295" width="390" height="130" fill="url(#sg)"/>
        <rect x="0" y="335" width="390" height="65"  fill="url(#sr)"/>
        <line x1="0" y1="335" x2="390" y2="335" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
        {[15,55,95,135,175,215,255,295,335,375].map(x => (
          <rect key={x} x={x} y="364" width="30" height="4" rx="2" fill="rgba(255,255,255,0.18)"/>
        ))}
        <rect x="0" y="395" width="390" height="3" rx="1" fill="rgba(255,255,255,0.07)"/>
        {[50,100,150,200,250,300,350].map(x => (
          <line key={x} x1={x} y1="295" x2={x} y2="335" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        ))}

        {/* Building */}
        <ellipse cx="128" cy="300" rx="90" ry="10" fill="url(#bl)"/>
        <rect x="28" y="62" width="196" height="240" rx="4" fill="#0c1c32" stroke="#1a3254" strokeWidth="1.5"/>
        <rect x="32" y="66" width="188" height="232" rx="2" fill="#0d1e30"/>
        <path d="M32,66 L32,220 L85,66 Z" fill="rgba(255,255,255,0.015)"/>
        {[40,72,104,136,168,196].map((x,i) => (
          <rect key={i} x={x} y="66" width="3" height="232" rx="1" fill="rgba(255,255,255,0.04)"/>
        ))}
        {Array.from({length:8},(_,row) =>
          [40,70,100,130,170].map((x,col) => {
            const skip = (row*5+col)%9===0||(row*5+col)%13===0
            const warm = (row+col)%3===0
            return !skip && (
              <rect key={`${row}-${col}`} x={x} y={72+row*28} width={20} height={20} rx="2"
                fill={warm?`rgba(255,200,90,${0.45+(row+col)*0.025})`:`rgba(140,200,255,${0.35+row*0.03})`}/>
            )
          })
        )}
        <rect x="28" y="58" width="196" height="8"  rx="3" fill="#1a3060" stroke="#2a4a80" strokeWidth="1"/>
        <rect x="55" y="40" width="142" height="22" rx="3" fill="#0e1c34" stroke="#1a3254" strokeWidth="1"/>
        <line x1="126" y1="40" x2="126" y2="8" stroke="#1e3a60" strokeWidth="2.5"/>
        <circle cx="126" cy="6" r="4" fill="#f97316" filter="url(#glow2)">
          <animate attributeName="opacity" values="1;0.15;1" dur="1.4s" repeatCount="indefinite"/>
        </circle>
        <line x1="145" y1="40" x2="145" y2="15" stroke="#1e3a60" strokeWidth="1.5"/>
        <circle cx="145" cy="13" r="3" fill="#22c55e" filter="url(#glow2)" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.9s" repeatCount="indefinite"/>
        </circle>
        <rect x="96" y="256" width="60" height="44" rx="3" fill="#08101e" stroke="#1a3050" strokeWidth="1.2"/>
        <rect x="99" y="259" width="26" height="41" rx="2" fill="#0d2040" stroke="#1a4060" strokeWidth="0.8"/>
        <rect x="127" y="259" width="26" height="41" rx="2" fill="#0d2040" stroke="#1a4060" strokeWidth="0.8"/>
        <line x1="103" y1="263" x2="103" y2="296" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <line x1="131" y1="263" x2="131" y2="296" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <rect x="36" y="236" width="180" height="22" rx="4" fill="#082856" stroke="#1464be" strokeWidth="1.8"/>
        <rect x="38" y="238" width="176" height="18" rx="3" fill="#0a3572"/>
        <text x="127" y="251" textAnchor="middle" fontSize="10" fontWeight="900"
          fill="#60b4ff" fontFamily="monospace" letterSpacing="2.5">TARS-STATION</text>

        {/* Flagpole */}
        <line x1="228" y1="300" x2="228" y2="42" stroke="#2a3a50" strokeWidth="2.5"/>
        <circle cx="228" cy="39" r="5" fill="#4a6080" stroke="#3a5070" strokeWidth="1"/>
        <rect x="230" y="46" width="52" height="34" rx="3" fill="#1055b0">
          <animateTransform attributeName="transform" type="skewX" values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </rect>
        <rect x="230" y="65" width="52" height="8" rx="0" fill="#0a3a8a">
          <animateTransform attributeName="transform" type="skewX" values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </rect>
        <text x="256" y="60" textAnchor="middle" fontSize="10" fontWeight="900" fill="white" fontFamily="monospace" letterSpacing="1">
          TARS
          <animateTransform attributeName="transform" type="skewX" values="0;3;0;-2;0" dur="2.4s" repeatCount="indefinite"/>
        </text>

        {/* Fahrschule car — scale 0.60 um Bodenpunkt (320, 320) */}
        <g transform="translate(320,320) scale(0.60) translate(-320,-320)">
        <ellipse cx="322" cy="316" rx="60" ry="7" fill="rgba(0,0,0,0.5)"/>
        <path d="M262,308 L262,285 Q264,270 278,266 L308,258 L342,258 Q360,258 372,268 L378,285 L378,308 Z"
          fill="#18283e" stroke="#2a3e5a" strokeWidth="1.5"/>
        <path d="M278,266 L308,254 L342,254 L368,268" fill="none" stroke="#3a5070" strokeWidth="1"/>
        <path d="M278,266 L286,258 L314,256 L314,270 L275,272 Z" fill="#1a3a60" stroke="#2a5080" strokeWidth="0.8" opacity="0.9"/>
        <path d="M342,256 L366,268 L365,272 L342,270 Z" fill="#1a3a60" stroke="#2a5080" strokeWidth="0.8" opacity="0.9"/>
        <rect x="318" y="258" width="22" height="10" rx="2" fill="#1a3a60" stroke="#2a5080" strokeWidth="0.5" opacity="0.9"/>
        <line x1="318" y1="258" x2="318" y2="307" stroke="#243450" strokeWidth="0.8"/>
        <rect x="295" y="285" width="18" height="4" rx="2" fill="#2a3e5a" stroke="#3a5070" strokeWidth="0.5"/>
        <rect x="265" y="283" width="10" height="7" rx="2" fill="#fef08a" opacity="0.5" filter="url(#glow2)"/>
        <rect x="376" y="283" width="5"  height="7" rx="1" fill="#ef4444" opacity="0.6"/>
        {/* Wheels */}
        {[285,358].map(cx => (
          <g key={cx}>
            <circle cx={cx} cy="308" r="12" fill="#0e1520" stroke="#374151" strokeWidth="1.5"/>
            <circle cx={cx} cy="308" r="8"  fill="#18243a" stroke="#4b5563" strokeWidth="1"/>
            <circle cx={cx} cy="308" r="3"  fill="#374151"/>
            {[0,45,90,135,180,225,270,315].map((a,i) => (
              <line key={i}
                x1={cx+4*Math.cos(a*Math.PI/180)} y1={308+4*Math.sin(a*Math.PI/180)}
                x2={cx+7*Math.cos(a*Math.PI/180)} y2={308+7*Math.sin(a*Math.PI/180)}
                stroke="#4b5563" strokeWidth="1.5"/>
            ))}
          </g>
        ))}
        <rect x="290" y="246" width="66" height="14" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2"/>
        <text x="323" y="256" textAnchor="middle" fontSize="7" fontWeight="900" fill="#78350f" letterSpacing="0.5">FAHRSCHULE</text>
        <line x1="305" y1="256" x2="305" y2="260" stroke="#d97706" strokeWidth="1.5"/>
        <line x1="341" y1="256" x2="341" y2="260" stroke="#d97706" strokeWidth="1.5"/>
        </g>
      </svg>

      {/* ═══ TARS CHARACTER ═══ */}
      {mainPhase === 'phase1' && (
        <div style={p1TarsStyle}>
          <div style={{ animation: (phase==='stopped'||phase==='speaking'||phase==='ready') ? 'tarsIdle 3s ease-in-out infinite' : 'none' }}>
            <TarsCharacter />
          </div>
        </div>
      )}
      {mainPhase === 'phase2' && p2Phase !== 'complete' && q && (
        <div style={tarsP2Style(q.pos)}>
          <div style={{ animation: 'tarsIdle 3s ease-in-out infinite' }}>
            <TarsCharacter />
          </div>
        </div>
      )}
      {mainPhase === 'phase2' && (p2Phase === 'intro' || p2Phase === 'intro_typing') && (
        <div style={p1TarsStyle}>
          <div style={{ animation: 'tarsIdle 3s ease-in-out infinite' }}>
            <TarsCharacter />
          </div>
        </div>
      )}

      {/* ═══ PHASE 1 DIALOGUE ═══ */}
      {mainPhase === 'phase1' && showDialogue && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, zIndex:100,
          background:'linear-gradient(to top,rgba(4,10,22,0.99) 0%,rgba(4,10,22,0.97) 65%,transparent 100%)',
          padding:'1.25rem 1.25rem 2.75rem',
          animation:'simDialogUp 0.4s cubic-bezier(0.2,0,0.2,1)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.8rem' }}>
            <div style={{
              width:'42px', height:'42px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#1464be 0%,#082856 100%)',
              border:'2px solid rgba(96,180,255,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem',
            }}>🎓</div>
            <div>
              <p style={{ margin:0, fontSize:'0.78rem', fontWeight:900, color:'#60b4ff' }}>Tars</p>
              <p style={{ margin:0, fontSize:'0.58rem', color:'rgba(255,255,255,0.38)', letterSpacing:'0.04em' }}>
                TÜV · Amtlich bestellter Fahrprüfer
              </p>
            </div>
            {phase === 'speaking' && (
              <div style={{ marginLeft:'auto', display:'flex', gap:'4px', alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:'6px', height:'6px', borderRadius:'50%', background:'#1464be',
                    animation:`tarsDot 1.1s ${i*0.22}s ease-in-out infinite`,
                  }}/>
                ))}
              </div>
            )}
          </div>
          <div style={{
            background:'rgba(10,24,50,0.6)', borderRadius:'0.85rem',
            border:'1px solid rgba(20,100,190,0.25)',
            padding:'0.85rem 1rem', marginBottom:'0.85rem', minHeight:'60px',
          }}>
            <p style={{ margin:0, fontSize:'0.96rem', fontWeight:500, color:'rgba(255,255,255,0.92)', lineHeight:1.65 }}>
              {ttsOn ? GREETING : GREETING.slice(0, typed)}
              {phase === 'speaking' && !ttsOn && <span style={{ animation:'tarsCursor 0.75s step-end infinite', opacity:1 }}>|</span>}
            </p>
          </div>
          {phase === 'ready' && (
            <button onClick={startPhase2} style={{
              width:'100%', padding:'0.9rem',
              background:'linear-gradient(135deg,#1055b0,#082856)',
              border:'1px solid rgba(96,180,255,0.35)', borderRadius:'100px',
              color:'white', fontWeight:800, fontSize:'0.92rem', cursor:'pointer',
              boxShadow:'0 4px 24px rgba(20,100,190,0.4)',
              animation:'simFadeIn 0.5s ease', letterSpacing:'0.02em',
            }}>Weiter →</button>
          )}
        </div>
      )}

      {/* ═══ PHASE 2 INTRO ═══ */}
      {mainPhase === 'phase2' && (p2Phase === 'intro' || p2Phase === 'intro_typing') && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, zIndex:100,
          background:'linear-gradient(to top,rgba(4,10,22,0.99) 0%,rgba(4,10,22,0.97) 65%,transparent 100%)',
          padding:'1.25rem 1.25rem 2.75rem',
          animation:'simDialogUp 0.4s cubic-bezier(0.2,0,0.2,1)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.8rem' }}>
            <div style={{
              width:'42px', height:'42px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#1464be 0%,#082856 100%)',
              border:'2px solid rgba(96,180,255,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem',
            }}>🎓</div>
            <div>
              <p style={{ margin:0, fontSize:'0.78rem', fontWeight:900, color:'#60b4ff' }}>Tars</p>
              <p style={{ margin:0, fontSize:'0.58rem', color:'rgba(255,255,255,0.38)' }}>
                Fahrzeug-Rundgang
              </p>
            </div>
            {p2Phase === 'intro_typing' && (
              <div style={{ marginLeft:'auto', display:'flex', gap:'4px', alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:'6px', height:'6px', borderRadius:'50%', background:'#1464be',
                    animation:`tarsDot 1.1s ${i*0.22}s ease-in-out infinite`,
                  }}/>
                ))}
              </div>
            )}
          </div>
          <div style={{
            background:'rgba(10,24,50,0.6)', borderRadius:'0.85rem',
            border:'1px solid rgba(20,100,190,0.25)',
            padding:'0.85rem 1rem', marginBottom:'0.85rem', minHeight:'60px',
          }}>
            <p style={{ margin:0, fontSize:'0.96rem', fontWeight:500, color:'rgba(255,255,255,0.92)', lineHeight:1.65 }}>
              {ttsOn ? P2_INTRO : P2_INTRO.slice(0, p2Typed)}
              {p2Phase === 'intro_typing' && !ttsOn && <span style={{ animation:'tarsCursor 0.75s step-end infinite' }}>|</span>}
            </p>
          </div>
          {p2Phase === 'intro' && p2Typed >= P2_INTRO.length && (
            <button onClick={startQuestions} style={{
              width:'100%', padding:'0.9rem',
              background:'linear-gradient(135deg,#1055b0,#082856)',
              border:'1px solid rgba(96,180,255,0.35)', borderRadius:'100px',
              color:'white', fontWeight:800, fontSize:'0.92rem', cursor:'pointer',
              boxShadow:'0 4px 24px rgba(20,100,190,0.4)',
              animation:'simFadeIn 0.5s ease',
            }}>Los geht&apos;s →</button>
          )}
        </div>
      )}

      {/* ═══ PHASE 2 QUESTION PANEL ═══ */}
      {mainPhase === 'phase2' && (p2Phase === 'question' || p2Phase === 'feedback') && q && (
        <div ref={panelRef} style={{
          position:'absolute', bottom:0, left:0, right:0, zIndex:100,
          background:'linear-gradient(to top,rgba(4,10,22,1) 0%,rgba(4,10,22,0.98) 80%,transparent 100%)',
          padding:'1rem 1.1rem 2.5rem',
          maxHeight:'70vh', overflowY:'auto',
          animation:'simDialogUp 0.4s cubic-bezier(0.2,0,0.2,1)',
        }}>
          {/* Progress bar */}
          <div style={{ display:'flex', gap:'5px', marginBottom:'0.75rem' }}>
            {questions.map((_,i) => (
              <div key={i} style={{
                height:'4px', flex:1, borderRadius:'2px',
                background: i < currentQ ? '#4ade80' : i===currentQ ? '#60b4ff' : 'rgba(255,255,255,0.12)',
                transition:'background 0.4s',
              }}/>
            ))}
          </div>

          {/* Position badge + 🔊 */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.65rem' }}>
            <span style={{
              fontSize:'0.58rem', fontWeight:800, padding:'3px 10px', borderRadius:'6px',
              background:'rgba(96,180,255,0.1)', border:'1px solid rgba(96,180,255,0.25)',
              color:'#60b4ff', letterSpacing:'0.06em',
            }}>📍 {q.posLabel}</span>
            <button onClick={() => speakText(q.question)} style={{
              background:'transparent', border:'none', color:'rgba(255,255,255,0.3)',
              cursor:'pointer', fontSize:'0.85rem', padding:'2px',
            }}>🔊</button>
          </div>

          {/* Question */}
          <div style={{
            background:'rgba(10,24,50,0.6)', border:'1px solid rgba(20,100,190,0.25)',
            borderRadius:'0.85rem', padding:'0.85rem 1rem', marginBottom:'0.85rem',
          }}>
            <p style={{ margin:0, fontSize:'0.97rem', fontWeight:600, color:'rgba(255,255,255,0.95)', lineHeight:1.6 }}>
              {q.question}
            </p>
          </div>

          {/* Input: Text + Mic (nur während Frage aktiv) */}
          {p2Phase === 'question' && (
            <>
              {/* Mode toggle */}
              <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.6rem' }}>
                {(['text','voice'] as InputMode[]).map(m => (
                  <button key={m} onClick={() => { setInputMode(m); setVoiceError('') }} style={{
                    flex:1, padding:'0.4rem',
                    background: inputMode===m ? 'rgba(20,100,190,0.28)' : 'transparent',
                    border: `1px solid ${inputMode===m ? 'rgba(96,180,255,0.4)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius:'0.5rem',
                    color: inputMode===m ? '#60b4ff' : 'rgba(255,255,255,0.38)',
                    fontSize:'0.65rem', fontWeight:700, cursor:'pointer',
                  }}>
                    {m === 'text' ? '✏️ Schreiben' : '🎤 Sprechen'}
                  </button>
                ))}
              </div>

              {/* Text input */}
              {inputMode === 'text' && (
                <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                  <input
                    autoFocus
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitAnswer(userInput)}
                    placeholder="Antwort eingeben …"
                    style={{
                      flex:1, padding:'0.7rem 0.9rem',
                      background:'rgba(10,24,50,0.7)', border:'1px solid rgba(20,100,190,0.35)',
                      borderRadius:'0.65rem', color:'white', fontSize:'0.92rem', outline:'none',
                    }}
                  />
                  <button
                    onClick={() => submitAnswer(userInput)}
                    disabled={!userInput.trim()}
                    style={{
                      padding:'0.7rem 1.1rem', borderRadius:'0.65rem',
                      background: userInput.trim() ? 'linear-gradient(135deg,#1055b0,#082856)' : 'rgba(255,255,255,0.05)',
                      border:'1px solid rgba(96,180,255,0.35)', color:'white',
                      fontWeight:800, fontSize:'1rem', cursor: userInput.trim() ? 'pointer' : 'default',
                      opacity: userInput.trim() ? 1 : 0.4,
                    }}>→</button>
                </div>
              )}

              {/* Voice input */}
              {inputMode === 'voice' && (
                <button
                  onClick={isListening ? stopVoice : startVoice}
                  style={{
                    width:'100%', padding:'0.9rem', marginBottom:'0.5rem',
                    background: isListening ? 'rgba(239,68,68,0.18)' : 'rgba(20,100,190,0.18)',
                    border: `1px solid ${isListening ? 'rgba(239,68,68,0.45)' : 'rgba(96,180,255,0.35)'}`,
                    borderRadius:'0.75rem',
                    color: isListening ? '#f87171' : '#60b4ff',
                    fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem',
                    animation: isListening ? 'micPulse 1.2s ease-in-out infinite' : 'none',
                  }}>
                  {isListening
                    ? <><span style={{width:'9px',height:'9px',borderRadius:'50%',background:'#ef4444',display:'inline-block',animation:'tarsDot 0.8s ease-in-out infinite'}}/>Aufnahme läuft …</>
                    : <><span>🎤</span> Antwort sprechen (automatisch gesendet)</>}
                </button>
              )}

              {voiceError && <p style={{ margin:'0 0 0.5rem', fontSize:'0.72rem', color:'#f87171', textAlign:'center' }}>{voiceError}</p>}
            </>
          )}

          {/* Tars Feedback */}
          {p2Phase === 'feedback' && (
            <div style={{
              display:'flex', gap:'0.65rem', alignItems:'flex-start',
              background:'rgba(10,24,50,0.6)', border:'1px solid rgba(20,100,190,0.25)',
              borderRadius:'0.85rem', padding:'0.85rem 1rem', marginBottom:'0.8rem',
              animation:'simFadeIn 0.4s ease',
            }}>
              <div style={{ fontSize:'1.2rem', flexShrink:0 }}>🎓</div>
              <div style={{ flex:1 }}>
                {loadingFb
                  ? <div style={{ display:'flex', gap:'4px', paddingTop:'4px' }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:'7px',height:'7px',borderRadius:'50%',background:'#1464be', animation:`tarsDot 1.1s ${i*0.22}s ease-in-out infinite` }}/>)}
                    </div>
                  : <p style={{ margin:0, fontSize:'0.88rem', color:'rgba(255,255,255,0.88)', lineHeight:1.55 }}>
                      {ttsOn ? aiFeedback : aiFeedback.slice(0, fbTyped)}
                      {!ttsOn && fbTyped < aiFeedback.length && <span style={{ animation:'tarsCursor 0.75s step-end infinite' }}>|</span>}
                    </p>
                }
              </div>
              <button onClick={() => speakText(aiFeedback)} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'0.85rem', padding:'2px', flexShrink:0 }}>🔊</button>
            </div>
          )}

          {/* Weiter */}
          {p2Phase === 'feedback' && !loadingFb && (
            <button onClick={nextQuestion} style={{
              width:'100%', padding:'0.9rem',
              background:'linear-gradient(135deg,#1055b0,#082856)',
              border:'1px solid rgba(96,180,255,0.35)', borderRadius:'100px',
              color:'white', fontWeight:800, fontSize:'0.92rem', cursor:'pointer',
              boxShadow:'0 4px 24px rgba(20,100,190,0.4)',
              animation:'simFadeIn 0.35s ease',
            }}>
              {currentQ + 1 < questions.length ? 'Nächste Frage →' : 'Auswertung anzeigen →'}
            </button>
          )}
        </div>
      )}

      {/* ═══ PHASE 2 AUSWERTUNG ═══ */}
      {mainPhase === 'phase2' && p2Phase === 'complete' && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, zIndex:100,
          background:'linear-gradient(to top,rgba(4,10,22,1) 0%,rgba(4,10,22,0.99) 85%,transparent 100%)',
          padding:'1.25rem 1.1rem 3rem',
          maxHeight:'82vh', overflowY:'auto',
          animation:'simDialogUp 0.4s cubic-bezier(0.2,0,0.2,1)',
        }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
            <div style={{
              width:'52px', height:'52px', borderRadius:'50%', flexShrink:0,
              background: score === answers.length
                ? 'linear-gradient(135deg,rgba(34,197,94,0.25),rgba(34,197,94,0.05))'
                : score >= 2
                  ? 'linear-gradient(135deg,rgba(251,191,36,0.25),rgba(251,191,36,0.05))'
                  : 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.05))',
              border: `2px solid ${score === answers.length ? 'rgba(34,197,94,0.5)' : score >= 2 ? 'rgba(251,191,36,0.5)' : 'rgba(239,68,68,0.4)'}`,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontSize:'1.3rem', fontWeight:900, color: score === answers.length ? '#4ade80' : score >= 2 ? '#fbbf24' : '#f87171', lineHeight:1 }}>{score}</span>
              <span style={{ fontSize:'0.52rem', color:'rgba(255,255,255,0.35)' }}>/{answers.length}</span>
            </div>
            <div>
              <p style={{ margin:0, fontSize:'1rem', fontWeight:900, color:'white' }}>
                {score === answers.length ? '🏆 Perfekt!' : score >= 2 ? '👍 Gut gemacht' : '📚 Weiter üben'}
              </p>
              <p style={{ margin:0, fontSize:'0.72rem', color:'rgba(255,255,255,0.45)' }}>
                {score} von {answers.length} Fragen korrekt beantwortet
              </p>
            </div>
          </div>

          {/* Stars */}
          <div style={{ display:'flex', gap:'0.2rem', justifyContent:'center', marginBottom:'1rem' }}>
            {Array.from({length:3},(_,i) => (
              <span key={i} style={{
                fontSize:'1.5rem',
                opacity: i < Math.ceil((score/answers.length)*3) ? 1 : 0.15,
                filter: i < Math.ceil((score/answers.length)*3) ? 'drop-shadow(0 0 6px #fbbf24)' : 'none',
              }}>⭐</span>
            ))}
          </div>

          {/* Detaillierte Auswertung */}
          <p style={{ margin:'0 0 0.6rem', fontSize:'0.65rem', fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            Auswertung im Detail
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'1rem' }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                background: a.correct ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${a.correct ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.22)'}`,
                borderRadius:'0.85rem', padding:'0.8rem 0.9rem',
              }}>
                {/* Frage */}
                <p style={{ margin:'0 0 0.35rem', fontSize:'0.78rem', fontWeight:700, color:'rgba(255,255,255,0.85)', lineHeight:1.4 }}>
                  {i+1}. {a.question}
                </p>
                {/* Deine Antwort */}
                <p style={{ margin:'0 0 0.25rem', fontSize:'0.72rem', color:'rgba(255,255,255,0.5)', lineHeight:1.35 }}>
                  <span style={{ color:'rgba(255,255,255,0.3)' }}>Deine Antwort: </span>
                  <span style={{ fontStyle:'italic', color: a.correct ? '#4ade80' : '#f87171' }}>„{a.userAnswer}"</span>
                  <span style={{ marginLeft:'0.4rem', fontSize:'0.85rem' }}>{a.correct ? '✓' : '✗'}</span>
                </p>
                {/* Korrekte Antwort (nur bei Fehler) */}
                {!a.correct && (
                  <p style={{ margin:'0 0 0.25rem', fontSize:'0.72rem', color:'#4ade80', lineHeight:1.35 }}>
                    ✓ Korrekt: „{a.correctAnswer}"
                  </p>
                )}
                {/* Tars Feedback */}
                <p style={{ margin:'0.3rem 0 0', fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', lineHeight:1.4, borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'0.3rem' }}>
                  🎓 {a.feedback}
                </p>
              </div>
            ))}
          </div>

          {/* Tars Schlusswort */}
          <div style={{
            background:'rgba(20,100,190,0.08)', border:'1px solid rgba(96,180,255,0.18)',
            borderRadius:'0.85rem', padding:'0.75rem 1rem', marginBottom:'1rem',
          }}>
            <p style={{ margin:0, fontSize:'0.82rem', color:'rgba(255,255,255,0.75)', lineHeight:1.5, fontStyle:'italic' }}>
              {score === answers.length
                ? '„Ausgezeichnet! Alle Fragen richtig – das ist das Niveau eines Profifahrers."'
                : score >= 2
                  ? '„Solide Leistung! Wiederholen Sie die schwachen Punkte und Sie sind bereit."'
                  : '„Keine Sorge – mit etwas Übung werden Sie das schaffen. Weiter so!"'}
            </p>
            <p style={{ margin:'0.35rem 0 0', fontSize:'0.6rem', color:'rgba(255,255,255,0.3)' }}>— Tars, Fahrprüfer</p>
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:'0.6rem' }}>
            <button onClick={restart} style={{
              flex:1, padding:'0.85rem', background:'transparent',
              border:'1px solid rgba(96,180,255,0.3)', borderRadius:'100px',
              color:'#60b4ff', fontWeight:700, fontSize:'0.88rem', cursor:'pointer',
            }}>🔄 Nochmal</button>
            <Link href="/dashboard" style={{
              flex:1, padding:'0.85rem',
              background:'linear-gradient(135deg,#1055b0,#082856)',
              border:'1px solid rgba(96,180,255,0.35)', borderRadius:'100px',
              color:'white', fontWeight:800, fontSize:'0.88rem',
              display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none',
            }}>🏠 Dashboard</Link>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        @keyframes simDialogUp {
          from { transform: translateY(24px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        @keyframes simFadeIn {
          from { opacity: 0; transform: translateY(8px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes tarsIdle {
          0%,100% { transform: translateY(0px) }
          50%     { transform: translateY(-4px) }
        }
        @keyframes tarsDot {
          0%,60%,100% { transform: translateY(0); opacity: 0.7 }
          30%         { transform: translateY(-5px); opacity: 1 }
        }
        @keyframes tarsCursor {
          0%,100% { opacity: 1 }
          50%     { opacity: 0 }
        }
        @keyframes micPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3) }
          50%     { box-shadow: 0 0 0 8px rgba(239,68,68,0) }
        }
        input::placeholder { color: rgba(255,255,255,0.25) }
        input:focus { border-color: rgba(96,180,255,0.5) !important; box-shadow: 0 0 0 2px rgba(96,180,255,0.1) }
      `}</style>
    </div>
  )
}

/* ─── Tars Character SVG ─────────────────────────────────── */
function TarsCharacter() {
  return (
    <svg viewBox="0 0 90 172" width="90" height="172">
      <ellipse cx="45" cy="168" rx="22" ry="5" fill="rgba(0,0,0,0.45)"/>
      <rect x="28" y="118" width="13" height="42" rx="5" fill="#0a1e40"/>
      <rect x="47" y="118" width="13" height="42" rx="5" fill="#0a1e40"/>
      <rect x="24" y="156" width="20" height="9" rx="4" fill="#111820"/>
      <rect x="44" y="156" width="20" height="9" rx="4" fill="#111820"/>
      <path d="M18,60 Q16,57 22,54 L34,52 L45,56 L56,52 L68,54 Q74,57 72,60 L74,118 L16,118 Z"
        fill="#1055b0" stroke="#0a3a8a" strokeWidth="1"/>
      <path d="M37,53 L45,58 L53,53" fill="white"/>
      <path d="M42,55 L45,72 L48,55" fill="#c0392b" stroke="#922b21" strokeWidth="0.5"/>
      <rect x="18" y="104" width="54" height="6" rx="3" fill="#08142a"/>
      <rect x="39" y="104" width="12" height="6" rx="2" fill="#c8a020"/>
      <rect x="48" y="64" width="18" height="24" rx="3" fill="#0a3060" stroke="#1464be" strokeWidth="1"/>
      <rect x="50" y="66" width="14" height="20" rx="2" fill="#d4a020" opacity="0.9"/>
      <text x="57" y="78" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0a1e40">TÜV</text>
      <line x1="51" y1="80" x2="63" y2="80" stroke="#0a1e40" strokeWidth="0.8"/>
      <text x="57" y="84" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#0a1e40">PRÜFER</text>
      <path d="M18,60 Q9,72 11,90 L18,88 Q20,72 24,62 Z" fill="#1055b0" stroke="#0a3a8a" strokeWidth="0.8"/>
      <circle cx="13" cy="93" r="6" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.5"/>
      <path d="M72,60 Q81,72 79,90 L72,88 Q70,72 66,62 Z" fill="#1055b0" stroke="#0a3a8a" strokeWidth="0.8"/>
      <rect x="68" y="68" width="20" height="30" rx="3" fill="#e8c870" stroke="#b89820" strokeWidth="1"/>
      <rect x="72" y="63" width="12" height="8"  rx="2" fill="#8b6818" stroke="#6b4e10" strokeWidth="0.8"/>
      <line x1="70" y1="76" x2="86" y2="76" stroke="#8b6818" strokeWidth="1.2"/>
      <line x1="70" y1="82" x2="86" y2="82" stroke="#8b6818" strokeWidth="1.2"/>
      <line x1="70" y1="88" x2="80" y2="88" stroke="#8b6818" strokeWidth="1.2"/>
      <circle cx="77" cy="100" r="5" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.5"/>
      <rect x="37" y="44" width="16" height="14" rx="5" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.5"/>
      <circle cx="45" cy="30" r="20" fill="#f0c8a0" stroke="#ddb880" strokeWidth="0.8"/>
      <ellipse cx="25" cy="31" rx="4" ry="5" fill="#ebbf98" stroke="#ddb880" strokeWidth="0.5"/>
      <ellipse cx="65" cy="31" rx="4" ry="5" fill="#ebbf98" stroke="#ddb880" strokeWidth="0.5"/>
      <circle cx="36" cy="28" r="4" fill="white"/>
      <circle cx="54" cy="28" r="4" fill="white"/>
      <circle cx="37" cy="29" r="2.2" fill="#2a3e70"/>
      <circle cx="55" cy="29" r="2.2" fill="#2a3e70"/>
      <circle cx="37.5" cy="29" r="1"   fill="#111"/>
      <circle cx="55.5" cy="29" r="1"   fill="#111"/>
      <circle cx="38.5" cy="27.5" r="0.8" fill="rgba(255,255,255,0.8)"/>
      <circle cx="56.5" cy="27.5" r="0.8" fill="rgba(255,255,255,0.8)"/>
      <path d="M31,22 Q36,20 41,22" fill="none" stroke="#7a5535" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M49,22 Q54,20 59,22" fill="none" stroke="#7a5535" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M35,38 Q45,45 55,38" fill="none" stroke="#7a5535" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M43,32 Q45,35 47,32" fill="none" stroke="#c8956a" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M24,22 Q24,8 45,8 Q66,8 66,22 Z" fill="#0a2a60" stroke="#1464be" strokeWidth="1"/>
      <rect x="20" y="22" width="50" height="6" rx="2" fill="#0a2a60" stroke="#1464be" strokeWidth="1"/>
      <rect x="32" y="11" width="26" height="13" rx="3" fill="#c8a020" stroke="#a07810" strokeWidth="0.8"/>
      <text x="45" y="20" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0a1e40">TÜV</text>
      <rect x="16" y="56" width="12" height="4" rx="1" fill="#d4a020" opacity="0.8"/>
      <rect x="62" y="56" width="12" height="4" rx="1" fill="#d4a020" opacity="0.8"/>
    </svg>
  )
}
