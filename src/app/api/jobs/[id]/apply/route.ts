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
      const { resumeUrl, coverLetter } = body;
  
      // Check if already applied
      const existing = await prisma.jobApplication.findUnique({
        where: {
          userId_jobId: {
            userId: session.user.id,
            jobId: params.id,
          },
        },
      });
  
      if (existing) {
        return NextResponse.json(
          { error: "Already applied" },
          { status: 400 }
        );
      }
  
      const application = await prisma.jobApplication.create({
        data: {
          userId: session.user.id,
          jobId: params.id,
          resumeUrl,
          coverLetter,
        },
      });
  
      // Increment application count
      await prisma.jobListing.update({
        where: { id: params.id },
        data: { applicationCount: { increment: 1 } },
      });
  
      return NextResponse.json(application, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }
  }
  