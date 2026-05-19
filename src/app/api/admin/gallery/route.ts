import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - List all gallery items
export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'IMAGE' | 'VIDEO' | null;
  const status = searchParams.get('status');

  const where: any = {};

  if (type) where.type = type;
  if (status) where.status = status;

  const items = await prisma.galleryItem.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  return ApiResponse.success(items);
});

// POST - Create new gallery item
export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, type, url, thumbnail, alt, caption, size, width, height, folder, status, order } = body;

  if (!title || !type || !url) {
    return NextResponse.json(
      { error: 'Title, type, and url are required' },
      { status: 400 }
    );
  }

  const item = await prisma.galleryItem.create({
    data: {
      title,
      type,
      url,
      thumbnail: thumbnail || null,
      alt: alt || null,
      caption: caption || null,
      size: size || null,
      width: width || null,
      height: height || null,
      folder: folder || 'gallery',
      status: status || 'ACTIVE',
      order: order || 0,
    },
  });

  return ApiResponse.success(item);
});