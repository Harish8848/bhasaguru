import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

type PrismaModelName = 'article' | 'course' | 'jobListing' | 'comment' | 'user';

interface BulkRequestBody {
  action: 'delete' | 'publish' | 'archive';
  model: PrismaModelName;
  ids: string[];
}

interface BulkResult {
  count: number;
}

const modelMap = {
    article: prisma.article,
    course: prisma.course,
    jobListing: prisma.jobListing,
    comment: prisma.comment,
    user: prisma.user,
  };

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const body: BulkRequestBody = await request.json();
  const { action, model, ids } = body;

  let result: BulkResult;

  const prismaModel = modelMap[model];

  switch (action) {
    case 'delete':
      result = await (prismaModel as any).deleteMany({
        where: { id: { in: ids } },
      });
      break;

    case 'publish':
      result = await (prismaModel as any).updateMany({
        where: { id: { in: ids } },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });
      break;

    case 'archive':
      result = await (prismaModel as any).updateMany({
        where: { id: { in: ids } },
        data: { status: 'ARCHIVED' },
      });
      break;

    default:
      throw new Error('Invalid action');
  }

  return ApiResponse.success(
    result,
    `Bulk ${action} completed: ${result.count} items affected`
  );
});

  export const adminHelpers = {
    // Generate admin report
    generateReport: async (type: 'users' | 'courses' | 'revenue') => {
      // Implementation for generating reports
    },
  
    // Export data
    exportData: async (model: string, format: 'csv' | 'json') => {
      // Implementation for data export
    },
  };