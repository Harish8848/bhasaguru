import { PrismaClient } from '../src/generated/prisma/client'

/* prisma/seed.ts
   Seeds:
   - JLPT N5, N4, N3, N2
   - IELTS, PTE, TOEFL
   - TOPIK I, TOPIK II
   - Japanese Alphabet (Hiragana & Katakana)
   - 50 lessons per course (includes vocab/grammar banks + audio/video samples)
   - 3 mock tests per course (each test with multiple questions)
   - Culture posts (articles)
*/


const prisma = new PrismaClient();

const LESSONS_PER_COURSE = 50; // change if you want more/less
const MOCK_TESTS_PER_COURSE = 3;
const QUESTIONS_PER_TEST = 25; // reasonable default, change as needed

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function slugify(...parts: string[]) {
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sampleVideoUrl(courseSlug: string, idx: number) {
  return `https://example.com/videos/${courseSlug}-lesson-${pad(idx)}.mp4`;
}
function sampleAudioUrl(courseSlug: string, idx: number) {
  return `https://example.com/audio/${courseSlug}-lesson-${pad(idx)}.mp3`;
}

async function createCourses() {
  const coursesData = [
    // Japanese JLPT
    {
      slug: "jlpt-n5",
      title: "JLPT N5 Japanese Course",
      description: "Beginner JLPT N5: hiragana, basic grammar, core vocab and kanji.",
      language: "Japanese",
      level: "BEGINNER",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 1,
    },
    {
      slug: "jlpt-n4",
      title: "JLPT N4 Japanese Course",
      description: "JLPT N4: build conversational abilities, more kanji and grammar.",
      language: "Japanese",
      level: "ELEMENTARY",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 2,
    },
    {
      slug: "jlpt-n3",
      title: "JLPT N3 Japanese Course",
      description: "JLPT N3: intermediate grammar, reading comprehension, vocabulary.",
      language: "Japanese",
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 3,
    },
    {
      slug: "jlpt-n2",
      title: "JLPT N2 Japanese Course",
      description: "JLPT N2: upper-intermediate, advanced grammar, reading & listening drills.",
      language: "Japanese",
      level: "UPPER_INTERMEDIATE",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 4,
    },

    // English exam prep
    {
      slug: "ielts-prep",
      title: "IELTS Preparation Course",
      description: "Complete IELTS prep: listening, reading, writing & speaking strategies.",
      language: "English",
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 5,
    },
    {
      slug: "pte-prep",
      title: "PTE Academic Course",
      description: "PTE Academic practice with integrated computer-based tasks and tips.",
      language: "English",
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 6,
    },
    {
      slug: "toefl-ibt",
      title: "TOEFL iBT Course",
      description: "TOEFL reading, listening, speaking & writing mastery.",
      language: "English",
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 7,
    },

    // Korean TOPIK
    {
      slug: "topik-i",
      title: "TOPIK I (Beginner) Korean Course",
      description: "TOPIK I focused curriculum for beginner Korean learners.",
      language: "Korean",
      level: "BEGINNER",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 8,
    },
    {
      slug: "topik-ii",
      title: "TOPIK II (Intermediate/Advanced) Korean Course",
      description: "TOPIK II course for intermediate to advanced learners.",
      language: "Korean",
      level: "INTERMEDIATE",
      status: "PUBLISHED",
      lessonsCount: LESSONS_PER_COURSE,
      order: 9,
    },

    // Japanese alphabet course
    {
      slug: "japanese-alphabet",
      title: "Japanese Alphabet: Hiragana & Katakana",
      description: "Complete chart + practice lessons for Hiragana and Katakana (reading & writing).",
      language: "Japanese",
      level: "BEGINNER",
      status: "PUBLISHED",
      lessonsCount: 30,
      order: 10,
    },
  ];

  const created: Array<any> = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        language: c.language,
        level: c.level as any,
        status: c.status as any,
        lessonsCount: c.lessonsCount,
        order: c.order,
        // small thumbnails to identify
        thumbnail: `/images/courses/${c.slug}-thumb.jpg`,
        coverImage: `/images/courses/${c.slug}-cover.jpg`,
      },
    });
    created.push(course);
    console.log(`Created course: ${course.slug}`);
  }
  return created;
}

