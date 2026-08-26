import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

// Use the direct PostgreSQL connection for seeding (PrismaPg adapter cannot
// connect via an Accelerate URL). Fall back to DATABASE_URL if DIRECT_DATABASE_URL
// is not set.
const databaseUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding N5 vocabullary")

  const jlptN5Vocabulary = await prisma.mockTest.create({
    data: {
      title: "JLPT N5 Vocabulary Test 1",
      description: "Basic Japanese vocabulary practice for JLPT N5.",
      language: "Japanese",
      module: "JLPT",
      section: "Vocabulary",
      standardSection: "N5",
      type: "PRACTICE",
      duration: 20,
      passingScore: 60,
      questionsCount: 10,
  
      questions: {
        create: [
          {
            type: "MULTIPLE_CHOICE",
            questionText: "犬 (いぬ) means?",
            options: ["Dog", "Cat", "Bird", "Fish"],
            correctAnswer: "Dog",
            explanation: "犬 (いぬ) means Dog.",
            order: 1,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "猫 (ねこ) means?",
            options: ["Dog", "Bird", "Cat", "Horse"],
            correctAnswer: "Cat",
            explanation: "猫 means Cat.",
            order: 2,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "学校 (がっこう) means?",
            options: ["Hospital", "School", "Office", "Station"],
            correctAnswer: "School",
            explanation: "学校 means School.",
            order: 3,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "先生 (せんせい) means?",
            options: ["Student", "Teacher", "Doctor", "Friend"],
            correctAnswer: "Teacher",
            explanation: "先生 means Teacher.",
            order: 4,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "水 (みず) means?",
            options: ["Tea", "Milk", "Water", "Coffee"],
            correctAnswer: "Water",
            explanation: "水 means Water.",
            order: 5,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "本 (ほん) means?",
            options: ["Pen", "Notebook", "Book", "Bag"],
            correctAnswer: "Book",
            explanation: "本 means Book.",
            order: 6,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "山 (やま) means?",
            options: ["Mountain", "River", "Sea", "Lake"],
            correctAnswer: "Mountain",
            explanation: "山 means Mountain.",
            order: 7,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "車 (くるま) means?",
            options: ["Train", "Car", "Bus", "Bicycle"],
            correctAnswer: "Car",
            explanation: "車 means Car.",
            order: 8,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "友達 (ともだち) means?",
            options: ["Teacher", "Friend", "Parent", "Brother"],
            correctAnswer: "Friend",
            explanation: "友達 means Friend.",
            order: 9,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
          {
            type: "MULTIPLE_CHOICE",
            questionText: "食べる (たべる) means?",
            options: ["Drink", "Run", "Eat", "Sleep"],
            correctAnswer: "Eat",
            explanation: "食べる means Eat.",
            order: 10,
            language: "Japanese",
            module: "JLPT",
            section: "Vocabulary",
            standardSection: "N5",
            difficulty: "Easy",
          },
        ],
      },
    },
  });
  
    console.log("✅ JLPT N5 Vocabulary Test seeded.");
  }

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })