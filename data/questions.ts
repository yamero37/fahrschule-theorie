import type { Question } from '@/types'

export const questions: Question[] = [
  // ─── Vorfahrt ──────────────────────────────────────────────────────────────
  {
    id: 'V01',
    topic: 'Vorfahrt',
    points: 4,
    question: 'Wer hat Vorfahrt an einer Kreuzung ohne Zeichen?',
    answers: [
      { id: 'a', text: 'Der von rechts kommende Verkehr', correct: true },
      { id: 'b', text: 'Der von links kommende Verkehr', correct: false },
      { id: 'c', text: 'Der geradeaus fahrende Verkehr', correct: false },
    ],
  },
  {
    id: 'V02',
    topic: 'Vorfahrt',
    points: 4,
    question: 'Was bedeutet das Zeichen „Vorfahrt gewähren" (Dreieck mit Spitze nach unten)?',
    answers: [
      { id: 'a', text: 'Ich muss dem kreuzenden Verkehr Vorfahrt gewähren', correct: true },
      { id: 'b', text: 'Ich habe Vorfahrt vor dem kreuzenden Verkehr', correct: false },
      { id: 'c', text: 'Ich muss anhalten, bis die Straße frei ist', correct: false },
    ],
  },
  {
    id: 'V03',
    topic: 'Vorfahrt',
    points: 4,
    question: 'Das Zeichen „Stoppschild" (rotes Achteck mit STOP) verpflichtet mich zu…',
    answers: [
      { id: 'a', text: 'Anhalten und Vorfahrt gewähren', correct: true },
      { id: 'b', text: 'Langsam fahren und Vorfahrt gewähren', correct: false },
      { id: 'c', text: 'Einfahrt verboten', correct: false },
    ],
  },
  {
    id: 'V04',
    topic: 'Vorfahrt',
    points: 4,
    question: 'Gilt die Regel „rechts vor links" auch für Fahrzeuge auf Radwegen?',
    answers: [
      { id: 'a', text: 'Ja, auch Radfahrer auf dem Radweg haben Vorfahrt von rechts', correct: true },
      { id: 'b', text: 'Nein, Radfahrer haben grundsätzlich keine Vorfahrt', correct: false },
      { id: 'c', text: 'Nur wenn der Radweg mit einem Zeichen ausgewiesen ist', correct: false },
    ],
  },
  {
    id: 'V05',
    topic: 'Vorfahrt',
    points: 3,
    question: 'Was müssen Sie tun, wenn Sie an einer Einmündung einbiegen wollen und das Schild „Vorfahrtstraße" auf der Hauptstraße steht?',
    answers: [
      { id: 'a', text: 'Dem Verkehr auf der Vorfahrtstraße Vorfahrt gewähren', correct: true },
      { id: 'b', text: 'Ich habe Vorfahrt, weil ich von rechts komme', correct: false },
      { id: 'c', text: 'Ich darf nur fahren, wenn die Straße frei ist', correct: false },
    ],
  },
  {
    id: 'V06',
    topic: 'Vorfahrt',
    points: 4,
    question: 'An einer Kreuzung mit Ampel: Die Ampel zeigt grün, aber ein Einsatzfahrzeug mit Blaulicht nähert sich. Was tun Sie?',
    answers: [
      { id: 'a', text: 'Sofort freie Bahn für das Einsatzfahrzeug schaffen, auch bei grün', correct: true },
      { id: 'b', text: 'Weiterfahren, da ich grün habe', correct: false },
      { id: 'c', text: 'Anhalten und warten, bis das Einsatzfahrzeug vorbei ist, dann weiterfahren', correct: false },
    ],
  },

  // ─── Verkehrszeichen ────────────────────────────────────────────────────────
  {
    id: 'Z01',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Was bedeutet ein rundes Zeichen mit rotem Rand und weißem Querbalken?',
    answers: [
      { id: 'a', text: 'Einfahrt verboten (Durchfahrt nicht gestattet)', correct: true },
      { id: 'b', text: 'Halten verboten', correct: false },
      { id: 'c', text: 'Überholverbot', correct: false },
    ],
  },
  {
    id: 'Z02',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Welche Farbe haben Gefahrzeichen (Warnschilder)?',
    answers: [
      { id: 'a', text: 'Gelbes Dreieck mit rotem Rand', correct: true },
      { id: 'b', text: 'Rotes Dreieck mit weißem Hintergrund', correct: false },
      { id: 'c', text: 'Blaues Dreieck', correct: false },
    ],
  },
  {
    id: 'Z03',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Was bedeutet ein blaues rundes Schild mit weißem Pfeil?',
    answers: [
      { id: 'a', text: 'Fahrtrichtung in die gezeigte Richtung vorgeschrieben', correct: true },
      { id: 'b', text: 'Empfohlene Fahrtrichtung', correct: false },
      { id: 'c', text: 'Einbahnstraße', correct: false },
    ],
  },
  {
    id: 'Z04',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Was bedeutet das Zeichen „Tempo 30-Zone"?',
    answers: [
      { id: 'a', text: 'Innerhalb der Zone gilt Tempo 30, Vorfahrt gilt rechts vor links', correct: true },
      { id: 'b', text: 'Empfehlung, nicht schneller als 30 km/h zu fahren', correct: false },
      { id: 'c', text: 'Höchstgeschwindigkeit 30 km/h nur für LKW', correct: false },
    ],
  },
  {
    id: 'Z05',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Ein Schild zeigt eine rote Kreuzung auf gelbem Hintergrund mit roten Balken. Was bedeutet es?',
    answers: [
      { id: 'a', text: 'Bahnübergang ohne Schranken – besondere Vorsicht geboten', correct: true },
      { id: 'b', text: 'Kreuzung mit Vorfahrtstraße', correct: false },
      { id: 'c', text: 'Autobahn-Einfahrt', correct: false },
    ],
  },
  {
    id: 'Z06',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Was zeigt ein blaues Rechteck mit weißem „P"?',
    answers: [
      { id: 'a', text: 'Parkplatz', correct: true },
      { id: 'b', text: 'Polizei-Station', correct: false },
      { id: 'c', text: 'Halteplatz für Busse', correct: false },
    ],
  },
  {
    id: 'Z07',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Das gelbe Schild mit schwarzem Diamant (Raute) bedeutet:',
    answers: [
      { id: 'a', text: 'Ich befinde mich auf einer Vorfahrtstraße', correct: true },
      { id: 'b', text: 'Ich muss Vorfahrt gewähren', correct: false },
      { id: 'c', text: 'Kreuzung ohne Vorfahrtsregelung voraus', correct: false },
    ],
  },

  // ─── Geschwindigkeit ────────────────────────────────────────────────────────
  {
    id: 'G01',
    topic: 'Geschwindigkeit',
    points: 4,
    question: 'Welche Höchstgeschwindigkeit gilt innerorts, wenn kein Zeichen aufgestellt ist?',
    answers: [
      { id: 'a', text: '50 km/h', correct: true },
      { id: 'b', text: '60 km/h', correct: false },
      { id: 'c', text: '30 km/h', correct: false },
    ],
  },
  {
    id: 'G02',
    topic: 'Geschwindigkeit',
    points: 4,
    question: 'Welche Höchstgeschwindigkeit gilt außerorts (Landstraße) für PKW?',
    answers: [
      { id: 'a', text: '100 km/h', correct: true },
      { id: 'b', text: '80 km/h', correct: false },
      { id: 'c', text: '120 km/h', correct: false },
    ],
  },
  {
    id: 'G03',
    topic: 'Geschwindigkeit',
    points: 4,
    question: 'Auf der Autobahn gilt für PKW ohne besondere Beschilderung…',
    answers: [
      { id: 'a', text: 'Keine allgemeine Höchstgeschwindigkeit, Richtgeschwindigkeit 130 km/h', correct: true },
      { id: 'b', text: 'Maximal 130 km/h', correct: false },
      { id: 'c', text: 'Maximal 150 km/h', correct: false },
    ],
  },
  {
    id: 'G04',
    topic: 'Geschwindigkeit',
    points: 4,
    question: 'Sie fahren in einer geschlossenen Ortschaft. Wann müssen Sie Ihre Geschwindigkeit verringern?',
    answers: [
      { id: 'a', text: 'Wenn die Sicht durch Nebel, Regen oder Dunkelheit eingeschränkt ist', correct: true },
      { id: 'b', text: 'Nur wenn ein Tempo-30-Schild aufgestellt ist', correct: false },
      { id: 'c', text: 'Niemals, 50 km/h darf immer gefahren werden', correct: false },
    ],
  },
  {
    id: 'G05',
    topic: 'Geschwindigkeit',
    points: 3,
    question: 'Mit welcher Höchstgeschwindigkeit darf ein PKW mit Anhänger auf der Autobahn fahren?',
    answers: [
      { id: 'a', text: '80 km/h', correct: true },
      { id: 'b', text: '100 km/h', correct: false },
      { id: 'c', text: '120 km/h', correct: false },
    ],
  },
  {
    id: 'G06',
    topic: 'Geschwindigkeit',
    points: 4,
    question: 'Was verstehen Sie unter „angepasster Geschwindigkeit"?',
    answers: [
      { id: 'a', text: 'Geschwindigkeit, die der Straßen-, Verkehrs-, Sicht- und Wetterlage entspricht', correct: true },
      { id: 'b', text: 'Die erlaubte Höchstgeschwindigkeit immer ausfahren', correct: false },
      { id: 'c', text: 'Geschwindigkeit, die dem Verkehrsfluss entspricht', correct: false },
    ],
  },

  // ─── Abstand ────────────────────────────────────────────────────────────────
  {
    id: 'A01',
    topic: 'Abstand',
    points: 4,
    question: 'Welcher Mindestabstand zum vorausfahrenden Fahrzeug ist bei 100 km/h einzuhalten?',
    answers: [
      { id: 'a', text: 'Mindestens 50 m (halber Tacho in Metern)', correct: true },
      { id: 'b', text: 'Mindestens 100 m', correct: false },
      { id: 'c', text: 'Mindestens 30 m', correct: false },
    ],
  },
  {
    id: 'A02',
    topic: 'Abstand',
    points: 4,
    question: 'Was ist die Faustregel für den Sicherheitsabstand?',
    answers: [
      { id: 'a', text: 'Halber Tachowert in Metern (bei 60 km/h → 30 m)', correct: true },
      { id: 'b', text: 'Ganzer Tachowert in Metern', correct: false },
      { id: 'c', text: 'Mindestens 2 Sekunden Zeitabstand', correct: false },
    ],
  },
  {
    id: 'A03',
    topic: 'Abstand',
    points: 3,
    question: 'Warum müssen Sie beim Fahren hinter einem LKW einen größeren Abstand einhalten?',
    answers: [
      { id: 'a', text: 'Weil die Sicht durch den LKW stark eingeschränkt ist', correct: true },
      { id: 'b', text: 'Weil LKW schneller bremsen als PKW', correct: false },
      { id: 'c', text: 'Weil LKW beim Bremsen ausscheren können', correct: false },
    ],
  },
  {
    id: 'A04',
    topic: 'Abstand',
    points: 4,
    question: 'Bei einer Geschwindigkeit von 80 km/h und trockenem Asphalt beträgt der Anhalteweg etwa…',
    answers: [
      { id: 'a', text: 'Ca. 65 m (Bremsweg ca. 40 m + Reaktionsweg ca. 25 m)', correct: true },
      { id: 'b', text: 'Ca. 30 m', correct: false },
      { id: 'c', text: 'Ca. 120 m', correct: false },
    ],
  },

  // ─── Überholen ──────────────────────────────────────────────────────────────
  {
    id: 'UE01',
    topic: 'Überholen',
    points: 4,
    question: 'Wann ist Überholen verboten?',
    answers: [
      { id: 'a', text: 'Wenn es durch Zeichen verboten ist oder die Übersicht fehlt', correct: true },
      { id: 'b', text: 'Grundsätzlich immer auf Landstraßen', correct: false },
      { id: 'c', text: 'Nur innerorts', correct: false },
    ],
  },
  {
    id: 'UE02',
    topic: 'Überholen',
    points: 4,
    question: 'Auf welcher Seite darf man in Deutschland überholen?',
    answers: [
      { id: 'a', text: 'Links, außer wenn das vorausfahrende Fahrzeug links abbiegen will', correct: true },
      { id: 'b', text: 'Rechts ist immer erlaubt', correct: false },
      { id: 'c', text: 'Auf Autobahnen immer rechts', correct: false },
    ],
  },
  {
    id: 'UE03',
    topic: 'Überholen',
    points: 4,
    question: 'Welchen Seitenabstand müssen Sie beim Überholen von Radfahrern mindestens einhalten?',
    answers: [
      { id: 'a', text: 'Innerorts mindestens 1,5 m, außerorts mindestens 2 m', correct: true },
      { id: 'b', text: 'Mindestens 0,5 m', correct: false },
      { id: 'c', text: 'Mindestens 1 m', correct: false },
    ],
  },
  {
    id: 'UE04',
    topic: 'Überholen',
    points: 3,
    question: 'Was müssen Sie tun, bevor Sie überholen?',
    answers: [
      { id: 'a', text: 'Prüfen, ob Überholen erlaubt, gefahrlos und ohne Behinderung anderer möglich ist', correct: true },
      { id: 'b', text: 'Den Blinker setzen und sofort überholen', correct: false },
      { id: 'c', text: 'Hupen, um den Vorausfahrenden zu warnen', correct: false },
    ],
  },

  // ─── Alkohol & Drogen ────────────────────────────────────────────────────────
  {
    id: 'AD01',
    topic: 'Alkohol & Drogen',
    points: 5,
    question: 'Wie hoch ist die allgemeine Promillegrenze in Deutschland für PKW-Fahrer?',
    answers: [
      { id: 'a', text: '0,5 ‰ (0,3 ‰ bei Ausfallerscheinungen)', correct: true },
      { id: 'b', text: '0,8 ‰', correct: false },
      { id: 'c', text: '1,0 ‰', correct: false },
    ],
  },
  {
    id: 'AD02',
    topic: 'Alkohol & Drogen',
    points: 5,
    question: 'Welche Promillegrenze gilt für Fahranfänger in der Probezeit (und unter 21 Jahren)?',
    answers: [
      { id: 'a', text: '0,0 ‰ – absolutes Alkoholverbot', correct: true },
      { id: 'b', text: '0,3 ‰', correct: false },
      { id: 'c', text: '0,5 ‰', correct: false },
    ],
  },
  {
    id: 'AD03',
    topic: 'Alkohol & Drogen',
    points: 5,
    question: 'Wie wirkt Alkohol auf die Fahrtüchtigkeit?',
    answers: [
      { id: 'a', text: 'Er verlangsamt die Reaktion, beeinträchtigt das Sehen und erhöht die Risikobereitschaft', correct: true },
      { id: 'b', text: 'Er entspannt und verbessert die Konzentration', correct: false },
      { id: 'c', text: 'Er erhöht die Reaktionsgeschwindigkeit leicht', correct: false },
    ],
  },
  {
    id: 'AD04',
    topic: 'Alkohol & Drogen',
    points: 5,
    question: 'Ab wann gilt eine absolute Fahruntüchtigkeit durch Alkohol?',
    answers: [
      { id: 'a', text: 'Ab 1,6 ‰ (absolute Fahruntüchtigkeit)', correct: true },
      { id: 'b', text: 'Ab 1,0 ‰', correct: false },
      { id: 'c', text: 'Ab 2,0 ‰', correct: false },
    ],
  },
  {
    id: 'AD05',
    topic: 'Alkohol & Drogen',
    points: 5,
    question: 'Dürfen Sie nach dem Genuss von Drogen (z.B. Cannabis) Auto fahren?',
    answers: [
      { id: 'a', text: 'Nein, Drogen beeinträchtigen die Fahrtüchtigkeit und sind verboten', correct: true },
      { id: 'b', text: 'Ja, wenn Sie sich fit fühlen', correct: false },
      { id: 'c', text: 'Ja, solange die Wirkung nachgelassen hat', correct: false },
    ],
  },

  // ─── Fahrzeugtechnik ─────────────────────────────────────────────────────────
  {
    id: 'FT01',
    topic: 'Fahrzeugtechnik',
    points: 3,
    question: 'Wie erkennen Sie, dass die Bremsen Ihres Fahrzeugs nachlassen?',
    answers: [
      { id: 'a', text: 'Das Pedal lässt sich tief durchdrücken oder das Fahrzeug bremst einseitig', correct: true },
      { id: 'b', text: 'Das Lenkrad vibriert beim Bremsen', correct: false },
      { id: 'c', text: 'Der Motor wird lauter beim Bremsen', correct: false },
    ],
  },
  {
    id: 'FT02',
    topic: 'Fahrzeugtechnik',
    points: 3,
    question: 'Welches Reifenprofil ist gesetzlich vorgeschrieben (Mindestprofiltiefe)?',
    answers: [
      { id: 'a', text: '1,6 mm über die gesamte Reifenbreite', correct: true },
      { id: 'b', text: '2,0 mm', correct: false },
      { id: 'c', text: '3,0 mm', correct: false },
    ],
  },
  {
    id: 'FT03',
    topic: 'Fahrzeugtechnik',
    points: 3,
    question: 'Wann dürfen Sie mit abgefahrenen Reifen (unter Mindestprofiltiefe) fahren?',
    answers: [
      { id: 'a', text: 'Gar nicht – dies ist gesetzlich verboten und gefährlich', correct: true },
      { id: 'b', text: 'Nur auf trockener Fahrbahn bei geringer Geschwindigkeit', correct: false },
      { id: 'c', text: 'Nur auf der Autobahn, wo keine Kurven sind', correct: false },
    ],
  },
  {
    id: 'FT04',
    topic: 'Fahrzeugtechnik',
    points: 3,
    question: 'Was ist ABS?',
    answers: [
      { id: 'a', text: 'Antiblockiersystem – verhindert das Blockieren der Räder beim Bremsen', correct: true },
      { id: 'b', text: 'Automatisches Bremssystem – bremst selbstständig bei Hindernissen', correct: false },
      { id: 'c', text: 'Antriebsblockier-Sperre – verhindert Schleudern beim Anfahren', correct: false },
    ],
  },
  {
    id: 'FT05',
    topic: 'Fahrzeugtechnik',
    points: 3,
    question: 'Was bewirkt ESP (Elektronisches Stabilitätsprogramm)?',
    answers: [
      { id: 'a', text: 'Es stabilisiert das Fahrzeug in kritischen Fahrsituationen', correct: true },
      { id: 'b', text: 'Es erhöht die Motorleistung bei Kurvenfahrten', correct: false },
      { id: 'c', text: 'Es reguliert den Reifendruck automatisch', correct: false },
    ],
  },
  {
    id: 'FT06',
    topic: 'Fahrzeugtechnik',
    points: 2,
    question: 'Wofür steht „HU" bei der Hauptuntersuchung?',
    answers: [
      { id: 'a', text: 'Hauptuntersuchung – regelmäßige technische Prüfung beim TÜV/DEKRA', correct: true },
      { id: 'b', text: 'Halfyear-Update – halbjährliche Inspektion', correct: false },
      { id: 'c', text: 'Hubraum-Überprüfung', correct: false },
    ],
  },
  {
    id: 'FT07',
    topic: 'Fahrzeugtechnik',
    points: 3,
    question: 'Was müssen Sie tun, wenn während der Fahrt die Öldruckwarnleuchte aufleuchtet?',
    answers: [
      { id: 'a', text: 'Sofort anhalten und den Motor abstellen', correct: true },
      { id: 'b', text: 'Fahrt fortsetzen und beim nächsten Werkstatttermin checken lassen', correct: false },
      { id: 'c', text: 'Langsam weiterfahren und den Ölstand in der nächsten Pause prüfen', correct: false },
    ],
  },

  // ─── Umweltschutz ───────────────────────────────────────────────────────────
  {
    id: 'UW01',
    topic: 'Umweltschutz',
    points: 2,
    question: 'Welche Fahrweise hilft am meisten Kraftstoff zu sparen?',
    answers: [
      { id: 'a', text: 'Frühzeitig in einen hohen Gang schalten und vorausschauend fahren', correct: true },
      { id: 'b', text: 'Motor immer im niedrigen Drehzahlbereich halten', correct: false },
      { id: 'c', text: 'Klimaanlage immer auf volle Leistung stellen', correct: false },
    ],
  },
  {
    id: 'UW02',
    topic: 'Umweltschutz',
    points: 2,
    question: 'Was verursacht hohe CO2-Emissionen beim Fahrzeug?',
    answers: [
      { id: 'a', text: 'Hoher Kraftstoffverbrauch durch schnelles und unsportliches Fahren', correct: true },
      { id: 'b', text: 'Zu wenig Öl im Motor', correct: false },
      { id: 'c', text: 'Zu niedriger Reifendruck allein', correct: false },
    ],
  },
  {
    id: 'UW03',
    topic: 'Umweltschutz',
    points: 2,
    question: 'Warum sollten Sie den Motor nicht unnötig laufen lassen (z.B. im Stand)?',
    answers: [
      { id: 'a', text: 'Es verursacht unnötigen Kraftstoffverbrauch und Schadstoffausstoß', correct: true },
      { id: 'b', text: 'Der Motor überhitzt bei Standgas', correct: false },
      { id: 'c', text: 'Es schadet dem Getriebe', correct: false },
    ],
  },
  {
    id: 'UW04',
    topic: 'Umweltschutz',
    points: 2,
    question: 'Wie wirkt sich zu niedriger Reifendruck auf den Verbrauch aus?',
    answers: [
      { id: 'a', text: 'Der Rollwiderstand steigt, der Verbrauch erhöht sich', correct: true },
      { id: 'b', text: 'Der Verbrauch sinkt, weil weniger Reibung entsteht', correct: false },
      { id: 'c', text: 'Reifendruck hat keinen Einfluss auf den Verbrauch', correct: false },
    ],
  },

  // ─── Autobahn ────────────────────────────────────────────────────────────────
  {
    id: 'AB01',
    topic: 'Autobahn',
    points: 4,
    question: 'Was müssen Sie beim Einfahren auf die Autobahn beachten?',
    answers: [
      { id: 'a', text: 'Auf der Auffahrt beschleunigen und dem Verkehr auf der Autobahn Vorfahrt lassen', correct: true },
      { id: 'b', text: 'Der Einfahrende hat Vorfahrt', correct: false },
      { id: 'c', text: 'Sie dürfen einfahren, wenn Sie blinken', correct: false },
    ],
  },
  {
    id: 'AB02',
    topic: 'Autobahn',
    points: 4,
    question: 'Auf welcher Spur darf auf der Autobahn gefahren werden?',
    answers: [
      { id: 'a', text: 'Rechts fahren – die linken Spuren nur zum Überholen nutzen', correct: true },
      { id: 'b', text: 'Auf jeder Spur beliebig', correct: false },
      { id: 'c', text: 'Auf der mittleren Spur dauerhaft', correct: false },
    ],
  },
  {
    id: 'AB03',
    topic: 'Autobahn',
    points: 4,
    question: 'Was müssen Sie bei einem Stau auf der Autobahn als erstes tun?',
    answers: [
      { id: 'a', text: 'Warnblinkanlage einschalten und eine Rettungsgasse bilden', correct: true },
      { id: 'b', text: 'Sofort auf den Standstreifen fahren', correct: false },
      { id: 'c', text: 'Nächste Ausfahrt nehmen', correct: false },
    ],
  },
  {
    id: 'AB04',
    topic: 'Autobahn',
    points: 3,
    question: 'Was ist eine Rettungsgasse und wann muss sie gebildet werden?',
    answers: [
      { id: 'a', text: 'Freie Gasse für Einsatzfahrzeuge – bei Stau oder stockendem Verkehr zwischen der linken und der nächsten Spur', correct: true },
      { id: 'b', text: 'Die rechte Spur freihalten, sobald ein Einsatzfahrzeug kommt', correct: false },
      { id: 'c', text: 'Alle Fahrzeuge rechts ranfahren bei Blaulicht-Einsatz', correct: false },
    ],
  },
  {
    id: 'AB05',
    topic: 'Autobahn',
    points: 4,
    question: 'Dürfen Fußgänger und Radfahrer die Autobahn benutzen?',
    answers: [
      { id: 'a', text: 'Nein, die Autobahn ist ausschließlich für Kraftfahrzeuge bestimmt', correct: true },
      { id: 'b', text: 'Ja, auf dem Standstreifen', correct: false },
      { id: 'c', text: 'Nur auf eigene Gefahr', correct: false },
    ],
  },
  {
    id: 'AB06',
    topic: 'Autobahn',
    points: 3,
    question: 'Was müssen Sie tun, wenn Ihr Fahrzeug auf der Autobahn liegen bleibt?',
    answers: [
      { id: 'a', text: 'Fahrzeug auf dem Standstreifen abstellen, Warndreieck aufstellen, Warnweste anlegen', correct: true },
      { id: 'b', text: 'Auf der Fahrbahn bleiben und Warnblinkanlage einschalten', correct: false },
      { id: 'c', text: 'Fahrzeug auf der Fahrbahn lassen und sofort die Polizei rufen', correct: false },
    ],
  },

  // ─── Gefahrenlehre ───────────────────────────────────────────────────────────
  {
    id: 'GL01',
    topic: 'Gefahrenlehre',
    points: 5,
    question: 'Was ist beim Fahren bei Nebel (Sichtweite unter 50 m) vorgeschrieben?',
    answers: [
      { id: 'a', text: 'Nebelschlussleuchte einschalten, max. 50 km/h fahren', correct: true },
      { id: 'b', text: 'Nur Abblendlicht einschalten', correct: false },
      { id: 'c', text: 'Warnblinkanlage einschalten und normal weiterfahren', correct: false },
    ],
  },
  {
    id: 'GL02',
    topic: 'Gefahrenlehre',
    points: 5,
    question: 'Was sollten Sie beim Fahren auf winterlicher, vereister Fahrbahn beachten?',
    answers: [
      { id: 'a', text: 'Sehr langsam fahren, größeren Abstand halten, sanft bremsen und lenken', correct: true },
      { id: 'b', text: 'Mit Sommerreifen langsam fahren ist ausreichend', correct: false },
      { id: 'c', text: 'Schneller fahren, damit das Fahrzeug stabiler wird', correct: false },
    ],
  },
  {
    id: 'GL03',
    topic: 'Gefahrenlehre',
    points: 5,
    question: 'Ein Kind läuft plötzlich auf die Straße. Was müssen Sie tun?',
    answers: [
      { id: 'a', text: 'Vollbremsung einleiten – Fahrzeuge und nicht Menschen gefährden', correct: true },
      { id: 'b', text: 'Ausweichen ohne zu bremsen', correct: false },
      { id: 'c', text: 'Hupen und weiterfahren', correct: false },
    ],
  },
  {
    id: 'GL04',
    topic: 'Gefahrenlehre',
    points: 4,
    question: 'Wodurch verlängert sich der Bremsweg?',
    answers: [
      { id: 'a', text: 'Nässe, Schnee, Eis, abgefahrene Reifen, erhöhte Geschwindigkeit', correct: true },
      { id: 'b', text: 'Nur durch Nässe und Eis', correct: false },
      { id: 'c', text: 'Nur durch erhöhte Geschwindigkeit', correct: false },
    ],
  },
  {
    id: 'GL05',
    topic: 'Gefahrenlehre',
    points: 4,
    question: 'Was versteht man unter dem „toten Winkel" bei LKW?',
    answers: [
      { id: 'a', text: 'Bereiche neben und hinter dem LKW, die der Fahrer im Spiegel nicht sehen kann', correct: true },
      { id: 'b', text: 'Die Windschutzscheibe des LKW', correct: false },
      { id: 'c', text: 'Der Bereich direkt vor dem LKW', correct: false },
    ],
  },
  {
    id: 'GL06',
    topic: 'Gefahrenlehre',
    points: 4,
    question: 'Welche Gefahr geht von Aquaplaning aus?',
    answers: [
      { id: 'a', text: 'Das Fahrzeug schwimmt auf einem Wasserfilm auf und verliert die Bodenhaftung', correct: true },
      { id: 'b', text: 'Das Fahrzeug wird durch starke Gischt gebremst', correct: false },
      { id: 'c', text: 'Die Windschutzscheibe beschlägt und die Sicht wird eingeschränkt', correct: false },
    ],
  },
  {
    id: 'GL07',
    topic: 'Gefahrenlehre',
    points: 3,
    question: 'Warum ist Ablenkung durch das Smartphone besonders gefährlich?',
    answers: [
      { id: 'a', text: 'Bereits 1 Sekunde Ablenkung bei 50 km/h entspricht 14 m Blindflug', correct: true },
      { id: 'b', text: 'Weil das Telefon die Elektronik des Autos stört', correct: false },
      { id: 'c', text: 'Nur bei Dunkelheit wirklich gefährlich', correct: false },
    ],
  },
  {
    id: 'GL08',
    topic: 'Gefahrenlehre',
    points: 5,
    question: 'Was bewirkt Müdigkeit am Steuer?',
    answers: [
      { id: 'a', text: 'Verlängerte Reaktionszeit, Sekundenschlaf und erhöhtes Unfallrisiko', correct: true },
      { id: 'b', text: 'Nur leichte Ablenkung, die gut beherrschbar ist', correct: false },
      { id: 'c', text: 'Keine nennenswerte Beeinträchtigung der Fahrtüchtigkeit', correct: false },
    ],
  },

  // ─── Erste Hilfe ─────────────────────────────────────────────────────────────
  {
    id: 'EH01',
    topic: 'Erste Hilfe',
    points: 5,
    question: 'Was müssen Sie als erster an einem Unfallort tun?',
    answers: [
      { id: 'a', text: 'Absichern – Warnen – Helfen (Warnblinkanlage, Warndreieck, 112 rufen)', correct: true },
      { id: 'b', text: 'Verletzte sofort aus dem Fahrzeug ziehen', correct: false },
      { id: 'c', text: 'Fotos machen und auf die Polizei warten', correct: false },
    ],
  },
  {
    id: 'EH02',
    topic: 'Erste Hilfe',
    points: 5,
    question: 'Was ist die stabile Seitenlage und wann wird sie angewendet?',
    answers: [
      { id: 'a', text: 'Bewusstlose Person in Seitenlage bringen, damit die Atemwege frei bleiben', correct: true },
      { id: 'b', text: 'Position für verletzte Personen, die nicht bewusstlos sind', correct: false },
      { id: 'c', text: 'Für Personen mit Knochenbrüchen', correct: false },
    ],
  },
  {
    id: 'EH03',
    topic: 'Erste Hilfe',
    points: 5,
    question: 'Wann wird eine Herzdruckmassage durchgeführt?',
    answers: [
      { id: 'a', text: 'Wenn die Person nicht atmet und kein Puls feststellbar ist', correct: true },
      { id: 'b', text: 'Bei jeder bewusstlosen Person', correct: false },
      { id: 'c', text: 'Nur wenn der Notarzt es telefonisch anordnet', correct: false },
    ],
  },
  {
    id: 'EH04',
    topic: 'Erste Hilfe',
    points: 5,
    question: 'Wie lautet der Notruf in Deutschland?',
    answers: [
      { id: 'a', text: '112 (Feuerwehr/Rettungsdienst), 110 (Polizei)', correct: true },
      { id: 'b', text: '110 (Feuerwehr), 112 (Polizei)', correct: false },
      { id: 'c', text: '118 für alle Notfälle', correct: false },
    ],
  },
  {
    id: 'EH05',
    topic: 'Erste Hilfe',
    points: 4,
    question: 'Darf eine verletzte Person aus einem Unfallfahrzeug gezogen werden?',
    answers: [
      { id: 'a', text: 'Nur wenn Lebensgefahr durch Feuer oder andere Gefahr besteht', correct: true },
      { id: 'b', text: 'Immer, um Verletzungen besser zu versorgen', correct: false },
      { id: 'c', text: 'Niemals, man muss immer auf den Rettungsdienst warten', correct: false },
    ],
  },

  // ─── Ruhender Verkehr ─────────────────────────────────────────────────────────
  {
    id: 'RV01',
    topic: 'Ruhender Verkehr',
    points: 3,
    question: 'Was ist der Unterschied zwischen Halten und Parken?',
    answers: [
      { id: 'a', text: 'Halten: kurzes Anhalten (≤3 min), Parken: längeres Abstellen oder Verlassen des Fahrzeugs', correct: true },
      { id: 'b', text: 'Halten ist immer erlaubt, Parken benötigt ein Schild', correct: false },
      { id: 'c', text: 'Kein Unterschied, beide Begriffe bedeuten dasselbe', correct: false },
    ],
  },
  {
    id: 'RV02',
    topic: 'Ruhender Verkehr',
    points: 3,
    question: 'Wo ist das Parken generell verboten?',
    answers: [
      { id: 'a', text: 'An Kreuzungen, vor Einfahrten, auf Radwegen, in Kurven mit mangelnder Sicht', correct: true },
      { id: 'b', text: 'Nur an Haltestellen', correct: false },
      { id: 'c', text: 'Nur wo Parkverbotsschilder stehen', correct: false },
    ],
  },
  {
    id: 'RV03',
    topic: 'Ruhender Verkehr',
    points: 3,
    question: 'Welchen Abstand müssen Sie beim Parken von einem Feuerwehrhydranten einhalten?',
    answers: [
      { id: 'a', text: 'Mindestens 5 m', correct: true },
      { id: 'b', text: 'Mindestens 3 m', correct: false },
      { id: 'c', text: 'Mindestens 10 m', correct: false },
    ],
  },
  {
    id: 'RV04',
    topic: 'Ruhender Verkehr',
    points: 3,
    question: 'Was müssen Sie beim Verlassen des Fahrzeugs in der Dunkelheit beachten?',
    answers: [
      { id: 'a', text: 'Standlicht oder Parkleuchte einschalten, wenn das Fahrzeug den Verkehr behindern könnte', correct: true },
      { id: 'b', text: 'Nichts besonderes, das Fahrzeug einfach verlassen', correct: false },
      { id: 'c', text: 'Warnblinkanlage immer einschalten', correct: false },
    ],
  },
  {
    id: 'RV05',
    topic: 'Ruhender Verkehr',
    points: 2,
    question: 'Darf auf dem Gehweg geparkt werden?',
    answers: [
      { id: 'a', text: 'Nur wenn ein Schild mit Gehwegparken-Zeichen aufgestellt ist', correct: true },
      { id: 'b', text: 'Immer, wenn genug Platz für Fußgänger bleibt', correct: false },
      { id: 'c', text: 'Grundsätzlich verboten, kein Schild ändert das', correct: false },
    ],
  },

  // ─── Zusätzliche Fragen (Gemischt) ──────────────────────────────────────────
  {
    id: 'GE01',
    topic: 'Gefahrenlehre',
    points: 4,
    question: 'Was ist beim Fahren durch Tunnels zu beachten?',
    answers: [
      { id: 'a', text: 'Licht einschalten, Abstand vergrößern, Geschwindigkeit anpassen', correct: true },
      { id: 'b', text: 'Geschwindigkeit erhöhen, um den Tunnel schnell zu passieren', correct: false },
      { id: 'c', text: 'Nichts besonderes – wie auf normaler Straße fahren', correct: false },
    ],
  },
  {
    id: 'GE02',
    topic: 'Gefahrenlehre',
    points: 4,
    question: 'Was verursacht einen längeren Reaktionsweg?',
    answers: [
      { id: 'a', text: 'Ablenkung, Müdigkeit, Medikamente, Alkohol', correct: true },
      { id: 'b', text: 'Nur hohe Geschwindigkeit', correct: false },
      { id: 'c', text: 'Gutes Wetter und trockene Fahrbahn', correct: false },
    ],
  },
  {
    id: 'V07',
    topic: 'Vorfahrt',
    points: 4,
    question: 'An einer geregelten Kreuzung (Ampel): Der Gegenverkehr kommt und biegt links ab. Sie fahren geradeaus. Wer hat Vorfahrt?',
    answers: [
      { id: 'a', text: 'Ich – Geradeausfahrer hat Vorfahrt vor Linksabbiegern', correct: true },
      { id: 'b', text: 'Der Abbiegende, weil er schon die Kreuzung begonnen hat', correct: false },
      { id: 'c', text: 'Keiner – beide müssen gleichzeitig abwarten', correct: false },
    ],
  },
  {
    id: 'G07',
    topic: 'Geschwindigkeit',
    points: 4,
    question: 'Wie beeinflusst eine Verdopplung der Geschwindigkeit den Bremsweg?',
    answers: [
      { id: 'a', text: 'Er vervierfacht sich (quadratisches Verhältnis)', correct: true },
      { id: 'b', text: 'Er verdoppelt sich', correct: false },
      { id: 'c', text: 'Er verdreifacht sich', correct: false },
    ],
  },
  {
    id: 'FT08',
    topic: 'Fahrzeugtechnik',
    points: 3,
    question: 'Was prüfen Sie regelmäßig vor einer längeren Fahrt?',
    answers: [
      { id: 'a', text: 'Reifendruck, Ölstand, Kühlwasser, Scheibenwaschanlage, Beleuchtung', correct: true },
      { id: 'b', text: 'Nur den Tankstand', correct: false },
      { id: 'c', text: 'Nur Reifenprofil und Bremsen', correct: false },
    ],
  },
  {
    id: 'Z08',
    topic: 'Verkehrszeichen',
    points: 3,
    question: 'Was bedeutet ein Schild mit einem rotem Rand, schwarzem PKW und Motorrad auf weißem Grund?',
    answers: [
      { id: 'a', text: 'Überholverbot für PKW und Motorräder', correct: true },
      { id: 'b', text: 'Einfahrt verboten für LKW', correct: false },
      { id: 'c', text: 'Nur PKW und Motorräder dürfen einfahren', correct: false },
    ],
  },
  {
    id: 'AB07',
    topic: 'Autobahn',
    points: 3,
    question: 'Was gilt für das Wenden und Rückwärtsfahren auf der Autobahn?',
    answers: [
      { id: 'a', text: 'Beides ist auf der Autobahn generell verboten', correct: true },
      { id: 'b', text: 'Nur Wenden ist verboten, Rückwärtsfahren ist erlaubt', correct: false },
      { id: 'c', text: 'Beides ist auf dem Standstreifen erlaubt', correct: false },
    ],
  },
  {
    id: 'UE05',
    topic: 'Überholen',
    points: 4,
    question: 'Dürfen Sie einen Schulbus, der Kinder ein- oder aussteigen lässt, überholen?',
    answers: [
      { id: 'a', text: 'Nein, nur mit Schrittgeschwindigkeit und größtem Abstand vorbeifahren', correct: true },
      { id: 'b', text: 'Ja, wenn Sie langsam fahren', correct: false },
      { id: 'c', text: 'Ja, wenn die Kinder auf dem Gehweg sind', correct: false },
    ],
  },
  {
    id: 'GL09',
    topic: 'Gefahrenlehre',
    points: 5,
    question: 'Was müssen Sie bei Gegenwind oder beim Überholen von LKW beachten?',
    answers: [
      { id: 'a', text: 'Seitenwind kann das Fahrzeug abdrängen – Lenkrad fest halten und Geschwindigkeit reduzieren', correct: true },
      { id: 'b', text: 'Nichts, moderne Fahrzeuge sind windstabil genug', correct: false },
      { id: 'c', text: 'Blinker setzen und schnell überholen', correct: false },
    ],
  },
  {
    id: 'RV06',
    topic: 'Ruhender Verkehr',
    points: 3,
    question: 'Dürfen Sie ein Fahrzeug in zweiter Reihe kurz anhalten?',
    answers: [
      { id: 'a', text: 'Nein, es sei denn es handelt sich um ein kurzes Halten zum Ein- oder Aussteigen ohne Behinderung anderer', correct: true },
      { id: 'b', text: 'Ja, immer mit Warnblinkanlage', correct: false },
      { id: 'c', text: 'Ja, für bis zu 5 Minuten', correct: false },
    ],
  },
]

export const getQuestionsByTopic = (topic: string) =>
  questions.filter((q) => q.topic === topic)

export const getTopicStats = () => {
  const stats: Record<string, number> = {}
  for (const q of questions) {
    stats[q.topic] = (stats[q.topic] ?? 0) + 1
  }
  return stats
}
