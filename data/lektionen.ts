export interface LessonBlock {
  type: 'heading' | 'badge' | 'list' | 'highlight' | 'question' | 'answer' | 'note' | 'divider'
  text?: string
  items?: string[]
}

export interface Lesson {
  id: number
  title: string
  blocks: LessonBlock[]
}

export interface Topic {
  id: number
  title: string
  icon: string
  subtitle: string
  available: boolean
  lessons: Lesson[]
}

export const TOPICS: Topic[] = [
  {
    id: 1,
    icon: '🧠',
    title: 'Verhalten im Straßenverkehr',
    subtitle: 'Alkohol, Müdigkeit, Defensives Fahren',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 1 – Wichtige Punkte für die Theorieprüfung',
        blocks: [
          { type: 'badge', text: '⚡ Sehr oft abgefragt' },
          { type: 'heading', text: 'Alkohol & Probezeit' },
          { type: 'list', items: ['In der Probezeit gilt: 0,0 Promille'] },
          { type: 'list', items: [
            'Alkohol führt zu:',
            '→ schlechter Reaktion',
            '→ schlechter Wahrnehmung',
            '→ Selbstüberschätzung',
            '→ Müdigkeit',
          ]},
          { type: 'heading', text: 'Müdigkeit' },
          { type: 'list', items: [
            'Müdigkeit kann zu folgenden Folgen führen:',
            '→ Sekundenschlaf',
            '→ Konzentrationsfehlern',
            '→ längeren Reaktionszeiten',
          ]},
          { type: 'question', text: 'Typische Prüfungsfrage: „Wie wirkt sich Müdigkeit aus?"' },
          { type: 'answer', items: [
            'Reaktionszeit verlängert sich',
            'Aufmerksamkeit sinkt',
            'Ablenkung nimmt zu',
          ]},
          { type: 'highlight', text: 'Besonders wichtig: Ablenkung am Steuer' },
          { type: 'list', items: [
            'Handy am Steuer',
            'Navigation einstellen während der Fahrt',
            'Essen / Trinken beim Fahren',
          ]},
          { type: 'note', text: '⚠️ Schon 2 Sekunden Blindflug können gefährlich sein.' },
          { type: 'divider' },
          { type: 'heading', text: 'Gefühle & Emotionen' },
          { type: 'badge', text: '📋 Prüfungsrelevant' },
          { type: 'list', items: ['Stress', 'Aggression', 'Zeitdruck', 'Wut'] },
          { type: 'note', text: 'Diese Dinge erhöhen das Unfallrisiko.' },
          { type: 'divider' },
          { type: 'heading', text: 'Defensives Fahren' },
          { type: 'badge', text: '⚡ Sehr wichtig in Prüfungsfragen' },
          { type: 'list', items: [
            'vorausschauend fahren',
            'Fehler anderer ausgleichen',
            'Abstand halten',
            'Rücksicht nehmen',
          ]},
          { type: 'heading', text: 'Schwächere Verkehrsteilnehmer' },
          { type: 'list', items: [
            'Du musst besonders achten auf:',
            '→ Kinder',
            '→ ältere Menschen',
            '→ Fahrradfahrer',
            '→ Fußgänger',
          ]},
          { type: 'question', text: 'Typische Frage: „Warum sind Kinder im Straßenverkehr besonders gefährdet?"' },
          { type: 'answer', items: [
            'Sie können Entfernungen/Geschwindigkeiten schlecht einschätzen',
            'Sie handeln oft spontan',
          ]},
          { type: 'divider' },
          { type: 'heading', text: '📌 Merke dir' },
          { type: 'list', items: [
            'Menschliches Fehlverhalten = Hauptursache vieler Unfälle',
            'Handy + Fahren = große Gefahr',
            'Müdigkeit ≈ Wirkung wie Alkohol',
            'In Probezeit: absolut kein Alkohol',
            'Defensive Fahrer vermeiden Unfälle',
          ]},
        ],
      },
    ],
  },
  {
    id: 2,
    icon: '⚖️',
    title: 'Rechtliche Rahmenbedingungen',
    subtitle: 'Führerschein, Probezeit, Versicherung, Punkte',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 2 – Rechtliche Rahmenbedingungen (Kurzfassung)',
        blocks: [
          { type: 'highlight', text: 'In dieser Lektion geht es um die wichtigsten Regeln rund um Führerschein, Fahrzeugpapiere, Zulassung und Verantwortung im Straßenverkehr.' },
          { type: 'heading', text: 'Führerschein & Fahrerlaubnis' },
          { type: 'list', items: [
            'Du darfst nur Fahrzeuge fahren, für die du eine Fahrerlaubnis besitzt',
            'Führerschein = Nachweis der Fahrerlaubnis',
            'Beim Fahren immer mitführen',
          ]},
          { type: 'heading', text: 'Fahrzeugpapiere' },
          { type: 'highlight', text: 'Zulassungsbescheinigung Teil I (früher: Fahrzeugschein) → musst du bei Fahrten dabeihaben.' },
          { type: 'heading', text: 'Probezeit' },
          { type: 'list', items: [
            'Dauer: 2 Jahre',
            'Verstöße können folgende Konsequenzen haben:',
            '→ Probezeitverlängerung',
            '→ Aufbauseminar',
            '→ Punkte',
            '→ Fahrverbot',
          ]},
          { type: 'heading', text: 'Punkte in Flensburg' },
          { type: 'list', items: [
            'Verstöße können Punkte bringen',
            'Zu viele Punkte → Führerscheinentzug möglich',
          ]},
          { type: 'heading', text: 'Versicherungspflicht' },
          { type: 'list', items: [
            'Jedes Auto braucht eine Kfz-Haftpflichtversicherung',
            'Ohne Versicherung darf das Fahrzeug nicht gefahren werden',
          ]},
          { type: 'heading', text: 'TÜV / Hauptuntersuchung' },
          { type: 'list', items: [
            'Fahrzeuge müssen regelmäßig geprüft werden:',
            '→ Verkehrssicherheit',
            '→ Umweltvorschriften',
          ]},
          { type: 'divider' },
          { type: 'badge', text: '⚡ Sehr oft abgefragt' },
          { type: 'heading', text: 'Probezeit – Typische Prüfungsfragen' },
          { type: 'question', text: 'Wie lange dauert die Probezeit? Was passiert bei schweren Verstößen?' },
          { type: 'answer', items: [
            '2 Jahre Probezeit',
            'Alkohol in der Probezeit verboten (0,0 Promille)',
            'A-Verstoß → Probezeitverlängerung + Aufbauseminar',
          ]},
          { type: 'heading', text: 'Fahrzeugpapiere – Was musst du mitführen?' },
          { type: 'list', items: ['Führerschein', 'Zulassungsbescheinigung Teil I', 'Versicherungsnachweis'] },
          { type: 'question', text: 'Typische Prüfungsfrage: „Warum braucht man eine Haftpflichtversicherung?"' },
          { type: 'answer', items: ['Damit Schäden anderer bezahlt werden.'] },
          { type: 'heading', text: 'Punkte-System' },
          { type: 'list', items: [
            'Verstöße → Punkte in Flensburg',
            'Zu viele Punkte → Entzug der Fahrerlaubnis',
          ]},
          { type: 'heading', text: 'Verantwortlichkeit' },
          { type: 'list', items: [
            'Der Fahrer ist verantwortlich für:',
            '→ Verkehrssicherheit',
            '→ Ladung',
            '→ Mitfahrer',
            '→ Fahrzeugzustand',
          ]},
          { type: 'divider' },
          { type: 'heading', text: '📌 Merksätze für die Prüfung' },
          { type: 'list', items: [
            'Ohne Fahrerlaubnis darfst du kein Fahrzeug führen',
            'Probezeit = 2 Jahre',
            'Jedes Fahrzeug braucht Versicherung',
            'Führerschein und Fahrzeugschein mitführen',
            'Zu viele Punkte können zum Führerscheinverlust führen',
          ]},
          { type: 'note', text: '💡 Prüfungs-Tipp: Viele Fragen prüfen, ob du Verantwortung kennst – Wer haftet? Wer muss kontrollieren? Wer ist verantwortlich? Fast immer: der Fahrer bzw. Halter.' },
        ],
      },
    ],
  },
  {
    id: 3,
    icon: '🚦',
    title: 'Grundregeln & Verkehrszeichen',
    subtitle: 'Rechtsfahrgebot, Gefahrzeichen, Vorschriftzeichen',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 3 – Grundregeln / Verkehrszeichen & Verkehrseinrichtungen',
        blocks: [
          { type: 'highlight', text: 'In Lektion 3 lernst du die wichtigsten Grundregeln im Straßenverkehr sowie Verkehrszeichen und deren Bedeutung.' },

          { type: 'heading', text: 'Grundregeln im Straßenverkehr' },
          { type: 'list', items: [
            'Jeder Verkehrsteilnehmer muss:',
            '→ vorsichtig fahren',
            '→ aufmerksam sein',
            '→ Rücksicht nehmen',
            '→ niemanden gefährden',
          ]},

          { type: 'heading', text: 'Rechtsfahrgebot' },
          { type: 'note', text: '⚠️ Immer möglichst weit rechts fahren.' },
          { type: 'list', items: [
            'Besonders wichtig:',
            '→ auf mehrspurigen Straßen',
            '→ außer beim Überholen',
          ]},

          { type: 'heading', text: 'Geschwindigkeit anpassen' },
          { type: 'list', items: [
            'Du musst deine Geschwindigkeit anpassen an:',
            '→ Wetter',
            '→ Sicht',
            '→ Verkehr',
            '→ Straßenverhältnisse',
          ]},
          { type: 'note', text: '⚠️ Auch wenn kein Schild steht!' },

          { type: 'heading', text: 'Abstand halten' },
          { type: 'list', items: [
            'Genügend Abstand halten:',
            '→ nach vorne',
            '→ beim Überholen',
            '→ zu Fahrradfahrern',
          ]},
          { type: 'highlight', text: '📏 Merksatz: Abstand = Sicherheit.' },

          { type: 'divider' },
          { type: 'heading', text: 'Verkehrszeichen' },

          { type: 'heading', text: '⚠️ Gefahrzeichen' },
          { type: 'list', items: [
            'Warnen vor Gefahren:',
            '→ Kurve',
            '→ Baustelle',
            '→ Kinder',
            '→ Wildwechsel',
          ]},
          { type: 'highlight', text: '🔺 Form: Dreieckig mit rotem Rand.' },

          { type: 'heading', text: '🛑 Vorschriftzeichen' },
          { type: 'list', items: [
            'Gebote oder Verbote:',
            '→ Stoppschild',
            '→ Vorfahrt achten',
            '→ Geschwindigkeitsbegrenzung',
          ]},
          { type: 'highlight', text: '🔴 Form: Meist rund.' },

          { type: 'heading', text: '🔷 Richtzeichen' },
          { type: 'list', items: [
            'Geben Hinweise:',
            '→ Parken',
            '→ Autobahn',
            '→ Einbahnstraße',
          ]},
          { type: 'highlight', text: '🔵 Form: Meist rechteckig / blau.' },

          { type: 'heading', text: 'Verkehrseinrichtungen' },
          { type: 'list', items: [
            'Dazu gehören:',
            '→ Leitpfosten',
            '→ Baustellenbaken',
            '→ Ampeln',
            '→ Fahrbahnmarkierungen',
          ]},
          { type: 'note', text: '💡 Sie helfen bei Orientierung und Sicherheit.' },

          { type: 'divider' },
          { type: 'badge', text: '⚡ Sehr oft abgefragt' },

          { type: 'heading', text: 'Rechtsfahrgebot' },
          { type: 'question', text: 'Typische Frage: „Wo müssen Sie fahren?"' },
          { type: 'answer', items: ['Möglichst weit rechts'] },

          { type: 'heading', text: 'Geschwindigkeit – Prüfungsfalle' },
          { type: 'note', text: '⚠️ Auch ohne Tempolimit musst du langsamer fahren bei: Nebel, Regen, Schnee, schlechter Sicht.' },

          { type: 'heading', text: 'Verkehrszeichen erkennen' },
          { type: 'question', text: 'Du musst unterscheiden können: Gefahrzeichen – Vorschriftzeichen – Richtzeichen. Das kommt extrem oft dran.' },
          { type: 'answer', items: [
            'Dreieck mit rotem Rand → Gefahrzeichen',
            'Rund → Vorschriftzeichen (Gebot/Verbot)',
            'Rechteckig/Blau → Richtzeichen (Hinweis)',
          ]},

          { type: 'heading', text: 'Verkehrszeichen mit hoher Prüfungsquote' },
          { type: 'list', items: [
            'Stoppschild',
            'Vorfahrt achten',
            'Verbot der Einfahrt',
            'Einbahnstraße',
            'Fußgängerüberweg',
            'Geschwindigkeitsbegrenzung',
          ]},

          { type: 'divider' },
          { type: 'heading', text: '📌 Merksätze für die Prüfung' },
          { type: 'list', items: [
            'Fahre defensiv und rücksichtsvoll',
            'Geschwindigkeit immer anpassen',
            'Rechts fahren außer beim Überholen',
            'Verkehrszeichen früh erkennen',
            'Abstand rettet Leben',
          ]},
          { type: 'note', text: '💡 Prüfungs-Tipp: Bei Verkehrszeichen-Fragen → Form erkennen → Farbe erkennen → Bedeutung ableiten. Dreieck = Gefahr · Rund = Gebot/Verbot · Rechteckig = Hinweis' },
        ],
      },
    ],
  },
  { id: 4,  icon: '🛣️', title: 'Geschwindigkeit & Abstand',   subtitle: 'Tempolimits, Sicherheitsabstand',       available: false, lessons: [] },
  { id: 5,  icon: '🚗', title: 'Überholen & Spurwechsel',     subtitle: 'Überholverbote, Fahrspurregeln',        available: false, lessons: [] },
  { id: 6,  icon: '🅿️', title: 'Parken & Halten',             subtitle: 'Halte- und Parkverbote',               available: false, lessons: [] },
  { id: 7,  icon: '🌧️', title: 'Fahren bei schlechtem Wetter',subtitle: 'Regen, Schnee, Nebel, Eis',             available: false, lessons: [] },
  { id: 8,  icon: '🚨', title: 'Verkehrszeichen',              subtitle: 'Gebots-, Verbots- und Gefahrenzeichen', available: false, lessons: [] },
  { id: 9,  icon: '🛑', title: 'Ampeln & Lichtzeichen',        subtitle: 'Lichtzeichenanlagen, Blinkzeichen',    available: false, lessons: [] },
  { id: 10, icon: '⛽', title: 'Fahrzeugtechnik',              subtitle: 'Bremsen, Reifen, Beleuchtung',         available: false, lessons: [] },
  { id: 11, icon: '🏥', title: 'Erste Hilfe & Unfall',         subtitle: 'Verhalten nach dem Unfall, Notruf',    available: false, lessons: [] },
  { id: 12, icon: '🌍', title: 'Umwelt & Energie',             subtitle: 'Kraftstoff sparen, Emissionen',        available: false, lessons: [] },
]
