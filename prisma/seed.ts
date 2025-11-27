import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create some sample courses
  const japaneseCourse = await prisma.course.upsert({
    where: { slug: 'japanese-n5-fundamentals' },
    update: {},
    create: {
      slug: 'japanese-n5-fundamentals',
      title: 'Japanese N5 Fundamentals',
      description: 'Learn the basics of Japanese language for N5 certification',
      language: 'Japanese',
      level: 'BEGINNER',
      status: 'PUBLISHED',
    },
  })

  const koreanCourse = await prisma.course.upsert({
    where: { slug: 'korean-topic-i' },
    update: {},
    create: {
      slug: 'korean-topic-i',
      title: 'Korean Topic I',
      description: 'Comprehensive Korean language course for beginners',
      language: 'Korean',
      level: 'BEGINNER',
      status: 'PUBLISHED',
    },
  })

  const englishCourse = await prisma.course.upsert({
    where: { slug: 'english-ielts-preparation' },
    update: {},
    create: {
      slug: 'english-ielts-preparation',
      title: 'English IELTS Preparation',
      description: 'Prepare for IELTS exam with comprehensive English lessons',
      language: 'English',
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
    },
  })

  // Create sample lessons
  await prisma.lesson.createMany({
    data: [
      {
        courseId: japaneseCourse.id,
        slug: 'hiragana-introduction',
        title: 'Hiragana Introduction',
        description: 'Learn the basics of Hiragana characters',
        type: 'VIDEO',
        content: 'Introduction to Japanese Hiragana writing system',
        duration: 45,
        order: 1,
        isFree: true,
      },
      {
        courseId: japaneseCourse.id,
        slug: 'katakana-writing-guide',
        title: 'Katakana Writing Guide',
        description: 'Complete guide to writing Katakana characters',
        type: 'TEXT',
        content: 'Step-by-step guide to Katakana writing',
        order: 2,
        isFree: false,
      },
      {
        courseId: koreanCourse.id,
        slug: 'korean-alphabet-basics',
        title: 'Korean Alphabet Basics',
        description: 'Learn Hangul, the Korean alphabet',
        type: 'INTERACTIVE',
        content: 'Interactive lessons for learning Korean alphabet',
        duration: 30,
        order: 1,
        isFree: true,
      },
      {
        courseId: englishCourse.id,
        slug: 'ielts-listening-techniques',
        title: 'IELTS Listening Techniques',
        description: 'Master IELTS listening section strategies',
        type: 'VIDEO',
        content: 'Advanced techniques for IELTS listening',
        duration: 60,
        order: 1,
        isFree: false,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Database seeded successfully!')
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
