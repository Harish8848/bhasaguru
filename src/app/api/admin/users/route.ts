import { UserRole, AccountStatus } from '@/lib/prisma/enums';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

interface WhereClause {
  OR?: Array<{ email?: { contains: string; mode: 'insensitive' }; name?: { contains: string; mode: 'insensitive' } }>;
  role?: UserRole;
  status?: AccountStatus;
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const role = searchParams.get('role');
  const status = searchParams.get('status');

  const where: WhereClause = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) where.role = role as UserRole;
  if (status) where.status = status as AccountStatus;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            enrollments: true,
            testAttempts: true,
            jobApplications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return ApiResponse.paginated(users, total, page, limit);
});