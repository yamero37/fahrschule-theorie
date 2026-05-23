import type { Question } from '@/types'

export const questions: Question[] = [

  // ─── Lektion 1: Der Mensch als Risikofaktor ──────────────────────────────

  {
    id: 'L1_01',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Aussage über die menschliche Wahrnehmung im Straßenverkehr ist richtig?',
    answers: [
      { id: 'a', text: 'Menschen nehmen immer alle relevanten Verkehrssituationen vollständig und korrekt wahr', correct: false },
      { id: 'b', text: 'Die Wahrnehmung kann durch Ablenkung, Stress oder Müdigkeit erheblich beeinträchtigt werden', correct: true },
      { id: 'c', text: 'Erfahrene Fahrer nehmen Gefahren immer rechtzeitig und vollständig wahr', correct: false },
    ],
  },
  {
    id: 'L1_02',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter dem "toten Winkel" bei Fahrzeugen?',
    answers: [
      { id: 'a', text: 'Bereiche um das Fahrzeug, die vom Fahrer weder direkt noch über Spiegel eingesehen werden können', correct: true },
      { id: 'b', text: 'Den Bereich direkt vor dem Fahrzeug, der bei hoher Geschwindigkeit nicht eingesehen werden kann', correct: false },
      { id: 'c', text: 'Den Bereich hinter dem Fahrzeug, der nur bei Dunkelheit nicht sichtbar ist', correct: false },
    ],
  },
  {
    id: 'L1_03',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie beeinflusst Müdigkeit die Fahrtüchtigkeit?',
    answers: [
      { id: 'a', text: 'Müdigkeit verlängert die Reaktionszeit und kann zu Sekundenschlaf führen, was das Unfallrisiko erheblich erhöht', correct: true },
      { id: 'b', text: 'Müdigkeit beeinträchtigt nur die Sehschärfe, nicht aber die Reaktionsfähigkeit', correct: false },
      { id: 'c', text: 'Durch Koffein kann die Wirkung von Müdigkeit vollständig aufgehoben werden', correct: false },
    ],
  },
  {
    id: 'L1_04',
    topic: 'Lektion 1',
    points: 3,
    question: 'Ab welchem Blutalkoholgehalt gilt man in Deutschland generell als fahruntüchtig (absolute Fahruntüchtigkeit)?',
    answers: [
      { id: 'a', text: 'Ab 1,1 Promille', correct: true },
      { id: 'b', text: 'Ab 0,5 Promille', correct: false },
      { id: 'c', text: 'Ab 0,8 Promille', correct: false },
    ],
  },
  {
    id: 'L1_05',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was gilt für Fahranfänger in der Probezeit bezüglich Alkohol am Steuer?',
    answers: [
      { id: 'a', text: 'Es gilt ein absolutes Alkoholverbot (0,0 Promille)', correct: true },
      { id: 'b', text: 'Es gilt die gleiche 0,5-Promille-Grenze wie für alle anderen Fahrer', correct: false },
      { id: 'c', text: 'Es gilt eine verschärfte Grenze von 0,3 Promille', correct: false },
    ],
  },
  {
    id: 'L1_06',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Aussage über Alkohol und Fahrtüchtigkeit ist korrekt?',
    answers: [
      { id: 'a', text: 'Alkohol beeinträchtigt Reaktionsvermögen, Koordination und Urteilsvermögen – gleichzeitig steigt das Selbstüberschätzungsrisiko', correct: true },
      { id: 'b', text: 'Kleine Mengen Alkohol verbessern die Konzentration und Reaktionsfähigkeit', correct: false },
      { id: 'c', text: 'Die Wirkung von Alkohol kann durch ausreichend Wasser und Essen vollständig ausgeglichen werden', correct: false },
    ],
  },
  {
    id: 'L1_07',
    topic: 'Lektion 1',
    points: 3,
    question: 'Ab welchem Blutalkoholgehalt liegt eine Ordnungswidrigkeit vor (ohne Ausfallerscheinungen)?',
    answers: [
      { id: 'a', text: 'Ab 0,5 Promille', correct: true },
      { id: 'b', text: 'Ab 0,3 Promille', correct: false },
      { id: 'c', text: 'Ab 0,8 Promille', correct: false },
    ],
  },
  {
    id: 'L1_08',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wann kann bereits ab 0,3 Promille eine Straftat vorliegen?',
    answers: [
      { id: 'a', text: 'Wenn alkoholbedingte Ausfallerscheinungen wie Schlangenlinien fahren oder Unfallbeteiligung vorliegen', correct: true },
      { id: 'b', text: 'Nur wenn zusätzlich Drogen konsumiert wurden', correct: false },
      { id: 'c', text: 'Wenn der Fahrer unter 21 Jahre alt ist', correct: false },
    ],
  },
  {
    id: 'L1_09',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was ist "Sekundenschlaf" und welche Gefahr geht davon aus?',
    answers: [
      { id: 'a', text: 'Ein kurzzeitiges, unkontrollierbares Einschlafen am Steuer, das selbst bei niedrigen Geschwindigkeiten zu schweren Unfällen führen kann', correct: true },
      { id: 'b', text: 'Ein kurzes Dösen, das nur bei Geschwindigkeiten über 100 km/h gefährlich ist', correct: false },
      { id: 'c', text: 'Ein medizinischer Zustand, der nur nachts auftritt und leicht erkennbar ist', correct: false },
    ],
  },
  {
    id: 'L1_10',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was sollte man bei starker Müdigkeit während der Fahrt tun?',
    answers: [
      { id: 'a', text: 'Sofort an einem sicheren Ort anhalten und eine Pause einlegen oder schlafen', correct: true },
      { id: 'b', text: 'Das Fenster öffnen und Musik lauter stellen, um wach zu bleiben', correct: false },
      { id: 'c', text: 'Die Geschwindigkeit erhöhen, um schneller ans Ziel zu kommen', correct: false },
    ],
  },
  {
    id: 'L1_11',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Auswirkungen haben illegale Drogen auf die Fahrtüchtigkeit?',
    answers: [
      { id: 'a', text: 'Illegale Drogen können Wahrnehmung, Reaktionsvermögen und Urteilsfähigkeit stark beeinträchtigen – teils für viele Stunden bis Tage nach dem Konsum', correct: true },
      { id: 'b', text: 'Die Wirkung illegaler Drogen auf die Fahrtüchtigkeit ist von Person zu Person so unterschiedlich, dass keine allgemeinen Aussagen möglich sind', correct: false },
      { id: 'c', text: 'Nur Cannabis beeinträchtigt die Fahrtüchtigkeit; andere illegale Drogen haben kaum Einfluss', correct: false },
    ],
  },
  {
    id: 'L1_12',
    topic: 'Lektion 1',
    points: 3,
    question: 'Darf man nach dem Konsum von Cannabis Auto fahren?',
    answers: [
      { id: 'a', text: 'Nein, Cannabis kann die Fahrtüchtigkeit erheblich beeinträchtigen; das Fahren unter dem Einfluss ist verboten und gefährlich', correct: true },
      { id: 'b', text: 'Ja, wenn man sich fit fühlt und nur eine geringe Menge konsumiert hat', correct: false },
      { id: 'c', text: 'Ja, aber nur auf bekannten Strecken und bei guten Wetterbedingungen', correct: false },
    ],
  },
  {
    id: 'L1_13',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie können Medikamente die Fahrtüchtigkeit beeinflussen?',
    answers: [
      { id: 'a', text: 'Manche Medikamente können Schläfrigkeit, Konzentrationsprobleme oder verlängerte Reaktionszeiten verursachen und damit die Fahrtüchtigkeit einschränken', correct: true },
      { id: 'b', text: 'Rezeptpflichtige Medikamente haben keine Auswirkungen auf die Fahrtüchtigkeit, da sie medizinisch kontrolliert sind', correct: false },
      { id: 'c', text: 'Nur Schlafmittel beeinflussen die Fahrtüchtigkeit; andere Medikamente sind unbedenklich', correct: false },
    ],
  },
  {
    id: 'L1_14',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was sollte man tun, wenn man Medikamente einnehmen muss und Auto fahren möchte?',
    answers: [
      { id: 'a', text: 'Den Beipackzettel lesen und ggf. den Arzt oder Apotheker fragen, ob das Medikament die Fahrtüchtigkeit beeinträchtigt', correct: true },
      { id: 'b', text: 'Immer auf das Autofahren verzichten, solange man Medikamente nimmt', correct: false },
      { id: 'c', text: 'Die Dosierung des Medikaments halbieren, um negative Auswirkungen zu vermeiden', correct: false },
    ],
  },
  {
    id: 'L1_15',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter "selektivem Sehen" im Straßenverkehr?',
    answers: [
      { id: 'a', text: 'Die Tendenz des Gehirns, nur bestimmte Reize bewusst wahrzunehmen und andere auszublenden, was zu übersehenen Gefahren führen kann', correct: true },
      { id: 'b', text: 'Die Fähigkeit, bei schlechten Sichtverhältnissen besonders gut zu sehen', correct: false },
      { id: 'c', text: 'Eine spezielle Fahrtechnik für komplexe Verkehrssituationen', correct: false },
    ],
  },
  {
    id: 'L1_16',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie wirkt sich Stress auf das Fahrverhalten aus?',
    answers: [
      { id: 'a', text: 'Stress kann zu Konzentrationsmängeln, erhöhter Risikobereitschaft und schlechteren Reaktionen führen', correct: true },
      { id: 'b', text: 'Stress erhöht die Aufmerksamkeit und macht Fahrer sicherer', correct: false },
      { id: 'c', text: 'Stress hat keinen nachweisbaren Einfluss auf das Fahrverhalten', correct: false },
    ],
  },
  {
    id: 'L1_17',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter "Risikobereitschaft" im Straßenverkehr?',
    answers: [
      { id: 'a', text: 'Die Bereitschaft, bewusst oder unbewusst gefährliche Situationen in Kauf zu nehmen, z.B. durch Überholen bei schlechter Sicht', correct: true },
      { id: 'b', text: 'Die Fähigkeit, Risiken im Straßenverkehr zuverlässig einzuschätzen und zu vermeiden', correct: false },
      { id: 'c', text: 'Ein positives Merkmal erfahrener Fahrer, das ihre Fahrzeugkontrolle verbessert', correct: false },
    ],
  },
  {
    id: 'L1_18',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was ist "Fahrtüchtigkeit" und welche Faktoren können sie beeinflussen?',
    answers: [
      { id: 'a', text: 'Die körperliche und geistige Eignung zum sicheren Führen eines Fahrzeugs – sie wird durch Alkohol, Drogen, Medikamente, Müdigkeit und Stress beeinflusst', correct: true },
      { id: 'b', text: 'Ausschließlich die technischen Kenntnisse eines Fahrers über das Fahrzeug', correct: false },
      { id: 'c', text: 'Nur die Sehfähigkeit und motorische Geschicklichkeit des Fahrers', correct: false },
    ],
  },
  {
    id: 'L1_19',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was sind typische Anzeichen für Übermüdung beim Fahren?',
    answers: [
      { id: 'a', text: 'Häufiges Blinzeln, schwere Augen, Konzentrationsprobleme und das Abkommen von der Fahrspur', correct: true },
      { id: 'b', text: 'Erhöhte Herzfrequenz und Schwitzen', correct: false },
      { id: 'c', text: 'Hunger und Durst', correct: false },
    ],
  },
  {
    id: 'L1_20',
    topic: 'Lektion 1',
    points: 3,
    question: 'Warum ist Telefonieren ohne Freisprecheinrichtung während der Fahrt verboten?',
    answers: [
      { id: 'a', text: 'Weil es die Aufmerksamkeit erheblich ablenkt, die Reaktionszeit verlängert und das Unfallrisiko deutlich erhöht', correct: true },
      { id: 'b', text: 'Ausschließlich wegen möglicher Strahlenbelastung durch das Mobiltelefon', correct: false },
      { id: 'c', text: 'Nur weil es die Sicht einschränkt, wenn das Telefon ans Ohr gehalten wird', correct: false },
    ],
  },
  {
    id: 'L1_21',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie beeinflusst emotionaler Stress (z.B. Streit, Sorgen) die Fahrtüchtigkeit?',
    answers: [
      { id: 'a', text: 'Emotionaler Stress kann die Konzentration erheblich verringern und zu aggressiverem oder unvorsichtigerem Fahrverhalten führen', correct: true },
      { id: 'b', text: 'Emotionaler Stress hat keinen Einfluss auf die Fahrtüchtigkeit, solange man körperlich fit ist', correct: false },
      { id: 'c', text: 'Emotionaler Stress macht Fahrer aufmerksamer und vorsichtiger', correct: false },
    ],
  },
  {
    id: 'L1_22',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter dem Begriff "Gefahrenwahrnehmung"?',
    answers: [
      { id: 'a', text: 'Die Fähigkeit, potenzielle Gefahrensituationen im Straßenverkehr frühzeitig zu erkennen und entsprechend zu reagieren', correct: true },
      { id: 'b', text: 'Das automatische Bremsen des Fahrzeugs bei erkannten Gefahren', correct: false },
      { id: 'c', text: 'Die rechtliche Pflicht, Unfälle der Polizei zu melden', correct: false },
    ],
  },
  {
    id: 'L1_23',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Faktoren können die Reaktionszeit eines Fahrers verlängern?',
    answers: [
      { id: 'a', text: 'Alkohol, Drogen, Medikamente, Müdigkeit, Ablenkung und Stress', correct: true },
      { id: 'b', text: 'Nur Alkohol und illegale Drogen; legale Substanzen haben keinen Einfluss', correct: false },
      { id: 'c', text: 'Ausschließlich körperliche Erkrankungen wie Sehprobleme oder Gehörschäden', correct: false },
    ],
  },
  {
    id: 'L1_24',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie sollte man sich verhalten, wenn man merkt, dass man nicht mehr fahrtüchtig ist?',
    answers: [
      { id: 'a', text: 'Sofort an einem sicheren Ort anhalten, nicht weiterfahren und ggf. Hilfe organisieren', correct: true },
      { id: 'b', text: 'Langsamer fahren und versuchen, das Ziel noch zu erreichen', correct: false },
      { id: 'c', text: 'Kurz pausieren und dann bei reduzierter Geschwindigkeit weiterfahren', correct: false },
    ],
  },
  {
    id: 'L1_25',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was ist unter dem Begriff "Ablenkung" im Straßenverkehr zu verstehen?',
    answers: [
      { id: 'a', text: 'Jede Aktivität, die die Aufmerksamkeit des Fahrers vom Verkehrsgeschehen ablenkt, wie Essen, Bedienen des Navigationssystems oder Gespräche', correct: true },
      { id: 'b', text: 'Ausschließlich das Benutzen von Mobiltelefonen während der Fahrt', correct: false },
      { id: 'c', text: 'Das Betrachten von Werbetafeln am Straßenrand', correct: false },
    ],
  },
  {
    id: 'L1_26',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Aussage über Drogen im Straßenverkehr ist richtig?',
    answers: [
      { id: 'a', text: 'Das Führen eines Fahrzeugs unter dem Einfluss von Drogen ist strafbar, unabhängig von der konsumierten Menge', correct: true },
      { id: 'b', text: 'Drogen sind nur dann illegal beim Fahren, wenn sie die Fahrtüchtigkeit nachweislich beeinträchtigen', correct: false },
      { id: 'c', text: 'Bei medizinisch verschriebenen Betäubungsmitteln ist Fahren immer erlaubt', correct: false },
    ],
  },
  {
    id: 'L1_27',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie lange nach dem Konsum von Cannabis kann die Fahrtüchtigkeit noch beeinträchtigt sein?',
    answers: [
      { id: 'a', text: 'Bis zu 24 Stunden oder länger, abhängig von Menge, Häufigkeit des Konsums und individueller Verarbeitung', correct: true },
      { id: 'b', text: 'Maximal 2 Stunden nach dem letzten Konsum', correct: false },
      { id: 'c', text: 'Nur solange die akute Rauschwirkung anhält, danach ist Fahren sicher', correct: false },
    ],
  },
  {
    id: 'L1_28',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter "Tunnelblick" beim Autofahren?',
    answers: [
      { id: 'a', text: 'Eine Einengung des Blickfeldes, bei der der Fahrer nur noch geradeaus schaut und seitliche Gefahren übersieht', correct: true },
      { id: 'b', text: 'Das Fahren durch einen Tunnel ohne ausreichende Beleuchtung', correct: false },
      { id: 'c', text: 'Eine spezielle Fahrtechnik bei Nebel für bessere Sicht', correct: false },
    ],
  },
  {
    id: 'L1_29',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie beeinflusst mangelnde Erfahrung die Fahrsicherheit?',
    answers: [
      { id: 'a', text: 'Unerfahrene Fahrer haben häufig Schwierigkeiten, Gefahren rechtzeitig zu erkennen und richtig zu reagieren, da ihnen die nötige Routine fehlt', correct: true },
      { id: 'b', text: 'Unerfahrene Fahrer sind vorsichtiger und daher sicherer als erfahrene Fahrer', correct: false },
      { id: 'c', text: 'Erfahrung ist beim Autofahren weniger wichtig als technisches Wissen über das Fahrzeug', correct: false },
    ],
  },
  {
    id: 'L1_30',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was ist unter "Fahren auf Sicht" zu verstehen?',
    answers: [
      { id: 'a', text: 'Die Pflicht, die Geschwindigkeit so anzupassen, dass man innerhalb der überschaubaren Strecke anhalten kann', correct: true },
      { id: 'b', text: 'Das Fahren ohne Navigationsgerät, nur anhand der Straßenschilder', correct: false },
      { id: 'c', text: 'Das Fahren bei klarer Sicht ohne Nebel oder Regen', correct: false },
    ],
  },
  {
    id: 'L1_31',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Auswirkungen hat Alkohol auf das Sehvermögen?',
    answers: [
      { id: 'a', text: 'Alkohol beeinträchtigt die Sehschärfe, verengt das Gesichtsfeld und verschlechtert die Tiefenwahrnehmung', correct: true },
      { id: 'b', text: 'Alkohol schärft die Sinne und verbessert das Nachtsehen', correct: false },
      { id: 'c', text: 'Alkohol hat keine nachweisbaren Auswirkungen auf das Sehvermögen', correct: false },
    ],
  },
  {
    id: 'L1_32',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was ist die Hauptursache für schwere Verkehrsunfälle?',
    answers: [
      { id: 'a', text: 'Menschliches Versagen, z.B. durch Ablenkung, Unachtsamkeit, überhöhte Geschwindigkeit oder Alkohol', correct: true },
      { id: 'b', text: 'Technische Defekte an Fahrzeugen', correct: false },
      { id: 'c', text: 'Schlechte Straßenverhältnisse und Witterungsbedingungen', correct: false },
    ],
  },
  {
    id: 'L1_33',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Aussage über die Auswirkungen von Alkohol auf die Psyche ist richtig?',
    answers: [
      { id: 'a', text: 'Alkohol senkt Hemmungen, führt zu Selbstüberschätzung und verringert die Fähigkeit, Risiken richtig einzuschätzen', correct: true },
      { id: 'b', text: 'Alkohol steigert die Konzentration und macht Fahrer wachsamer', correct: false },
      { id: 'c', text: 'Die psychischen Auswirkungen von Alkohol treten erst bei sehr hohen Promillewerten auf', correct: false },
    ],
  },
  {
    id: 'L1_34',
    topic: 'Lektion 1',
    points: 3,
    question: 'Warum sind junge Fahrer besonders häufig in Unfälle verwickelt?',
    answers: [
      { id: 'a', text: 'Mangelnde Fahrpraxis, Risikobereitschaft, Selbstüberschätzung und oft auch Alkohol- oder Drogeneinfluss spielen eine große Rolle', correct: true },
      { id: 'b', text: 'Weil sie in schlecht gewarteten Fahrzeugen fahren', correct: false },
      { id: 'c', text: 'Weil sie häufiger auf gefährlichen Straßen fahren als ältere Fahrer', correct: false },
    ],
  },
  {
    id: 'L1_35',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter "kognitiver Ablenkung" beim Fahren?',
    answers: [
      { id: 'a', text: 'Wenn die Gedanken des Fahrers beim Fahren abschweifen und er sich mental nicht auf das Verkehrsgeschehen konzentriert', correct: true },
      { id: 'b', text: 'Das Bedienen des Radios oder anderer technischer Geräte während der Fahrt', correct: false },
      { id: 'c', text: 'Ablenkung durch andere Personen im Fahrzeug', correct: false },
    ],
  },
  {
    id: 'L1_36',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie wirkt sich Hunger oder ein niedriger Blutzucker auf das Fahrverhalten aus?',
    answers: [
      { id: 'a', text: 'Niedriger Blutzucker kann zu Konzentrationsproblemen, Schwindel und verlangsamter Reaktion führen und damit die Fahrtüchtigkeit beeinträchtigen', correct: true },
      { id: 'b', text: 'Hunger hat keinen nennenswerten Einfluss auf die Fahrtüchtigkeit', correct: false },
      { id: 'c', text: 'Niedriger Blutzucker erhöht die Aufmerksamkeit und Reaktionsfähigkeit', correct: false },
    ],
  },
  {
    id: 'L1_37',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Maßnahmen helfen, das Risiko von Verkehrsunfällen durch menschliche Fehler zu reduzieren?',
    answers: [
      { id: 'a', text: 'Vorausschauendes Fahren, regelmäßige Pausen, Verzicht auf Alkohol und Drogen sowie Minimierung von Ablenkungen', correct: true },
      { id: 'b', text: 'Ausschließlich technische Hilfssysteme wie Spurhalteassistent und Notbremsassistent', correct: false },
      { id: 'c', text: 'Ausschließlich eine bessere Fahrausbildung für Anfänger', correct: false },
    ],
  },
  {
    id: 'L1_38',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was ist der Unterschied zwischen relativer und absoluter Fahruntüchtigkeit bei Alkohol?',
    answers: [
      { id: 'a', text: 'Ab 0,3‰ mit Ausfallerscheinungen gilt relative Fahruntüchtigkeit (Straftat möglich), ab 1,1‰ absolute Fahruntüchtigkeit (immer Straftat)', correct: true },
      { id: 'b', text: 'Relative Fahruntüchtigkeit beginnt ab 0,5‰, absolute ab 0,8‰', correct: false },
      { id: 'c', text: 'Der Unterschied besteht nur im Strafmaß, nicht in der Promillegrenze', correct: false },
    ],
  },
  {
    id: 'L1_39',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche rechtlichen Konsequenzen drohen beim Fahren unter Alkoholeinfluss ab 0,5 Promille?',
    answers: [
      { id: 'a', text: 'Geldbuße, Punkte in Flensburg und ein temporäres Fahrverbot (Ordnungswidrigkeit)', correct: true },
      { id: 'b', text: 'Sofortiger Führerscheinentzug und Freiheitsstrafe', correct: false },
      { id: 'c', text: 'Nur eine mündliche Verwarnung durch die Polizei', correct: false },
    ],
  },
  {
    id: 'L1_40',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie kann man vor einer langen Fahrt sicherstellen, ausreichend fit zu sein?',
    answers: [
      { id: 'a', text: 'Ausreichend schlafen, keine berauschenden Mittel einnehmen, regelmäßige Pausen einplanen und bei Bedarf Fahrten verschieben', correct: true },
      { id: 'b', text: 'Energydrinks und starken Kaffee trinken, um wach zu bleiben', correct: false },
      { id: 'c', text: 'Sich auf das Ziel konzentrieren und die Fahrt möglichst schnell hinter sich bringen', correct: false },
    ],
  },
  {
    id: 'L1_41',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter "Risikowahrnehmung" im Straßenverkehr?',
    answers: [
      { id: 'a', text: 'Die Fähigkeit, gefährliche Situationen frühzeitig zu erkennen und die eigene Gefährdung realistisch einzuschätzen', correct: true },
      { id: 'b', text: 'Die automatische Erkennung von Gefahren durch moderne Fahrerassistenzsysteme', correct: false },
      { id: 'c', text: 'Das bewusste Eingehen von Risiken, um schneller ans Ziel zu kommen', correct: false },
    ],
  },
  {
    id: 'L1_42',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Personengruppen unterliegen im Straßenverkehr einem besonderen Alkoholverbot?',
    answers: [
      { id: 'a', text: 'Fahranfänger in der Probezeit und Fahrer unter 21 Jahren (0,0-Promille-Grenze)', correct: true },
      { id: 'b', text: 'Nur Berufskraftfahrer wie LKW- und Busfahrer', correct: false },
      { id: 'c', text: 'Alle Fahrer nach 22 Uhr auf der Autobahn', correct: false },
    ],
  },
  {
    id: 'L1_43',
    topic: 'Lektion 1',
    points: 3,
    question: 'Wie beeinflusst Lärm im Fahrzeug die Aufmerksamkeit des Fahrers?',
    answers: [
      { id: 'a', text: 'Sehr laute Musik oder starker Lärm kann die Konzentration beeinträchtigen und wichtige Geräusche wie Hupen oder Sirenen überdecken', correct: true },
      { id: 'b', text: 'Musik im Auto hat keine nachweisbaren Auswirkungen auf die Aufmerksamkeit', correct: false },
      { id: 'c', text: 'Laute Musik erhöht die Wachheit und verbessert die Reaktionsfähigkeit', correct: false },
    ],
  },
  {
    id: 'L1_44',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter "proaktiver Fahrweise"?',
    answers: [
      { id: 'a', text: 'Vorausschauendes Fahren, bei dem der Fahrer potenzielle Gefahren frühzeitig erkennt und entsprechend handelt, bevor es zu kritischen Situationen kommt', correct: true },
      { id: 'b', text: 'Defensives Fahren, bei dem man immer hinter anderen Fahrzeugen bleibt', correct: false },
      { id: 'c', text: 'Aggressives Fahren, um schnell im Verkehr voranzukommen', correct: false },
    ],
  },
  {
    id: 'L1_45',
    topic: 'Lektion 1',
    points: 3,
    question: 'Warum ist Müdigkeit am Steuer so gefährlich?',
    answers: [
      { id: 'a', text: 'Weil Müdigkeit zu Sekundenschlaf führen kann, wobei selbst bei 100 km/h in einer Sekunde fast 28 Meter zurückgelegt werden – ohne Kontrolle über das Fahrzeug', correct: true },
      { id: 'b', text: 'Weil müde Fahrer grundsätzlich zu langsam fahren und den Verkehr behindern', correct: false },
      { id: 'c', text: 'Weil Müdigkeit ausschließlich nachts ein Problem darstellt', correct: false },
    ],
  },
  {
    id: 'L1_46',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was sind Anzeichen dafür, dass man eine Pause beim Fahren einlegen sollte?',
    answers: [
      { id: 'a', text: 'Schwere Augen, häufiges Gähnen, Konzentrationsprobleme, Abkommen von der Spur oder das Verpassen von Ausfahrten', correct: true },
      { id: 'b', text: 'Hunger und Durst, da diese die einzigen zuverlässigen Anzeichen für Müdigkeit sind', correct: false },
      { id: 'c', text: 'Nur starkes Zittern der Hände, da dies auf Kreislaufprobleme hindeutet', correct: false },
    ],
  },
  {
    id: 'L1_47',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Aussage über die Kombination von Alkohol und Medikamenten gilt?',
    answers: [
      { id: 'a', text: 'Alkohol kann die Wirkung bestimmter Medikamente verstärken und zu gefährlichen Wechselwirkungen führen, die die Fahrtüchtigkeit stark beeinträchtigen', correct: true },
      { id: 'b', text: 'Medikamente neutralisieren die Wirkung von Alkohol und machen das Fahren sicherer', correct: false },
      { id: 'c', text: 'Die Kombination aus Alkohol und Medikamenten ist nur bei verschreibungspflichtigen Mitteln problematisch', correct: false },
    ],
  },
  {
    id: 'L1_48',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was versteht man unter "Fahren unter dem Einfluss von Betäubungsmitteln"?',
    answers: [
      { id: 'a', text: 'Das Führen eines Kraftfahrzeugs, nachdem illegale Drogen oder bestimmte Medikamente eingenommen wurden, die die Fahrtüchtigkeit beeinträchtigen', correct: true },
      { id: 'b', text: 'Ausschließlich das Fahren unter dem Einfluss von Alkohol', correct: false },
      { id: 'c', text: 'Nur das Fahren nach dem Konsum von Cannabis oder Heroin', correct: false },
    ],
  },
  {
    id: 'L1_49',
    topic: 'Lektion 1',
    points: 3,
    question: 'Welche Faktoren erhöhen das Unfallrisiko besonders bei Nachtfahrten?',
    answers: [
      { id: 'a', text: 'Eingeschränkte Sicht, Blendung durch Gegenverkehr, erhöhte Müdigkeit und häufigerer Alkohol- oder Drogenkonsum am Abend', correct: true },
      { id: 'b', text: 'Ausschließlich schlechtere Straßenverhältnisse und mangelnde Beleuchtung', correct: false },
      { id: 'c', text: 'Nächtliche Temperaturschwankungen, die die Fahrbahn gefährlicher machen', correct: false },
    ],
  },
  {
    id: 'L1_50',
    topic: 'Lektion 1',
    points: 3,
    question: 'Was sollte man tun, wenn man sich unsicher ist, ob man nach dem Alkohol- oder Drogenkonsum noch fahrtüchtig ist?',
    answers: [
      { id: 'a', text: 'Im Zweifel auf das Fahren verzichten – ein Taxi, öffentliche Verkehrsmittel oder ein nüchterner Fahrgemeinschaftspartner sind sichere Alternativen', correct: true },
      { id: 'b', text: 'Einen kurzen Test machen, indem man geradeaus läuft, um die eigene Fahrtüchtigkeit einzuschätzen', correct: false },
      { id: 'c', text: 'Einfach vorsichtig und langsam fahren, um das Risiko zu minimieren', correct: false },
    ],
  },

]

export function getQuestionsByTopic(topic: string): Question[] {
  return questions.filter(q => q.topic === topic)
}

export function getTopicStats() {
  const stats: Record<string, number> = {}
  for (const q of questions) {
    stats[q.topic] = (stats[q.topic] ?? 0) + 1
  }
  return stats
}
