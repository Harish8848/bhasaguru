import { z } from 'zod';

// User validation schemas
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nativeLanguage: z.string().optional(),
  learningLanguages: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

// Course validation schemas
export const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  language: z.string().min(1),
  level: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'PROFICIENT']),
  thumbnail: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  duration: z.number().positive().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// Lesson validation schemas
export const createLessonSchema = z.object({
  courseId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['VIDEO', 'TEXT', 'AUDIO', 'INTERACTIVE', 'QUIZ']),
  content: z.string().min(1),
  videoUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  attachments: z.any().optional(),
  duration: z.number().positive().optional(),
  order: z.number().int().nonnegative(),
  isFree: z.boolean().default(false),
});

export const updateLessonSchema = createLessonSchema.partial().omit({ courseId: true });

// Test validation schemas
export const createTestSchema = z.object({
  courseId: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  language: z.string().optional(),
  module: z.string().optional(),
  section: z.string().optional(),
  standardSection: z.string().optional(),
  type: z.enum(['PRACTICE', 'FINAL', 'CERTIFICATION']),
  duration: z.number().positive(),
  passingScore: z.number().min(0).max(100),
  questionsCount: z.number().int().nonnegative(),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
  showResults: z.boolean().default(true),
  allowRetake: z.boolean().default(true),
});

export const createQuestionSchema = z.object({
  testId: z.string().cuid(),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING', 'AUDIO_QUESTION', 'SPEAKING_PART1', 'SPEAKING_PART2', 'SPEAKING_PART3']),
  questionText: z.string().min(1),
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  options: z.any().optional(),
  correctAnswer: z.string().optional(),
  points: z.number().positive().default(1),
  order: z.number().int().nonnegative(),
  explanation: z.string().optional(),
  language: z.string().optional(),
  module: z.string().optional(),
  section: z.string().optional(),
  standardSection: z.string().optional(),
  difficulty: z.string().optional(),
  // Speaking-specific fields
  preparationTime: z.number().positive().optional(),
  speakingTime: z.number().positive().optional(),
  cueCardContent: z.string().optional(),
  followUpQuestions: z.any().optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial().omit({ testId: true });

// Job listing validation schemas
export const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(100),
  location: z.string().min(1),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  description: z.string().min(10),
  requirements: z.string().min(10),
  languageRequired: z.string().min(1),
  languageLevel: z.enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED', 'PROFICIENT']),
  salary: z.string().optional(),
  currency: z.string().optional(),
  applicationUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updateJobSchema = createJobSchema.partial();

// Article validation schemas
export const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  language: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()),
  featuredImage: z.string().url().optional(),
  readTime: z.number().positive().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  authorName: z.string().optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

// Comment validation schema
export const createCommentSchema = z.object({
  articleId: z.string().cuid(),
  content: z.string().min(1).max(1000),
});

// Job application validation schema
export const createApplicationSchema = z.object({
  resumeUrl: z.string().url().optional(),
  coverLetter: z.string().min(10).max(2000).optional(),
});

// Progress update validation schema
export const updateProgressSchema = z.object({
  completed: z.boolean().optional(),
  timeSpent: z.number().nonnegative().optional(),
  lastPosition: z.number().nonnegative().optional(),
});

// Saved item validation schema
export const createSavedItemSchema = z.object({
  itemType: z.enum(['LESSON', 'ARTICLE', 'JOB']),
  itemId: z.string().cuid(),
  notes: z.string().max(500).optional(),
});

// Helper function to validate request body
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; errors: null } | { data: null; errors: z.ZodError }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, errors: error };
    }
    throw error;
  }
}
