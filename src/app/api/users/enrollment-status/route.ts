import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ enrolled: false }, { status: 200 });
    }

    // If the user is enrolled in at least one course, they have access.
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    return NextResponse.json({ enrolled: !!enrollment });
  } catch {
    return NextResponse.json(
      { enrolled: false, error: "Failed to fetch enrollment status" },
      { status: 200 }
    );
  }
}

