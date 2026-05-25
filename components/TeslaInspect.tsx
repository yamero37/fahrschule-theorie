'use client'

import { useState } from 'react'

/* ── Types ──────────────────────────────────────────────── */
type Check = { label: string }

type CarPart = {
  id: string
  cx: number      // SVG x-center of hotspot (viewBox 0 0 400 220)
  cy: number      // SVG y-center of hotspot
  title: string
  subtitle: string
  color: string
  checks: Check[]
  info: string
  tip?: string    // Alleine prüfen – Tipp
  law?: string
  sticker?: boolean  // TÜV-Plaketten-Diagram anzeigen
  tire?: boolean     // Reifen-Infopanel anzeigen
  washer?: boolean   // Scheibenwischwasser-Panel anzeigen
  supa?: boolean     // SUPA-Eselsbrücke anzeigen
}

const VIEWS = ['Heck', 'Front', 'Seite', 'Innenraum'] as const
type ViewName = typeof VIEWS[number]

/* ── Prüfungsdaten ──────────────────────────────────────── */
const VIEW_PARTS: Record<ViewName, CarPart[]> = {
  Heck: [
    // ── Rückstrahler ──
    {
      id: 'reflektor-l',
      cx: 60, cy: 175,
      title: 'Rückstrahler links',
      subtitle: 'Untere linke Bumperecke · rot',
      color: '#ef4444',
      checks: [
        { label: 'Sauber — kein Schmutz, kein Dreck' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
      ],
      info: 'Rote Rückstrahler reflektieren das Licht anderer Fahrzeuge passiv zurück. Sie funktionieren auch ohne Strom und erhöhen so die Sichtbarkeit des Fahrzeugs.',
      law: '§ 51a StVZO',
    },
    {
      id: 'reflektor-r',
      cx: 340, cy: 175,
      title: 'Rückstrahler rechts',
      subtitle: 'Untere rechte Bumperecke · rot',
      color: '#ef4444',
      checks: [
        { label: 'Sauber — kein Schmutz, kein Dreck' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
      ],
      info: 'Rote Rückstrahler reflektieren das Licht anderer Fahrzeuge passiv zurück. Sie funktionieren auch ohne Strom und erhöhen so die Sichtbarkeit des Fahrzeugs.',
      law: '§ 51a StVZO',
    },
    // ── Bremslichter ──
    {
      id: 'bremslicht-l',
      cx: 80, cy: 134,
      title: 'Bremslicht links',
      subtitle: 'Linke Rücklichtleiste · leuchtet beim Bremsen',
      color: '#f97316',
      checks: [
        { label: 'Leuchtet auf, sobald das Bremspedal betätigt wird' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
      ],
      info: 'Das Bremslicht warnt nachfolgende Fahrzeuge, dass das Fahrzeug abbremst. Es muss sofort und deutlich aufleuchten.',
      tip: 'Rückwärts an eine Wand stellen → Bremse treten → durch den Innenspiegel schauen ob es leuchtet.',
      law: '§ 53 StVZO',
    },
    {
      id: 'bremslicht-r',
      cx: 320, cy: 134,
      title: 'Bremslicht rechts',
      subtitle: 'Rechte Rücklichtleiste · leuchtet beim Bremsen',
      color: '#f97316',
      checks: [
        { label: 'Leuchtet auf, sobald das Bremspedal betätigt wird' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
      ],
      info: 'Das Bremslicht warnt nachfolgende Fahrzeuge, dass das Fahrzeug abbremst. Es muss sofort und deutlich aufleuchten.',
      tip: 'Rückwärts an eine Wand stellen → Bremse treten → durch den Innenspiegel schauen ob es leuchtet.',
      law: '§ 53 StVZO',
    },
    {
      id: 'bremslicht-mitte',
      cx: 200, cy: 54,
      title: '3. Bremsleuchte (oben)',
      subtitle: 'Obere Mitte · Heckscheibe / Spoilerbereich',
      color: '#f97316',
      checks: [
        { label: 'Leuchtet auf, sobald das Bremspedal betätigt wird' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
      ],
      info: 'Die 3. Bremsleuchte ist in der Mitte oben angebracht und erhöht die Sichtbarkeit für nachfolgende Fahrzeuge erheblich — besonders bei Auffahrunfällen. Seit 1998 Pflicht für alle Neuwagen.',
      tip: 'Rückwärts an eine Wand stellen → Bremse treten → durch den Innenspiegel schauen ob alle 3 Lichter leuchten.',
      law: '§ 53 StVZO',
    },
    // ── Nebelschlussleuchte ──
    {
      id: 'nebel',
      cx: 40, cy: 134,
      title: 'Nebelschlussleuchte',
      subtitle: 'Linke Seite außen · Rücklichtleiste',
      color: '#a78bfa',
      checks: [
        { label: 'Leuchtet auf wenn aktiviert (funktioniert)' },
        { label: 'Nicht beschädigt / nicht gebrochen' },
        { label: 'Nur bei Sichtweite unter 50 Meter einschalten' },
        { label: 'Bei besserer Sicht sofort wieder ausschalten' },
      ],
      info: 'Die Nebelschlussleuchte ist rot und deutlich heller als normale Rücklichter. Sie ist LINKS verbaut (bei Fahrzeugen für den Rechtsverkehr). Nur erlaubt bei Nebel, Schnee oder starkem Regen wenn die Sichtweite unter 50 Meter liegt. Bei besserem Wetter ausschalten — sie blendet sonst nachfolgende Fahrer stark und kann mit Bremslichtern verwechselt werden.',
      tip: 'Symbol auf dem Armaturenbrett: ein Rücklicht-Symbol mit Wellenlinien dahinter. Einschalten → im Innenspiegel oder durch Umschauen prüfen ob sie leuchtet.',
      law: '§ 53d StVZO',
    },
    // ── Kennzeichen ──
    {
      id: 'kennzeichen',
      cx: 200, cy: 172,
      title: 'Kennzeichen + TÜV-Plakette',
      subtitle: 'Hinteres Kennzeichen · Mitte Stoßstange',
      color: '#fbbf24',
      checks: [
        { label: 'Kennzeichen vollständig vorhanden und lesbar' },
        { label: 'Fest angebracht — nicht verbogen, nicht locker' },
        { label: 'TÜV-Plakette (HU) nicht abgelaufen' },
      ],
      info: 'Das Kennzeichen muss jederzeit gut lesbar sein. Die TÜV-Plakette (Hauptuntersuchung) zeigt wann die nächste HU fällig ist. Neue Fahrzeuge: erste HU nach 3 Jahren — danach alle 2 Jahre.',
      law: '§ 60 StVZO · § 29 StVZO',
      sticker: true,
    },
  ],
  Front: [
    {
      id: 'frunk-wasser',
      cx: 200, cy: 82,
      title: 'Scheibenwischwasser',
      subtitle: 'Vorderer Kofferraum (Frunk) · Behälter unter der Motorhaube',
      color: '#38bdf8',
      checks: [
        { label: 'Behälter mind. auf MIN-Markierung befüllt' },
        { label: 'Wasser + Reinigungsmittel mischen' },
        { label: 'Im Winter: zusätzlich Frostschutz beimischen' },
      ],
      info: 'Beim Tesla Model 3 befindet sich der Scheibenwischwasser-Behälter im vorderen Kofferraum (Frunk). Da es keinen Verbrennungsmotor gibt, ist der gesamte Vorderwagen Stauraum — der Behälter liegt gut zugänglich ganz vorne.',
      washer: true,
    },
  ],
  Seite: [
    {
      id: 'reifen',
      cx: 308, cy: 162,
      title: 'Reifen',
      subtitle: 'Alle 4 Reifen prüfen vor Fahrtantritt',
      color: '#22c55e',
      checks: [
        { label: 'Profiltiefe mind. 1,6 mm (TWI-Anzeige)' },
        { label: 'Luftdruck korrekt (laut Betriebsanleitung)' },
        { label: 'Keine sichtbare Beschädigung (Nägel, Scherben)' },
        { label: 'Reifenart passt zur Saison (Sommer / Winter / Allwetter)' },
      ],
      info: 'Reifen sind das einzige Verbindungsstück zwischen Fahrzeug und Fahrbahn. Schlechte Reifen verlängern den Bremsweg erheblich und können zu Kontrollverlust führen.',
      tire: true,
    },
  ],
  Innenraum: [
    // ── Decke / Headliner ──
    {
      id: 'warnblinker',
      cx: 162, cy: 8,
      title: 'Warnblinker',
      subtitle: 'Rote Dreiecks-Taste · Deckenkonsole über dem Innenspiegel',
      color: '#dc2626',
      checks: [
        { label: 'Rote Dreiecks-Taste an der Decke drücken' },
        { label: 'Alle 6 Blinker leuchten gleichzeitig orange auf (4 Fahrzeugecken + 2 Spiegelblinker)' },
        { label: 'Nur bei tatsächlicher Gefahr oder Notlage einschalten' },
        { label: 'So früh wie möglich einschalten — nicht erst an der Gefahrenstelle' },
      ],
      info: 'Der Warnblinker lässt alle 6 Blinkleuchten gleichzeitig orange aufleuchten: vorne links + rechts, hinten links + rechts und die beiden Spiegelblinker. Er darf nur bei echter Gefahr eingesetzt werden — nicht zum Parken im Halteverbot oder als Danke-Geste.',
      supa: true,
    },
    {
      id: 'spiegel',
      cx: 200, cy: 16,
      title: 'Spiegel einstellen',
      subtitle: 'Innen- + Außenspiegel · vor jedem Fahrtantritt',
      color: '#a78bfa',
      checks: [
        { label: 'Innenspiegel: gesamte Heckscheibe im Blickfeld' },
        { label: 'Linker Außenspiegel: Fahrzeugflanke links sichtbar, Horizont mittig' },
        { label: 'Rechter Außenspiegel: Fahrzeugflanke rechts sichtbar, Horizont mittig' },
        { label: 'Blinde Winkel zusätzlich per Schulterblick prüfen' },
      ],
      info: 'Spiegel immer vor Fahrtantritt einstellen — nie während der Fahrt. Beim Tesla werden Außenspiegel über das Fahrertür-Panel (oder per Display-Profil) verstellt.',
      tip: 'Beim Tesla: Display → Spiegel einstellen. Gespeicherte Fahrer-Profile stellen Spiegel automatisch ein.',
    },
    // ── Linke Seite / Gurt ──
    {
      id: 'gurt',
      cx: 34, cy: 148,
      title: 'Sicherheitsgurt',
      subtitle: 'Pflicht · vor jedem Losfahren anlegen',
      color: '#22c55e',
      checks: [
        { label: 'Immer anlegen — auch bei kurzen Strecken' },
        { label: 'Schultergurt über Schulter und Brust (nie unter dem Arm)' },
        { label: 'Beckengurt über dem Becken, nicht über dem Bauch' },
        { label: 'Gurt darf nicht verdreht sein und liegt flach am Körper' },
      ],
      info: 'Der Sicherheitsgurt ist die wichtigste passive Sicherheitseinrichtung. Er reduziert das Verletzungsrisiko bei einem Unfall um bis zu 50 %. Nicht angegurtet fahren: Bußgeld 30 €.',
      law: '§ 21a StVO',
    },
    // ── Lenkrad-Bereich ──
    {
      id: 'sitz',
      cx: 72, cy: 165,
      title: 'Sitz & Lenkrad einstellen',
      subtitle: 'Fahrersitz · vor Fahrtantritt einstellen',
      color: '#fb923c',
      checks: [
        { label: 'Abstand: Pedale vollständig durchtreten, Bein leicht gebeugt' },
        { label: 'Lehne: leichte Vorneigung, Arme am Lenkrad leicht angewinkelt' },
        { label: 'Sitzhöhe: freie Sicht über die Motorhaube' },
        { label: 'Lenkrad: kein Kontakt mit Knien beim vollen Einschlag' },
      ],
      info: 'Eine korrekte Sitzposition ist entscheidend für die volle Kontrolle — besonders in Gefahrensituationen. Beim Tesla ist der Sitz elektrisch verstellbar und kann per Profil gespeichert werden.',
      tip: 'Fahrertür-Bedienfeld oder Display → Fahrer-Profil → Sitzeinstellungen automatisch laden.',
    },
    {
      id: 'hupe',
      cx: 108, cy: 194,
      title: 'Hupe',
      subtitle: 'Lenkrad-Nabe drücken · § 16 StVO',
      color: '#fbbf24',
      checks: [
        { label: 'Außerorts: kurzes Signal vor dem Überholen (Ankündigung)' },
        { label: 'Als Warnsignal bei drohender Gefahr (jederzeit erlaubt)' },
        { label: 'Innerorts: nur bei unmittelbarer Gefahr erlaubt' },
        { label: 'Nicht als Ausdrucksmittel von Ärger oder Ungeduld verwenden' },
      ],
      info: 'Die Hupe darf außerorts zum Ankündigen eines Überholmanövers eingesetzt werden. Innerorts ist sie nur bei unmittelbarer Gefahr erlaubt. Missbräuchliche Benutzung kann als Belästigung gewertet werden.',
      law: '§ 16 StVO',
    },
    {
      id: 'fernlicht',
      cx: 148, cy: 205,
      title: 'Fernlicht',
      subtitle: 'Blinker-Hebel nach hinten (von dir weg) drücken',
      color: '#93c5fd',
      checks: [
        { label: 'Rechten Hebel nach hinten drücken = Fernlicht EIN' },
        { label: 'Blaue Kontrollleuchte im Display leuchtet auf' },
        { label: 'Nur bei freier Sicht ohne entgegenkommende Fahrzeuge' },
        { label: 'Rechtzeitig auf Abblendlicht zurückschalten (andere nicht blenden)' },
      ],
      info: 'Fernlicht leuchtet weiter und heller als Abblendlicht — erhöht die Sichtweite erheblich. Es muss sofort abgeblendet werden, sobald Gegenverkehr kommt oder man einem Fahrzeug zu nahe auffährt.',
      tip: 'Kontrollleuchte: blaues Scheinwerfer-Symbol mit waagerechten Strichen im Display.',
      law: '§ 17 StVO',
    },
    {
      id: 'scheibenwischer',
      cx: 66, cy: 212,
      title: 'Scheibenwischer + Waschanlage',
      subtitle: 'Linker Hebel: Knopf am Ende reindrücken',
      color: '#38bdf8',
      checks: [
        { label: 'Linken Hebel (gleicher wie Blinker) → Knopf am Ende reindrücken' },
        { label: 'Wasser sprüht und Wischer wischen gleichzeitig' },
        { label: 'Wischer-Stufe am Hebel oder auf "Auto" über Display einstellen' },
        { label: 'Scheibenwischwasser muss ausreichend befüllt sein (Frunk prüfen)' },
      ],
      info: 'Beim Tesla Model 3 ist der linke Hebel für Blinker und Scheibenwischer kombiniert. Der Knopf am Hebelende aktiviert die Sprühfunktion. Der Auto-Wischer-Modus erkennt Regen automatisch über eine Kamera.',
    },
    // ── Pedal-Bereich ──
    {
      id: 'betriebsbremse',
      cx: 83, cy: 245,
      title: 'Betriebsbremse prüfen',
      subtitle: 'Bremspedal · Widerstandsprüfung vor Fahrtantritt',
      color: '#f87171',
      checks: [
        { label: 'Leicht reindrücken: ab 1/3 des Wegs Widerstand spüren' },
        { label: 'Ab 2/3 des Wegs darf das Pedal nicht weiter nachgeben' },
        { label: 'Pedal fühlt sich fest an → Bremse in Ordnung' },
        { label: 'Weiches / durchgehendes Pedal → defekte Bremse → nicht fahren!' },
      ],
      info: 'Die Betriebsbremse (Fußbremse) ist das wichtigste Bremssystem. Beim Tesla gibt es kein Kupplungspedal — nur Gas und Bremse. Der Widerstand im Pedal kommt vom Bremskraftbegrenzer und zeigt, dass das System Druck aufgebaut hat.',
      tip: 'Prüfung: Zündung EIN (Motor nicht starten) → Bremspedal langsam durchdrücken → Widerstand bei ca. 1/3 muss spürbar sein.',
    },
    // ── Display-Bereich ──
    {
      id: 'nebel-innen',
      cx: 238, cy: 220,
      title: 'Nebelschlussleuchte (Display)',
      subtitle: 'Einschalten über Schnellmenü im Display',
      color: '#f97316',
      checks: [
        { label: 'Display → Schnellzugriff → Nebelschlussleuchte tippen' },
        { label: 'Orange Kontrollleuchte (Rücklicht + Wellenlinien) leuchtet auf' },
        { label: 'Nur bei Sichtweite unter 50 Meter einschalten' },
        { label: 'Bei besserem Wetter sofort ausschalten (blendet Hinterfahrer)' },
      ],
      info: 'Die Nebelschlussleuchte ist beim Tesla Model 3 ausschließlich über das Display steuerbar. Die orange Kontrollleuchte zeigt die Aktivierung an. Sie darf nur bei extremer Sichtbehinderung durch Nebel, Schnee oder Regen genutzt werden.',
      law: '§ 53d StVZO',
    },
    {
      id: 'display',
      cx: 286, cy: 163,
      title: 'Display — Fahrzeugkontrolle',
      subtitle: '15,4" Zentraldisplay · Bedienzentrale für alles',
      color: '#60a5fa',
      checks: [
        { label: 'Keine aktiven Warnmeldungen oder Fehlermeldungen' },
        { label: 'Reichweite ausreichend für die geplante Fahrt' },
        { label: 'Licht auf "Auto" oder korrekt manuell eingestellt' },
        { label: 'Scheibenwischer auf Auto-Modus (oder geprüft)' },
      ],
      info: 'Beim Tesla Model 3 werden fast alle Fahrzeugfunktionen über den 15,4" Touchscreen gesteuert — Licht, Klimaanlage, Außenspiegel, Sitzheizung, Scheibenwischer, Nebelschlussleuchte, Fahrmodus und mehr.',
      tip: 'Vor Fahrtantritt: Warnleuchten prüfen, Akkuladestand und Reichweite kontrollieren, Licht auf "Auto" stellen.',
    },
  ],
}

/* ── Hotspot SVG-Element ────────────────────────────────── */
function Hotspot({
  cx, cy, color, selected, onClick, index,
}: {
  cx: number; cy: number; color: string; selected: boolean; onClick: () => void; index: number
}) {
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Pulsing outer ring (only when not selected) */}
      {!selected && (
        <circle cx={cx} cy={cy} r="14" fill="none" stroke={color} strokeWidth="1.5">
          <animate attributeName="r" values="14;26;14" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Main circle */}
      <circle
        cx={cx} cy={cy} r="13"
        fill={selected ? color : 'rgba(15,15,20,0.75)'}
        stroke={color}
        strokeWidth={selected ? 0 : 2}
      />

      {/* Inner glow when selected */}
      {selected && (
        <circle cx={cx} cy={cy} r="13" fill={color} opacity="0.25" />
      )}

      {/* Label */}
      <text
        x={cx} y={cy + 4}
        textAnchor="middle"
        fill={selected ? '#fff' : color}
        fontSize="11"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {index + 1}
      </text>
    </g>
  )
}

/* ── TÜV-Plaketten Diagram ──────────────────────────────── */
function TuvStickerDiagram() {
  // Positions für Zahlen 1–12 auf dem Ziffernblatt (clockwise, 12 o'clock = oben)
  // Monatsziffer oben = Ablaufmonat → Beispiel: "6" oben = Juni
  const months = [
    { n: 6,  x: 50, y: 14,  highlight: true  }, // TOP (= Ablaufmonat Beispiel)
    { n: 7,  x: 68, y: 20,  highlight: false },
    { n: 8,  x: 80, y: 34,  highlight: false },
    { n: 9,  x: 85, y: 50,  highlight: false },
    { n: 10, x: 80, y: 66,  highlight: false },
    { n: 11, x: 68, y: 80,  highlight: false },
    { n: 12, x: 50, y: 86,  highlight: false },
    { n: 1,  x: 32, y: 80,  highlight: false },
    { n: 2,  x: 20, y: 66,  highlight: false },
    { n: 3,  x: 15, y: 50,  highlight: false },
    { n: 4,  x: 20, y: 34,  highlight: false },
    { n: 5,  x: 32, y: 20,  highlight: false },
  ]

  return (
    <div style={{ margin: '0.85rem 0 0.5rem' }}>
      {/* Titel */}
      <p style={{
        margin: '0 0 0.6rem', fontSize: '0.6rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fbbf24',
      }}>TÜV-Plakette lesen</p>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Sticker SVG */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" width="90" height="90">
            {/* Äußerer Ring (Jahresfarbe – hier Gelb für 2026) */}
            <circle cx="50" cy="50" r="47" fill="#fbbf24" />
            {/* Weißer Innenring */}
            <circle cx="50" cy="50" r="38" fill="white" />
            {/* Innenfläche */}
            <circle cx="50" cy="50" r="25" fill="#f5f2ec" />

            {/* Alle 12 Monatszahlen */}
            {months.map(m => (
              <text
                key={m.n}
                x={m.x} y={m.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={m.highlight ? '9.5' : '7'}
                fontWeight={m.highlight ? '900' : '600'}
                fill={m.highlight ? '#dc2626' : '#888'}
              >{m.n}</text>
            ))}

            {/* Highlight-Kasten um den Ablaufmonat (oben) */}
            <rect x="40" y="5" width="20" height="13" rx="3"
              fill="rgba(220,38,38,0.15)" stroke="#dc2626" strokeWidth="1.2" />

            {/* Jahreszahl in der Mitte */}
            <text x="50" y="54" textAnchor="middle" dominantBaseline="middle"
              fontSize="20" fontWeight="900" fill="#1a1a1a">26</text>
          </svg>
        </div>

        {/* Beschriftung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '140px' }}>
          {/* Monat */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '0.45rem 0.65rem', borderRadius: '0.6rem',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
          }}>
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
              background: '#dc2626', fontSize: '0.52rem', fontWeight: 900,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>▲</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#fca5a5' }}>Obere Zahl am Rand</p>
              <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)' }}>= Ablaufmonat (1–12)</p>
            </div>
          </div>

          {/* Jahr */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '0.45rem 0.65rem', borderRadius: '0.6rem',
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
          }}>
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
              background: '#fbbf24', fontSize: '0.52rem', fontWeight: 900,
              color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>●</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#fde68a' }}>Zahl in der Mitte</p>
              <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)' }}>= Ablaujahr (z.B. 26 = 2026)</p>
            </div>
          </div>

          {/* Farbe */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '0.45rem 0.65rem', borderRadius: '0.6rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🎨</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text)' }}>Farbe des Rings</p>
              <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)' }}>Jedes Jahr andere Farbe — schnelle Erkennung</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gültigkeitsdauer */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginTop: '0.65rem', flexWrap: 'wrap',
      }}>
        {[
          { label: 'Neuwagen', value: 'Erste HU nach 3 Jahren', icon: '🆕' },
          { label: 'Danach', value: 'Alle 2 Jahre', icon: '🔄' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, minWidth: '120px',
            padding: '0.5rem 0.65rem', borderRadius: '0.6rem',
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '0.85rem' }}>{item.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: 700 }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#fde68a' }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Tesla Heck SVG ─────────────────────────────────────── */
function TeslaRearSVG({
  parts, selectedId, onSelect,
}: {
  parts: CarPart[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <svg viewBox="0 0 400 220" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="tailL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="tailR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#232326" />
          <stop offset="100%" stopColor="#111113" />
        </linearGradient>
        <linearGradient id="bumperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1c" />
          <stop offset="100%" stopColor="#0d0d0f" />
        </linearGradient>
        <filter id="redGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Karosserie (Hauptkörper) ── */}
      <path
        d="M 44 202 L 356 202 Q 374 202 374 184 L 374 114 Q 374 80 352 64 L 318 52 Q 262 37 200 37 Q 138 37 82 52 L 48 64 Q 26 80 26 114 L 26 184 Q 26 202 44 202 Z"
        fill="url(#bodyGrad)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="1.5"
      />

      {/* ── Heckscheibe (groß, Tesla-typisch) ── */}
      <path
        d="M 82 54 Q 138 39 200 39 Q 262 39 318 54 L 312 106 Q 260 118 200 118 Q 140 118 88 106 Z"
        fill="#08101c"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
      />
      {/* Glasreflexion */}
      <path
        d="M 105 57 Q 155 47 200 47 Q 245 47 295 57 L 290 78 Q 245 72 200 72 Q 155 72 110 78 Z"
        fill="rgba(255,255,255,0.035)"
      />
      {/* Zweite Reflexionslinie */}
      <path
        d="M 118 82 Q 160 77 200 77 Q 240 77 282 82 L 280 90 Q 240 86 200 86 Q 160 86 120 90 Z"
        fill="rgba(255,255,255,0.02)"
      />

      {/* ── 3. Bremsleuchte (oben Mitte, im Heckscheiben-Bereich) ── */}
      <rect x="158" y="45" width="84" height="7" rx="3.5" fill="#2a0a00" stroke="rgba(249,115,22,0.35)" strokeWidth="1" />
      <rect x="161" y="46.5" width="78" height="4" rx="2" fill="rgba(249,115,22,0.18)" />
      {/* Mittige Teilung */}
      <line x1="200" y1="46" x2="200" y2="52" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />

      {/* ── Kofferraumdeckel-Kante ── */}
      <line x1="84" y1="122" x2="316" y2="122" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
      <line x1="84" y1="123" x2="316" y2="123" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />

      {/* ── Tesla T-Logo ── */}
      <text
        x="200" y="149"
        textAnchor="middle"
        fill="rgba(255,255,255,0.18)"
        fontSize="13"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >T</text>

      {/* ── Rücklichtleiste (das markante Tesla-Band) ── */}
      <rect x="26" y="126" width="348" height="17" rx="3" fill="#0b0000" />
      {/* Links leuchtend */}
      <rect x="26" y="126" width="130" height="17" rx="3" fill="url(#tailL)" />
      {/* Rechts leuchtend */}
      <rect x="244" y="126" width="130" height="17" rx="3" fill="url(#tailR)" />
      {/* Mitte (Tesla-Logo-Unterbrechung) */}
      <rect x="172" y="127" width="56" height="15" rx="2" fill="#0e0000" />
      {/* Glow-Effekt */}
      <rect x="26" y="126" width="130" height="17" rx="3" fill="rgba(220,38,38,0.2)" filter="url(#redGlow)" />
      <rect x="244" y="126" width="130" height="17" rx="3" fill="rgba(220,38,38,0.2)" filter="url(#redGlow)" />
      {/* ── Nebelschlussleuchte (linke Außenseite, hell markiert) ── */}
      <rect x="26" y="126" width="28" height="17" rx="3" fill="#1a0030" stroke="rgba(167,139,250,0.5)" strokeWidth="1" />
      <rect x="28" y="128" width="22" height="13" rx="2" fill="rgba(167,139,250,0.2)" />
      {/* Mittlere Trennlinie (trennt Nebel von restlichem Rücklicht) */}
      <line x1="54" y1="127" x2="54" y2="143" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />

      {/* ── Stoßstange ── */}
      <path
        d="M 30 148 L 370 148 L 372 196 Q 372 206 356 206 L 44 206 Q 28 206 28 196 Z"
        fill="url(#bumperGrad)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      {/* Stoßstangen-Trennlinie (Aero-Kante) */}
      <line x1="32" y1="162" x2="368" y2="162" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* ── Linker Rückstrahler ── */}
      <rect x="34" y="165" width="52" height="22" rx="5" fill="#3d0000" stroke="#9b1c1c" strokeWidth="1.5" />
      <rect x="37" y="167" width="46" height="16" rx="3" fill="#5a0000" />
      {/* Reflektor-Muster */}
      <rect x="38" y="168" width="20" height="7" rx="1.5" fill="rgba(252,165,165,0.15)" />
      <rect x="62" y="168" width="17" height="7" rx="1.5" fill="rgba(252,165,165,0.1)" />
      {/* Highlight */}
      <rect x="38" y="167" width="12" height="3" rx="1" fill="rgba(255,200,200,0.2)" />

      {/* ── Rechter Rückstrahler ── */}
      <rect x="314" y="165" width="52" height="22" rx="5" fill="#3d0000" stroke="#9b1c1c" strokeWidth="1.5" />
      <rect x="317" y="167" width="46" height="16" rx="3" fill="#5a0000" />
      {/* Reflektor-Muster */}
      <rect x="318" y="168" width="20" height="7" rx="1.5" fill="rgba(252,165,165,0.15)" />
      <rect x="342" y="168" width="17" height="7" rx="1.5" fill="rgba(252,165,165,0.1)" />
      {/* Highlight */}
      <rect x="318" y="167" width="12" height="3" rx="1" fill="rgba(255,200,200,0.2)" />

      {/* ── Kennzeichen ── */}
      <rect x="150" y="158" width="100" height="28" rx="4" fill="#ece8de" stroke="rgba(150,150,150,0.3)" strokeWidth="1" />
      <text x="200" y="176" textAnchor="middle" fill="#1a1a1a" fontSize="10" fontWeight="800" fontFamily="monospace" letterSpacing="1">WH · TD 2026</text>

      {/* ── Rückfahrkamera ── */}
      <rect x="194" y="189" width="12" height="9" rx="2" fill="#080808" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="200" cy="193.5" r="3" fill="#090909" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

      {/* ── Bodenschatten ── */}
      <ellipse cx="200" cy="214" rx="170" ry="7" fill="rgba(0,0,0,0.45)" />

      {/* ── Interaktive Hotspots ── */}
      {parts.map((p, i) => (
        <Hotspot
          key={p.id}
          cx={p.cx} cy={p.cy}
          color={p.color}
          selected={selectedId === p.id}
          onClick={() => onSelect(p.id)}
          index={i}
        />
      ))}
    </svg>
  )
}

/* ── Tesla Front SVG ────────────────────────────────────── */
function TeslaFrontSVG({
  parts, selectedId, onSelect,
}: {
  parts: CarPart[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <svg viewBox="0 0 400 220" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="frontBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2e2e32" />
          <stop offset="55%" stopColor="#1c1c1e" />
          <stop offset="100%" stopColor="#0e0e10" />
        </linearGradient>
        <linearGradient id="frontBumperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#181818" />
          <stop offset="100%" stopColor="#0a0a0c" />
        </linearGradient>
        <linearGradient id="lightBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="18%"  stopColor="#bae6fd" stopOpacity="1"   />
          <stop offset="50%"  stopColor="#f0f9ff" stopOpacity="0.95"/>
          <stop offset="82%"  stopColor="#bae6fd" stopOpacity="1"   />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.9" />
        </linearGradient>
        <filter id="lightGlow">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softShadow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Bodenschatten ── */}
      <ellipse cx="200" cy="208" rx="168" ry="8" fill="rgba(0,0,0,0.55)" />

      {/* ── Hauptkarosserie ── */}
      <path
        d="M 38 198 L 362 198 Q 376 198 376 184 L 376 150 Q 374 124 356 110 L 352 106
           L 350 80 Q 346 58 322 50 L 200 44 L 78 50 Q 54 58 50 80 L 48 106
           L 44 110 Q 26 124 24 150 L 24 184 Q 24 198 38 198 Z"
        fill="url(#frontBodyGrad)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.5"
      />

      {/* ── Motorhauben-Kontur (Frunk-Bereich) ── */}
      <path
        d="M 78 50 Q 200 42 322 50 L 350 80 Q 280 74 200 72 Q 120 74 50 80 Z"
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      {/* Hauben-Mittellinie */}
      <line x1="200" y1="44" x2="200" y2="106" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />
      {/* Hauben-Seitenfalten */}
      <path d="M 110 55 Q 145 65 155 106" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
      <path d="M 290 55 Q 255 65 245 106" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />

      {/* ── Frontschürze / oberer Abschluss ── */}
      <rect x="24" y="106" width="352" height="8" rx="1"
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

      {/* ── Voll-LED Lichtband (Tesla-typisch) ── */}
      {/* Glow-Effekt darunter */}
      <rect x="36" y="108" width="328" height="7" rx="3"
        fill="rgba(186,230,253,0.3)" filter="url(#lightGlow)" />
      {/* Äußere Lichtleiste */}
      <rect x="36" y="109" width="328" height="6" rx="3"
        fill="url(#lightBarGrad)" />
      {/* Innerer Glanzstreifen */}
      <rect x="38" y="109.5" width="324" height="2" rx="1"
        fill="rgba(255,255,255,0.6)" />
      {/* Mittlere Unterbrechung (Tesla-Logo-Bereich) */}
      <rect x="182" y="109" width="36" height="6" rx="0"
        fill="#0e0e10" />

      {/* ── Scheinwerfer links ── */}
      {/* Gehäuse */}
      <path d="M 28 110 L 36 110 L 182 110 L 178 134 Q 160 148 120 152 Q 70 154 36 144 Q 24 138 24 128 Z"
        fill="#04080f" stroke="rgba(147,197,253,0.25)" strokeWidth="1" />
      {/* DRL / Tagfahrlicht-Kontur */}
      <path d="M 36 112 L 160 112 L 157 128 Q 140 140 108 142 Q 66 143 38 136 Q 28 132 28 126 Z"
        fill="rgba(8,24,40,0.9)" />
      {/* Innere Lichteinheiten */}
      <ellipse cx="80" cy="132" rx="22" ry="12" fill="#060e18" stroke="rgba(147,197,253,0.3)" strokeWidth="1" />
      <ellipse cx="80" cy="132" rx="14" ry="8" fill="#04080f" stroke="rgba(147,197,253,0.5)" strokeWidth="0.75" />
      <ellipse cx="80" cy="132" rx="7" ry="4" fill="#0a1828" />
      {/* Projektorreflex */}
      <ellipse cx="78" cy="131" rx="3" ry="2" fill="rgba(186,230,253,0.15)" />
      {/* Abblendlicht */}
      <ellipse cx="130" cy="135" rx="16" ry="8" fill="#060e18" stroke="rgba(147,197,253,0.2)" strokeWidth="0.75" />
      <ellipse cx="130" cy="135" rx="9" ry="5" fill="rgba(186,230,253,0.08)" />
      {/* Obere Abschlussnaht */}
      <line x1="36" y1="115" x2="174" y2="115" stroke="rgba(147,197,253,0.12)" strokeWidth="0.75" />

      {/* ── Scheinwerfer rechts (gespiegelt) ── */}
      <path d="M 372 110 L 364 110 L 218 110 L 222 134 Q 240 148 280 152 Q 330 154 364 144 Q 376 138 376 128 Z"
        fill="#04080f" stroke="rgba(147,197,253,0.25)" strokeWidth="1" />
      <path d="M 364 112 L 240 112 L 243 128 Q 260 140 292 142 Q 334 143 362 136 Q 372 132 372 126 Z"
        fill="rgba(8,24,40,0.9)" />
      <ellipse cx="320" cy="132" rx="22" ry="12" fill="#060e18" stroke="rgba(147,197,253,0.3)" strokeWidth="1" />
      <ellipse cx="320" cy="132" rx="14" ry="8" fill="#04080f" stroke="rgba(147,197,253,0.5)" strokeWidth="0.75" />
      <ellipse cx="320" cy="132" rx="7" ry="4" fill="#0a1828" />
      <ellipse cx="318" cy="131" rx="3" ry="2" fill="rgba(186,230,253,0.15)" />
      <ellipse cx="270" cy="135" rx="16" ry="8" fill="#060e18" stroke="rgba(147,197,253,0.2)" strokeWidth="0.75" />
      <ellipse cx="270" cy="135" rx="9" ry="5" fill="rgba(186,230,253,0.08)" />
      <line x1="364" y1="115" x2="226" y2="115" stroke="rgba(147,197,253,0.12)" strokeWidth="0.75" />

      {/* ── Stoßstange ── */}
      <path
        d="M 24 152 L 376 152 L 374 196 Q 372 200 362 200 L 38 200 Q 28 200 26 196 Z"
        fill="url(#frontBumperGrad)"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
      {/* Aerodynamik-Kante */}
      <line x1="28" y1="164" x2="372" y2="164" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      {/* Unterer Lufteinlass-Bereich (Attrappe, kein echter Einlass) */}
      <rect x="44" y="168" width="130" height="20" rx="4"
        fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />
      <rect x="226" y="168" width="130" height="20" rx="4"
        fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />
      {/* Kleine horizontale Streben im Einlass */}
      {[172, 177, 182].map(y => (
        <line key={y} x1="48" y1={y} x2="170" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
      ))}
      {[172, 177, 182].map(y => (
        <line key={y} x1="230" y1={y} x2="352" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
      ))}

      {/* ── Tesla T-Logo ── */}
      {/* T-Querbalken */}
      <rect x="189" y="80" width="22" height="3.5" rx="1.5" fill="rgba(255,255,255,0.28)" />
      {/* T-Senkrechter */}
      <rect x="198.5" y="80" width="3" height="14" rx="1" fill="rgba(255,255,255,0.28)" />

      {/* ── Kennzeichen ── */}
      <rect x="158" y="170" width="84" height="22" rx="3" fill="#ece8de" stroke="rgba(150,150,150,0.3)" strokeWidth="0.75" />
      <text x="200" y="185" textAnchor="middle" fill="#1a1a1a" fontSize="8.5" fontWeight="800" fontFamily="monospace" letterSpacing="1">WH · TD 2026</text>

      {/* ── Frontkamera (oben Windschutzscheibe) ── */}
      <rect x="196" y="44" width="8" height="5" rx="1.5" fill="#080808" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      {/* ── Hauben-Öffnungs-Hinweis (gestrichelter Frunk-Rahmen) ── */}
      <path
        d="M 78 52 Q 200 44 322 52 L 350 82 Q 280 75 200 73 Q 120 75 50 82 Z"
        fill="none"
        stroke="rgba(56,189,248,0.2)"
        strokeWidth="1"
        strokeDasharray="5,4"
      />

      {/* ── Interaktive Hotspots ── */}
      {parts.map((p, i) => (
        <Hotspot
          key={p.id}
          cx={p.cx} cy={p.cy}
          color={p.color}
          selected={selectedId === p.id}
          onClick={() => onSelect(p.id)}
          index={i}
        />
      ))}
    </svg>
  )
}

/* ── Scheibenwischwasser-Panel ──────────────────────────── */
function WasherFluidPanel() {
  return (
    <div style={{ margin: '0.85rem 0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <p style={{
        margin: '0 0 0.2rem', fontSize: '0.6rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#38bdf8',
      }}>Scheibenwischwasser — Zusammensetzung</p>

      {/* Behälter-Visualisierung */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.75rem 0.9rem', borderRadius: '0.75rem',
        background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)',
      }}>
        {/* Behälter SVG */}
        <svg viewBox="0 0 48 72" width="44" height="66" style={{ flexShrink: 0 }}>
          {/* Behälter-Körper */}
          <rect x="8" y="18" width="32" height="46" rx="4" fill="#0c1a28" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
          {/* Einfüllstutzen */}
          <rect x="16" y="10" width="16" height="10" rx="2" fill="#0c1a28" stroke="rgba(56,189,248,0.35)" strokeWidth="1.2" />
          <rect x="18" y="8" width="12" height="5" rx="2" fill="#0c1a28" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />
          {/* Flüssigkeitsstand (ca. 70% voll) */}
          <rect x="10" y="36" width="28" height="26" rx="2" fill="rgba(56,189,248,0.35)" />
          {/* Welleneffekt */}
          <path d="M 10 37 Q 18 34 24 37 Q 30 40 38 37" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="1" />
          {/* MIN-Linie */}
          <line x1="8" y1="56" x2="13" y2="56" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <text x="5" y="59" fontSize="4.5" fill="rgba(255,255,255,0.4)" fontWeight="700">MIN</text>
          {/* MAX-Linie */}
          <line x1="8" y1="24" x2="13" y2="24" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <text x="4" y="27" fontSize="4.5" fill="rgba(255,255,255,0.4)" fontWeight="700">MAX</text>
          {/* Scheibenwischer-Symbol */}
          <text x="24" y="52" textAnchor="middle" fontSize="10" fill="rgba(56,189,248,0.5)">💧</text>
        </svg>
        <div>
          <p style={{ margin: '0 0 3px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)' }}>
            Frunk → Behälter öffnen
          </p>
          <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.55 }}>
            Haube öffnen → Behälter mit Windschutzscheiben-Symbol suchen → Deckel öffnen und befüllen.
            Immer <strong style={{ color: '#38bdf8' }}>gemischte Lösung</strong> verwenden, nie nur reines Wasser.
          </p>
        </div>
      </div>

      {/* ── 3 Komponenten ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>

        {/* Komponente 1: Wasser */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.65rem 0.9rem', borderRadius: '0.65rem',
          background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.22)',
        }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.95rem',
          }}>💧</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#7dd3fc' }}>
              Komponente 1 — Wasser
            </p>
            <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>
              Basis der Mischung. Normales Leitungswasser ist geeignet.
            </p>
          </div>
          <span style={{
            fontSize: '0.55rem', fontWeight: 800, padding: '2px 8px', borderRadius: '100px',
            background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
            color: '#38bdf8', flexShrink: 0,
          }}>immer</span>
        </div>

        {/* Komponente 2: Reinigungsmittel */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.65rem 0.9rem', borderRadius: '0.65rem',
          background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)',
        }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.95rem',
          }}>🧴</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#86efac' }}>
              Komponente 2 — Reinigungsmittel
            </p>
            <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>
              Löst Insekten, Fett und Straßenschmutz. Dosierung laut Hersteller auf der Flasche.
            </p>
          </div>
          <span style={{
            fontSize: '0.55rem', fontWeight: 800, padding: '2px 8px', borderRadius: '100px',
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e', flexShrink: 0,
          }}>immer</span>
        </div>

        {/* Komponente 3: Frostschutz (nur Winter) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.65rem 0.9rem', borderRadius: '0.65rem',
          background: 'rgba(147,197,253,0.07)', border: '1px solid rgba(147,197,253,0.28)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Winter-Hintergrund-Akzent */}
          <div style={{
            position: 'absolute', right: '-8px', top: '-8px',
            fontSize: '2.5rem', opacity: 0.07, userSelect: 'none', pointerEvents: 'none',
          }}>❄️</div>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(147,197,253,0.2)', border: '1px solid rgba(147,197,253,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.95rem',
          }}>❄️</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#bae6fd' }}>
              Komponente 3 — Frostschutz
            </p>
            <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>
              Verhindert Einfrieren der Düsen und Leitungen. Schützt bis ca. −20 °C (je nach Dosierung).
              Ohne Frostschutz können Leitungen und Düsen reißen!
            </p>
          </div>
          <span style={{
            fontSize: '0.55rem', fontWeight: 800, padding: '2px 8px', borderRadius: '100px',
            background: 'rgba(147,197,253,0.18)', border: '1px solid rgba(147,197,253,0.4)',
            color: '#93c5fd', flexShrink: 0,
          }}>❄️ Winter</span>
        </div>
      </div>

      {/* Hinweis-Box */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
        padding: '0.6rem 0.8rem', borderRadius: '0.65rem',
        background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.22)',
      }}>
        <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: '#fbbf24' }}>Nie nur Wasser verwenden!</strong> Im Sommer verdunstet es schnell und reinigt schlecht. Im Winter friert es ein und beschädigt die Anlage.
        </p>
      </div>
    </div>
  )
}

