'use client'
import { useState } from 'react'

/* ─── Types ─────────────────────────────────────────────── */
type Check = { label: string; done: boolean }
type CarPart = {
  id: string; cx: number; cy: number
  title: string; subtitle: string; color: string
  checks: Check[]
  info: string
  tip?: string; law?: string
  sticker?: boolean
  tire?: boolean
  washer?: boolean
  oilCheck?: boolean
  coolantCheck?: boolean
}

const VIEWS = ['Heck', 'Front', 'Seite'] as const
type View = typeof VIEWS[number]

/* ─── View Parts ─────────────────────────────────────────── */
const VIEW_PARTS: Record<View, CarPart[]> = {
  Heck: [
    {
      id: 'reflektor-l', cx: 76, cy: 176, color: '#f87171',
      title: 'Rückstrahler Links', subtitle: 'Passiv · Rot',
      checks: [
        { label: 'Vorhanden & unbeschädigt', done: false },
        { label: 'Sauber (nicht verschmutzt)', done: false },
        { label: 'Fest montiert', done: false },
      ],
      info: 'Rote Rückstrahler reflektieren das Licht anderer Fahrzeuge zurück – ohne eigene Stromversorgung. Pflicht an jedem Fahrzeug.',
      tip: 'Reflektoren müssen auch bei Tageslicht gut sichtbar sein – auf Risse oder Schmutz prüfen.',
      law: '§ 51a StVZO',
    },
    {
      id: 'reflektor-r', cx: 324, cy: 176, color: '#f87171',
      title: 'Rückstrahler Rechts', subtitle: 'Passiv · Rot',
      checks: [
        { label: 'Vorhanden & unbeschädigt', done: false },
        { label: 'Sauber (nicht verschmutzt)', done: false },
        { label: 'Fest montiert', done: false },
      ],
      info: 'Rote Rückstrahler reflektieren das Licht anderer Fahrzeuge zurück – ohne eigene Stromversorgung. Pflicht an jedem Fahrzeug.',
      tip: 'Reflektoren müssen auch bei Tageslicht gut sichtbar sein – auf Risse oder Schmutz prüfen.',
      law: '§ 51a StVZO',
    },
    {
      id: 'bremslicht-l', cx: 50, cy: 106, color: '#ef4444',
      title: 'Bremslicht Links', subtitle: 'Aktiv · Rot',
      checks: [
        { label: 'Leuchtet beim Bremsen', done: false },
        { label: 'Kein Riss / keine Verschmutzung', done: false },
        { label: 'Gleichmäßige Helligkeit', done: false },
      ],
      info: 'Beim T-Roc gibt es insgesamt 3 Bremslichter: links, rechts und ein mittleres Hochbremslicht (CHMSL). Alle 3 müssen beim Bremsen leuchten.\n\n🔍 Alleine prüfen: Rückwärts an eine Wand stellen, bremsen und durch den Innenspiegel schauen.',
      tip: 'Das mittlere Bremslicht ist gesetzlich Pflicht und reduziert nachweislich Auffahrunfälle.',
      law: '§ 53 StVZO',
    },
    {
      id: 'bremslicht-r', cx: 350, cy: 106, color: '#ef4444',
      title: 'Bremslicht Rechts', subtitle: 'Aktiv · Rot',
      checks: [
        { label: 'Leuchtet beim Bremsen', done: false },
        { label: 'Kein Riss / keine Verschmutzung', done: false },
        { label: 'Gleichmäßige Helligkeit', done: false },
      ],
      info: 'Beim T-Roc gibt es insgesamt 3 Bremslichter: links, rechts und ein mittleres Hochbremslicht (CHMSL). Alle 3 müssen beim Bremsen leuchten.\n\n🔍 Alleine prüfen: Rückwärts an eine Wand stellen, bremsen und durch den Innenspiegel schauen.',
      tip: 'Das mittlere Bremslicht ist gesetzlich Pflicht und reduziert nachweislich Auffahrunfälle.',
      law: '§ 53 StVZO',
    },
    {
      id: 'bremslicht-mitte', cx: 200, cy: 50, color: '#ef4444',
      title: 'Hochbremslicht (CHMSL)', subtitle: 'Mitte oben · 3. Bremslicht',
      checks: [
        { label: 'Leuchtet beim Bremsen', done: false },
        { label: 'Sauber & unbeschädigt', done: false },
      ],
      info: 'Das mittlere Hochbremslicht (Centre High Mounted Stop Light) sitzt hoch im Heckfenster und ist für nachfolgende Fahrzeuge früher sichtbar.\n\n🔍 Alleine prüfen: Rückwärts an eine Wand stellen, bremsen und durch den Innenspiegel schauen.',
      law: '§ 53 StVZO',
    },
    {
      id: 'nebel', cx: 42, cy: 165, color: '#f97316',
      title: 'Nebelschlussleuchte', subtitle: 'Links hinten · Orange/Rot',
      checks: [
        { label: 'Funktioniert (leuchtet bei Aktivierung)', done: false },
        { label: 'Nur eine Leuchte hinten links', done: false },
        { label: 'Orangene Kontrollleuchte im Cockpit', done: false },
      ],
      info: 'Die Nebelschlussleuchte darf nur bei Sichtweite unter 50 m eingesetzt werden – z. B. bei dichtem Nebel oder starkem Schneetreiben.\n\n⚠️ Bei besserem Wetter sofort ausschalten! Sie kann andere Fahrer blenden und die Bremslichter überdecken.',
      tip: 'Beim T-Roc wird sie über den Lichtschalter aktiviert (nach links drehen und ziehen).',
      law: '§ 53d StVZO',
    },
    {
      id: 'kennzeichen', cx: 200, cy: 174, color: '#facc15',
      title: 'Kennzeichen + TÜV', subtitle: 'Beleuchtung · Plakette',
      sticker: true,
      checks: [
        { label: 'Kennzeichen lesbar & vollständig', done: false },
        { label: 'Kennzeichenbeleuchtung funktioniert', done: false },
        { label: 'TÜV-Plakette aktuell', done: false },
      ],
      info: 'Das Kennzeichen muss bei Nacht beleuchtet sein. Die TÜV-Plakette zeigt die nächste Hauptuntersuchung an.',
      tip: 'TÜV-Plakette lesen: obere Zahl = Monat, mittlere Zahl = Jahr (2-stellig). Jedes Jahr hat eine andere Farbe.',
      law: '§ 47 StVZO',
    },
  ],

  Front: [
    {
      id: 'scheibenwasser', cx: 200, cy: 48, color: '#38bdf8',
      title: 'Scheibenwischwasser', subtitle: 'Motorraum · Vorratsbehälter',
      washer: true,
      checks: [
        { label: 'Füllstand im Bereich MIN–MAX', done: false },
        { label: 'Reinigungsmittel zugegeben', done: false },
        { label: 'Im Winter: Frostschutz vorhanden', done: false },
      ],
      info: 'Der Scheibenwaschwasser-Behälter sitzt im Motorraum. Das Wasser besteht aus:\n1. Wasser\n2. Reinigungsmittel (Konzentrat)\n3. Im Winter: Frostschutzmittel (verhindert Einfrieren)',
      tip: 'Reines Wasser im Sommer reicht – aber im Winter unbedingt Frostschutz beimischen!',
    },
    {
      id: 'motoroel', cx: 143, cy: 50, color: '#fbbf24',
      title: 'Motoröl', subtitle: 'Motorraum · Ölmessstab',
      oilCheck: true,
      checks: [
        { label: 'Füllstand zwischen MIN und MAX', done: false },
        { label: 'Öl nicht schwarz/verbrannt', done: false },
        { label: 'Richtiger Öltyp (laut Handbuch)', done: false },
      ],
      info: 'Das Motoröl schmiert alle beweglichen Teile im Motor. Zu wenig Öl kann zu schwerem Motorschaden führen.',
      tip: 'Öl kalt prüfen (Motor aus, mindestens 5 Min. stehen lassen). Nie über MAX befüllen!',
    },
    {
      id: 'kuehlwasser', cx: 257, cy: 50, color: '#22d3ee',
      title: 'Kühlwasser', subtitle: 'Motorraum · Ausgleichsbehälter',
      coolantCheck: true,
      checks: [
        { label: 'Füllstand zwischen MIN und MAX', done: false },
        { label: 'Farbe normal (nicht braun/trüb)', done: false },
        { label: 'NIEMALS heißen Deckel öffnen!', done: false },
      ],
      info: 'Das Kühlwasser verhindert Überhitzung des Motors. Es besteht aus Wasser + Frostschutzmittel (Kühlmittelkonzentrat).',
      tip: '⚠️ NIEMALS den Kühlwasser-Deckel öffnen wenn der Motor warm/heiß ist! Das Kühlsystem steht unter Druck – kochendes Wasser kann herausspritzen und schwere Verbrennungen verursachen.',
      law: 'Betriebssicherheit § 29 StVZO',
    },
  ],

  Seite: [
    {
      id: 'reifen', cx: 308, cy: 168, color: '#4ade80',
      title: 'Reifen', subtitle: 'Alle 4 Reifen prüfen',
      tire: true,
      checks: [
        { label: 'Profiltiefe ≥ 1,6 mm (TWI)', done: false },
        { label: 'Luftdruck korrekt', done: false },
        { label: 'Keine Beschädigungen', done: false },
        { label: 'Richtige Reifenart (Saison)', done: false },
      ],
      info: 'Vor jeder Fahrt einen kurzen Reifencheck machen. Schlechte Reifen sind ein häufiger Unfallgrund.',
      tip: 'T-Roc Reifendruck: meist 2,3–2,5 bar (vorne/hinten), genaue Werte auf dem Aufkleber im Türrahmen.',
    },
  ],
}

