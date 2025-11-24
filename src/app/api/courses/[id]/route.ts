import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
  
      const course = await prisma.course.findUnique({
        where: { id: params.id },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              type: true,
              duration: true,
              order: true,
              isFree: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });
  
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
  
      // Check if user is enrolled
      let isEnrolled = false;
      if (session) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: params.id,
            },
          },
        });
        isEnrolled = !!enrollment;
      }
  
      return NextResponse.json({ ...course, isEnrolled });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch course" },
        { status: 500 }
      );
    }
  }