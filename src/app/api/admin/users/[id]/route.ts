import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();
  
    const body = await request.json();
    const { role, status } = body;
  
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
    });
  
    return ApiResponse.success(user, 'User updated successfully');
  });
  
  // DELETE - Delete user (soft delete)
  export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();
  
    await prisma.user.update({
      where: { id: params.id },
      data: { status: 'DELETED' },
    });
  
    return ApiResponse.success(null, 'User deleted successfully');
  });
  