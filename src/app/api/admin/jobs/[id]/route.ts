import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - Get single job listing (admin)
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const job = await prisma.jobListing.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      },
    },
  });

  if (!job) {
    return ApiResponse.notFound('Job listing not found');
  }

  return ApiResponse.success(job);
});

// PATCH - Update job listing
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;
  const body = await request.json();

  const updateData: any = { ...body };

  if (body.expiresAt) {
    updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  }

  const job = await prisma.jobListing.update({
    where: { id },
    data: updateData,
  });

  return ApiResponse.success(job, 'Job listing updated successfully');
});

// DELETE - Delete job listing
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const job = await prisma.jobListing.findUnique({
    where: { id },
  });

  if (!job) {
    return ApiResponse.notFound('Job listing not found');
  }

  await prisma.jobListing.delete({
    where: { id },
  });

  return ApiResponse.success(null, 'Job listing deleted successfully');
});
