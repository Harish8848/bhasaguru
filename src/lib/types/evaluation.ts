// Enhanced evaluation types for unified test system
import { QuestionType } from './test'

// ============================================================================
// CORE UNIFIED TYPES
// ============================================================================

export interface BaseAnswerPayload {
  questionId: string
  questionType: QuestionType
  timeSpent: number // in seconds
  timestamp: Date
  isPartial?: boolean
  metadata?: Record<string, any>
}

// Question-specific answer payloads
export interface MultipleChoiceAnswer extends BaseAnswerPayload {
  questionType: QuestionType.MULTIPLE_CHOICE
  userAnswer: {
    selectedOption: string // option ID
    isOptionIds?: string[] // for multi-select if needed
  }
}

export interface TrueFalseAnswer extends BaseAnswerPayload {
  questionType: QuestionType.TRUE_FALSE
  userAnswer: {
    value: boolean
  }
}

export interface FillBlankAnswer extends BaseAnswerPayload {
  questionType: QuestionType.FILL_BLANK
  userAnswer: {
    answers: { [blankIndex: number]: string } // for multiple blanks
    fullText?: string // complete sentence
    synonyms?: boolean // allow synonyms
  }
}

export interface MatchingAnswer extends BaseAnswerPayload {
  questionType: QuestionType.MATCHING
  userAnswer: {
    matches: { [leftItemId: string]: string } // leftItem -> rightItem mapping
    partialCredit?: boolean
  }
}

export interface AudioQuestionAnswer extends BaseAnswerPayload {
  questionType: QuestionType.AUDIO_QUESTION
  userAnswer: {
    selectedOption?: string
    textAnswer?: string
    audioResponse?: {
      audioUrl: string
      duration: number
      transcript?: string
    }
  }
}

export interface ReadingComprehensionAnswer extends BaseAnswerPayload {
  questionType: QuestionType.READING_COMPREHENSION
  userAnswer: {
    passageId: string
    answers: { [questionId: string]: any } // nested answers
    timeOnPassage: number
  }
}

export interface ListeningComprehensionAnswer extends BaseAnswerPayload {
  questionType: QuestionType.LISTENING_COMPREHENSION
  userAnswer: {
    audioId: string
    answers: { [questionId: string]: any }
    timeOnAudio: number
  }
}

export interface WritingAnswer extends BaseAnswerPayload {
  questionType: QuestionType.WRITING
  userAnswer: {
    essayType: 'task1' | 'task2'
    wordCount?: number
    content: string
    planningNotes?: string
    handwriting?: boolean // for scanned handwriting
  }
}

export interface SpeakingAnswer extends BaseAnswerPayload {
  questionType: QuestionType.SPEAKING_PART1 | QuestionType.SPEAKING_PART2 | QuestionType.SPEAKING_PART3
  userAnswer: {
    audioUrl: string
    duration: number
    transcript?: string
    preparationTime?: number
  }
}

// Union type for all answer payloads
export type AnswerPayload = 
  | MultipleChoiceAnswer 
  | TrueFalseAnswer 
  | FillBlankAnswer 
  | MatchingAnswer 
  | AudioQuestionAnswer
  | ReadingComprehensionAnswer
  | ListeningComprehensionAnswer
  | WritingAnswer
  | SpeakingAnswer

// ============================================================================
// EVALUATION RESULT TYPES
// ============================================================================

export interface BaseEvaluationResult {
  questionId: string
  questionType: QuestionType
  isCorrect: boolean
  score: number
  maxScore: number
  timeSpent: number
  feedback?: string
  status: 'completed' | 'pending' | 'manual-review' | 'skipped'
  partialCredit?: number
  evaluationMetadata?: Record<string, any>
}

export interface MultipleChoiceEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.MULTIPLE_CHOICE
  expectedOption: string
  selectedOption: string
  allOptions: { id: string; text: string; isCorrect: boolean }[]
}

export interface TrueFalseEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.TRUE_FALSE
  expectedValue: boolean
  selectedValue: boolean
}

export interface FillBlankEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.FILL_BLANK
  expectedAnswers: string[]
  providedAnswers: (string | undefined)[]
  correctBlanks: number
  totalBlanks: number
  caseSensitive: boolean
  synonymSupport: boolean
}

export interface MatchingEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.MATCHING
  expectedMatches: { [leftItemId: string]: string }
  providedMatches: { [leftItemId: string]: string }
  correctMatches: number
  totalMatches: number
  partialCreditEnabled: boolean
}

export interface AudioQuestionEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.AUDIO_QUESTION
  hasAudioResponse: boolean
  audioEvaluation?: {
    quality: number
    clarity: number
    relevance: number
  }
}

export interface ReadingComprehensionEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.READING_COMPREHENSION
  passageId: string
  nestedEvaluations: BaseEvaluationResult[]
}

export interface ListeningComprehensionEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.LISTENING_COMPREHENSION
  audioId: string
  nestedEvaluations: BaseEvaluationResult[]
}

