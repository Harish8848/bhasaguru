import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { UnifiedEvaluationService } from "@/lib/unified-evaluation-service";
import { AnswerPayload } from "@/lib/types/evaluation";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const { attemptId, answers, timeSpent } = body;
  
      // Verify attempt belongs to user
      const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: { test: { include: { questions: true } } },
      });

      if (!attempt || attempt.userId !== session.user.id) {
        return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
      }

      // Ensure this is a formal test attempt (not a practice session)
      if (!attempt.test) {
        return NextResponse.json({ error: "Invalid test attempt" }, { status: 400 });
      }
  
      // Grade answers using the UnifiedEvaluationService
      const evaluationService = new UnifiedEvaluationService();
      const answerPayloads: AnswerPayload[] = answers.map((ans: any) => ({
        ...ans,
        questionType: attempt.test.questions.find(q => q.id === ans.questionId)?.type,
      }));

      const evaluationResult = await evaluationService.evaluateBatch(
        attempt.test.questions,
        answerPayloads,
        {}
      );

      const correctAnswers = evaluationResult.results.filter(r => r.isCorrect).length;
      
      const gradedAnswers = evaluationResult.results.map(result => ({
        attemptId,
        questionId: result.questionId,
        selectedOption: answers.find((a: any) => a.questionId === result.questionId)?.selectedOption,
        textAnswer: answers.find((a: any) => a.questionId === result.questionId)?.textAnswer,
        isCorrect: result.isCorrect,
        score: result.score,
      }));
  
      // Save answers
      await prisma.answer.createMany({
        data: gradedAnswers.map(a => ({
          attemptId: a.attemptId,
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          textAnswer: a.textAnswer,
          isCorrect: a.isCorrect,
        })),
      });
  
      // Calculate score
      const totalScore = evaluationResult.results.reduce((sum, r) => sum + r.score, 0);
      const maxScore = evaluationResult.results.reduce((sum, r) => sum + r.maxScore, 0);
      const score = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = score >= attempt.test.passingScore;
  
      // Update attempt
      const updatedAttempt = await prisma.testAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          correctAnswers,
          passed,
          timeSpent,
          completedAt: new Date(),
        },
      });
  
      return NextResponse.json({
        attemptId: updatedAttempt.id,
        score,
        correctAnswers,
        totalQuestions: attempt.test.questions.length,
        passed,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to submit test" },
        { status: 500 }
      );
    }
  }