/* ── Tesla Seite SVG ────────────────────────────────────── */
function TeslaSideSVG({
  parts, selectedId, onSelect,
}: {
  parts: CarPart[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  return (
    <svg viewBox="0 0 400 210" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="sideBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2e" />
          <stop offset="60%" stopColor="#1a1a1c" />
          <stop offset="100%" stopColor="#111113" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0d1f2d" />
          <stop offset="100%" stopColor="#071018" />
        </linearGradient>
        <radialGradient id="wheelGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a2a2e" />
          <stop offset="60%" stopColor="#111" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
        <radialGradient id="tireGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>
        <filter id="shadowBlur">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Bodenschatten ── */}
      <ellipse cx="200" cy="198" rx="175" ry="8" fill="rgba(0,0,0,0.5)" />

      {/* ── Karosserie ── */}
      {/* Unterboden */}
      <rect x="48" y="148" width="306" height="24" rx="4" fill="#0d0d0f" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {/* Hauptkörper */}
      <path
        d="M 58 148 L 58 92 Q 58 70 78 62 L 128 46 Q 158 38 188 37 L 240 37 Q 268 37 284 44 L 318 68 Q 344 82 348 108 L 348 148 Z"
        fill="url(#sideBodyGrad)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="1.5"
      />
      {/* Seitenlinie (Charakterlinie) */}
      <path
        d="M 62 118 Q 150 110 220 108 Q 280 108 346 116"
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
      />
      {/* Türspalt vorne */}
      <line x1="182" y1="60" x2="178" y2="148" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5" />
      <line x1="183" y1="60" x2="179" y2="148" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      {/* Türspalt hinten */}
      <line x1="268" y1="57" x2="272" y2="148" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5" />
      <line x1="269" y1="57" x2="273" y2="148" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

      {/* ── Windschutzscheibe ── */}
      <path
        d="M 128 46 Q 158 38 188 37 L 182 60 Q 158 54 130 62 Z"
        fill="url(#glassGrad)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      {/* Reflex Windschutzscheibe */}
      <path
        d="M 134 50 L 182 40 L 180 47 L 136 56 Z"
        fill="rgba(255,255,255,0.04)"
      />

      {/* ── Heckscheibe ── */}
      <path
        d="M 240 37 Q 268 37 284 44 L 318 68 Q 300 62 268 58 Z"
        fill="url(#glassGrad)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      {/* Reflex Heckscheibe */}
      <path
        d="M 248 40 L 280 46 L 314 66 L 306 64 L 272 48 L 246 44 Z"
        fill="rgba(255,255,255,0.035)"
      />

      {/* ── Dach (Glasdach) ── */}
      <path
        d="M 188 37 L 240 37 L 268 58 L 182 60 Z"
        fill="#08121c"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="0.75"
      />
      {/* Glasdach-Reflex */}
      <path
        d="M 195 39 L 235 39 L 255 52 L 200 54 Z"
        fill="rgba(255,255,255,0.025)"
      />

      {/* ── A-Säule ── */}
      <line x1="128" y1="46" x2="130" y2="62" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />

      {/* ── Außenspiegel ── */}
      <path
        d="M 156 72 L 170 68 L 172 75 L 158 78 Z"
        fill="#1a1a1c" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
      />

      {/* ── Türgriffe ── */}
      {/* Vorderer Türgriff */}
      <rect x="145" y="97" width="22" height="5" rx="2.5" fill="#111" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
      {/* Hinterer Türgriff */}
      <rect x="233" y="97" width="22" height="5" rx="2.5" fill="#111" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />

      {/* ── Rücklicht (Seite) ── */}
      <rect x="338" y="110" width="10" height="30" rx="2" fill="#2a0000" stroke="rgba(220,38,38,0.6)" strokeWidth="1" />
      <rect x="340" y="113" width="6" height="24" rx="1.5" fill="rgba(220,38,38,0.35)" />

      {/* ── Scheinwerfer (Seite) ── */}
      <path d="M 56 90 Q 48 100 48 110 L 62 108 Q 60 100 62 92 Z"
        fill="#081828" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />

      {/* ── Vorderes Rad ── */}
      <circle cx="100" cy="172" r="30" fill="url(#tireGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      {/* Reifenprofil-Ring */}
      <circle cx="100" cy="172" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      {/* Felge */}
      <circle cx="100" cy="172" r="20" fill="url(#wheelGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Felgenspeichen */}
      {[0,36,72,108,144,180,216,252,288,324].map(deg => {
        const rad = (deg * Math.PI) / 180
        return <line key={deg}
          x1={100 + 8 * Math.cos(rad)} y1={172 + 8 * Math.sin(rad)}
          x2={100 + 18 * Math.cos(rad)} y2={172 + 18 * Math.sin(rad)}
          stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" strokeLinecap="round"
        />
      })}
      {/* Nabenkappe */}
      <circle cx="100" cy="172" r="8" fill="#0f0f11" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="100" cy="172" r="4" fill="#1a1a1c" />

      {/* ── Hinteres Rad ── */}
      <circle cx="308" cy="172" r="30" fill="url(#tireGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <circle cx="308" cy="172" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
      <circle cx="308" cy="172" r="20" fill="url(#wheelGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {[0,36,72,108,144,180,216,252,288,324].map(deg => {
        const rad = (deg * Math.PI) / 180
        return <line key={deg}
          x1={308 + 8 * Math.cos(rad)} y1={172 + 8 * Math.sin(rad)}
          x2={308 + 18 * Math.cos(rad)} y2={172 + 18 * Math.sin(rad)}
          stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" strokeLinecap="round"
        />
      })}
      <circle cx="308" cy="172" r="8" fill="#0f0f11" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="308" cy="172" r="4" fill="#1a1a1c" />

      {/* ── Interaktive Hotspots ── */}
      {parts.map((p, i) => (
        <Hotspot
          key={p.id}
          cx={p.cx} cy={p.cy}
          color={p.color}
          selected={selectedId === p.id}
          onClick={() => onSelect(p.id)}
          index={i}
        />
      ))}
    </svg>
  )
}