export interface WritingEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.WRITING
  essayType: 'task1' | 'task2'
  criteriaScores: {
    taskAchievement?: number
    coherence?: number
    lexical?: number
    grammar?: number
  }
  wordCount: number
  manualReviewRequired: boolean
  aiEvaluation?: {
    confidence: number
    criteriaScores: Record<string, number>
  }
}

export interface SpeakingEvaluation extends BaseEvaluationResult {
  questionType: QuestionType.SPEAKING_PART1 | QuestionType.SPEAKING_PART2 | QuestionType.SPEAKING_PART3
  part: 1 | 2 | 3
  ieltsBands: {
    fluencyCoherence: number
    lexicalResource: number
    grammaticalRange: number
    pronunciation: number
  }
  audioAnalysis?: {
    duration: number
    wordsPerMinute: number
    pausesCount: number
    fillerWords: number
  }
  manualReviewRequired: boolean
}

export type EvaluationResult = 
  | MultipleChoiceEvaluation
  | TrueFalseEvaluation
  | FillBlankEvaluation
  | MatchingEvaluation
  | AudioQuestionEvaluation
  | ReadingComprehensionEvaluation
  | ListeningComprehensionEvaluation
  | WritingEvaluation
  | SpeakingEvaluation

// ============================================================================
// RESULT STRUCTURE TYPES
// ============================================================================

export interface SectionResult {
  sectionId: string
  sectionName: string
  standardSection?: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  score: number
  maxScore: number
  percentage: number
  timeSpent: number
  timeLimit?: number
  difficulty?: string
  language?: string
  module?: string
}

export interface TestResult {
  attemptId: string
  userId: string
  testId?: string
  examType: TestType
  level?: string
  sectionResults: SectionResult[]
  totalScore: number
  maxScore: number
  percentage: number
  status: 'pass' | 'fail' | 'pending' | 'incomplete'
  timeSpent: number
  startedAt: Date
  completedAt: Date
  submittedAt: Date
  evaluationResults: EvaluationResult[]
  passingScore?: number
  resultMetadata?: {
    autoGraded: number
    manualReview: number
    pending: number
    skipped: number
  }
}

export enum TestType {
  PRACTICE = 'PRACTICE',
  FINAL = 'FINAL',
  CERTIFICATION = 'CERTIFICATION',
  JLPT = 'JLPT',
  TOPIK = 'TOPIK',
  IELTS = 'IELTS',
  TOEFL = 'TOEFL'
}

// ============================================================================
// EVALUATION SERVICE TYPES
// ============================================================================

export interface EvaluationConfig {
  allowPartialCredit: boolean
  synonymSupport: boolean
  caseSensitive: boolean
  timePenalty?: number // points per second over time limit
  skipPenalty?: number // penalty for skipped questions
  autoSubmitTimeout?: number
}

export interface EvaluationContext {
  userId: string
  testId?: string
  examType: TestType
  level?: string
  config: EvaluationConfig
  sectionFilters?: {
    language?: string
    module?: string
    difficulty?: string
    standardSection?: string
  }
}

export interface EvaluationService {
  evaluateAnswer(
    question: any,
    answer: AnswerPayload,
    context: EvaluationContext
  ): Promise<EvaluationResult>

  evaluateBatch(
    questions: any[],
    answers: AnswerPayload[],
    context: EvaluationContext
  ): Promise<EvaluationResult[]>

  generateResult(
    evaluationResults: EvaluationResult[],
    context: EvaluationContext,
    timeSpent: number
  ): TestResult
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface EvaluationError {
  questionId: string
  error: string
  code: 'INVALID_ANSWER' | 'EVALUATION_FAILED' | 'CONFIGURATION_ERROR'
  details?: any
}

export interface BatchEvaluationResult {
  success: boolean
  results?: EvaluationResult[]
  errors?: EvaluationError[]
  summary?: {
    totalQuestions: number
    evaluated: number
    errors: number
    skipped: number
  }
}

// ============================================================================
// COMPATIBILITY TYPES FOR EVALUATION SERVICE
// ============================================================================

export interface TestSubmission {
  testId: string
  userId: string
  answers: {
    questionId: string
    selectedAnswer: string
    timeSpent?: number
  }[]
  startTime?: Date
  endTime?: Date
}

export interface SpeakingTestSubmission {
  testId: string
  userId: string
  responses: {
    questionId: string
    audioUrl: string
    transcript: string
    duration?: number
  }[]
  startTime?: Date
  endTime?: Date
}

export interface DetailedResult {
  questionId: string
  isCorrect: boolean
  correctAnswer?: string | null
  selectedAnswer?: string | null
  points: number
  feedback?: string
}

export interface EvaluationResultData {
  testId: string
  userId: string
  score: number
  correctAnswers: number
  totalQuestions: number
  passed: boolean
  detailedResults: DetailedResult[]
  feedback?: string
  createdAt: Date
}
