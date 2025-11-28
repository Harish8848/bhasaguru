import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();
  
    const questions = await prisma.question.findMany({
      where: { testId: params.id },
      orderBy: { order: 'asc' },
    });
  
    return ApiResponse.success(questions);
  });
  
  // POST - Add question to test
  export const POST = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();
  
    const body = await request.json();
  
    const question = await prisma.question.create({
      data: {
        ...body,
        testId: params.id,
      },
    });
  
    // Update test question count
    await prisma.mockTest.update({
      where: { id: params.id },
      data: {
        questionsCount: { increment: 1 },
      },
    });
  
    return ApiResponse.success(question, 'Question added successfully', 201);
  });