/* ── Reifen Info-Panel ──────────────────────────────────── */
function TireInfoPanel() {
  return (
    <div style={{ margin: '0.85rem 0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <p style={{
        margin: '0 0 0.2rem', fontSize: '0.6rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#22c55e',
      }}>Reifen-Check im Detail</p>

      {/* ── 1. Profiltiefe ── */}
      <div style={{
        padding: '0.75rem 0.9rem', borderRadius: '0.75rem',
        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', color: '#22c55e', fontWeight: 900,
          }}>1</span>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)' }}>
            Profiltiefe — mind. <span style={{ color: '#22c55e' }}>1,6 mm</span>
          </p>
        </div>
        {/* TWI Diagramm */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.5rem 0.65rem', borderRadius: '0.6rem',
          background: 'rgba(0,0,0,0.25)', marginBottom: '0.45rem',
        }}>
          {/* Mini-SVG Reifenprofil */}
          <svg viewBox="0 0 60 50" width="60" height="50" style={{ flexShrink: 0 }}>
            {/* Reifen-Querschnitt */}
            <rect x="2" y="2" width="56" height="46" rx="4" fill="#1a1a1a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            {/* Profilrillen */}
            <rect x="8"  y="2" width="7" height="32" rx="1" fill="#2a2a2a" />
            <rect x="20" y="2" width="7" height="32" rx="1" fill="#2a2a2a" />
            <rect x="32" y="2" width="7" height="32" rx="1" fill="#2a2a2a" />
            <rect x="44" y="2" width="7" height="32" rx="1" fill="#2a2a2a" />
            {/* Lauffläche (oben) */}
            <rect x="2" y="34" width="56" height="10" rx="0" fill="#111" />
            {/* TWI-Indikator in einer Rille */}
            <rect x="20" y="26" width="7" height="6" rx="1" fill="#22c55e" opacity="0.9" />
            {/* Pfeil / TWI-Markierung am Rand */}
            <text x="3" y="22" fontSize="5" fill="#22c55e" fontWeight="900">TWI</text>
            {/* Maßpfeil */}
            <line x1="15" y1="2" x2="15" y2="34" stroke="rgba(34,197,94,0.6)" strokeWidth="0.75" strokeDasharray="2,2" />
            <text x="2" y="20" fontSize="4.5" fill="rgba(34,197,94,0.8)" transform="rotate(-90,8,20)">1,6mm</text>
          </svg>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)' }}>
              TWI — Verschleißanzeige nutzen
            </p>
            <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.55 }}>
              Am Reifenrand einen kleinen <strong style={{ color: '#22c55e' }}>Pfeil ▸ oder „TWI"</strong> suchen. Genau dort liegt im Profil ein 1,6 mm hoher Steg. Ragt der Steg über die Lauffläche hinaus → Reifen muss getauscht werden.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Luftdruck ── */}
      <div style={{
        padding: '0.75rem 0.9rem', borderRadius: '0.75rem',
        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', color: '#60a5fa', fontWeight: 900,
          }}>2</span>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)' }}>
            Luftdruck — laut Herstellerangabe
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            { icon: '📖', text: 'Betriebsanleitung des Fahrzeugs' },
            { icon: '🚪', text: 'Sticker an der Fahrertür (Türrahmen innen)' },
            { icon: '⛽', text: 'Sticker am Tankdeckel' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0.4rem 0.6rem', borderRadius: '0.5rem',
              background: 'rgba(59,130,246,0.05)',
            }}>
              <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Beschädigung ── */}
      <div style={{
        padding: '0.75rem 0.9rem', borderRadius: '0.75rem',
        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', color: '#f87171', fontWeight: 900,
          }}>3</span>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)' }}>
            Beschädigungen — Sichtprüfung
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: '🔩', label: 'Nägel', desc: 'Im Profil eingedrungen → sofort tauschen' },
            { icon: '🪟', label: 'Glasscherben', desc: 'Im Profil oder in der Flanke' },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, minWidth: '120px',
              padding: '0.5rem 0.65rem', borderRadius: '0.6rem',
              background: 'rgba(239,68,68,0.07)',
              display: 'flex', alignItems: 'flex-start', gap: '7px',
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#fca5a5' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Reifenart ── */}
      <div style={{
        padding: '0.75rem 0.9rem', borderRadius: '0.75rem',
        background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.22)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <span style={{
            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', color: '#fbbf24', fontWeight: 900,
          }}>4</span>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)' }}>
            Reifenart — Saison beachten
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Sommerreifen', icon: '☀️', desc: 'Kein Symbol am Reifen (Standard)', color: 'rgba(251,191,36,0.12)' },
            { label: 'Winterreifen', icon: '❄️', desc: '3PMSF-Symbol: Berg mit Schneeflocke', color: 'rgba(147,197,253,0.1)' },
            { label: 'Allwetter', icon: '🌦️', desc: 'Ebenfalls 3PMSF-Symbol, ganzjährig', color: 'rgba(34,197,94,0.08)' },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, minWidth: '100px',
              padding: '0.5rem 0.65rem', borderRadius: '0.6rem',
              background: item.color,
              display: 'flex', flexDirection: 'column', gap: '3px',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 800, color: 'var(--text)' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
        {/* 3PMSF Symbol Erklärung */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          marginTop: '0.55rem', padding: '0.5rem 0.7rem', borderRadius: '0.55rem',
          background: 'rgba(147,197,253,0.07)', border: '1px solid rgba(147,197,253,0.2)',
        }}>
          {/* Mini 3PMSF Symbol */}
          <svg viewBox="0 0 32 36" width="28" height="32" style={{ flexShrink: 0 }}>
            {/* Berg */}
            <polygon points="16,2 30,30 2,30" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
            {/* 3 Bergspitzen-Linien */}
            <line x1="8" y1="20" x2="16" y2="8" stroke="#93c5fd" strokeWidth="1.5" />
            <line x1="24" y1="20" x2="16" y2="8" stroke="#93c5fd" strokeWidth="1.5" />
            {/* Schneeflocke */}
            <text x="16" y="26" textAnchor="middle" fontSize="10" fill="#93c5fd" fontWeight="900">*</text>
          </svg>
          <div>
            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 800, color: '#93c5fd' }}>3PMSF-Symbol</p>
            <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-dim)', lineHeight: 1.45 }}>
              Steht für „Three Peak Mountain Snow Flake" — zertifiziert für Winterbetrieb. Am Reifen auf der Flanke eingestanzt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Tesla Innenraum SVG ────────────────────────────────── */
