import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          enrollments: {
            include: { course: true },
            where: { status: "ACTIVE" },
          },
          _count: {
            select: {
              enrollments: true,
              testAttempts: true,
              savedItems: true,
            },
          },
        },
      });
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      return NextResponse.json(user);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }
  }
  export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const session = await getServerSession(authOptions);

      const { id } = await params;

      if (!session || (session.user.id !== id && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await request.json();
      const { name, phone, address, nativeLanguage, learningLanguages, timezone, profilePicture } = body;

      const user = await prisma.user.update({
        where: { id },
        data: {
          name,
          phone,
          address,
          nativeLanguage,
          learningLanguages,
          timezone,
          profilePicture,
        },
      });
  
      return NextResponse.json(user);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
  }
