// Client-side types for test functionality
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
  MATCHING = 'MATCHING',
  AUDIO_QUESTION = 'AUDIO_QUESTION',
  SPEAKING_PART1 = 'SPEAKING_PART1',
  SPEAKING_PART2 = 'SPEAKING_PART2',
  SPEAKING_PART3 = 'SPEAKING_PART3'
}

export enum TestType {
  PRACTICE = 'PRACTICE',
  FINAL = 'FINAL',
  CERTIFICATION = 'CERTIFICATION'
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
