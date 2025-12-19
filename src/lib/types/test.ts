// Client-side types for test functionality
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
  MATCHING = 'MATCHING',
  AUDIO_QUESTION = 'AUDIO_QUESTION',
  SPEAKING_PART1 = 'SPEAKING_PART1',
  SPEAKING_PART2 = 'SPEAKING_PART2',
  SPEAKING_PART3 = 'SPEAKING_PART3',
  READING_COMPREHENSION = 'READING_COMPREHENSION',
  LISTENING_COMPREHENSION = 'LISTENING_COMPREHENSION',
  WRITING = 'WRITING'
}

export enum TestType {
  PRACTICE = 'PRACTICE',
  FINAL = 'FINAL',
  CERTIFICATION = 'CERTIFICATION'
}

export interface QuestionOption {
  id: string
  text: string
  isCorrect?: boolean
}

export interface Question {
  id: string
  type: QuestionType
  questionText: string
  audioUrl?: string
  imageUrl?: string
  options?: QuestionOption[]
  explanation?: string
  points: number
  // Additional metadata
  difficulty?: string
  timeLimit?: number
  tags?: string[]
}

export interface SpeakingQuestion {
  id: string
  type: 'SPEAKING_PART1' | 'SPEAKING_PART2' | 'SPEAKING_PART3'
  questionText: string
  preparationTime?: number
  speakingTime?: number
  cueCardContent?: string
  followUpQuestions?: string[]
  order: number
}

export interface MockTest {
  id: string
  title: string
  description?: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
  type: string
  duration: number
  questionsCount: number
  passingScore: number
}

export interface TestResult {
  attemptId: string
  score: number
  correctAnswers: number
  totalQuestions: number
  passed: boolean
  timeSpent: number
  earnedPoints: number
  totalPoints: number
}

export interface Answer {
  questionId: string
  selectedOption?: string
  textAnswer?: string
}