function generateLesson(course: any, idx: number) {
  // pick special lessons for vocab/grammar/video/audio/quiz
  const courseSlug = course.slug;
  const isAlphabetCourse = course.slug === "japanese-alphabet";
  const lessonNum = idx;
  const baseTitle = isAlphabetCourse
    ? lessonNum <= 10
      ? `Hiragana Set ${lessonNum}`
      : lessonNum <= 20
      ? `Katakana Set ${lessonNum - 10}`
      : `Alphabet Practice ${lessonNum - 20}`
    : `Lesson ${lessonNum}`;

  // pick types by rotating
  const typeOrder: any[] = ["TEXT", "VIDEO", "AUDIO", "INTERACTIVE", "QUIZ"];
  const type = typeOrder[idx % typeOrder.length];

  const slug = slugify(course.slug, "lesson", pad(idx));

  const extras: any = {
    courseId: course.id,
    slug,
    title: isAlphabetCourse ? baseTitle : `${baseTitle} - ${course.title.split(" ")[0]}`,
    description: isAlphabetCourse ? "Practice reading & writing the script." : `Auto-generated lesson ${idx}`,
    type: type as any,
    content: isAlphabetCourse
      ? `Practice content for ${baseTitle}. Includes chart and writing drills.`
      : `Content for ${course.title} — lesson ${idx}. Includes exercises, examples and notes.`,
    order: idx,
    isFree: idx === 1, // first lesson free
  };

  if (type === "VIDEO") extras.videoUrl = sampleVideoUrl(course.slug, idx);
  if (type === "AUDIO") extras.audioUrl = sampleAudioUrl(course.slug, idx);
  if (type === "INTERACTIVE")
    extras.attachments = {
      interactive: true,
      exercises: [`exercise-${pad(idx)}-1`, `exercise-${pad(idx)}-2`],
    };
  if (type === "QUIZ") extras.content += " This lesson contains a small in-lesson quiz.";

  // Add special vocab/grammar bank lessons in early slots
  if (idx === 2) {
    extras.title = "Vocabulary Bank: Core Words";
    extras.slug = slugify(course.slug, "vocab-core");
    extras.type = "TEXT";
    extras.content = `Vocabulary bank for ${course.title}. Core high-frequency words list.`;
  }
  if (idx === 3) {
    extras.title = "Grammar Bank: Key Patterns";
    extras.slug = slugify(course.slug, "grammar-bank");
    extras.type = "TEXT";
    extras.content = `Grammar reference for ${course.title}. Important grammar points and examples.`;
  }

  return extras;
}

function generateQuestionsForTest(course: any, testIndex: number) {
  const qs = [];
  for (let q = 1; q <= QUESTIONS_PER_TEST; q++) {
    const qIdx = (testIndex - 1) * 100 + q;
    const type = q % 5 === 0 ? "TRUE_FALSE" : "MULTIPLE_CHOICE";
    if (type === "MULTIPLE_CHOICE") {
      const options = {
        a: `Option A for q${qIdx}`,
        b: `Option B for q${qIdx}`,
        c: `Option C for q${qIdx}`,
        d: `Option D for q${qIdx}`,
      };
      qs.push({
        type: type as any,
        questionText: `[${course.language}] Sample MCQ ${qIdx} for ${course.slug}`,
        options,
        correctAnswer: "a",
        points: 1,
        order: q,
        explanation: "Correct answer is A (sample explanation).",
      });
    } else {
      qs.push({
        type: type as any,
        questionText: `[${course.language}] True/False sample ${qIdx} for ${course.slug}`,
        correctAnswer: q % 2 === 0 ? "true" : "false",
        points: 1,
        order: q,
        explanation: "Sample T/F explanation.",
      });
    }
  }
  return qs;
}

