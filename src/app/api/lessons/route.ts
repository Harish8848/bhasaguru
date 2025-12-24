import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheHelpers } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const cacheKey = `lessons:${language || 'all'}:${level || 'all'}:${search || 'none'}:${page}:${limit}`;

    const cachedData = await cacheHelpers.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const where: any = {};

    // Filter by language and/or level if provided
    if (language && language !== "all") {
      where.course = {
        language: language,
      };
    }

    if (level) {
      where.course = {
        ...where.course,
        level: level,
      };
    }

    // Filter by search term if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { course: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Optimize query: Get lessons with course information and count in a single transaction
    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.lesson.count({ where })
    ]);

    // Transform the data to match the component's expected format
    const transformedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      course: lesson.course.title,
      language: lesson.course.language,
      type: lesson.type.toLowerCase(), // "video", "text", "audio" etc.
      duration: lesson.duration ? `${lesson.duration} min` : undefined,
      views: Math.floor(Math.random() * 5000) + 100, // Mock views for now
      level: lesson.course.level,
      description: lesson.description,
      isFree: lesson.isFree,
      slug: lesson.slug,
    }));

    const responseData = {
      lessons: transformedLessons,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await cacheHelpers.set(cacheKey, responseData, 300);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
