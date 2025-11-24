import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Session {
  user?: {
    id?: string;
    role?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    const body = await request.json();
    const { path, referrer } = body;

    const userAgent = request.headers.get("user-agent");
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || "unknown";

    await prisma.pageView.create({
      data: {
        path,
        referrer,
        userId: session?.user?.id,
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Silent fail for analytics
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

export const apiHelpers = {
  // Check if user is admin
  isAdmin: async (session: Session | null) => {
    return session?.user?.role === "ADMIN";
  },

  // Check if user has access to course
  hasAccessToCourse: async (userId: string, courseId: string) => {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
    return !!enrollment;
  },

  // Paginate results
  paginate: (page: number, limit: number) => ({
    skip: (page - 1) * limit,
    take: limit,
  }),

  // Format pagination response
  paginationMeta: (total: number, page: number, limit: number) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  }),
};