async function seedLessons(courses: any[]) {
  console.log("Seeding lessons...");
  for (const course of courses) {
    const count = course.lessonsCount || LESSONS_PER_COURSE;
    // generate lesson objects
    const lessons: any[] = [];
    // Always include 1: Intro, 2: Vocab bank, 3: Grammar bank
    for (let i = 1; i <= count; i++) {
      lessons.push(generateLesson(course, i));
    }

    // prisma.createMany does not support nested relations: fine, lessons don't have nested creates
    // But createMany expects array of plain objects; attachments and JSON fields must be JSON-serializable (they are)
    // Split into smaller batches if needed
    const batchSize = 100;
    for (let i = 0; i < lessons.length; i += batchSize) {
      const batch = lessons.slice(i, i + batchSize);
      await prisma.lesson.createMany({ data: batch });
    }
    console.log(`  inserted ${lessons.length} lessons for ${course.slug}`);
  }
}

async function seedMockTestsAndQuestions(courses: any[]) {
  console.log("Seeding mock tests and questions...");
  for (const course of courses) {
    for (let t = 1; t <= MOCK_TESTS_PER_COURSE; t++) {
      const testTitle = `${course.title} - Practice Test ${t}`;
      const test = await prisma.mockTest.create({
        data: {
          title: testTitle,
          description: `Auto-generated practice test ${t} for ${course.title}.`,
          language: course.language,
          type: "PRACTICE" as any,
          duration: 60,
          passingScore: Math.max(5, Math.floor(QUESTIONS_PER_TEST * 0.6)),
          questionsCount: QUESTIONS_PER_TEST,
          shuffleQuestions: true,
          shuffleOptions: true,
          showResults: true,
          allowRetake: true,
          courseId: course.id,
          questions: {
            create: generateQuestionsForTest(course, t),
          },
        },
      });
      console.log(`  created test ${test.title} (${course.slug}) with ${QUESTIONS_PER_TEST} questions`);
    }
  }
}

async function seedArticles() {
  console.log("Seeding culture posts / articles...");
  const articles = [
    {
      slug: "japanese-culture-guide",
      title: "A Modern Guide to Japanese Culture",
      excerpt: "Traditions, etiquette, food, and festivals in Japan.",
      content:
        "Japan merges deep tradition with modern life. This article covers festivals, food, etiquette, and travel tips.",
      language: "English",
      category: "Culture",
      tags: ["Japan", "Culture", "Travel"],
      featuredImage: "/images/culture/japan.jpg",
      status: "PUBLISHED" as any,
    },
    {
      slug: "korean-culture-guide",
      title: "Korean Culture: From Hanbok to K-pop",
      excerpt: "An overview of Korean traditions, festivals, and modern pop culture.",
      content: "Korean culture spans traditional practices and vibrant modern entertainment.",
      language: "English",
      category: "Culture",
      tags: ["Korea", "Culture", "K-pop"],
      featuredImage: "/images/culture/korea.jpg",
      status: "PUBLISHED" as any,
    },
    {
      slug: "ielts-strategies",
      title: "Top Strategies to Boost Your IELTS Band",
      excerpt: "Practical tips for each IELTS module.",
      content: "Module-specific strategies, practice plans, and time management tips for IELTS.",
      language: "English",
      category: "Exam Tips",
      tags: ["IELTS", "Exam"],
      featuredImage: "/images/culture/ielts.jpg",
      status: "PUBLISHED" as any,
    },
  ];

  await prisma.article.createMany({ data: articles });
  console.log("  articles inserted");
}

async function main() {
  try {
    console.log("🌱 Starting big seed (JLPT, TOPIK, IELTS/PTE/TOEFL, Lessons, Tests)...");

    // 1. Create courses
    const courses = await createCourses();

    // 2. Seed lessons (50+ per course)
    await seedLessons(courses);

    // 3. Seed mock tests (multiple per course) + questions
    await seedMockTestsAndQuestions(courses);

    // 4. Seed articles (culture posts)
    await seedArticles();

    console.log("🌱 Seed complete. ✅");
  } catch (err) {
    console.error("❌ Error during seed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
