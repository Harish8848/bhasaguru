import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper function to check profile completion
export function isProfileComplete(user: { name: string | null; phone: string | null; address: string | null }) {
  return !!(user.name && user.name.trim() !== '' && user.phone && user.phone.trim() !== '' && user.address && user.address.trim() !== '');
}

// POST /api/courses/[id]/enroll - Enroll in a course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const userId = session.user.id;

    // Check if user has completed their profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true, address: true },
    });

    if (!user || !isProfileComplete(user)) {
      return NextResponse.json(
        { 
          error: "profile_incomplete",
          message: "Please complete your profile before enrolling. Add your name, phone number, and address."
        },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "ACTIVE",
      },
      include: {
        course: true,
      },
    });

    // Update course student count
    await prisma.course.update({
      where: { id: courseId },
      data: { studentsCount: { increment: 1 } },
    });

    return NextResponse.json(
      { 
        message: "Successfully enrolled in course",
        enrollment 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
