export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
  
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
  
    // Page views over time
    const pageViews = await prisma.pageView.groupBy({
      by: ['path'],
      where: {
        viewedAt: { gte: startDate },
      },
      _count: true,
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    });
  
    // User registrations over time
    const usersByDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
  
    // Course enrollments by language
    const enrollmentsByLanguage = await prisma.$queryRaw`
      SELECT c.language, COUNT(e.id) as count
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.enrolled_at >= ${startDate}
      GROUP BY c.language
      ORDER BY count DESC
    `;
  
    return ApiResponse.success({
      pageViews,
      usersByDay,
      enrollmentsByLanguage,
    });
  });