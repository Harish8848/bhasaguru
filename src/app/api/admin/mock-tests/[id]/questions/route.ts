import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { cacheHelpers } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// GET - List all questions for a mock test (admin)
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const test = await prisma.mockTest.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!test) {
    return ApiResponse.notFound('Mock test not found');
  }

  const questions = await prisma.question.findMany({
    where: { testId: id },
    orderBy: { order: 'asc' },
  });

  return ApiResponse.success(questions);
});

// POST - Create a new question for a mock test (admin)
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;
  const body = await request.json();

  const {
    type,
    questionText,
    audioUrl,
    imageUrl,
    videoUrl,
    options,
    correctAnswer,
    points,
    explanation,
    language,
    module,
    section,
    standardSection,
    difficulty,
    preparationTime,
    speakingTime,
    cueCardContent,
    followUpQuestions,
  } = body;

  if (!type || !questionText) {
    return ApiResponse.error('Type and question text are required', 400);
  }

  const test = await prisma.mockTest.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!test) {
    return ApiResponse.notFound('Mock test not found');
  }

  // Get the next order value
  const lastQuestion = await prisma.question.findFirst({
    where: { testId: id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const nextOrder = (lastQuestion?.order ?? 0) + 1;

  const question = await prisma.question.create({
    data: {
      testId: id,
      type,
      questionText,
      audioUrl: audioUrl || null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      options: options || undefined,
      correctAnswer: correctAnswer || null,
      points: points ? parseInt(points) : 1,
      order: nextOrder,
      explanation: explanation || null,
      language: language || null,
      module: module || null,
      section: section || null,
      standardSection: standardSection || null,
      difficulty: difficulty || null,
      preparationTime: preparationTime ? parseInt(preparationTime) : null,
      speakingTime: speakingTime ? parseInt(speakingTime) : null,
      cueCardContent: cueCardContent || null,
      followUpQuestions: followUpQuestions || undefined,
    },
  });

  // Update questionsCount on the mock test
  const questionCount = await prisma.question.count({ where: { testId: id } });
  await prisma.mockTest.update({
    where: { id },
    data: { questionsCount: questionCount },
  });

  // Invalidate cache
  await cacheHelpers.deletePattern('mock-tests:*');
  await cacheHelpers.deletePattern('admin-mock-tests:*');

  return ApiResponse.success(question, 'Question created successfully', 201);
});