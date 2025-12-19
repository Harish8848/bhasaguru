// Unified Evaluation Service - Handles all question types with standardized evaluation logic

import { prisma } from './prisma';
import { QuestionType } from './types/test';

// CORE UNIFIED TYPES

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

// EVALUATION RESULT TYPES

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

// EVALUATION SERVICE TYPES

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

export interface EvaluationError {
  questionId: string
  error: string
  code: 'INVALID_ANSWER' | 'EVALUATION_FAILED' | 'CONFIGURATION_ERROR'
  details?: any
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

// EVALUATION SERVICE IMPLEMENTATION

export class UnifiedEvaluationService implements EvaluationService {
  private readonly defaultConfig: EvaluationConfig = {
    allowPartialCredit: true,
    synonymSupport: true,
    caseSensitive: false,
    timePenalty: 0,
    skipPenalty: 0
  };

    // PUBLIC API

  async evaluateAnswer(
    question: any,
    answer: AnswerPayload,
    context: EvaluationContext
  ): Promise<EvaluationResult> {
    const config: EvaluationConfig = {
      ...this.defaultConfig,
      ...(context?.config ?? {})
    };

    try {
      switch (answer.questionType) {
        case QuestionType.MULTIPLE_CHOICE:
          return this.evaluateMultipleChoice(question, answer as MultipleChoiceAnswer, config);
        case QuestionType.TRUE_FALSE:
          return this.evaluateTrueFalse(question, answer as TrueFalseAnswer, config);
        case QuestionType.FILL_BLANK:
          return this.evaluateFillBlank(question, answer as FillBlankAnswer, config);
        case QuestionType.MATCHING:
          return this.evaluateMatching(question, answer as MatchingAnswer, config);
        case QuestionType.AUDIO_QUESTION:
          return this.evaluateAudioQuestion(question, answer as AudioQuestionAnswer, config);
        case QuestionType.READING_COMPREHENSION:
          return this.evaluateReadingComprehension(question, answer as ReadingComprehensionAnswer, config);
        case QuestionType.LISTENING_COMPREHENSION:
          return this.evaluateListeningComprehension(question, answer as ListeningComprehensionAnswer, config);
        case QuestionType.WRITING:
          return this.evaluateWriting(question, answer as WritingAnswer, config);

        case QuestionType.SPEAKING_PART1:
        case QuestionType.SPEAKING_PART2:
        case QuestionType.SPEAKING_PART3:
          return this.evaluateSpeaking(question, answer as SpeakingAnswer, config);
        default:
          // This should never happen with proper type coverage
          const _exhaustiveCheck: never = answer;
          throw new Error(`Unsupported question type: ${(answer as any).questionType}`);
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
      throw err;
    }
  }

    // QUESTION TYPE HANDLERS

  private evaluateMultipleChoice(question: any, answer: MultipleChoiceAnswer, config: EvaluationConfig): MultipleChoiceEvaluation {
    const expected = question.correctAnswer;
    const selected = answer.userAnswer?.selectedOption;
    const isCorrect = expected === selected;
    const maxScore = question.points ?? 1;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.MULTIPLE_CHOICE,
      isCorrect,
      score: isCorrect ? maxScore : 0,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'completed',
      expectedOption: expected,
      selectedOption: selected,
      allOptions: Array.isArray(question.options) ? question.options : [],
      partialCredit: 0,
      evaluationMetadata: {}
    };
  }

  private evaluateTrueFalse(question: any, answer: TrueFalseAnswer, config: EvaluationConfig): TrueFalseEvaluation {
    const expected = Boolean(question.correctAnswer);
    const selected = Boolean(answer.userAnswer?.value);
    const isCorrect = expected === selected;
    const maxScore = question.points ?? 1;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.TRUE_FALSE,
      isCorrect,
      score: isCorrect ? maxScore : 0,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'completed',
      expectedValue: expected,
      selectedValue: selected,
      partialCredit: 0,
      evaluationMetadata: {}
    };
  }

