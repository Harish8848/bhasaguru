import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const body = await request.json();
  
    const test = await prisma.mockTest.create({
      data: body,
    });
  
    return ApiResponse.success(test, 'Test created successfully', 201);
  });