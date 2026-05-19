import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'IMAGE' | 'VIDEO' | null;
  const folder = searchParams.get('folder');

  const where: any = {
    status: 'ACTIVE',
  };

  if (type) where.type = type;
  if (folder) where.folder = folder;

  const items = await prisma.galleryItem.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  return ApiResponse.success(items);
});