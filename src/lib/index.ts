import { 
    User, 
    Course, 
    Lesson, 
    MockTest, 
    Question,
    TestAttempt,
    Answer,
    Enrollment,
    Progress,
    JobListing,
    JobApplication,
    Article,
    Comment,
    SavedItem,
    PageView,
    UserRole,
    AccountStatus,
    LanguageLevel,
    CourseStatus,
    LessonType,
    EnrollmentStatus,
    TestType,
    QuestionType,
    JobType,
    JobStatus,
    ArticleStatus,
    SavedItemType,
  } from '@/generated/prisma/client'; // Update the path to the correct relative location
  
  // 1. EXTENDED PRISMA TYPES (With Relations)
  
  // User with relations
  export type UserWithRelations = User & {
    enrollments?: EnrollmentWithCourse[];
    progress?: Progress[];
    testAttempts?: TestAttemptWithTest[];
    savedItems?: SavedItem[];
    jobApplications?: JobApplicationWithJob[];
    comments?: Comment[];
    _count?: {
      enrollments: number;
      testAttempts: number;
      savedItems: number;
      jobApplications: number;
      comments: number;
    };
  };
  
  // Course with relations
  export type CourseWithRelations = Course & {
    lessons?: Lesson[];
    enrollments?: Enrollment[];
    mockTests?: MockTest[];
    _count?: {
      lessons: number;
      enrollments: number;
      mockTests: number;
    };
  };
  
  // Course with enrollment status
  export type CourseWithEnrollment = Course & {
    isEnrolled: boolean;
    userProgress?: number;
  };
  
  // Lesson with relations
  export type LessonWithRelations = Lesson & {
    course?: CourseBasic;
    progress?: Progress[];
  };
  
  // Lesson with user progress
  export type LessonWithProgress = Lesson & {
    progress?: Progress | null;
    isCompleted?: boolean;
    userTimeSpent?: number;
  };
  
  // Enrollment with relations
  export type EnrollmentWithCourse = Enrollment & {
    course: CourseBasic;
  };
  
  export type EnrollmentWithUser = Enrollment & {
    user: UserBasic;
  };
  
  // Test with relations
  export type MockTestWithRelations = MockTest & {
    course?: CourseBasic;
    questions?: Question[];
    attempts?: TestAttempt[];
    _count?: {
      questions: number;
      attempts: number;
    };
  };
  
  // Test attempt with relations
  export type TestAttemptWithTest = TestAttempt & {
    test: MockTestBasic;
    answers?: Answer[];
  };
  
  export type TestAttemptWithDetails = TestAttempt & {
    test: MockTestWithRelations;
    user: UserBasic;
    answers: AnswerWithQuestion[];
  };
  
  // Answer with question
  export type AnswerWithQuestion = Answer & {
    question: Question;
  };
  
  // Job with relations
  export type JobListingWithRelations = JobListing & {
    applications?: JobApplication[];
    _count?: {
      applications: number;
    };
  };
  
  export type JobApplicationWithJob = JobApplication & {
    job: JobListingBasic;
  };
  
  export type JobApplicationWithUser = JobApplication & {
    user: UserBasic;
  };
  
  // Article with relations
  export type ArticleWithRelations = Article & {
    comments?: CommentWithUser[];
    _count?: {
      comments: number;
    };
  };
  
  export type CommentWithUser = Comment & {
    user: UserBasic;
  };
  
  export type CommentWithArticle = Comment & {
    article: ArticleBasic;
    user: UserBasic;
  };
  
  // 2. BASIC/MINIMAL TYPES (For Performance)
  
  export type UserBasic = Pick<
    User,
    'id' | 'email' | 'name' | 'image' | 'role'
  >;
  
  export type CourseBasic = Pick<
    Course,
    'id' | 'slug' | 'title' | 'language' | 'level' | 'thumbnail'
  >;
  
  export type LessonBasic = Pick<
    Lesson,
    'id' | 'slug' | 'title' | 'type' | 'duration' | 'order'
  >;
  
  export type MockTestBasic = Pick<
    MockTest,
    'id' | 'title' | 'type' | 'duration' | 'passingScore'
  >;
  
  export type JobListingBasic = Pick<
    JobListing,
    'id' | 'slug' | 'title' | 'company' | 'location' | 'type' | 'languageRequired'
  >;
  
  export type ArticleBasic = Pick<
    Article,
    'id' | 'slug' | 'title' | 'excerpt' | 'language' | 'category'
  >;
  
  // 3. API REQUEST TYPES (DTOs - Data Transfer Objects)
  
  // User DTOs
  export interface UpdateUserRequest {
    name?: string;
    nativeLanguage?: string;
    learningLanguages?: string[];
    timezone?: string;
  }
  
  export interface UpdateUserRoleRequest {
    role: UserRole;
  }
  
  export interface UpdateUserStatusRequest {
    status: AccountStatus;
  }
  
  // Course DTOs
  export interface CreateCourseRequest {
    title: string;
    description: string;
    language: string;
    level: LanguageLevel;
    thumbnail?: string;
    coverImage?: string;
    duration?: number;
    metaTitle?: string;
    metaDescription?: string;
  }
  
  export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
    status?: CourseStatus;
  }
  
  export interface CourseFilters {
    language?: string;
    level?: LanguageLevel;
    status?: CourseStatus;
    search?: string;
  }
  
  // Lesson DTOs
  export interface CreateLessonRequest {
    courseId: string;
    title: string;
    description?: string;
    type: LessonType;
    content: string;
    videoUrl?: string;
    audioUrl?: string;
    attachments?: LessonAttachment[];
    duration?: number;
    order: number;
    isFree?: boolean;
  }
  
  export interface UpdateLessonRequest extends Partial<Omit<CreateLessonRequest, 'courseId'>> {}
  
  export interface LessonAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
  }
  
  // Progress DTOs
  export interface UpdateProgressRequest {
    completed?: boolean;
    timeSpent?: number;
    lastPosition?: number;
  }
  
  // Test DTOs
  export interface CreateTestRequest {
    courseId?: string;
    title: string;
    description?: string;
    type: TestType;
    duration: number;
    passingScore: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showResults?: boolean;
    allowRetake?: boolean;
  }
  
  export interface UpdateTestRequest extends Partial<CreateTestRequest> {}
  
  export interface CreateQuestionRequest {
    testId: string;
    type: QuestionType;
    questionText: string;
    audioUrl?: string;
    imageUrl?: string;
    options?: QuestionOption[];
    correctAnswer?: string;
    points?: number;
    order: number;
    explanation?: string;
  }
  
  export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
  }
  
  export interface StartTestRequest {
    testId: string;
  }
  
  export interface SubmitTestRequest {
    attemptId: string;
    answers: TestAnswerSubmission[];
    timeSpent: number;
  }
  
  export interface TestAnswerSubmission {
    questionId: string;
    selectedOption?: string;
    textAnswer?: string;
  }
  
  // Job DTOs
  export interface CreateJobRequest {
    title: string;
    company: string;
    location: string;
    type: JobType;
    description: string;
    requirements: string;
    languageRequired: string;
    languageLevel: LanguageLevel;
    salary?: string;
    currency?: string;
    applicationUrl?: string;
    email?: string;
    expiresAt?: Date;
  }
  
  export interface UpdateJobRequest extends Partial<CreateJobRequest> {
    status?: JobStatus;
  }
  
  export interface JobFilters {
    language?: string;
    type?: JobType;
    status?: JobStatus;
    search?: string;
  }
  
  export interface CreateJobApplicationRequest {
    resumeUrl?: string;
    coverLetter?: string;
  }
  
  // Article DTOs
  export interface CreateArticleRequest {
    title: string;
    excerpt?: string;
    content: string;
    language: string;
    category: string;
    tags: string[];
    featuredImage?: string;
    readTime?: number;
    metaTitle?: string;
    metaDescription?: string;
    authorName?: string;
  }
  
  export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
    status?: ArticleStatus;
  }
  
  export interface ArticleFilters {
    language?: string;
    category?: string;
    status?: ArticleStatus;
    search?: string;
  }
  
  export interface CreateCommentRequest {
    articleId: string;
    content: string;
  }
  
  // Saved Item DTOs
  export interface CreateSavedItemRequest {
    itemType: SavedItemType;
    itemId: string;
    notes?: string;
  }
  
  // Bulk Operations DTO
  export interface BulkOperationRequest {
    action: 'delete' | 'publish' | 'archive' | 'approve';
    model: string;
    ids: string[];
  }
  
  // 4. API RESPONSE TYPES
  
  export interface ApiSuccessResponse<T> {
    success: true;
    message?: string;
    data: T;
    pagination?: PaginationMeta;
  }
  
  export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: ValidationError[];
  }
  
  export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
  
  export interface ValidationError {
    field: string;
    message: string;
  }
  
  export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
  }
  
  // 5. QUERY PARAMETERS TYPES
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }
  
  export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface SearchParams {
    search?: string;
  }
  
  export type QueryParams = PaginationParams & SortParams & SearchParams;
  
  // 6. AUTHENTICATION TYPES (NextAuth Extension)
  
  import { DefaultSession, DefaultUser } from 'next-auth';
  import { JWT } from 'next-auth/jwt';
  
  declare module 'next-auth' {
    interface Session {
      user: {
        id: string;
        role: UserRole;
        status: AccountStatus;
      } & DefaultSession['user'];
    }
  
    interface User extends DefaultUser {
      role: UserRole;
      status: AccountStatus;
    }
  }
  
  declare module 'next-auth/jwt' {
    interface JWT {
      id: string;
      role: UserRole;
      status: AccountStatus;
    }
  }
  
  // 7. DASHBOARD & STATISTICS TYPES
  
  export interface DashboardStats {
    overview: {
      totalUsers: number;
      activeUsers: number;
      totalCourses: number;
      publishedCourses: number;
      totalEnrollments: number;
      totalTests: number;
      totalJobs: number;
      activeJobs: number;
      totalArticles: number;
      publishedArticles: number;
      newUsersLast30Days: number;
    };
    recentActivity: {
      enrollments: EnrollmentWithUser[];
      testAttempts: TestAttemptWithDetails[];
    };
    popularCourses: CourseBasic[];
  }
  
  export interface UserDashboardData {
    user: UserWithRelations;
    activeEnrollments: EnrollmentWithCourse[];
    recentProgress: Progress[];
    stats: {
      coursesEnrolled: number;
      coursesCompleted: number;
      testsPassed: number;
      hoursLearned: number;
      currentStreak: number;
    };
    recommendations: CourseBasic[];
  }
  
  export interface AnalyticsData {
    pageViews: PageViewStat[];
    usersByDay: UserGrowthStat[];
    enrollmentsByLanguage: LanguageEnrollmentStat[];
  }
  
  export interface PageViewStat {
    path: string;
    count: number;
  }
  
  export interface UserGrowthStat {
    date: string;
    count: number;
  }
  
  export interface LanguageEnrollmentStat {
    language: string;
    count: number;
  }
  
  // 8. TEST RESULTS TYPES
  
  export interface TestResult {
    attemptId: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
    timeSpent: number;
    answers?: TestAnswerResult[];
  }
  
  export interface TestAnswerResult {
    questionId: string;
    questionText: string;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
    points: number;
  }
  
  export interface TestSummary {
    totalAttempts: number;
    bestScore: number;
    averageScore: number;
    lastAttempt?: TestAttemptWithTest;
    passRate: number;
  }
  
  // 9. PROGRESS TRACKING TYPES
  
  export interface CourseProgress {
    courseId: string;
    courseName: string;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    timeSpent: number;
    lastAccessed: Date;
    nextLesson?: LessonBasic;
  }
  
  export interface LearningStreak {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
    daysLearned: Date[];
  }
  
  export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
    progress?: number;
    total?: number;
  }
  
  // 10. FORM TYPES (For React Hook Form)
  
  export interface LoginFormData {
    email: string;
    password: string;
    remember?: boolean;
  }
  
  export interface SignupFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface ProfileFormData {
    name: string;
    nativeLanguage: string;
    learningLanguages: string[];
    timezone: string;
  }
  
  export interface CourseFormData extends CreateCourseRequest {}
  
  export interface LessonFormData extends CreateLessonRequest {}
  
  export interface TestFormData extends CreateTestRequest {}
  
  export interface QuestionFormData extends CreateQuestionRequest {}
  
  export interface JobFormData extends CreateJobRequest {}
  
  export interface ArticleFormData extends CreateArticleRequest {}
  
  export interface CommentFormData {
    content: string;
  }
  
  export interface ApplicationFormData {
    resumeUrl?: string;
    coverLetter: string;
  }
  
  // 11. FILE UPLOAD TYPES
  
  export interface UploadedFile {
    url: string;
    publicId: string;
    format: string;
    size: number;
    width?: number;
    height?: number;
  }
  
  export interface FileUploadOptions {
    maxSize?: number;
    allowedTypes?: string[];
    folder?: string;
  }
  
  export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
  }
  
  // 12. NOTIFICATION TYPES
  
  export type NotificationType = 
    | 'enrollment'
    | 'progress'
    | 'test_result'
    | 'job_application'
    | 'comment'
    | 'achievement';
  
  export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: Date;
  }
  
  // 13. EMAIL TYPES
  
  export interface EmailData {
    to: string;
    subject: string;
    html: string;
  }
  
  export interface WelcomeEmailData extends EmailData {
    userName: string;
  }
  
  export interface EnrollmentEmailData extends EmailData {
    userName: string;
    courseName: string;
    courseUrl: string;
  }
  
  export interface TestResultEmailData extends EmailData {
    userName: string;
    testName: string;
    score: number;
    passed: boolean;
    certificateUrl?: string;
  }
  
  // 14. FILTER & SEARCH TYPES
  
  export interface FilterOption {
    label: string;
    value: string;
    count?: number;
  }
  
  export interface SearchResult<T> {
    type: 'course' | 'article' | 'job';
    id: string;
    title: string;
    description?: string;
    url: string;
    data: T;
  }
  
  export type SearchResults = SearchResult<Course | Article | JobListing>[];
  
  // 15. UTILITY TYPES
  
  // Make all properties optional recursively
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };
  
  // Make specific properties required
  export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
  
  // Remove null from type
  export type NonNullable<T> = Exclude<T, null | undefined>;
  
  // Extract keys of a specific type
  export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
  }[keyof T];
  
  // 16. ERROR TYPES
  
  export class AppError extends Error {
    constructor(
      public message: string,
      public statusCode: number = 500,
      public errors?: ValidationError[]
    ) {
      super(message);
      this.name = 'AppError';
    }
  }
  
  export class ValidationErrorClass extends AppError {
    constructor(errors: ValidationError[]) {
      super('Validation failed', 400, errors);
      this.name = 'ValidationError';
    }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
      super(message, 401);
      this.name = 'UnauthorizedError';
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
      super(message, 403);
      this.name = 'ForbiddenError';
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string = 'Not found') {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }
  
  // 17. ENUMS RE-EXPORT (For easier imports)

  export {
    UserRole,
    AccountStatus,
    LanguageLevel,
    CourseStatus,
    LessonType,
    EnrollmentStatus,
    TestType,
    QuestionType,
    JobType,
    JobStatus,
    ArticleStatus,
    SavedItemType,
  };
  
  // 18. CONSTANTS & ENUMS  
  export const LANGUAGE_LEVELS_MAP: Record<LanguageLevel, string> = {
    BEGINNER: 'A1 - Beginner',
    ELEMENTARY: 'A2 - Elementary',
    INTERMEDIATE: 'B1 - Intermediate',
    UPPER_INTERMEDIATE: 'B2 - Upper Intermediate',
    ADVANCED: 'C1 - Advanced',
    PROFICIENT: 'C2 - Proficient',
  };
  
  export const LESSON_TYPES_MAP: Record<LessonType, string> = {
    VIDEO: 'Video Lesson',
    TEXT: 'Text Lesson',
    AUDIO: 'Audio Lesson',
    INTERACTIVE: 'Interactive Exercise',
    QUIZ: 'Quiz',
  };
  
  export const JOB_TYPES_MAP: Record<JobType, string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
  };
  
  export const TEST_TYPES_MAP: Record<TestType, string> = {
    PRACTICE: 'Practice Test',
    FINAL: 'Final Exam',
    CERTIFICATION: 'Certification Test',
  };
  
  
  // 19. TYPE GUARDS
  
  export function isUser(obj: any): obj is User {
    return obj && typeof obj.email === 'string' && typeof obj.role === 'string';
  }
  
  export function isCourse(obj: any): obj is Course {
    return obj && typeof obj.title === 'string' && typeof obj.language === 'string';
  }
  
  export function isLesson(obj: any): obj is Lesson {
    return obj && typeof obj.title === 'string' && typeof obj.type === 'string';
  }
  
  export function isApiError(response: any): response is ApiErrorResponse {
    return response && response.success === false;
  }
  
  export function isApiSuccess<T>(response: any): response is ApiSuccessResponse<T> {
    return response && response.success === true;
  }
  
  // 20. HELPER TYPE FUNCTIONS
  
  export type SelectFields<T, K extends keyof T> = Pick<T, K>;
  
  export type OmitFields<T, K extends keyof T> = Omit<T, K>;
  
  export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
  
  export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  
    export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
    };
