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
  | 'Lektion 1'
  | 'Lektion 2'
  | 'Lektion 3'
  | 'Lektion 4'
  | 'Lektion 5'
  | 'Lektion 6'
  | 'Lektion 7'
  | 'Lektion 8'
  | 'Lektion 9'
  | 'Lektion 10'
  | 'Lektion 11'
  | 'Lektion 12'
  | 'B1 Lektion 1'
  | 'B1 Lektion 2'
  | 'B1 Lektion 3'
  | 'B1 Lektion 4'
  | 'B1 Lektion 5'
  | 'B1 Lektion 6'
  | 'B1 Lektion 7'
  | 'B1 Lektion 8'
  | 'B1 Lektion 9'
  | 'B1 Lektion 10'
  | 'B1 Lektion 11'
  | 'B1 Lektion 12'

export const TOPICS: Topic[] = [
  'Lektion 1',
  'Lektion 2',
  'Lektion 3',
  'Lektion 4',
  'Lektion 5',
  'Lektion 6',
  'Lektion 7',
  'Lektion 8',
  'Lektion 9',
  'Lektion 10',
  'Lektion 11',
  'Lektion 12',
  'B1 Lektion 1',
  'B1 Lektion 2',
  'B1 Lektion 3',
  'B1 Lektion 4',
  'B1 Lektion 5',
  'B1 Lektion 6',
  'B1 Lektion 7',
  'B1 Lektion 8',
  'B1 Lektion 9',
  'B1 Lektion 10',
  'B1 Lektion 11',
  'B1 Lektion 12',
]

export interface QuizState {
  currentIndex: number
  answers: Record<string, string[]>
  finished: boolean
}

export interface Progress {
  learnedIds: string[]
}