  private evaluateFillBlank(question: any, answer: FillBlankAnswer, config: EvaluationConfig): FillBlankEvaluation {
    const expectedAnswers: string[] = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : [question.correctAnswer];

    const provided: Record<number, string> = answer.userAnswer?.answers ?? {};

    let correct = 0;
    expectedAnswers.forEach((exp, idx) => {
      if (this.compareAnswers(exp, provided[idx], config)) correct++;
    });

    const total = expectedAnswers.length || 1;
    const ratio = correct / total;
    const maxScore = question.points ?? 1;
    const score = (config.allowPartialCredit ? ratio : Number(ratio === 1)) * maxScore;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.FILL_BLANK,
      isCorrect: correct === total,
      score,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'completed',
      expectedAnswers,
      providedAnswers: Object.values(provided),
      correctBlanks: correct,
      totalBlanks: total,
      caseSensitive: config.caseSensitive,
      synonymSupport: config.synonymSupport,
      partialCredit: ratio,
      evaluationMetadata: {}
    };
  }

  private evaluateMatching(question: any, answer: MatchingAnswer, config: EvaluationConfig): MatchingEvaluation {
    const expected: Record<string, string> = question.correctAnswer ?? {};
    const provided: Record<string, string> = answer.userAnswer?.matches ?? {};

    const keys = Object.keys(expected);
    const total = keys.length || 1;

    let correct = 0;
    keys.forEach(k => {
      if (expected[k] === provided[k]) correct++;
    });

    const ratio = correct / total;
    const maxScore = question.points ?? 1;
    const score = (config.allowPartialCredit ? ratio : Number(ratio === 1)) * maxScore;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.MATCHING,
      isCorrect: correct === total,
      score,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'completed',
      expectedMatches: expected,
      providedMatches: provided,
      correctMatches: correct,
      totalMatches: total,
      partialCreditEnabled: config.allowPartialCredit,
      partialCredit: ratio,
      evaluationMetadata: {}
    };
  }

  private evaluateAudioQuestion(question: any, answer: AudioQuestionAnswer, config: EvaluationConfig): AudioQuestionEvaluation {
    const audio = answer.userAnswer?.audioResponse;
    const maxScore = question.points ?? 1;

    if (!audio) {
      return {
        questionId: answer.questionId,
        questionType: QuestionType.AUDIO_QUESTION,
        isCorrect: false,
        score: 0,
        maxScore,
        timeSpent: answer.timeSpent ?? 0,
        status: 'manual-review',
        hasAudioResponse: false,
        audioEvaluation: {
          quality: 0,
          clarity: 0,
          relevance: 0
        },
        partialCredit: 0,
        evaluationMetadata: { manualReviewRequired: true }
      };
    }

    const quality = this.evaluateAudioQuality(audio);
    const score = quality * maxScore;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.AUDIO_QUESTION,
      isCorrect: score >= maxScore * 0.6,
      score,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'manual-review',
      hasAudioResponse: true,
      audioEvaluation: {
        quality,
        clarity: quality * 0.8,
        relevance: quality * 0.9
      },
      partialCredit: quality,
      evaluationMetadata: { manualReviewRequired: true }
    };
  }

  private evaluateReadingComprehension(question: any, answer: ReadingComprehensionAnswer, config: EvaluationConfig): ReadingComprehensionEvaluation {
    const answers = answer.userAnswer?.answers ?? {};
    const subs = question.questions ?? [];

    let correct = 0;
    subs.forEach((q: any) => {
      if (this.compareAnswers(q.correctAnswer, answers[q.id], config)) correct++;
    });

    const total = subs.length || 1;
    const ratio = correct / total;
    const maxScore = question.points ?? 1;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.READING_COMPREHENSION,
      isCorrect: correct === total,
      score: ratio * maxScore,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'completed',
      passageId: answer.userAnswer?.passageId || '',
      nestedEvaluations: [],
      partialCredit: ratio,
      evaluationMetadata: {}
    };
  }

  private evaluateListeningComprehension(question: any, answer: ListeningComprehensionAnswer, config: EvaluationConfig): ListeningComprehensionEvaluation {
    const answers = answer.userAnswer?.answers ?? {};
    const subs = question.questions ?? [];

    let correct = 0;
    subs.forEach((q: any) => {
      if (this.compareAnswers(q.correctAnswer, answers[q.id], config)) correct++;
    });

    const total = subs.length || 1;
    const ratio = correct / total;
    const maxScore = question.points ?? 1;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.LISTENING_COMPREHENSION,
      isCorrect: correct === total,
      score: ratio * maxScore,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'completed',
      audioId: answer.userAnswer?.audioId || '',
      nestedEvaluations: [],
      partialCredit: ratio,
      evaluationMetadata: {}
    };
  }

  private evaluateWriting(question: any, answer: WritingAnswer, config: EvaluationConfig): WritingEvaluation {
    const content = answer.userAnswer?.content ?? '';
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const lengthScore = this.evaluateWritingLength(wordCount, question.expectedWordCount);
    const coherenceScore = this.evaluateWritingCoherence(content);

    const avg = (lengthScore + coherenceScore) / 2;
    const maxScore = question.points ?? 1;

    return {
      questionId: answer.questionId,
      questionType: QuestionType.WRITING,
      isCorrect: avg >= 0.6,
      score: avg * maxScore,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'manual-review',
      essayType: answer.userAnswer?.essayType || 'task2',
      criteriaScores: {
        taskAchievement: avg,
        coherence: coherenceScore,
        lexical: avg * 0.8,
        grammar: avg * 0.85
      },
      wordCount,
      manualReviewRequired: true,
      aiEvaluation: {
        confidence: avg,
        criteriaScores: {
          taskAchievement: avg,
          coherence: coherenceScore,
          lexical: avg * 0.8,
          grammar: avg * 0.85
        }
      },
      partialCredit: avg,
      evaluationMetadata: { manualReviewRequired: true }
    };
  }

  private evaluateSpeaking(question: any, answer: SpeakingAnswer, config: EvaluationConfig): SpeakingEvaluation {
    // For speaking answers, we don't have audioResponse - the audio data is at the top level
    const duration = answer.userAnswer?.duration ?? 0;
    const transcript = answer.userAnswer?.transcript || '';

    const fluency = this.evaluateSpeakingFluency(duration);
    const lexical = this.evaluateSpeakingLexical(transcript);
    const grammar = this.evaluateSpeakingGrammar(transcript);
    const pronunciation = this.evaluateSpeakingPronunciation(transcript);

    const band = (fluency + lexical + grammar + pronunciation) / 4;
    const maxScore = question.points ?? 1;

    return {
      questionId: answer.questionId,
      questionType: answer.questionType,
      isCorrect: band >= 6,
      score: (band / 9) * maxScore,
      maxScore,
      timeSpent: answer.timeSpent ?? 0,
      status: 'manual-review',
      part: answer.questionType === QuestionType.SPEAKING_PART1 ? 1 : 
            answer.questionType === QuestionType.SPEAKING_PART2 ? 2 : 3,
      ieltsBands: {
        fluencyCoherence: fluency,
        lexicalResource: lexical,
        grammaticalRange: grammar,
        pronunciation: pronunciation
      },
      audioAnalysis: {
        duration,
        wordsPerMinute: duration > 0 ? transcript.split(' ').length / (duration / 60) : 0,
        pausesCount: Math.floor(duration / 2),
        fillerWords: (transcript.match(/\b(um|uh|like|you know)\b/gi) || []).length
      },
      manualReviewRequired: true,
      partialCredit: band / 9,
      evaluationMetadata: { manualReviewRequired: true }
    };
  }

    // BATCH EVALUATION
  

  async evaluateBatch(
    questions: any[],
    answers: AnswerPayload[],
    context: EvaluationContext
  ): Promise<BatchEvaluationResult> {
    const results: EvaluationResult[] = [];
    const errors: EvaluationError[] = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        errors.push({ 
          questionId: answer.questionId, 
          error: 'Question not found', 
          code: 'EVALUATION_FAILED',
          details: { questionId: answer.questionId }
        });
        continue;
      }

      try {
        results.push(await this.evaluateAnswer(question, answer, context));
      } catch (e: any) {
        errors.push({ 
          questionId: answer.questionId, 
          error: e.message, 
          code: 'EVALUATION_FAILED',
          details: e
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        totalQuestions: answers.length,
        evaluated: results.length,
        errors: errors.length,
        skipped: answers.length - results.length - errors.length
      }
    };
  }

  generateResult(
    evaluationResults: EvaluationResult[],
    context: EvaluationContext,
    timeSpent: number
  ): TestResult {
    let totalScore = 0;
    let maxScore = 0;
    let correctAnswers = 0;
    let manualReviewCount = 0;
    let skippedCount = 0;

    // Group by section if section filters or metadata available
    // For now, we'll do a simple aggregation and single "Default" section if none provided
    const sectionResultsMap = new Map<string, SectionResult>();

    for (const result of evaluationResults) {
      totalScore += result.score;
      maxScore += result.maxScore;
      
      if (result.status === 'manual-review') {
        manualReviewCount++;
      } else if (result.status === 'skipped') {
        skippedCount++;
      }
      
      if (result.isCorrect) {
        correctAnswers++;
      }

      // Basic section grouping logic (can be enhanced with question metadata)
      const sectionId = 'default'; // This would come from question metadata in a real scenario
      if (!sectionResultsMap.has(sectionId)) {
        sectionResultsMap.set(sectionId, {
          sectionId,
          sectionName: 'General Section',
          totalQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          skippedAnswers: 0,
          score: 0,
          maxScore: 0,
          percentage: 0,
          timeSpent: 0
        });
      }

      const section = sectionResultsMap.get(sectionId)!;
      section.totalQuestions++;
      section.score += result.score;
      section.maxScore += result.maxScore;
      section.timeSpent += result.timeSpent;

      if (result.isCorrect) section.correctAnswers++;
      else if (result.status === 'skipped') section.skippedAnswers++;
      else section.wrongAnswers++;
    }

    // Calculate percentages for sections
    const sectionResults = Array.from(sectionResultsMap.values()).map(s => ({
      ...s,
      percentage: s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0
    }));

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passingScore = 60; // Default passing percentage if not in context
    const isPassed = percentage >= passingScore;

    return {
      attemptId: '', // Would be generated or passed
      userId: context.userId,
      testId: context.testId,
      examType: context.examType,
      level: context.level,
      sectionResults,
      totalScore,
      maxScore,
      percentage,
      status: manualReviewCount > 0 ? 'pending' : (isPassed ? 'pass' : 'fail'),
      timeSpent,
      startedAt: new Date(Date.now() - timeSpent * 1000),
      completedAt: new Date(),
      submittedAt: new Date(),
      evaluationResults,
      passingScore: passingScore, // This should ideally come from Test entity
      resultMetadata: {
        autoGraded: evaluationResults.length - manualReviewCount,
        manualReview: manualReviewCount,
        pending: manualReviewCount,
        skipped: skippedCount
      }
    };
  }

    // HELPERS

  private compareAnswers(expected?: string, provided?: string, config?: EvaluationConfig): boolean {
    if (!expected || !provided) return false;
    const e = config?.caseSensitive ? expected : expected.toLowerCase();
    const p = config?.caseSensitive ? provided : provided.toLowerCase();
    if (e === p) return true;
    return config?.synonymSupport ? this.checkSynonyms(e, p) : false;
  }

  private checkSynonyms(expected: string, provided: string): boolean {
    const map: Record<string, string[]> = {
      big: ['large', 'huge', 'enormous'],
      small: ['tiny', 'little', 'miniature'],
      good: ['great', 'excellent', 'wonderful', 'fantastic'],
      bad: ['poor', 'terrible', 'awful', 'horrible'],
      happy: ['joyful', 'pleased', 'delighted', 'cheerful'],
      sad: ['unhappy', 'sorrowful', 'melancholy', 'depressed'],
      fast: ['quick', 'rapid', 'swift', 'speedy'],
      slow: ['gradual', 'leisurely', 'unhurried']
    };
    
    return map[expected]?.includes(provided) ?? false;
  }

  private evaluateAudioQuality(audio: any): number {
    if (!audio) return 0;
    
    // Basic audio quality evaluation
    let score = 0;
    
    // Duration check
    if (audio.duration && audio.duration > 1) score += 0.3;
    if (audio.duration && audio.duration > 5) score += 0.2;
    
    // Transcript check
    if (audio.transcript && audio.transcript.length > 10) score += 0.3;
    if (audio.transcript && audio.transcript.length > 50) score += 0.2;
    
    return Math.min(score, 1);
  }

  private evaluateWritingLength(words: number, expected?: number): number {
    if (!expected) return 0.8;
    const ratio = words / expected;
    if (ratio >= 0.9 && ratio <= 1.1) return 1;
    if (ratio >= 0.75) return 0.7;
    if (ratio >= 0.5) return 0.5;
    return 0.3;
  }

  private evaluateWritingCoherence(content: string): number {
    if (content.length < 50) return 0.3;
    if (content.length < 150) return 0.6;
    
    // Simple coherence check based on structure
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
    if (sentences.length >= 3) return 0.8;
    if (sentences.length >= 2) return 0.6;
    return 0.4;
  }

  private evaluateSpeakingFluency(duration: number): number {
    // Basic fluency assessment based on duration
    if (duration < 10) return 3;
    if (duration < 30) return 5;
    if (duration < 60) return 7;
    if (duration < 120) return 8;
    return 6;
  }

  private evaluateSpeakingLexical(transcript: string): number {
    // Basic lexical diversity check
    const words = transcript.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const diversity = uniqueWords.size / words.length;
    
    if (diversity > 0.7) return 8;
    if (diversity > 0.5) return 6;
    if (diversity > 0.3) return 4;
    return 3;
  }

  private evaluateSpeakingGrammar(transcript: string): number {
    // Basic grammar assessment (simplified)
    const sentences = transcript.toLowerCase().split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    
    // Check for basic grammar patterns
    const hasProperSentences = sentences.every((s: string) => s.trim().split(' ').length >= 3);
    const hasVariedSentenceLength = sentences.some((s: string) => s.split(' ').length > 5);
    
    if (hasProperSentences && hasVariedSentenceLength) return 7;
    if (hasProperSentences) return 6;
    if (sentences.length > 0) return 4;
    return 3;
  }

  private evaluateSpeakingPronunciation(transcript: string): number {
    // Simplified pronunciation assessment
    const hasClearWords = transcript.split(' ').some((word: string) => word.length > 2);
    
    if (hasClearWords && transcript.length > 20) return 6;
    if (hasClearWords) return 5;
    return 4;
  }
}

// COMPATIBILITY TYPES FOR EVALUATION SERVICE

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
  ): Promise<BatchEvaluationResult>

  generateResult(
    evaluationResults: EvaluationResult[],
    context: EvaluationContext,
    timeSpent: number
  ): TestResult
}
