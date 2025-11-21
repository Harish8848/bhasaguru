export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const user = await prisma.user.findUnique({
        where: { id: params.id },
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
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session || (session.user.id !== params.id && session.user.role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const { name, nativeLanguage, learningLanguages, timezone } = body;
  
      const user = await prisma.user.update({
        where: { id: params.id },
        data: {
          name,
          nativeLanguage,
          learningLanguages,
          timezone,
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
  