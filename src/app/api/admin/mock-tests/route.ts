import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { TestType } from '@/generated/prisma/client';

// GET - List all mock tests (admin)
export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const type = searchParams.get('type') as TestType | null;

  const where: any = {};
  if (type) where.type = type;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [tests, total] = await Promise.all([
    prisma.mockTest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
      },
    }),
    prisma.mockTest.count({ where }),
  ]);

  return ApiResponse.success({
    data: tests,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// POST - Create new mock test
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const body = await request.json();
  const {
    courseId,
    title,
    description,
    language,
    module,
    section,
    standardSection,
    type,
    duration,
    passingScore,
    shuffleQuestions,
    shuffleOptions,
    showResults,
    allowRetake,
  } = body;

  if (!title || !type || !duration) {
    return ApiResponse.error('Title, type, and duration are required', 400);
  }

  const test = await prisma.mockTest.create({
    data: {
      courseId: courseId || null,
      title,
      description: description || null,
      language: language || null,
      module: module || null,
      section: section || null,
      standardSection: standardSection || null,
      type,
      duration: parseInt(duration),
      passingScore: parseInt(passingScore || '60'),
      questionsCount: 0,
      shuffleQuestions: shuffleQuestions ?? true,
      shuffleOptions: shuffleOptions ?? true,
      showResults: showResults ?? true,
      allowRetake: allowRetake ?? true,
    },
  });

  return ApiResponse.success(test, undefined, 201);
});
