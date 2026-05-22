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
  {
    id: 4,
    icon: '🚂',
    title: 'Straßenverkehrssystem & Bahnübergänge',
    subtitle: 'Verkehrsteilnehmer, Bahnübergänge, Andreaskreuz',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 4 – Straßenverkehrssystem & Bahnübergänge (Kurzfassung)',
        blocks: [
          { type: 'highlight', text: 'In dieser Lektion geht es darum, wie verschiedene Verkehrsteilnehmer zusammenarbeiten und wie man sich besonders an Bahnübergängen richtig verhält.' },

          { type: 'heading', text: 'Unterschiedliche Verkehrsteilnehmer' },
          { type: 'list', items: [
            'Im Straßenverkehr gibt es:',
            '→ Autos',
            '→ Motorräder',
            '→ Fahrräder',
            '→ Fußgänger',
            '→ Busse',
            '→ LKWs',
          ]},
          { type: 'note', text: '⚠️ Jeder verhält sich unterschiedlich und hat andere Risiken.' },

          { type: 'heading', text: 'Besondere Vorsicht' },
          { type: 'list', items: [
            'Besonders gefährdet sind:',
            '→ Kinder',
            '→ ältere Menschen',
            '→ Menschen mit Behinderung',
            '→ Fahrradfahrer',
          ]},
          { type: 'highlight', text: '⚠️ Du musst jederzeit mit Fehlern anderer rechnen.' },

          { type: 'heading', text: 'Öffentliche Verkehrsmittel' },
          { type: 'list', items: [
            'Bei Bussen und Straßenbahnen:',
            '→ vorsichtig vorbeifahren',
            '→ auf aussteigende Personen achten',
            '→ ggf. Schrittgeschwindigkeit',
          ]},

          { type: 'divider' },
          { type: 'heading', text: '🚂 Bahnübergänge' },

          { type: 'heading', text: 'Verhalten am Bahnübergang' },
          { type: 'list', items: [
            'Du musst:',
            '→ Geschwindigkeit verringern',
            '→ aufmerksam sein',
            '→ auf Signale achten',
          ]},

          { type: 'heading', text: 'Wann musst du warten?' },
          { type: 'list', items: [
            'Immer warten bei:',
            '→ rotem Blinklicht',
            '→ geschlossenen Schranken',
            '→ sich senkenden Schranken',
            '→ hörbaren Signalen',
            '→ Zugverkehr',
          ]},

          { type: 'heading', text: 'Wichtig zu wissen – Züge' },
          { type: 'list', items: [
            'Züge können nicht ausweichen',
            'Züge haben einen sehr langen Bremsweg',
            'Züge sind oft schneller als sie wirken',
          ]},

          { type: 'heading', text: 'Verhalten bei Stau' },
          { type: 'note', text: '🚫 Nie auf einen Bahnübergang fahren, wenn dahinter kein Platz ist!' },

          { type: 'divider' },
          { type: 'badge', text: '⚡ Sehr oft abgefragt' },

          { type: 'heading', text: 'Andreaskreuz' },
          { type: 'highlight', text: '✖️ Das Andreaskreuz bedeutet: Bahnübergang hat Vorrang. Du musst Züge immer durchlassen.' },

          { type: 'heading', text: 'Rotes Blinklicht' },
          { type: 'question', text: 'Typische Frage: „Wie verhalten Sie sich bei rotem Blinklicht am Bahnübergang?"' },
          { type: 'answer', items: [
            'Sofort anhalten',
            'Vor dem Bahnübergang warten',
          ]},

          { type: 'heading', text: 'Überholen am Bahnübergang' },
          { type: 'note', text: '🚫 Verboten: kurz vor Bahnübergängen überholen. Sehr wichtige Prüfungsfrage!' },

          { type: 'heading', text: 'Verhalten bei Schranken' },
          { type: 'question', text: 'Was gilt schon bei sich schließenden Schranken?' },
          { type: 'answer', items: [
            'Anhalten — nicht „noch schnell rüberfahren"',
          ]},

          { type: 'heading', text: 'Halteverbot' },
          { type: 'note', text: '🚫 Vor Bahnübergängen gilt oft: absolutes Halteverbot.' },

          { type: 'divider' },
          { type: 'heading', text: '📌 Merksätze für die Prüfung' },
          { type: 'list', items: [
            'Züge haben immer Vorrang',
            'Bei Rotlicht oder Schranken immer warten',
            'Niemals auf Bahnübergängen stehen bleiben',
            'Vor Bahnübergängen nicht überholen',
            'Vorsicht bei Kindern und Fußgängern',
          ]},
          { type: 'note', text: '💡 Prüfungs-Tipp: Bei Bahnübergängen ist die sicherste Antwort fast immer richtig — lieber warten als Risiko eingehen.' },
        ],
      },
    ],
  },
  {
    id: 5,
    icon: '⬆️',
    title: 'Vorfahrt & Vorrang',
    subtitle: 'Rechts-vor-Links, Vorfahrtsschilder, Kreisverkehr',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 5 – Vorfahrt & Vorrang (Kurzfassung)',
        blocks: [
          { type: 'heading', text: 'Rechts-vor-Links' },
          { type: 'highlight', text: '📌 Gilt immer ohne Schilder: Wer von rechts kommt, fährt zuerst.' },

          { type: 'heading', text: 'Vorfahrtsschilder' },
          { type: 'list', items: [
            'Vorfahrt gewähren → Andere zuerst fahren lassen',
            'Stoppschild → Immer vollständig anhalten',
            'Einmalige Vorfahrt → Vorfahrt nur an der nächsten Kreuzung',
            'Vorfahrtsstraße → Vorfahrt auf mehreren Kreuzungen',
          ]},

          { type: 'heading', text: 'Abknickende Vorfahrtstraße' },
          { type: 'list', items: [
            'Verlauf der Straße beachten',
            'richtig blinken',
            'Gegenverkehr beachten',
          ]},

          { type: 'heading', text: 'Kreisverkehr' },
          { type: 'list', items: [
            'Mit Schild:',
            '→ Fahrzeuge im Kreis haben Vorfahrt',
            '→ beim Einfahren nicht blinken',
            '→ beim Ausfahren rechts blinken',
          ]},
          { type: 'list', items: [
            'Ohne Schild:',
            '→ oft Rechts-vor-Links',
          ]},

          { type: 'divider' },
          { type: 'badge', text: '⚡ Sehr oft abgefragt' },

          { type: 'heading', text: 'Wichtig' },
          { type: 'list', items: [
            'defensiv fahren',
            'auf Fußgänger und Fahrräder achten',
            'Kreuzungen langsam anfahren',
          ]},

          { type: 'heading', text: 'Häufige Fehler' },
          { type: 'note', text: '⚠️ Diese Fehler kommen oft in Prüfungsfragen vor:' },
          { type: 'list', items: [
            'Stoppschild nur rollen (nicht vollständig anhalten)',
            'Rechts-vor-Links vergessen',
            'Kreisverkehr falsch blinken',
            'Vorfahrtsstraße verwechseln',
          ]},

          { type: 'divider' },
          { type: 'heading', text: '📌 Merksätze für die Prüfung' },
          { type: 'list', items: [
            'Rechts vor Links gilt ohne Schild',
            'Stoppschild = vollständig anhalten, nicht rollen',
            'Kreisverkehr mit Schild → Kreis hat Vorrang',
            'Kreisverkehr ausfahren → rechts blinken',
            'Vorfahrtsstraße gilt über mehrere Kreuzungen',
          ]},
          { type: 'note', text: '💡 Prüfungs-Tipp: Bei Vorfahrt-Fragen immer zuerst prüfen — gibt es ein Schild? Wenn nein → Rechts-vor-Links.' },
        ],
      },
    ],
  },
  {
    id: 6,
    icon: '🏎️',
    title: 'Geschwindigkeit & Abstand',
    subtitle: 'Tempolimits, Bremsweg, Sicherheitsabstand',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 6 – Geschwindigkeit & Abstand',
        blocks: [
          { type: 'highlight', text: 'Das lernst du: Geschwindigkeiten richtig einschätzen · Sicherheitsabstände einhalten · Bremsweg verstehen · typische Prüfungsfehler vermeiden' },

          { type: 'heading', text: 'Geschwindigkeit' },
          { type: 'list', items: [
            'Innerorts → maximal 50 km/h (wenn nichts anderes vorgeschrieben)',
            'Außerorts → maximal 100 km/h mit dem Pkw',
            'Autobahn → Richtgeschwindigkeit 130 km/h',
          ]},

          { type: 'heading', text: 'Geschwindigkeit anpassen' },
          { type: 'list', items: [
            'Du musst langsamer fahren bei:',
            '→ Regen',
            '→ Nebel',
            '→ Schnee',
            '→ Dunkelheit',
            '→ schlechter Sicht',
            '→ viel Verkehr',
            '→ engen Kurven',
          ]},

          { type: 'divider' },
          { type: 'heading', text: 'Sicherheitsabstand' },

          { type: 'heading', text: 'Grundregel' },
          { type: 'highlight', text: '📏 Abstand = halber Tachowert. Beispiel: 100 km/h → mindestens 50 Meter Abstand.' },

          { type: 'heading', text: 'Warum Abstand wichtig ist' },
          { type: 'list', items: [
            'Zu wenig Abstand führt zu:',
            '→ längerem Bremsweg',
            '→ höherer Unfallgefahr',
            '→ wenig Reaktionszeit',
          ]},

          { type: 'divider' },
          { type: 'badge', text: '⚡ Sehr oft abgefragt – Formeln' },

          { type: 'heading', text: 'Reaktionsweg' },
          { type: 'highlight', text: 'Strecke, die du während des Reagierens zurücklegst.' },
          { type: 'note', text: '🧮 Formel: Geschwindigkeit ÷ 10 × 3\nBeispiel bei 50 km/h: 5 × 3 = 15 Meter' },

          { type: 'heading', text: 'Bremsweg' },
          { type: 'highlight', text: 'Strecke vom Bremsen bis zum Stillstand.' },
          { type: 'note', text: '🧮 Formel: (Geschwindigkeit ÷ 10) × (Geschwindigkeit ÷ 10)\nBeispiel bei 50 km/h: 5 × 5 = 25 Meter' },

          { type: 'heading', text: 'Anhalteweg' },
          { type: 'question', text: 'Was ist der Anhalteweg bei 50 km/h?' },
          { type: 'answer', items: [
            'Reaktionsweg + Bremsweg = Anhalteweg',
            '15 m + 25 m = 40 Meter',
          ]},

          { type: 'divider' },
          { type: 'heading', text: 'Wichtige Regeln' },
          { type: 'list', items: [
            'Immer vorausschauend fahren',
            'Abstand bei schlechtem Wetter vergrößern',
            'Nicht drängeln',
            'Geschwindigkeit der Situation anpassen',
          ]},

          { type: 'heading', text: 'Häufige Fehler' },
          { type: 'note', text: '⚠️ Diese Fehler kommen oft in Prüfungsfragen vor:' },
          { type: 'list', items: [
            'Zu dicht auffahren',
            'Bremsweg unterschätzen',
            'Bei Regen zu schnell fahren',
            'Nur auf Tempolimits achten statt auf die Verkehrssituation',
          ]},

          { type: 'divider' },
          { type: 'heading', text: '📌 Merksätze für die Prüfung' },
          { type: 'list', items: [
            'Innerorts: 50 km/h · Außerorts: 100 km/h · Autobahn: 130 km/h (Richtlinie)',
            'Abstand = halber Tachowert in Metern',
            'Reaktionsweg: (v ÷ 10) × 3',
            'Bremsweg: (v ÷ 10) × (v ÷ 10)',
            'Anhalteweg = Reaktionsweg + Bremsweg',
            'Bei schlechtem Wetter immer mehr Abstand',
          ]},
          { type: 'note', text: '💡 Prüfungs-Tipp: Rechenaufgaben zum Bremsweg kommen oft vor — die Formeln auswendig lernen!' },
        ],
      },
    ],
  },
  {
    id: 7,
    icon: '🚀',
    title: 'Überholen & Vorbeifahren',
    subtitle: 'Überholregeln, Überholverbot, Seitenabstand',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 7 – Überholen & Vorbeifahren',
        blocks: [
          { type: 'highlight', text: 'Das lernst du: richtig überholen · Gefahren erkennen · sicheres Vorbeifahren · Überholverbote verstehen' },

          { type: 'heading', text: 'Grundregeln beim Überholen' },
          { type: 'list', items: [
            'Vor dem Überholen musst du:',
            '→ den Verkehr beobachten',
            '→ genügend Abstand halten',
            '→ den Blinker setzen',
            '→ sicherstellen, dass niemand gefährdet wird',
          ]},
          { type: 'list', items: [
            'Überholen nur wenn:',
            '→ die Straße frei ist',
            '→ genügend Sicht vorhanden ist',
            '→ genug Platz vorhanden ist',
            '→ niemand behindert wird',
          ]},

          { type: 'heading', text: 'Überholverbot' },
          { type: 'note', text: '🚫 Du darfst nicht überholen:' },
          { type: 'list', items: [
            'bei unklarer Verkehrslage',
            'in Kurven',
            'bei schlechter Sicht',
            'an Fußgängerüberwegen',
            'wenn ein Überholverbotsschild vorhanden ist',
          ]},

          { type: 'heading', text: 'Rechts überholen' },
          { type: 'highlight', text: '📌 Grundsatz: Links überholen!' },
          { type: 'list', items: [
            'Rechts überholen nur in bestimmten Situationen erlaubt:',
            '→ auf Autobahnen bei Stau',
            '→ auf mehreren Fahrstreifen in gleicher Richtung',
          ]},

          { type: 'divider' },
          { type: 'heading', text: 'Vorbeifahren' },
          { type: 'highlight', text: 'Vorbeifahren = an haltenden Fahrzeugen oder Hindernissen vorbeifahren.' },
          { type: 'list', items: [
            'Dabei:',
            '→ langsam fahren',
            '→ genügend Seitenabstand halten',
            '→ auf Fußgänger und Gegenverkehr achten',
          ]},

          { type: 'heading', text: 'Seitenabstand' },
          { type: 'badge', text: '⚡ Sehr oft abgefragt' },
          { type: 'list', items: [
            'Besonders wichtig bei:',
            '→ Fahrrädern',
            '→ E-Scootern',
            '→ Fußgängern',
          ]},
          { type: 'note', text: '⚠️ Zu wenig Seitenabstand kann sehr gefährlich sein!' },

          { type: 'heading', text: 'Verhalten nach dem Überholen' },
          { type: 'list', items: [
            'genügend Abstand halten',
            'erst dann wieder einscheren',
            'niemanden schneiden',
          ]},

          { type: 'divider' },
          { type: 'heading', text: 'Häufige Fehler' },
          { type: 'note', text: '⚠️ Diese Fehler kommen oft in Prüfungsfragen vor:' },
          { type: 'list', items: [
            'trotz schlechter Sicht überholen',
            'zu knapp einscheren',
            'Gegenverkehr unterschätzen',
            'Fahrradfahrer zu eng überholen',
          ]},

          { type: 'divider' },
          { type: 'heading', text: '📌 Merksätze für die Prüfung' },
          { type: 'list', items: [
            'Immer links überholen — rechts nur in Ausnahmen',
            'Vor dem Überholen: Beobachten, Blinken, Sicherheit prüfen',
            'In Kurven und bei schlechter Sicht nie überholen',
            'An Fußgängerüberwegen nicht überholen',
            'Seitenabstand zu Fahrrädern und Fußgängern einhalten',
            'Erst einscheren wenn genügend Abstand da ist',
          ]},
          { type: 'note', text: '💡 Prüfungs-Tipp: Bei Überholfragen immer prüfen — gibt es ein Verbot? Genug Sicht? Genug Platz? Wenn nicht sicher: nicht überholen.' },
        ],
      },
    ],
  },
  {
    id: 8,
    icon: '🅿️',
    title: 'Halten & Parken',
    subtitle: 'Halteverbot, Parkverbot, sicheres Aussteigen',
    available: true,
    lessons: [
      {
        id: 1,
        title: 'Lektion 8 – Halten & Parken',
        blocks: [
          { type: 'highlight', text: 'Das lernst du: Unterschied zwischen Halten und Parken · wo Halten und Parken verboten ist · sicheres Ein- und Aussteigen · typische Prüfungsfallen' },

          { type: 'heading', text: 'Halten' },
          { type: 'list', items: [
            'Halten bedeutet:',
            '→ freiwillige Fahrtunterbrechung bis 3 Minuten',
            '→ oder zum Ein- und Aussteigen',
          ]},

          { type: 'heading', text: 'Parken' },
          { type: 'list', items: [
            'Parken bedeutet:',
            '→ länger als 3 Minuten stehen',
            '→ oder Fahrzeug verlassen',
          ]},

          { type: 'highlight', text: '📌 Merke: Halten ≤ 3 Min. / Parken > 3 Min. oder Fahrzeug verlassen.' },

          { type: 'divider' },
          { type: 'heading', text: 'Halteverbot' },
          { type: 'badge', text: '⚡ Sehr oft abgefragt' },
          { type: 'note', text: '🚫 Du darfst nicht halten:' },
          { type: 'list', items: [
            'an engen Stellen',
            'auf Schutzstreifen',
            'auf Bahnübergängen',
            'auf Busspuren',
            'in Feuerwehrzufahrten',
          ]},

          { type: 'heading', text: 'Parkverbot' },
          { type: 'note', text: '🚫 Du darfst nicht parken:' },
          { type: 'list', items: [
            'vor Einfahrten',
            'vor abgesenkten Bordsteinen',
            'nahe Kreuzungen und Einmündungen',
            'auf Gehwegen ohne Erlaubnis',
          ]},

          { type: 'divider' },
          { type: 'heading', text: 'Sicheres Aussteigen' },
          { type: 'list', items: [
            'Vor dem Öffnen der Tür:',
            '→ Spiegel prüfen',
            '→ Schulterblick machen',
            '→ auf Fahrräder und Fahrzeuge achten',
          ]},
          { type: 'note', text: '⚠️ Dooring-Gefahr: Unachtsamkeit beim Türöffnen ist eine häufige Unfallursache!' },

          { type: 'heading', text: 'Parken bei Dunkelheit' },
          { type: 'list', items: [
            'Außerorts:',
            '→ möglichst Parkplätze nutzen',
            '→ Beleuchtung beachten',
          ]},

          { type: 'heading', text: 'Umweltbewusstes Verhalten' },
          { type: 'list', items: [
            'Motor nicht unnötig laufen lassen',
            'platzsparend parken',
            'andere nicht behindern',
          ]},

          { type: 'divider' },
          { type: 'heading', text: 'Häufige Fehler' },
          { type: 'note', text: '⚠️ Diese Fehler kommen oft in Prüfungsfragen vor:' },
          { type: 'list', items: [
            'zu nah an Kreuzungen parken',
            'Fahrradfahrer beim Aussteigen übersehen',
            'Halten und Parken verwechseln',
            'Einfahrten blockieren',
          ]},

          { type: 'divider' },
          { type: 'heading', text: '📌 Merksätze für die Prüfung' },
          { type: 'list', items: [
            'Halten = max. 3 Minuten / Parken = länger oder Fahrzeug verlassen',
            'Halteverbot gilt auch fürs Parken',
            'Parkverbot: vor Einfahrten, abgesenkten Bordsteinen, Kreuzungen',
            'Vor dem Türöffnen: Spiegel + Schulterblick',
            'Feuerwehrzufahrten immer freihalten',
          ]},
          { type: 'note', text: '💡 Prüfungs-Tipp: Bei Halten/Parken-Fragen immer prüfen — steht ein absolutes Halteverbot? Dann gilt es für beides. Steht nur ein Parkverbot? Dann darf man kurz halten.' },
        ],
      },
    ],
  },
  { id: 9,  icon: '🛑', title: 'Ampeln & Lichtzeichen',        subtitle: 'Lichtzeichenanlagen, Blinkzeichen',    available: false, lessons: [] },
  { id: 10, icon: '⛽', title: 'Fahrzeugtechnik',              subtitle: 'Bremsen, Reifen, Beleuchtung',         available: false, lessons: [] },
  { id: 11, icon: '🏥', title: 'Erste Hilfe & Unfall',         subtitle: 'Verhalten nach dem Unfall, Notruf',    available: false, lessons: [] },
  { id: 12, icon: '🌍', title: 'Umwelt & Energie',             subtitle: 'Kraftstoff sparen, Emissionen',        available: false, lessons: [] },
]