/* ─── SVG: T-Roc Heck ────────────────────────────────────── */
function TrocRearSVG() {
  return (
    <svg viewBox="0 0 400 220" width="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="trBodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </radialGradient>
        <radialGradient id="trGlassGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#0c1a2e" stopOpacity="0.95"/>
        </radialGradient>
      </defs>

      {/* Body */}
      <rect x="30" y="60" width="340" height="130" rx="10" fill="url(#trBodyGrad)" stroke="#334155" strokeWidth="1.5"/>
      {/* Roof */}
      <rect x="60" y="20" width="280" height="45" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1"/>

      {/* Rear window */}
      <rect x="70" y="25" width="260" height="38" rx="4" fill="url(#trGlassGrad)" stroke="#1e3a5f" strokeWidth="1"/>
      {[32,37,42,47,52,57].map(y => (
        <line key={y} x1="80" y1={y} x2="320" y2={y} stroke="#60a5fa" strokeWidth="0.4" strokeOpacity="0.3"/>
      ))}

      {/* Left C-shape tail light */}
      <path d="M30,65 L30,170 L80,170 L80,155 L50,155 L50,115 L80,115 L80,65 Z" fill="#1a0a0a" stroke="#ef4444" strokeWidth="1"/>
      <rect x="32" y="67" width="44" height="14" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="32" y="67" width="14" height="86" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="32" y="139" width="44" height="14" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="34" y="69" width="40" height="10" rx="1" fill="#ff6666" opacity="0.5"/>
      <rect x="34" y="141" width="40" height="10" rx="1" fill="#ff6666" opacity="0.5"/>
      <rect x="34" y="69" width="10" height="82" rx="1" fill="#ff6666" opacity="0.5"/>

      {/* Right C-shape tail light */}
      <path d="M370,65 L370,170 L320,170 L320,155 L350,155 L350,115 L320,115 L320,65 Z" fill="#1a0a0a" stroke="#ef4444" strokeWidth="1"/>
      <rect x="324" y="67" width="44" height="14" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="354" y="67" width="14" height="86" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="324" y="139" width="44" height="14" rx="2" fill="#ef4444" opacity="0.9"/>
      <rect x="326" y="69" width="40" height="10" rx="1" fill="#ff6666" opacity="0.5"/>
      <rect x="326" y="141" width="40" height="10" rx="1" fill="#ff6666" opacity="0.5"/>
      <rect x="356" y="69" width="10" height="82" rx="1" fill="#ff6666" opacity="0.5"/>

      {/* Connecting LED band */}
      <rect x="76" y="67" width="248" height="8" rx="2" fill="#dc2626" opacity="0.7"/>
      <rect x="78" y="68" width="244" height="5" rx="1" fill="#f87171" opacity="0.4"/>

      {/* Tailgate */}
      <rect x="82" y="65" width="236" height="103" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.5"/>

      {/* VW Badge */}
      <circle cx="200" cy="116" r="14" fill="#1e293b" stroke="#64748b" strokeWidth="1.5"/>
      <circle cx="200" cy="116" r="11" fill="#172035" stroke="#94a3b8" strokeWidth="0.8"/>
      <path d="M193,110 L197,121 L200,115 L203,121 L207,110" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M193,110 L196,117 L200,112 L204,117 L207,110" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>

      {/* Number plate */}
      <rect x="148" y="158" width="104" height="22" rx="3" fill="#f8f8f8" stroke="#cbd5e1" strokeWidth="1"/>
      <rect x="150" y="160" width="100" height="18" rx="2" fill="#f0f0f0"/>
      <text x="200" y="172" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1e293b">WN · TK 2025</text>
      <rect x="240" y="161" width="10" height="16" rx="1" fill="#22c55e" stroke="#166534" strokeWidth="0.5"/>
      <text x="245" y="167" textAnchor="middle" fontSize="4" fontWeight="900" fill="white">4</text>
      <text x="245" y="173" textAnchor="middle" fontSize="5" fontWeight="900" fill="white">26</text>
      <rect x="148" y="154" width="104" height="4" rx="1" fill="#fefce8" opacity="0.6"/>

      {/* Bumper */}
      <rect x="30" y="172" width="340" height="28" rx="8" fill="#1a2030" stroke="#334155" strokeWidth="1"/>
      {[180, 188].map(y => (
        <line key={y} x1="60" y1={y} x2="340" y2={y} stroke="#4b5563" strokeWidth="0.5"/>
      ))}
      <rect x="42" y="175" width="22" height="12" rx="3" fill="#1a1a2e" stroke="#64748b" strokeWidth="0.5"/>
      <rect x="43" y="176" width="20" height="10" rx="2" fill="#fef08a" opacity="0.15"/>
      <rect x="336" y="175" width="22" height="12" rx="3" fill="#1a1a2e" stroke="#64748b" strokeWidth="0.5"/>
      <rect x="337" y="176" width="20" height="10" rx="2" fill="#fef08a" opacity="0.15"/>

      {/* Nebelschlussleuchte indicator – moved inward so it never clips */}
      <rect x="33" y="156" width="20" height="16" rx="2" fill="#ea580c" opacity="0.9" stroke="#f97316" strokeWidth="0.8"/>
      <text x="43" y="167" textAnchor="middle" fontSize="7" fontWeight="900" fill="white">N</text>

      {/* Reflectors in bumper – visible red rectangles */}
      <rect x="63" y="177" width="26" height="8" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" opacity="0.85"/>
      <rect x="311" y="177" width="26" height="8" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.5" opacity="0.85"/>

      {/* Wheels */}
      <ellipse cx="90" cy="195" rx="35" ry="18" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="90" cy="195" rx="26" ry="13" fill="#1f2937" stroke="#4b5563" strokeWidth="1"/>
      <ellipse cx="90" cy="195" rx="8" ry="4" fill="#374151"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <line key={i} x1={90 + 10*Math.cos(a*Math.PI/180)} y1={195 + 5*Math.sin(a*Math.PI/180)}
          x2={90 + 24*Math.cos(a*Math.PI/180)} y2={195 + 12*Math.sin(a*Math.PI/180)}
          stroke="#4b5563" strokeWidth="1.5"/>
      ))}
      <ellipse cx="310" cy="195" rx="35" ry="18" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="310" cy="195" rx="26" ry="13" fill="#1f2937" stroke="#4b5563" strokeWidth="1"/>
      <ellipse cx="310" cy="195" rx="8" ry="4" fill="#374151"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <line key={i} x1={310 + 10*Math.cos(a*Math.PI/180)} y1={195 + 5*Math.sin(a*Math.PI/180)}
          x2={310 + 24*Math.cos(a*Math.PI/180)} y2={195 + 12*Math.sin(a*Math.PI/180)}
          stroke="#4b5563" strokeWidth="1.5"/>
      ))}

      <ellipse cx="200" cy="213" rx="170" ry="6" fill="black" opacity="0.4"/>
    </svg>
  )
}

