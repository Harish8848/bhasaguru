/**
 * Diagnostic: inspect a test attempt and its questions/answers
 * to find why grading returns 0%.
 *
 * Run: npx tsx scripts/diagnose-attempt.ts [attemptId|testId]
 *      (ids starting with a long cuid are treated as attemptId)
 */
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const accelerateUrl = process.env.DATABASE_URL;
if (!accelerateUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const prisma = new PrismaClient({ accelerateUrl });

const attemptInclude = {
  test: { select: { id: true, title: true, type: true, passingScore: true } },
  answers: {
    include: {
      question: {
        select: {
          id: true,
          type: true,
          questionText: true,
          options: true,
          correctAnswer: true,
          points: true,
        },
      },
    },
  },
};

async function main() {
  const arg = process.argv[2];
  // If arg looks like a cuid attempt id (starts with "cmt" and long), treat as attemptId
  const isAttemptId = arg && /^cmtd[a-z0-9]{20,}$/i.test(arg);
  const testId = isAttemptId ? undefined : arg;
  const attemptId = isAttemptId ? arg : undefined;

  const attempt = attemptId
    ? await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: attemptInclude,
      })
    : await prisma.testAttempt.findFirst({
        where: testId ? { testId } : {},
        orderBy: { startedAt: "desc" },
        include: attemptInclude,
      });

  if (!attempt) {
    console.log("No attempts found" + (arg ? ` for ${arg}` : ""));
    return;
  }

  console.log("=== ATTEMPT ===");
  console.log({
    id: attempt.id,
    test: attempt.test?.title,
    testType: attempt.test?.type,
    passingScore: attempt.test?.passingScore,
    score: attempt.score,
    correctAnswers: attempt.correctAnswers,
    totalQuestions: attempt.totalQuestions,
    passed: attempt.passed,
    timeSpent: attempt.timeSpent,
    completedAt: attempt.completedAt,
  });

  console.log("\n=== ANSWERS vs QUESTIONS ===");
  for (const a of attempt.answers) {
    console.log(
      JSON.stringify(
        {
          questionId: a.questionId,
          type: a.question.type,
          questionText: a.question.questionText.slice(0, 60),
          options: a.question.options,
          correctAnswer: a.question.correctAnswer,
          storedSelectedOption: a.selectedOption,
          storedTextAnswer: a.textAnswer,
          storedIsCorrect: a.isCorrect,
        },
        null,
        2
      )
    );
  }

  // Show summary of the 5 most recent attempts for comparison
  const recent = await prisma.testAttempt.findMany({
    where: testId ? { testId } : {},
    orderBy: { startedAt: "desc" },
    take: 5,
    select: {
      id: true,
      score: true,
      correctAnswers: true,
      totalQuestions: true,
      passed: true,
      timeSpent: true,
      startedAt: true,
      completedAt: true,
    },
  });

  console.log("\n=== RECENT ATTEMPTS (newest first) ===");
  for (const a of recent) {
    console.log(
      `${a.id} | score=${a.score} | correct=${a.correctAnswers}/${a.totalQuestions} | passed=${a.passed} | timeSpent=${a.timeSpent}s | completed=${a.completedAt?.toISOString()}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());