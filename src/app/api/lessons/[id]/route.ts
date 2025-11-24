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
  
      const lesson = await prisma.lesson.findUnique({
        where: { id: params.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              language: true,
              level: true,
            },
          },
        },
      });
  
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
  
      // Check if user has access
      if (!lesson.isFree && session) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: lesson.courseId,
            },
          },
        });
  
        if (!enrollment) {
          return NextResponse.json(
            { error: "Not enrolled in this course" },
            { status: 403 }
          );
        }
      }
  
      // Get user progress if logged in
      let progress = null;
      if (session) {
        progress = await prisma.progress.findUnique({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: params.id,
            },
          },
        });
      }
  
      return NextResponse.json({ ...lesson, progress });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch lesson" },
        { status: 500 }
      );
    }
  }