/* ─── SVG: T-Roc Front ───────────────────────────────────── */
function TrocFrontSVG() {
  return (
    <svg viewBox="0 0 400 220" width="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="trfBodyGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </radialGradient>
        <radialGradient id="trfHoodGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#243450"/>
          <stop offset="100%" stopColor="#0f1a2e"/>
        </radialGradient>
        <radialGradient id="trfGlassGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#0a1628" stopOpacity="0.98"/>
        </radialGradient>
        <filter id="trfGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Hood (shorter: y=22 → y=68, giving ~46px hood height) ── */}
      <path d="M60,68 L62,34 Q63,24 75,22 L200,18 L325,22 Q337,24 338,34 L340,68 Z"
        fill="url(#trfHoodGrad)" stroke="#334155" strokeWidth="1.5"/>

      {/* Engine bay dashed box on hood */}
      <rect x="100" y="28" width="200" height="34" rx="5"
        fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="5,3" strokeOpacity="0.55"/>
      <text x="200" y="48" textAnchor="middle" fontSize="6.5" fill="#fbbf24" fontWeight="700" opacity="0.7">MOTORRAUM</text>

      {/* Oil cap marker */}
      <circle cx="143" cy="44" r="7" fill="#f59e0b" stroke="#78350f" strokeWidth="1.2" opacity="0.9"/>
      <text x="143" y="47" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="white">OIL</text>

      {/* Coolant cap marker */}
      <circle cx="257" cy="44" r="7" fill="#0e7490" stroke="#0e4f5e" strokeWidth="1.2" opacity="0.9"/>
      <text x="257" y="47" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="white">COOL</text>

      {/* Washer nozzles at hood base */}
      <rect x="172" y="66" width="7" height="4" rx="1.5" fill="#64748b"/>
      <rect x="221" y="66" width="7" height="4" rx="1.5" fill="#64748b"/>

      {/* ── Main body (taller: y=68 → y=200) ── */}
      <rect x="28" y="68" width="344" height="132" rx="12" fill="url(#trfBodyGrad)" stroke="#334155" strokeWidth="1.5"/>

      {/* Hood-to-body gap line */}
      <line x1="60" y1="68" x2="340" y2="68" stroke="#475569" strokeWidth="1"/>

      {/* ── Windshield (short trapezoid – SUV style) ── */}
      <path d="M72,68 L80,30 L320,30 L328,68 Z"
        fill="url(#trfGlassGrad)" stroke="#1e3a5f" strokeWidth="0.8"/>

      {/* ── Wide angular headlights (T-Roc style) ── */}
      {/* Left housing */}
      <path d="M28,72 L28,118 L75,118 L75,72 Z" fill="#080e18" stroke="#1e293b" strokeWidth="1"/>
      {/* Left DRL – thin horizontal strip at top */}
      <rect x="30" y="74" width="43" height="9" rx="2" fill="#fef08a" opacity="0.9" filter="url(#trfGlow)"/>
      {/* Left signature L-shaped DRL */}
      <path d="M30,74 L30,100 L38,100 L38,83 L73,83 L73,74 Z" fill="#fde68a" opacity="0.55"/>
      {/* Left main beam lens */}
      <ellipse cx="53" cy="108" rx="17" ry="7" fill="#dbeafe" opacity="0.65"/>
      <ellipse cx="53" cy="108" rx="10" ry="4" fill="#eff6ff" opacity="0.85"/>

      {/* Right housing */}
      <path d="M372,72 L372,118 L325,118 L325,72 Z" fill="#080e18" stroke="#1e293b" strokeWidth="1"/>
      {/* Right DRL */}
      <rect x="327" y="74" width="43" height="9" rx="2" fill="#fef08a" opacity="0.9" filter="url(#trfGlow)"/>
      <path d="M370,74 L370,100 L362,100 L362,83 L327,83 L327,74 Z" fill="#fde68a" opacity="0.55"/>
      {/* Right main beam lens */}
      <ellipse cx="347" cy="108" rx="17" ry="7" fill="#dbeafe" opacity="0.65"/>
      <ellipse cx="347" cy="108" rx="10" ry="4" fill="#eff6ff" opacity="0.85"/>

      {/* ── Wide VW grille (T-Roc: spans full width) ── */}
      <path d="M75,120 L75,158 Q75,166 84,168 L316,168 Q325,166 325,158 L325,120 Z"
        fill="#0c1220" stroke="#2d3a50" strokeWidth="1"/>
      {/* Horizontal bars */}
      {[128, 137, 146, 155].map(y => (
        <rect key={y} x="80" y={y} width="240" height="6" rx="1.5" fill="#172035" stroke="#2d4060" strokeWidth="0.5"/>
      ))}
      {/* Vertical mesh lines */}
      {[120, 152, 184, 216, 248, 280].map(x => (
        <line key={x} x1={x} y1="120" x2={x} y2="162" stroke="#172035" strokeWidth="0.8" strokeOpacity="0.7"/>
      ))}

      {/* VW Badge – centered on grille */}
      <circle cx="200" cy="132" r="16" fill="#111827" stroke="#4b5563" strokeWidth="2"/>
      <circle cx="200" cy="132" r="13" fill="#0f172a" stroke="#94a3b8" strokeWidth="1"/>
      <path d="M192,125 L196,137 L200,130 L204,137 L208,125" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M192,125 L195,132 L200,127 L205,132 L208,125" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>

      {/* ── Front bumper ── */}
      <rect x="28" y="166" width="344" height="36" rx="10" fill="#111927" stroke="#2d3748" strokeWidth="1"/>
      {/* Lower lip / splitter */}
      <rect x="28" y="196" width="344" height="6" rx="3" fill="#0d1420" stroke="#253040" strokeWidth="0.5"/>
      {/* Fog light housings */}
      <rect x="40" y="171" width="30" height="18" rx="4" fill="#0d1520" stroke="#374151" strokeWidth="0.8"/>
      <ellipse cx="55" cy="180" rx="9" ry="6" fill="#fef9c3" opacity="0.18"/>
      <rect x="330" y="171" width="30" height="18" rx="4" fill="#0d1520" stroke="#374151" strokeWidth="0.8"/>
      <ellipse cx="345" cy="180" rx="9" ry="6" fill="#fef9c3" opacity="0.18"/>
      {/* Center air intake */}
      <rect x="145" y="172" width="110" height="14" rx="3" fill="#080f1a" stroke="#2d3748" strokeWidth="0.5"/>

      {/* ── Wheels ── */}
      <ellipse cx="88" cy="198" rx="30" ry="17" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="88" cy="198" rx="22" ry="12" fill="#1a2035" stroke="#4b5563" strokeWidth="1"/>
      <ellipse cx="88" cy="198" rx="7" ry="4" fill="#374151"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <line key={i} x1={88 + 9*Math.cos(a*Math.PI/180)} y1={198 + 5*Math.sin(a*Math.PI/180)}
          x2={88 + 20*Math.cos(a*Math.PI/180)} y2={198 + 11*Math.sin(a*Math.PI/180)}
          stroke="#4b5563" strokeWidth="1.5"/>
      ))}
      <ellipse cx="312" cy="198" rx="30" ry="17" fill="#111827" stroke="#374151" strokeWidth="1.5"/>
      <ellipse cx="312" cy="198" rx="22" ry="12" fill="#1a2035" stroke="#4b5563" strokeWidth="1"/>
      <ellipse cx="312" cy="198" rx="7" ry="4" fill="#374151"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <line key={i} x1={312 + 9*Math.cos(a*Math.PI/180)} y1={198 + 5*Math.sin(a*Math.PI/180)}
          x2={312 + 20*Math.cos(a*Math.PI/180)} y2={198 + 11*Math.sin(a*Math.PI/180)}
          stroke="#4b5563" strokeWidth="1.5"/>
      ))}

      {/* Ground shadow */}
      <ellipse cx="200" cy="216" rx="162" ry="5" fill="black" opacity="0.45"/>
    </svg>
  )
}

