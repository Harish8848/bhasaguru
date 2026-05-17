import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    await requireAdmin();
    const { id } = await params;
  
    const questions = await prisma.question.findMany({
      where: { testId: id },
      orderBy: { order: 'asc' },
    });
  
    return ApiResponse.success(questions);
  });
  
  // POST - Add question to test
  export const POST = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    await requireAdmin();
    const { id } = await params;
  
    const body = await request.json();
  
    const question = await prisma.question.create({
      data: {
        ...body,
        testId: id,
      },
    });
  
    // Update test question count
    await prisma.mockTest.update({
      where: { id },
      data: {
        questionsCount: { increment: 1 },
      },
    });
  
    return ApiResponse.success(question, 'Question added successfully', 201);
  });