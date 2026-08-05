import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

/**
 * What our student says
  - GET: returns latest published student feedback derived from user enrollments.
 *   (Stored as Comment rows in Prisma under a dedicated Article container.)
 * - POST: authenticated enrolled user can create a new feedback comment (auto-published).
 */

const FEEDBACK_ARTICLE_SLUG = 'student-feedback';


async function getOrCreateFeedbackArticle() {
  // This uses the existing Prisma model: Article + Comment.
  // We treat the article as a container for student feedback.
  const existing = await prisma.article.findUnique({
    where: { slug: FEEDBACK_ARTICLE_SLUG },
  });

  if (existing) return existing;

  return prisma.article.create({
    data: {
      slug: FEEDBACK_ARTICLE_SLUG,
      title: 'What our student says',
      excerpt: 'Student feedback about learning experience',
      content: 'Student feedback container (auto-created).',
      language: 'en',
      category: 'student-feedback',
      tags: ['student', 'feedback'],
      status: 'PUBLISHED',
      viewCount: 0,
    },
    select: { id: true },
  });
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 12), 50);

  const article = await prisma.article.findUnique({
    where: { slug: FEEDBACK_ARTICLE_SLUG },
    select: { id: true },
  });

  if (!article) {
    return ApiResponse.success({ comments: [] as Array<{ id: string; content: string; createdAt: Date; user: { name: string | null; address: string | null } }> });
  }


  const comments = await prisma.comment.findMany({
    where: {
      articleId: article.id,
      // student feedback is stored in a dedicated Article container
      // and is auto-published (no admin approval required)
      // (kept for backward compatibility)
      isApproved: true,

    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          address: true,
        },
      },
    },
  });

  // Shape data for the UI
  const response = ApiResponse.success({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: {
        name: c.user.name,
        address: c.user.address,
      },
    })),
  });

  // Prevent caching so new submissions appear immediately
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');

  return response;
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return ApiResponse.unauthorized('Unauthorized');
  }

  const body = await request.json().catch(() => ({}));
  const content = (body as { content?: unknown } | null)?.content;


  if (typeof content !== 'string' || content.trim().length < 3) {
    return ApiResponse.error('Content must be at least 3 characters', 400);
  }


  // Ensure enrolled in at least one course
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  if (!enrollment) {
    return ApiResponse.forbidden('You must be enrolled to submit feedback');
  }

  const article = await getOrCreateFeedbackArticle();

  // Create a new comment; by default it will be unapproved.
  // (If you want auto-approval, change isApproved to true.)
  const comment = await prisma.comment.create({
    data: {
      articleId: article.id,
      userId: session.user.id,
      content: content.trim(),
      isApproved: true,
    },

    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });

  return ApiResponse.success({
    comment,
    status: 'PUBLISHED',
  }, 'Feedback submitted successfully', 201);


});