/* ─── SVG: T-Roc Side ────────────────────────────────────── */
function TrocSideSVG() {
  return (
    <svg viewBox="0 0 400 210" width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="trsBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#243450"/>
          <stop offset="60%" stopColor="#1a2740"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="trsRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2535"/>
          <stop offset="100%" stopColor="#111827"/>
        </linearGradient>
        <radialGradient id="trsGlassGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#0a1628" stopOpacity="0.97"/>
        </radialGradient>
      </defs>

      {/* ── SUV body – high waistline, raised rear, short front overhang ── */}
      {/*  Main lower body panel (doors + sill area) */}
      <path d="M18,172 L18,90 Q19,78 30,76
               L95,74 L115,34 L295,30 L340,52 L368,58
               L380,72 L380,172 Z"
        fill="url(#trsBodyGrad)" stroke="#334155" strokeWidth="1.5"/>

      {/* ── Roof / greenhouse area ── */}
      <path d="M115,34 L295,30 L340,52 L368,58 L368,74 L380,72
               L380,60 L342,50 L296,28 L113,32 L94,72 L18,76 L18,88 L95,74 Z"
        fill="url(#trsRoofGrad)" stroke="#2d3a50" strokeWidth="0.8"/>

      {/* ── Windshield (steeply raked) ── */}
      <path d="M115,34 L94,72 L140,72 L148,34 Z"
        fill="url(#trsGlassGrad)" stroke="#1e3a5f" strokeWidth="1"/>

      {/* ── Rear window (more upright – SUV style) ── */}
      <path d="M156,32 L295,30 L338,52 L336,72 L156,72 Z"
        fill="url(#trsGlassGrad)" stroke="#1e3a5f" strokeWidth="1"/>

      {/* B-pillar */}
      <rect x="148" y="32" width="8" height="42" rx="2" fill="#111827" stroke="#1e293b" strokeWidth="0.5"/>

      {/* Waist crease line */}
      <path d="M18,108 L95,104 L380,100" stroke="#475569" strokeWidth="0.6" strokeOpacity="0.7"/>

      {/* Door split line */}
      <line x1="156" y1="74" x2="156" y2="164" stroke="#334155" strokeWidth="0.8"/>

      {/* Door handles */}
      <rect x="120" y="97" width="26" height="5" rx="2" fill="#2d3a50" stroke="#4b5563" strokeWidth="0.5"/>
      <rect x="220" y="95" width="26" height="5" rx="2" fill="#2d3a50" stroke="#4b5563" strokeWidth="0.5"/>

      {/* Side mirror – aerodynamic shape */}
      <path d="M113,48 L130,44 L133,58 L110,62 Z"
        fill="#1a2535" stroke="#2d3a50" strokeWidth="1"/>

      {/* ── Rocker/sill panel ── */}
      <rect x="128" y="162" width="152" height="10" rx="4" fill="#0f1520" stroke="#1e293b" strokeWidth="0.8"/>

      {/* ── Front bumper/fascia ── */}
      <path d="M18,90 L18,172 L30,172 L30,158 Q20,148 18,130 Z"
        fill="#111827" stroke="#1e293b" strokeWidth="0.5"/>
      <rect x="18" y="162" width="30" height="10" rx="3" fill="#0d1520"/>

      {/* Front headlight (slim, angular) */}
      <path d="M18,78 L18,98 L42,96 L42,80 Z" fill="#080f18" stroke="#1e293b" strokeWidth="0.8"/>
      <rect x="20" y="80" width="20" height="8" rx="2" fill="#fef08a" opacity="0.85"/>
      <rect x="20" y="90" width="20" height="5" rx="1" fill="#dbeafe" opacity="0.5"/>

      {/* ── Rear lights (L-shaped, T-Roc style) ── */}
      <path d="M368,58 L380,58 L380,130 L368,130 Z" fill="#1a0505"/>
      {/* Outer vertical bar */}
      <rect x="372" y="60" width="6" height="68" rx="2" fill="#ef4444" opacity="0.85"/>
      {/* Top horizontal arm */}
      <rect x="360" y="60" width="18" height="10" rx="2" fill="#ef4444" opacity="0.85"/>
      {/* Inner glow */}
      <rect x="374" y="62" width="3" height="64" rx="1" fill="#ff8080" opacity="0.45"/>

      {/* ── Wheel arch cut-outs (pronounced – SUV style) ── */}
      {/* Front arch */}
      <path d="M18,172 Q18,128 58,124 L100,124 Q136,124 136,164 L136,172 Z"
        fill="#0a1220" stroke="#1e293b" strokeWidth="1.2"/>
      {/* Rear arch */}
      <path d="M272,164 Q272,124 308,124 L348,124 Q380,124 380,160 L380,172 Z"
        fill="#0a1220" stroke="#1e293b" strokeWidth="1.2"/>

      {/* Arch lips (chrome trim) */}
      <path d="M18,172 Q18,128 58,124 L100,124 Q136,124 136,164"
        fill="none" stroke="#4b5563" strokeWidth="2.5"/>
      <path d="M272,164 Q272,124 308,124 L348,124 Q380,124 380,160"
        fill="none" stroke="#4b5563" strokeWidth="2.5"/>

      {/* ── Front wheel (r=30 – SUV ride height) ── */}
      <circle cx="77" cy="168" r="30" fill="#111827" stroke="#374151" strokeWidth="2"/>
      <circle cx="77" cy="168" r="22" fill="#171f30" stroke="#374151" strokeWidth="1"/>
      <circle cx="77" cy="168" r="8" fill="#2a3447" stroke="#4b5563" strokeWidth="1"/>
      {[0,40,80,120,160,200,240,280,320].map((a,i) => (
        <line key={i}
          x1={77 + 10*Math.cos(a*Math.PI/180)} y1={168 + 10*Math.sin(a*Math.PI/180)}
          x2={77 + 21*Math.cos(a*Math.PI/180)} y2={168 + 21*Math.sin(a*Math.PI/180)}
          stroke="#64748b" strokeWidth="2.2"/>
      ))}
      {/* Tread */}
      <circle cx="77" cy="168" r="28.5" fill="none" stroke="#0d1218" strokeWidth="4"
        strokeDasharray="7,4" strokeOpacity="0.7"/>

      {/* ── Rear wheel ── */}
      <circle cx="308" cy="168" r="30" fill="#111827" stroke="#374151" strokeWidth="2"/>
      <circle cx="308" cy="168" r="22" fill="#171f30" stroke="#374151" strokeWidth="1"/>
      <circle cx="308" cy="168" r="8" fill="#2a3447" stroke="#4b5563" strokeWidth="1"/>
      {[0,40,80,120,160,200,240,280,320].map((a,i) => (
        <line key={i}
          x1={308 + 10*Math.cos(a*Math.PI/180)} y1={168 + 10*Math.sin(a*Math.PI/180)}
          x2={308 + 21*Math.cos(a*Math.PI/180)} y2={168 + 21*Math.sin(a*Math.PI/180)}
          stroke="#64748b" strokeWidth="2.2"/>
      ))}
      <circle cx="308" cy="168" r="28.5" fill="none" stroke="#0d1218" strokeWidth="4"
        strokeDasharray="7,4" strokeOpacity="0.7"/>

      {/* Ground shadow */}
      <ellipse cx="200" cy="202" rx="172" ry="6" fill="black" opacity="0.45"/>
    </svg>
  )
}

