import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    const body = await request.json()
    const { completed, timeSpent, lastPosition } = body

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: id,
        },
      },
      update: {
        completed: completed !== undefined ? completed : undefined,
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
        lastPosition: lastPosition ?? undefined,
        updatedAt: new Date(),
        completedAt: completed ? new Date() : (completed === false ? null : undefined), // If explicitly set to false, clear completedAt? Or keep it? Usually keep history. But if untoggling?
        // If completed becomes false, we should probably clear completedAt.
      },
      create: {
        userId: session.user.id,
        lessonId: id,
        completed: completed || false,
        timeSpent: timeSpent || 0,
        lastPosition: lastPosition || 0,
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, data: progress })
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
