import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const test = await prisma.mockTest.findUnique({
        where: { id: params.id },
        include: {
          questions: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              type: true,
              questionText: true,
              audioUrl: true,
              imageUrl: true,
              options: true,
              order: true,
              points: true,
            },
          },
        },
      });
  
      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }
  
      // Shuffle questions if enabled
      let questions = test.questions;
      if (test.shuffleQuestions) {
        questions = questions.sort(() => Math.random() - 0.5);
      }
  
      // Create test attempt
      const attempt = await prisma.testAttempt.create({
        data: {
          userId: session.user.id,
          testId: params.id,
          score: 0,
          correctAnswers: 0,
          totalQuestions: questions.length,
          passed: false,
          timeSpent: 0,
        },
      });
  
      return NextResponse.json({
        attemptId: attempt.id,
        test: {
          id: test.id,
          title: test.title,
          duration: test.duration,
          passingScore: test.passingScore,
        },
        questions,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to start test" },
        { status: 500 }
      );
    }
  }