/* ─── Hotspot Component ──────────────────────────────────── */
function Hotspot({ part, onClick, isActive }: { part: CarPart; onClick: () => void; isActive: boolean }) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <circle cx={part.cx} cy={part.cy} r="16" fill="none" stroke={part.color} strokeWidth="1.5" strokeOpacity="0.3">
        <animate attributeName="r" values="14;20;14" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx={part.cx} cy={part.cy} r="12" fill={isActive ? part.color : 'transparent'}
        stroke={part.color} strokeWidth={isActive ? 0 : 1.5} strokeOpacity="0.7"/>
      <circle cx={part.cx} cy={part.cy} r="5" fill={part.color} opacity={isActive ? 1 : 0.85}/>
      {isActive && <circle cx={part.cx} cy={part.cy} r="12" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.8"/>}
    </g>
  )
}

/* ─── TÜV Sticker Diagram ────────────────────────────────── */
function TuvStickerDiagram() {
  const RING_COLORS: Record<number, string> = {
    24: '#f59e0b', 25: '#3b82f6', 26: '#22c55e',
    27: '#ef4444', 28: '#a855f7', 29: '#ec4899',
  }
  const thisYear = 26
  const ringColor = RING_COLORS[thisYear] || '#64748b'
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div>
        <p style={{ margin: '0 0 0.4rem', fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>TÜV-Plakette:</p>
        <svg viewBox="0 0 60 60" width="80" height="80">
          <circle cx="30" cy="30" r="28" fill={ringColor} stroke="white" strokeWidth="1.5"/>
          <circle cx="30" cy="30" r="20" fill="white"/>
          <text x="30" y="20" textAnchor="middle" fontSize="7" fontWeight="900" fill="#1e293b">4</text>
          <text x="30" y="34" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1e293b">26</text>
          <text x="30" y="44" textAnchor="middle" fontSize="5" fill="#475569">HU</text>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180
            return <circle key={i} cx={30 + 24*Math.cos(angle)} cy={30 + 24*Math.sin(angle)}
              r={i === 3 ? 3 : 1.5} fill="white" opacity={i === 3 ? 1 : 0.6}/>
          })}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <p style={{ margin: '0 0 0.4rem', fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>So liest du die Plakette:</p>
        {[
          { label: 'Außen oben (Zahl)', desc: '= Monat der nächsten HU' },
          { label: 'Mitte (große Zahl)', desc: '= Jahr (2-stellig, z. B. 26 = 2026)' },
          { label: 'Ringfarbe', desc: '= ändert sich jedes Jahr' },
        ].map(r => (
          <div key={r.label} style={{ marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{r.label}: </span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)' }}>{r.desc}</span>
          </div>
        ))}
        <div style={{ marginTop: '0.5rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Ringfarben:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {Object.entries(RING_COLORS).map(([y, c]) => (
              <div key={y} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.2)' }}/>
                <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)' }}>20{y}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Tire Info Panel ─────────────────────────────────────── */
function TireInfoPanel() {
  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
        🔍 Was vor jeder Fahrt zu prüfen ist:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ background: 'rgba(74,222,128,0.07)', borderRadius: '0.5rem', padding: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
            <span style={{ background: '#4ade80', color: '#052e16', fontSize: '0.6rem', fontWeight: 900, padding: '1px 6px', borderRadius: '4px' }}>1</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80' }}>Profiltiefe (TWI-Methode)</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Min. <strong style={{color:'#4ade80'}}>1,6 mm</strong> gesetzlich. Im Profil gibt es kleine Stege (TWI = Tread Wear Indicator) –
            wenn das Profil auf gleicher Höhe ist → Reifen wechseln!<br/>
            <span style={{opacity:0.7}}>Empfohlen: Sommer ≥3mm · Winter ≥4mm</span>
          </p>
        </div>
        <div style={{ background: 'rgba(74,222,128,0.07)', borderRadius: '0.5rem', padding: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
            <span style={{ background: '#4ade80', color: '#052e16', fontSize: '0.6rem', fontWeight: 900, padding: '1px 6px', borderRadius: '4px' }}>2</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80' }}>Luftdruck</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Vorgabe im <strong style={{color:'white'}}>Türrahmen-Aufkleber</strong> oder Handbuch.<br/>
            Zu wenig Druck → schlechtere Lenkung, mehr Verbrauch, Reifenschaden.<br/>
            Zu viel Druck → schlechtere Bodenhaftung, ungleichmäßiger Verschleiß.
          </p>
        </div>
        <div style={{ background: 'rgba(74,222,128,0.07)', borderRadius: '0.5rem', padding: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
            <span style={{ background: '#4ade80', color: '#052e16', fontSize: '0.6rem', fontWeight: 900, padding: '1px 6px', borderRadius: '4px' }}>3</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80' }}>Beschädigungen</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Auf Risse, Beulen, Nägel oder Schnitte prüfen – auch an der Flanke!<br/>
            <span style={{color:'#f87171', fontWeight:600}}>Bei Schaden: Sofort zum Reifenservice!</span>
          </p>
        </div>
        <div style={{ background: 'rgba(74,222,128,0.07)', borderRadius: '0.5rem', padding: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
            <span style={{ background: '#4ade80', color: '#052e16', fontSize: '0.6rem', fontWeight: 900, padding: '1px 6px', borderRadius: '4px' }}>4</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80' }}>Reifenart (Saison)</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            <strong style={{color:'white'}}>Winterreifen</strong>: Schneeflocken-Symbol <strong style={{color:'#93c5fd'}}>❄️ 3PMSF</strong> = geprüfte Wintertauglichkeit.<br/>
            <strong style={{color:'white'}}>M+S</strong> allein reicht nicht mehr (nur Übergangsregel bis 2024).<br/>
            Sommerreifen bei Schnee/Eis: <span style={{color:'#f87171', fontWeight:600}}>verboten & gefährlich!</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Washer Fluid Panel ─────────────────────────────────── */
function WasherFluidPanel() {
  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
        💧 Scheibenwaschwasser – Motorraum
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <svg viewBox="0 0 70 100" width="60" style={{ flexShrink: 0 }}>
          <rect x="15" y="15" width="40" height="70" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5"/>
          <rect x="27" y="8" width="16" height="10" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1"/>
          <rect x="17" y="55" width="36" height="28" rx="4" fill="#0284c7" opacity="0.6"/>
          <line x1="15" y1="55" x2="55" y2="55" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,2"/>
          <text x="35" y="50" textAnchor="middle" fontSize="7" fill="#38bdf8" fontWeight="700">MAX</text>
          <line x1="15" y1="75" x2="55" y2="75" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,2"/>
          <text x="35" y="85" textAnchor="middle" fontSize="7" fill="#38bdf8" fontWeight="700">MIN</text>
          <text x="35" y="34" textAnchor="middle" fontSize="14">💧</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { num: '1', color: '#38bdf8', label: 'Wasser', desc: 'Klares Leitungswasser' },
              { num: '2', color: '#38bdf8', label: 'Reinigungsmittel', desc: 'Konzentrat für Wischklarheit' },
              { num: '3', color: '#93c5fd', label: 'Frostschutz (Winter!)', desc: 'Verhindert Einfrieren der Anlage' },
            ].map(c => (
              <div key={c.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <span style={{ background: c.color, color: '#0c1a2e', fontSize: '0.58rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>{c.num}</span>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'white' }}>{c.label}</span>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>{c.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(56,189,248,0.08)', borderRadius: '0.4rem', border: '1px solid rgba(56,189,248,0.2)' }}>
            <p style={{ margin: 0, fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              ⚠️ Im Winter: mindestens <strong style={{color:'#93c5fd'}}>-20°C Frostschutz</strong> verwenden – sonst friert die Anlage ein!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Engine Oil Panel ────────────────────────────────────── */
function EngineOilPanel() {
  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
        🔧 Motoröl prüfen – Messstab-Methode
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <svg viewBox="0 0 50 130" width="45" style={{ flexShrink: 0 }}>
          <rect x="18" y="5" width="14" height="18" rx="4" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5"/>
          <text x="25" y="17" textAnchor="middle" fontSize="8" fontWeight="900" fill="#451a03">OIL</text>
          <rect x="23" y="20" width="4" height="70" rx="2" fill="#78716c"/>
          <rect x="20" y="88" width="10" height="35" rx="2" fill="#57534e" stroke="#78716c" strokeWidth="1"/>
          <line x1="15" y1="95" x2="35" y2="95" stroke="#4ade80" strokeWidth="1.5"/>
          <text x="38" y="98" fontSize="6" fill="#4ade80" fontWeight="700">MAX</text>
          <line x1="15" y1="115" x2="35" y2="115" stroke="#f87171" strokeWidth="1.5"/>
          <text x="38" y="118" fontSize="6" fill="#f87171" fontWeight="700">MIN</text>
          <rect x="21" y="115" width="8" height="8" rx="1" fill="#f59e0b" opacity="0.7"/>
          <rect x="21" y="100" width="8" height="15" rx="1" fill="#f59e0b" opacity="0.5"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { num: '1', label: 'Motor abstellen', desc: 'Mindestens 5 Min. warten (Öl läuft zurück)' },
              { num: '2', label: 'Messstab herausziehen', desc: 'Messstab reinigen (Tuch/Lappen)' },
              { num: '3', label: 'Einführen & herausziehen', desc: 'Erneut einstecken, dann wieder herausziehen' },
              { num: '4', label: 'Füllstand ablesen', desc: 'Ölfilm muss zwischen MIN und MAX liegen' },
              { num: '5', label: 'Ggf. nachfüllen', desc: 'Nur den richtigen Öltyp laut Handbuch!' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <span style={{ background: '#f59e0b', color: '#451a03', fontSize: '0.58rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>{s.num}</span>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'white' }}>{s.label}</span>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(245,158,11,0.08)', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p style={{ margin: 0, fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              ⚠️ NIE über MAX befüllen! Zu viel Öl kann Motorschaden verursachen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Coolant Panel ──────────────────────────────────────── */
function CoolantPanel() {
  return (
    <div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
        🌡️ Kühlwasser prüfen – Ausgleichsbehälter
      </p>
      <div style={{ marginBottom: '0.75rem', padding: '0.6rem', background: 'rgba(239,68,68,0.12)', borderRadius: '0.5rem', border: '1.5px solid rgba(239,68,68,0.4)' }}>
        <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: '#f87171', lineHeight: 1.5 }}>
          🚨 NIEMALS den Kühlwasserdeckel öffnen, wenn der Motor warm oder heiß ist!
        </p>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
          Das Kühlsystem steht unter Druck. Bei heißem Motor kann kochendes Wasser und Dampf herausschießen → schwere Verbrennungen!
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <svg viewBox="0 0 65 105" width="55" style={{ flexShrink: 0 }}>
          <rect x="20" y="4" width="25" height="14" rx="4" fill="#374151" stroke="#6b7280" strokeWidth="1.5"/>
          <text x="32" y="13" textAnchor="middle" fontSize="6" fill="#9ca3af">🔒</text>
          <rect x="10" y="16" width="45" height="78" rx="8" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5"/>
          <rect x="12" y="58" width="41" height="34" rx="5" fill="#0e7490" opacity="0.5"/>
          <line x1="8" y1="58" x2="57" y2="58" stroke="#22d3ee" strokeWidth="1.5"/>
          <text x="60" y="61" fontSize="5.5" fill="#22d3ee" fontWeight="700">MAX</text>
          <line x1="8" y1="80" x2="57" y2="80" stroke="#60a5fa" strokeWidth="1.5"/>
          <text x="60" y="83" fontSize="5.5" fill="#60a5fa" fontWeight="700">MIN</text>
          <text x="32" y="42" textAnchor="middle" fontSize="9">💧</text>
          <path d="M32,92 L28,98 L36,98 Z" fill="#94a3b8" opacity="0.5"/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { num: '1', color: '#22d3ee', label: 'Motor kalt prüfen', desc: 'Immer bei kaltem Motor (Fahrzeug schon länger gestanden)' },
              { num: '2', color: '#22d3ee', label: 'Füllstand prüfen', desc: 'Muss zwischen MIN und MAX liegen (von außen sichtbar)' },
              { num: '3', color: '#22d3ee', label: 'Farbe prüfen', desc: 'Normal: klar/blau/rot. Braun oder trüb → Werkstatt!' },
              { num: '4', color: '#22d3ee', label: 'Bei Bedarf auffüllen', desc: 'Wasser + Kühlmittelkonzentrat 50:50 mischen' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <span style={{ background: s.color, color: '#0c1a2e', fontSize: '0.58rem', fontWeight: 900, padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>{s.num}</span>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'white' }}>{s.label}</span>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(34,211,238,0.08)', borderRadius: '0.4rem', border: '1px solid rgba(34,211,238,0.2)' }}>
            <p style={{ margin: 0, fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              🧊 Frostschutz verhindert Einfrieren bis ca. <strong style={{color:'#22d3ee'}}>-35°C</strong> und schützt vor Korrosion.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function TrocInspect() {
  const [view, setView] = useState<View>('Heck')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, boolean[]>>({})

  const parts = VIEW_PARTS[view]
  const activePart = parts.find(p => p.id === activeId) ?? null

  const getChecks = (part: CarPart) => checks[part.id] ?? part.checks.map(() => false)

  const toggleCheck = (partId: string, idx: number) => {
    const part = parts.find(p => p.id === partId)!
    const cur = getChecks(part)
    const next = [...cur]
    next[idx] = !next[idx]
    setChecks(prev => ({ ...prev, [partId]: next }))
  }

  const handleHotspotClick = (id: string) => {
    setActiveId(prev => prev === id ? null : id)
  }

  const accent = '#4ade80'
  const accentBg = 'rgba(74,222,128,0.1)'
  const accentBorder = 'rgba(74,222,128,0.25)'

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ width: '3px', height: '18px', borderRadius: '2px', background: accent }}/>
        <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Fahrzeugkontrolle
        </p>
      </div>

      {/* View Selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {VIEWS.map(v => (
          <button key={v} onClick={() => { setView(v); setActiveId(null) }} style={{
            padding: '0.3rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 700,
            border: view === v ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.1)',
            background: view === v ? accentBg : 'transparent',
            color: view === v ? accent : 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
          }}>
            {v}
          </button>
        ))}
      </div>

      {/* SVG Diagram */}
      <div style={{ borderRadius: '1rem', overflow: 'hidden', border: `1px solid ${accentBorder}`, background: '#040810', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          {view === 'Heck' && <TrocRearSVG />}
          {view === 'Front' && <TrocFrontSVG />}
          {view === 'Seite' && <TrocSideSVG />}
          {/* Hotspot overlay */}
          <svg viewBox={view === 'Seite' ? '0 0 400 210' : '0 0 400 220'}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {parts.map(p => (
              <Hotspot key={p.id} part={p} onClick={() => handleHotspotClick(p.id)} isActive={activeId === p.id}/>
            ))}
          </svg>
        </div>
      </div>

      {!activeId && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          👆 Auf die Punkte tippen zum Lernen
        </p>
      )}

      {/* Detail Panel */}
      {activePart && (
        <div style={{
          marginTop: '0.75rem',
          background: '#08101e',
          border: `1px solid ${accentBorder}`,
          borderRadius: '1rem',
          padding: '1rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activePart.color, flexShrink: 0 }}/>
                <h3 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'white' }}>{activePart.title}</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>{activePart.subtitle}</p>
              {activePart.law && (
                <span style={{ fontSize: '0.55rem', color: activePart.color, fontWeight: 700, opacity: 0.8 }}>{activePart.law}</span>
              )}
            </div>
            <button onClick={() => setActiveId(null)} style={{
              width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem',
            }}>✕</button>
          </div>

          {/* Special Panels */}
          {activePart.sticker && (
            <div style={{ marginBottom: '0.75rem', padding: '0.65rem', background: 'rgba(250,204,21,0.06)', borderRadius: '0.6rem', border: '1px solid rgba(250,204,21,0.2)' }}>
              <TuvStickerDiagram />
            </div>
          )}
          {activePart.tire && (
            <div style={{ marginBottom: '0.75rem', padding: '0.65rem', background: 'rgba(74,222,128,0.06)', borderRadius: '0.6rem', border: '1px solid rgba(74,222,128,0.2)' }}>
              <TireInfoPanel />
            </div>
          )}
          {activePart.washer && (
            <div style={{ marginBottom: '0.75rem', padding: '0.65rem', background: 'rgba(56,189,248,0.06)', borderRadius: '0.6rem', border: '1px solid rgba(56,189,248,0.2)' }}>
              <WasherFluidPanel />
            </div>
          )}
          {activePart.oilCheck && (
            <div style={{ marginBottom: '0.75rem', padding: '0.65rem', background: 'rgba(245,158,11,0.06)', borderRadius: '0.6rem', border: '1px solid rgba(245,158,11,0.2)' }}>
              <EngineOilPanel />
            </div>
          )}
          {activePart.coolantCheck && (
            <div style={{ marginBottom: '0.75rem', padding: '0.65rem', background: 'rgba(34,211,238,0.06)', borderRadius: '0.6rem', border: '1px solid rgba(34,211,238,0.2)' }}>
              <CoolantPanel />
            </div>
          )}

          {/* Info */}
          <div style={{ marginBottom: '0.75rem', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {activePart.info}
            </p>
          </div>

          {/* Tip */}
          {activePart.tip && (
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.65rem', background: 'rgba(74,222,128,0.06)', borderRadius: '0.5rem', border: '1px solid rgba(74,222,128,0.15)' }}>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                <span style={{ color: accent, fontWeight: 700 }}>💡 Tipp: </span>{activePart.tip}
              </p>
            </div>
          )}

          {/* Checklist */}
          <div>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Prüfliste
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {activePart.checks.map((c, i) => {
                const done = getChecks(activePart)[i]
                return (
                  <button key={i} onClick={() => toggleCheck(activePart.id, i)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.45rem 0.6rem', borderRadius: '0.5rem',
                    background: done ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
                    border: done ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0,
                      background: done ? accent : 'transparent',
                      border: done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done && <span style={{ fontSize: '0.5rem', color: '#052e16', fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '0.62rem', color: done ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)', textDecoration: done ? 'line-through' : 'none' }}>
                      {c.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Progress */}
            {(() => {
              const cur = getChecks(activePart)
              const done = cur.filter(Boolean).length
              const total = activePart.checks.length
              const pct = total > 0 ? (done / total) * 100 : 0
              return (
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>Fortschritt</span>
                    <span style={{ fontSize: '0.55rem', color: done === total ? accent : 'rgba(255,255,255,0.3)', fontWeight: done === total ? 700 : 400 }}>
                      {done}/{total} {done === total ? '✓ Erledigt!' : ''}
                    </span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: '2px', transition: 'width 0.3s ease' }}/>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </div>
  )
}
