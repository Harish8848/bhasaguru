// Test Type to Question Type mapping for scalable and extensible question creation
export const TEST_TYPE_QUESTION_MAPPING = {
  READING: [
    'MULTIPLE_CHOICE',
    'FILL_BLANK',
    'TRUE_FALSE',
    'MATCHING',
    // 'READING_COMPREHENSION' - optional, can be added later
  ] as const,

  LISTENING: [
    'MULTIPLE_CHOICE',
    'FILL_BLANK',
    'TRUE_FALSE',
    // Note: Audio file/audio URL support is required for listening questions
  ] as const,

  SPEAKING: [
    'SPEAKING_PART1',
    'SPEAKING_PART2',
    'SPEAKING_PART3',
    // Note: Prompt text, time limit, and audio recording are required
  ] as const,

  WRITING: [
    'WRITING',
  ] as const,

  // Legacy test types (keeping for backward compatibility)
  PRACTICE: [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'MATCHING',
    'AUDIO_QUESTION',
    'SPEAKING_PART1',
    'SPEAKING_PART2',
    'SPEAKING_PART3',
    'WRITING',
    'READING_COMPREHENSION',
    'LISTENING_COMPREHENSION'
  ] as const,

  FINAL: [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'MATCHING',
    'AUDIO_QUESTION',
    'SPEAKING_PART1',
    'SPEAKING_PART2',
    'SPEAKING_PART3',
    'WRITING',
    'READING_COMPREHENSION',
    'LISTENING_COMPREHENSION'
  ] as const,

  CERTIFICATION: [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'MATCHING',
    'AUDIO_QUESTION',
    'SPEAKING_PART1',
    'SPEAKING_PART2',
    'SPEAKING_PART3',
    'WRITING',
    'READING_COMPREHENSION',
    'LISTENING_COMPREHENSION'
  ] as const,
} as const;

export type TestType = keyof typeof TEST_TYPE_QUESTION_MAPPING;
export type QuestionType = typeof TEST_TYPE_QUESTION_MAPPING[TestType][number];

/**
 * Get allowed question types for a given test type
 */
export function getAllowedQuestionTypes(testType: string): readonly string[] {
  const mapping = TEST_TYPE_QUESTION_MAPPING[testType as TestType];
  return mapping || [];
}

/**
 * Check if a question type is allowed for a given test type
 */
export function isQuestionTypeAllowed(testType: string, questionType: string): boolean {
  const allowedTypes = getAllowedQuestionTypes(testType);
  return allowedTypes.includes(questionType);
}

/**
 * Get user-friendly labels for question types
 */
export const QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TRUE_FALSE: 'True / False',
  FILL_BLANK: 'Fill in the Blanks',
  MATCHING: 'Matching',
  AUDIO_QUESTION: 'Audio Question',
  SPEAKING_PART1: 'Speaking Part 1',
  SPEAKING_PART2: 'Speaking Part 2',
  SPEAKING_PART3: 'Speaking Part 3',
  WRITING: 'Writing / Essay',
  READING_COMPREHENSION: 'Reading Comprehension',
  LISTENING_COMPREHENSION: 'Listening Comprehension',
};

/**
 * Get user-friendly labels for test types
 */
export const TEST_TYPE_LABELS: Record<string, string> = {
  READING: 'Reading',
  LISTENING: 'Listening',
  SPEAKING: 'Speaking',
  WRITING: 'Writing',
  PRACTICE: 'Practice',
  FINAL: 'Final',
  CERTIFICATION: 'Certification',
};

/**
 * Check if a test type requires media (audio/image)
 */
export function doesTestTypeRequireMedia(testType: string): boolean {
  switch (testType) {
    case 'LISTENING':
      return true; // Audio file/audio URL required
    case 'SPEAKING':
      return false; // Audio recording by student, but no pre-uploaded media required for question creation
    case 'READING':
    case 'WRITING':
    default:
      return false;
  }
}

/**
 * Get media requirements for a specific test type and question type combination
 */
export function getMediaRequirements(testType: string, questionType: string): {
  audioRequired: boolean;
  imageRequired: boolean;
  videoAllowed: boolean;
  transcriptAllowed: boolean;
} {
  const baseRequirements = {
    audioRequired: false,
    imageRequired: false,
    videoAllowed: true,
    transcriptAllowed: false,
  };

  switch (testType) {
    case 'LISTENING':
      return {
        ...baseRequirements,
        audioRequired: true,
        transcriptAllowed: true,
      };

    case 'SPEAKING':
      return {
        ...baseRequirements,
        // Speaking questions don't require pre-uploaded media
        // but students will record audio responses
      };

    case 'READING':
      return {
        ...baseRequirements,
        imageRequired: false, // Optional for reading
      };

    default:
      return baseRequirements;
  }
}
