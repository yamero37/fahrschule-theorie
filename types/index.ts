export interface Answer {
  id: string
  text: string
  correct: boolean
}

export interface Question {
  id: string
  question: string
  answers: Answer[]
  topic: Topic
  points: 2 | 3 | 4 | 5
}

export type Topic =
  | 'Vorfahrt'
  | 'Verkehrszeichen'
  | 'Geschwindigkeit'
  | 'Abstand'
  | 'Überholen'
  | 'Alkohol & Drogen'
  | 'Fahrzeugtechnik'
  | 'Umweltschutz'
  | 'Autobahn'
  | 'Gefahrenlehre'
  | 'Erste Hilfe'
  | 'Ruhender Verkehr'

export const TOPICS: Topic[] = [
  'Vorfahrt',
  'Verkehrszeichen',
  'Geschwindigkeit',
  'Abstand',
  'Überholen',
  'Alkohol & Drogen',
  'Fahrzeugtechnik',
  'Umweltschutz',
  'Autobahn',
  'Gefahrenlehre',
  'Erste Hilfe',
  'Ruhender Verkehr',
]

export interface QuizState {
  currentIndex: number
  answers: Record<string, string[]>
  finished: boolean
}

export interface Progress {
  learnedIds: string[]
}