function TeslaInteriorSVG({
  parts, selectedId, onSelect,
}: {
  parts: CarPart[]; selectedId: string | null; onSelect: (id: string) => void
}) {
  const spokeAngles = [-40, 40]
  return (
    <svg viewBox="0 0 400 260" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="iSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0e1e2c" />
          <stop offset="65%" stopColor="#091420" />
          <stop offset="100%" stopColor="#060e16" />
        </linearGradient>
        <linearGradient id="iRoadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f120d" />
          <stop offset="100%" stopColor="#0a0c08" />
        </linearGradient>
        <linearGradient id="iDashGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1c1c20" />
          <stop offset="100%" stopColor="#0e0e10" />
        </linearGradient>
        <linearGradient id="iWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1c1006" />
          <stop offset="30%"  stopColor="#241508" />
          <stop offset="70%"  stopColor="#1e1108" />
          <stop offset="100%" stopColor="#1a0f06" />
        </linearGradient>
        <linearGradient id="iWheelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2c" />
          <stop offset="100%" stopColor="#161618" />
        </linearGradient>
        <linearGradient id="iSeatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1e" />
          <stop offset="100%" stopColor="#0e0e12" />
        </linearGradient>
        <radialGradient id="iScreenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.08)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </radialGradient>
        <filter id="iGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="iWheelClip">
          <rect x="54" y="130" width="108" height="96" />
        </clipPath>
      </defs>

      {/* ── Haupthintergrund ── */}
      <rect x="0" y="0" width="400" height="260" fill="#090909" />

      {/* ── Türverkleidungen ── */}
      <rect x="0"   y="0" width="24" height="260" fill="#111114" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <rect x="376" y="0" width="24" height="260" fill="#111114" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      {/* Türtafeln Rahmen */}
      <rect x="2"   y="130" width="18" height="80" rx="4" fill="#161618" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <rect x="380" y="130" width="18" height="80" rx="4" fill="#161618" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Lautsprecher links (Tesla-typisch in der Tür) */}
      {[145,150,155,160,165,170].map(y => (
        <line key={y} x1="5" y1={y} x2="19" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
      ))}
      {[145,150,155,160,165,170].map(y => (
        <line key={y} x1="381" y1={y} x2="395" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
      ))}
      {/* Türöffner-Taste */}
      <rect x="3"  y="186" width="16" height="5" rx="2.5" fill="#1a1a1c" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <rect x="381" y="186" width="16" height="5" rx="2.5" fill="#1a1a1c" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

      {/* ── Windschutzscheibe ── */}
      <path d="M 24 2 L 376 2 L 360 78 L 40 78 Z" fill="url(#iSkyGrad)" />
      {/* Straße am unteren Rand */}
      <path d="M 40 78 L 360 78 L 346 66 L 200 60 L 54 66 Z" fill="url(#iRoadGrad)" />
      {/* Straßenmarkierung */}
      <line x1="200" y1="78" x2="200" y2="61" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeDasharray="5,4" />
      <line x1="200" y1="78" x2="200" y2="61" stroke="rgba(255,255,255,0.1)"  strokeWidth="6" strokeDasharray="5,4" />
      {/* Horizont (Bäume/Häuser Silhouette) */}
      <path d="M 40 68 Q 80 64 100 67 Q 120 64 130 67 Q 160 60 200 60 Q 240 60 270 67 Q 280 64 300 67 Q 320 64 360 68"
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />
      {/* Himmel-Gradient-Schicht */}
      <path d="M 24 2 L 376 2 L 360 50 L 40 50 Z"
        fill="rgba(14,30,50,0.3)" />

      {/* ── A-Säulen ── */}
      <path d="M 0 2 L 24 2 L 40 78 L 0 78 Z" fill="#0c0c0e" />
      <path d="M 400 2 L 376 2 L 360 78 L 400 78 Z" fill="#0c0c0e" />
      {/* A-Säulen Außenkante */}
      <line x1="24" y1="2" x2="40" y2="78" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
      <line x1="376" y1="2" x2="360" y2="78" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />

      {/* ── Sonnenblenden ── */}
      <rect x="24" y="2" width="62" height="14" rx="2" fill="#161618" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      <rect x="314" y="2" width="62" height="14" rx="2" fill="#161618" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      <line x1="26" y1="9" x2="84" y2="9" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      <line x1="316" y1="9" x2="374" y2="9" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

      {/* ── Deckenkonsole (Warnblinker + Innenlicht) ── */}
      <rect x="142" y="1.5" width="116" height="13" rx="3"
        fill="#161618" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Warnblinker-Taste (rotes Dreieck) */}
      <rect x="146" y="2.5" width="22" height="9" rx="2"
        fill="#160000" stroke="rgba(220,38,38,0.6)" strokeWidth="0.8" />
      <polygon points="157,4 151.5,10.5 162.5,10.5" fill="rgba(220,38,38,0.5)" />
      <polygon points="157,4 151.5,10.5 162.5,10.5" fill="none"
        stroke="rgba(220,38,38,0.3)" strokeWidth="0.5" />
      {/* Innenlicht */}
      <rect x="180" y="3.5" width="46" height="7" rx="2" fill="rgba(255,255,255,0.04)" />
      {[184,188,192,196,200,204,208,212,216,220].map(x => (
        <line key={x} x1={x} y1="3.5" x2={x} y2="10.5"
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {/* Trenn-Taste rechts (Fahrzeugkamera o.ä.) */}
      <rect x="234" y="2.5" width="20" height="9" rx="2"
        fill="#0a0a0c" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
      <circle cx="244" cy="7" r="2.5" fill="rgba(255,255,255,0.08)" />

      {/* ── Innenspiegel (rahmenlos, Tesla-typisch) ── */}
      {/* Stiel */}
      <rect x="197" y="28" width="6" height="10" rx="2" fill="#161618" />
      {/* Spiegel-Gehäuse */}
      <rect x="172" y="2" width="56" height="29" rx="4" fill="#06101c" stroke="rgba(147,197,253,0.25)" strokeWidth="1" />
      {/* Spiegelfläche */}
      <rect x="174" y="4" width="52" height="25" rx="3" fill="#08182a" />
      {/* Reflexion */}
      <path d="M 174 4 L 226 4 L 222 12 L 178 12 Z" fill="rgba(255,255,255,0.045)" />
      <path d="M 178 16 L 222 16 L 221 22 L 179 22 Z" fill="rgba(255,255,255,0.02)" />
      {/* Rückspiegel-Rahmen-Highlight */}
      <rect x="172" y="2" width="56" height="2" rx="1" fill="rgba(255,255,255,0.07)" />

      {/* ── Armaturenbrett Hauptkörper ── */}
      <path d="M 0 78 L 400 78 L 400 210 L 0 210 Z" fill="url(#iDashGrad)" />
      {/* Oberkante / Cowl-Wölbung */}
      <path d="M 0 78 Q 200 74 400 78 L 400 88 Q 200 84 0 88 Z" fill="#202024" />

      {/* ── Horizontaler Zierstreifen (Tesla Model 3 – geht über gesamte Breite) ── */}
      <rect x="0" y="88" width="400" height="13" fill="url(#iWoodGrad)" />
      {/* Holzmaserung */}
      {[89,91,93,95,97].map(y => (
        <path key={y} d={`M 0 ${y} Q 133 ${y + 0.4} 266 ${y - 0.3} Q 333 ${y + 0.2} 400 ${y}`}
          fill="none" stroke="rgba(255,220,150,0.025)" strokeWidth="0.5" />
      ))}
      {/* Zierstreifen Highlight oben */}
      <line x1="0" y1="88" x2="400" y2="88" stroke="rgba(255,255,255,0.14)" strokeWidth="0.75" />
      {/* Zierstreifen Schatten unten */}
      <line x1="0" y1="101" x2="400" y2="101" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />

      {/* ── Lüftungsdüsen (versteckter Schlitz – Tesla-typisch) ── */}
      <rect x="0" y="101" width="400" height="7" fill="#0a0a0c" />
      {[102,103.5,105,106.5].map(y => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
      ))}
      {/* Ausströmöffnungen */}
      {[20, 75, 145, 220, 270, 330, 375].map(x => (
        <rect key={x} x={x - 18} y="102" width="36" height="4" rx="2" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
      ))}

      {/* ── ZENTRALDISPLAY (15,4" Landscape ─ Hero-Element) ── */}
      {/* Ambient Glow um den Bildschirm */}
      <rect x="190" y="105" width="196" height="130" rx="12"
        fill="url(#iScreenGlow)" />
      {/* Gehäuse / Bezel */}
      <rect x="193" y="108" width="190" height="126" rx="8"
        fill="#000" stroke="rgba(56,189,248,0.18)" strokeWidth="1.5" />
      {/* Bezel Highlight oben */}
      <rect x="193" y="108" width="190" height="2" rx="0"
        fill="rgba(255,255,255,0.06)" />

      {/* ─── Bildschirminhalt ─── */}
      {/* Statusleiste */}
      <rect x="194" y="109" width="188" height="14" rx="0" fill="#050505" />
      <text x="203" y="119" fontSize="7.5" fill="rgba(255,255,255,0.55)" fontFamily="Arial, sans-serif">11:42</text>
      <text x="200" y="119" fontSize="6.5" fill="rgba(56,189,248,0.5)"  fontFamily="Arial, sans-serif" textAnchor="middle">●</text>
      {/* Akku + Reichweite rechts */}
      <text x="374" y="119" textAnchor="end" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Arial, sans-serif">⚡ 87 %</text>

      {/* Linkes Panel: Geschwindigkeit + Gang */}
      <rect x="194" y="123" width="82" height="110" fill="#060606" />
      {/* Geschwindigkeit */}
      <text x="235" y="166" textAnchor="middle" fontSize="48" fontWeight="900" fill="white" fontFamily="Arial, sans-serif">0</text>
      <text x="235" y="177" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.38)" fontFamily="Arial, sans-serif">km/h</text>
      {/* PRND Wahlhebel */}
      <text x="205" y="196" fontSize="9" fill="rgba(255,255,255,0.28)" fontFamily="Arial, sans-serif">R</text>
      <text x="219" y="196" fontSize="9" fill="rgba(255,255,255,0.28)" fontFamily="Arial, sans-serif">N</text>
      {/* P aktiv hervorgehoben */}
      <rect x="228" y="188" width="14" height="11" rx="3"
        fill="rgba(56,189,248,0.22)" stroke="rgba(56,189,248,0.65)" strokeWidth="0.75" />
      <text x="235" y="197" textAnchor="middle" fontSize="9" fontWeight="900" fill="#38bdf8" fontFamily="Arial, sans-serif">P</text>
      <text x="250" y="196" fontSize="9" fill="rgba(255,255,255,0.28)" fontFamily="Arial, sans-serif">D</text>
      {/* Reichweite */}
      <text x="235" y="214" textAnchor="middle" fontSize="8" fill="rgba(56,189,248,0.65)" fontFamily="Arial, sans-serif">487 km</text>
      {/* Karte Trennlinie */}
      <line x1="276" y1="123" x2="276" y2="233" stroke="rgba(255,255,255,0.04)" strokeWidth="0.75" />

      {/* Rechtes Panel: Karte */}
      <rect x="276" y="123" width="106" height="110" fill="#0b1408" />
      {/* Straßen */}
      <line x1="328" y1="123" x2="328" y2="233" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
      <line x1="276" y1="178" x2="382" y2="178" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
      <path d="M 276 148 L 305 148 L 318 163 L 318 233" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
      <path d="M 348 123 L 348 150 L 362 165 L 382 165" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />
      {/* Gebäudeblöcke */}
      {[
        {x:278,y:126,w:22,h:16},{x:304,y:126,w:14,h:11},
        {x:336,y:126,w:18,h:14},{x:356,y:126,w:22,h:20},
        {x:278,y:184,w:18,h:14},{x:336,y:184,w:20,h:18},
        {x:358,y:184,w:20,h:24},
      ].map((b,i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="1" fill="#132008" />
      ))}
      {/* Standort-Dot */}
      <circle cx="328" cy="178" r="5" fill="#38bdf8" />
      <circle cx="328" cy="178" r="9" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1.2" />
      <circle cx="328" cy="178" r="14" fill="none" stroke="rgba(56,189,248,0.15)" strokeWidth="0.75" />
      {/* Richtungspfeil auf Karte */}
      <path d="M 325 170 L 328 163 L 331 170 L 328 168 Z" fill="#38bdf8" />

      {/* Untere Kontrollleiste */}
      <rect x="194" y="233" width="188" height="0" rx="0" fill="#040404" />
      <line x1="194" y1="233" x2="382" y2="233" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

      {/* Screen Spiegelung (Glasreflex) */}
      <path d="M 193 108 L 382 108 L 378 116 L 197 116 Z"
        fill="rgba(255,255,255,0.025)" />

      {/* ── LENKRAD (flacher Boden, Tesla-Design) ── */}
      {/* Geclippte Gruppe für flachen Boden */}
      <g clipPath="url(#iWheelClip)">
        {/* Außenring */}
        <circle cx="108" cy="196" r="52" fill="none" stroke="url(#iWheelGrad)" strokeWidth="12" />
        <circle cx="108" cy="196" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <circle cx="108" cy="196" r="46" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        {/* Speichen */}
        {spokeAngles.map(deg => {
          const rad = (deg * Math.PI) / 180
          return (
            <line key={deg}
              x1={108 + 18 * Math.cos(rad)} y1={196 + 18 * Math.sin(rad)}
              x2={108 + 50 * Math.cos(rad)} y2={196 + 50 * Math.sin(rad)}
              stroke="#1e1e20" strokeWidth="13" strokeLinecap="round"
            />
          )
        })}
        {spokeAngles.map(deg => {
          const rad = (deg * Math.PI) / 180
          return (
            <line key={deg}
              x1={108 + 18 * Math.cos(rad)} y1={196 + 18 * Math.sin(rad)}
              x2={108 + 50 * Math.cos(rad)} y2={196 + 50 * Math.sin(rad)}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeLinecap="round"
            />
          )
        })}
      </g>
      {/* Mittelnabe / Airbag */}
      <ellipse cx="108" cy="194" rx="20" ry="17"
        fill="#161618" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      {/* Tesla T-Logo im Lenkrad */}
      <rect x="100" y="189" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
      <rect x="106.5" y="189" width="3" height="10" rx="1" fill="rgba(255,255,255,0.3)" />
      {/* Hupen-Ring */}
      <ellipse cx="108" cy="194" rx="20" ry="17" fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Scroll-Wheels (Bedienräder am Lenkrad) */}
      <rect x="56" y="188" width="9" height="16" rx="3.5"
        fill="#1e1e22" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />
      <rect x="57.5" y="190" width="6" height="12" rx="2.5" fill="#161618" />
      <rect x="155" y="188" width="9" height="16" rx="3.5"
        fill="#1e1e22" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />
      <rect x="156.5" y="190" width="6" height="12" rx="2.5" fill="#161618" />
      {/* Scheibenwischer-Hebel (links) */}
      <path d="M 60 210 L 86 202 L 90 209 L 64 217 Z"
        fill="#181818" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Knopf am Ende des Scheibenwischer-Hebels */}
      <circle cx="63" cy="213" r="4" fill="#1e1e22" stroke="rgba(56,189,248,0.2)" strokeWidth="0.75" />
      {/* Rechter Blinker/Fernlicht-Hebel */}
      <path d="M 126 204 L 158 200 L 160 207 L 128 211 Z"
        fill="#181818" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Fernlicht-Symbol am Hebelende */}
      <circle cx="159" cy="203.5" r="4" fill="#1e1e22" stroke="rgba(147,197,253,0.25)" strokeWidth="0.75" />
      <line x1="156" y1="200.5" x2="162" y2="200.5" stroke="rgba(147,197,253,0.3)" strokeWidth="0.75" />
      <line x1="155" y1="202.5" x2="162" y2="202.5" stroke="rgba(147,197,253,0.3)" strokeWidth="0.75" />
      <line x1="155" y1="204.5" x2="162" y2="204.5" stroke="rgba(147,197,253,0.3)" strokeWidth="0.75" />
      {/* Lenksäule */}
      <rect x="100" y="244" width="16" height="16" rx="4"
        fill="#141416" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      <rect x="88"  y="256" width="40" height="4" rx="2"
        fill="#111114" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

      {/* ── Sicherheitsgurt (linke Seite) ── */}
      {/* Gurt-Aufroller (oberer Anker) */}
      <rect x="0" y="124" width="12" height="22" rx="3"
        fill="#182014" stroke="rgba(34,197,94,0.3)" strokeWidth="0.75" />
      <rect x="1" y="126" width="10" height="18" rx="2" fill="#0e1a0e" />
      {/* Gurtband diagonaler Verlauf */}
      <path d="M 6 145 L 6 146 Q 8 158 14 166 L 42 208"
        fill="none" stroke="#1a4022" strokeWidth="8" strokeLinecap="round" />
      <path d="M 6 145 L 6 146 Q 8 158 14 166 L 42 208"
        fill="none" stroke="rgba(34,197,94,0.35)" strokeWidth="1" strokeLinecap="round" />
      {/* Schloss / Steckzunge */}
      <rect x="36" y="206" width="10" height="6" rx="2"
        fill="#152012" stroke="rgba(34,197,94,0.4)" strokeWidth="0.75" />

      {/* ── Mittelkonsole ── */}
      <rect x="156" y="208" width="88" height="52" rx="6"
        fill="#141416" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {/* Wireless Charging Pad */}
      <rect x="160" y="212" width="80" height="30" rx="4"
        fill="#0c0c0e" stroke="rgba(255,255,255,0.07)" strokeWidth="0.75" />
      <circle cx="200" cy="227" r="10" fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth="1.5" />
      <circle cx="200" cy="227" r="6"  fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="1" />
      <text x="200" y="230" textAnchor="middle" fontSize="8" fill="rgba(56,189,248,0.22)" fontFamily="Arial">⚡</text>
      {/* Getränkehalter */}
      <circle cx="173" cy="248" r="9" fill="#090909" stroke="rgba(255,255,255,0.07)" strokeWidth="0.75" />
      <circle cx="227" cy="248" r="9" fill="#090909" stroke="rgba(255,255,255,0.07)" strokeWidth="0.75" />
      <circle cx="173" cy="248" r="5" fill="#060606" />
      <circle cx="227" cy="248" r="5" fill="#060606" />

      {/* ── Fahrersitz (Andeutung unten links) ── */}
      <path d="M 0 222 Q 40 216 88 220 L 90 260 L 0 260 Z"
        fill="url(#iSeatGrad)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      {/* Sitznaht */}
      <path d="M 4 234 Q 46 228 84 232" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
      <path d="M 4 244 Q 46 238 84 242" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

      {/* ── Beifahrersitz ── */}
      <path d="M 400 222 Q 360 216 312 220 L 310 260 L 400 260 Z"
        fill="url(#iSeatGrad)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <path d="M 396 234 Q 354 228 316 232" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />

      {/* ── Bremspedal (unterhalb Lenksäule) ── */}
      <rect x="52" y="233" width="62" height="20" rx="4"
        fill="#0c0c0e" stroke="rgba(248,113,113,0.28)" strokeWidth="1" />
      <rect x="54" y="235" width="58" height="16" rx="3" fill="#0a0a0c" />
      {/* Riffelstruktur */}
      {[57,62,67,72,77,82,87,92,97,102,107].map(x => (
        <line key={x} x1={x} y1="236" x2={x} y2="250"
          stroke="rgba(255,255,255,0.055)" strokeWidth="1.2" />
      ))}
      <text x="83" y="247" textAnchor="middle" fontSize="4.5" letterSpacing="1.5"
        fill="rgba(248,113,113,0.35)" fontFamily="Arial" fontWeight="700">BRAKE</text>
      {/* Gaspedal daneben */}
      <rect x="120" y="236" width="36" height="17" rx="3.5"
        fill="#0c0c0e" stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />
      <rect x="122" y="238" width="32" height="13" rx="2.5" fill="#0a0a0c" />
      {[124,129,134,139,144].map(x => (
        <line key={x} x1={x} y1="239" x2={x} y2="250"
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <text x="138" y="248" textAnchor="middle" fontSize="4.5" letterSpacing="1"
        fill="rgba(255,255,255,0.12)" fontFamily="Arial" fontWeight="700">GAS</text>

      {/* ── Interaktive Hotspots ── */}
      {parts.map((p, i) => (
        <Hotspot
          key={p.id}
          cx={p.cx} cy={p.cy}
          color={p.color}
          selected={selectedId === p.id}
          onClick={() => onSelect(p.id)}
          index={i}
        />
      ))}
    </svg>
  )
}

/* ── SUPA Eselsbrücke Panel ─────────────────────────────── */
function SupaPanel() {
  const items = [
    { letter: 'S', word: 'Stau',        icon: '🚗', color: '#ef4444', desc: 'Stau voraus — andere Fahrer frühzeitig warnen, damit sie rechtzeitig bremsen' },
    { letter: 'U', word: 'Unfall',       icon: '💥', color: '#f97316', desc: 'Unfall — Unfallstelle absichern und nachfolgende Fahrzeuge warnen' },
    { letter: 'P', word: 'Panne',        icon: '🔧', color: '#fbbf24', desc: 'Panne — liegengebliebenes Fahrzeug für andere sichtbar machen' },
    { letter: 'A', word: 'Abschleppen',  icon: '🚛', color: '#a78bfa', desc: 'Abschleppvorgang — ungewöhnlich langsame Fahrt auf der Fahrbahn' },
  ]
  return (
    <div style={{ margin: '0.85rem 0 0.5rem' }}>
      <p style={{
        margin: '0 0 0.55rem', fontSize: '0.6rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#dc2626',
      }}>Wann Warnblinker? — Eselsbrücke SUPA</p>

      {/* SUPA Buchstaben-Übersicht */}
      <div style={{
        display: 'flex', gap: '0.4rem', marginBottom: '0.55rem', justifyContent: 'center',
      }}>
        {items.map(item => (
          <div key={item.letter} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0.5rem 0.3rem', borderRadius: '0.65rem',
            background: `${item.color}12`, border: `1px solid ${item.color}40`,
          }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: `${item.color}22`, border: `1.5px solid ${item.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 900, color: item.color,
              fontFamily: 'Arial', marginBottom: '4px',
            }}>{item.letter}</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text)' }}>{item.word}</span>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
          </div>
        ))}
      </div>

      {/* Detail-Karten */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {items.map(item => (
          <div key={item.letter} style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.6rem',
            background: `${item.color}08`, border: `1px solid ${item.color}28`,
          }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
              background: `${item.color}20`, border: `1.5px solid ${item.color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 900, color: item.color, fontFamily: 'Arial',
            }}>{item.letter}</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text)', marginRight: '6px' }}>
                {item.icon} {item.word}
              </span>
              <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Hauptkomponente ────────────────────────────────────── */
export default function TeslaInspect() {
  const [activeView, setActiveView] = useState<ViewName>('Heck')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const parts = VIEW_PARTS[activeView]
  const selected = parts.find(p => p.id === selectedId) ?? null

  function togglePart(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  return (
    <div style={{ marginTop: '1.25rem' }}>

      {/* ── Abschnittstitel ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '0.9rem',
        padding: '0.75rem 1rem',
        background: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '0.85rem',
      }}>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔍</span>
        <div>
          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)' }}>
            Interaktiver Fahrzeug-Check
          </p>
          <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Tippe auf die nummerierten Punkte für Prüfungshinweise
          </p>
        </div>
      </div>

      {/* ── Ansicht-Tabs ── */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {VIEWS.map(v => {
          const hasContent = VIEW_PARTS[v].length > 0
          const active = v === activeView
          return (
            <button
              key={v}
              onClick={() => { setActiveView(v); setSelectedId(null) }}
              disabled={!hasContent}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem',
                fontWeight: 700, cursor: hasContent ? 'pointer' : 'default',
                background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? '#60a5fa' : hasContent ? 'var(--text-muted)' : 'var(--text-dim)',
                opacity: hasContent ? 1 : 0.45,
                transition: 'all 0.15s',
              }}
            >
              {v}
              {!hasContent && (
                <span style={{ fontSize: '0.52rem', marginLeft: '4px', opacity: 0.6 }}>bald</span>
              )}
              {hasContent && (
                <span style={{
                  marginLeft: '5px', fontSize: '0.55rem', fontWeight: 800,
                  background: active ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                  padding: '1px 5px', borderRadius: '100px',
                  color: active ? '#93c5fd' : 'var(--text-dim)',
                }}>
                  {VIEW_PARTS[v].length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── SVG-Diagramm ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #0c0c14 0%, #070709 100%)',
        border: `1px solid ${selectedId ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.2)'}`,
        borderRadius: '1.1rem',
        overflow: 'hidden',
        padding: '1.25rem 1.25rem 0.75rem',
        transition: 'border-color 0.3s',
      }}>

        {/* Ansicht-Label oben rechts */}
        <div style={{
          position: 'absolute', top: '10px', right: '12px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{
            fontSize: '0.55rem', fontWeight: 700, color: 'rgba(59,130,246,0.7)',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            padding: '2px 8px', borderRadius: '100px',
          }}>
            Ansicht: {activeView}
          </span>
        </div>

        {/* Hinweistext unten links */}
        <div style={{
          position: 'absolute', bottom: '8px', left: '12px',
          fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            border: '1.5px solid rgba(239,68,68,0.6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '5px', color: '#ef4444',
          }}>!</span>
          {parts.length} Prüfungspunkt{parts.length !== 1 ? 'e' : ''}
        </div>

        {activeView === 'Heck' && (
          <TeslaRearSVG
            parts={parts}
            selectedId={selectedId}
            onSelect={togglePart}
          />
        )}

        {activeView === 'Front' && (
          <TeslaFrontSVG
            parts={parts}
            selectedId={selectedId}
            onSelect={togglePart}
          />
        )}

        {activeView === 'Seite' && (
          <TeslaSideSVG
            parts={parts}
            selectedId={selectedId}
            onSelect={togglePart}
          />
        )}

        {activeView === 'Innenraum' && (
          <TeslaInteriorSVG
            parts={parts}
            selectedId={selectedId}
            onSelect={togglePart}
          />
        )}

        {activeView !== 'Heck' && activeView !== 'Front' && activeView !== 'Seite' && activeView !== 'Innenraum' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '180px', flexDirection: 'column', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '2rem', opacity: 0.3 }}>🚗</span>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Diese Ansicht wird bald hinzugefügt.
            </p>
          </div>
        )}
      </div>

      {/* ── Info-Panel ── */}
      {selected && (
        <div style={{
          marginTop: '0.75rem',
          background: `linear-gradient(135deg, ${selected.color}12 0%, rgba(8,8,10,0.95) 100%)`,
          border: `1px solid ${selected.color}55`,
          borderRadius: '1rem',
          padding: '1rem 1.1rem',
          animation: 'fadeUp 0.2s ease both',
        }}>

          {/* Titel-Zeile */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '0.5rem',
            marginBottom: '0.9rem',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  background: selected.color, fontSize: '0.6rem', fontWeight: 900,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {parts.findIndex(p => p.id === selected.id) + 1}
                </span>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>
                  {selected.title}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '0.63rem', color: 'var(--text-dim)', marginLeft: '26px' }}>
                {selected.subtitle}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
              {selected.law && (
                <span style={{
                  fontSize: '0.55rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '6px',
                  background: `${selected.color}18`,
                  border: `1px solid ${selected.color}45`,
                  color: selected.color,
                }}>
                  {selected.law}
                </span>
              )}
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)',
                  fontSize: '0.7rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
          </div>

          {/* Prüfungsanforderungen */}
          <p style={{
            margin: '0 0 0.5rem',
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-dim)',
          }}>
            Prüfungsanforderungen
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
            {selected.checks.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.55rem 0.8rem', borderRadius: '0.65rem',
                background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)',
              }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', color: '#22c55e', fontWeight: 900,
                }}>✓</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          {/* TÜV-Plaketten-Diagram */}
          {selected.sticker && <TuvStickerDiagram />}

          {/* Reifen-Infopanel */}
          {selected.tire && <TireInfoPanel />}

          {/* Scheibenwischwasser-Panel */}
          {selected.washer && <WasherFluidPanel />}

          {/* SUPA-Eselsbrücke */}
          {selected.supa && <SupaPanel />}

          {/* Erklärungstext */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
            padding: '0.65rem 0.8rem', borderRadius: '0.65rem',
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)',
            marginBottom: selected.tip ? '0.5rem' : 0,
          }}>
            <span style={{ fontSize: '0.82rem', flexShrink: 0, marginTop: '1px' }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              {selected.info}
            </p>
          </div>

          {/* Alleine prüfen – Tipp */}
          {selected.tip && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
              padding: '0.65rem 0.8rem', borderRadius: '0.65rem',
              background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.22)',
            }}>
              <span style={{ fontSize: '0.82rem', flexShrink: 0, marginTop: '1px' }}>💡</span>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fbbf24' }}>
                  Alleine prüfen
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {selected.tip}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
