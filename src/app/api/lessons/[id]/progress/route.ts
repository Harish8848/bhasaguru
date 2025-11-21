export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const { completed, timeSpent, lastPosition } = body;
  
      const progress = await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: params.id,
          },
        },
        update: {
          completed: completed ?? undefined,
          timeSpent: timeSpent ?? undefined,
          lastPosition: lastPosition ?? undefined,
          completedAt: completed ? new Date() : undefined,
        },
        create: {
          userId: session.user.id,
          lessonId: params.id,
          completed: completed ?? false,
          timeSpent: timeSpent ?? 0,
          lastPosition: lastPosition ?? null,
        },
      });
  
      // Update enrollment progress
      if (completed) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: params.id },
        });
  
        if (lesson) {
          const enrollment = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: session.user.id,
                courseId: lesson.courseId,
              },
            },
          });
  
          if (enrollment) {
            const totalLessons = await prisma.lesson.count({
              where: { courseId: lesson.courseId },
            });
  
            const completedLessons = await prisma.progress.count({
              where: {
                userId: session.user.id,
                completed: true,
                lesson: { courseId: lesson.courseId },
              },
            });
  
            await prisma.enrollment.update({
              where: { id: enrollment.id },
              data: {
                completedLessons,
                progressPercent: Math.round((completedLessons / totalLessons) * 100),
                lastAccessedAt: new Date(),
              },
            });
          }
        }
      }
  
      return NextResponse.json(progress);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }
  }