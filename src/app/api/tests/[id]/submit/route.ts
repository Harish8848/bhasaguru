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
  
      // Grade answers
      let correctAnswers = 0;
      const gradedAnswers = [];
  
      for (const answer of answers) {
        const question = attempt.test.questions.find(q => q.id === answer.questionId);
        if (!question) continue;
  
        let isCorrect = false;
  
        if (question.type === "MULTIPLE_CHOICE") {
          const options: any = question.options;
          const correctOption = options.find((o: any) => o.isCorrect);
          isCorrect = answer.selectedOption === correctOption?.id;
        } else if (question.type === "TRUE_FALSE" || question.type === "FILL_BLANK") {
          isCorrect = answer.textAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
        }
  
        if (isCorrect) correctAnswers++;
  
        gradedAnswers.push({
          attemptId,
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          textAnswer: answer.textAnswer,
          isCorrect,
        });
      }
  
      // Save answers
      await prisma.answer.createMany({
        data: gradedAnswers,
      });
  
      // Calculate score
      const score = (correctAnswers / attempt.test.questions.length) * 100;
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