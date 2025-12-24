import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cacheHelpers } from "@/lib/cache";

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const language = searchParams.get("language");
      const level = searchParams.get("level");
      const search = searchParams.get("search");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "12");

      // Generate a unique cache key based on all filter parameters
      const cacheKey = `courses:${language || 'all'}:${level || 'all'}:${search || 'none'}:${page}:${limit}`;

      // Try to fetch from cache first
      const cachedData = await cacheHelpers.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      const where: any = { status: "PUBLISHED" };
      if (language && language !== "all") where.language = language;
      if (level) where.level = level;

      // Filter by search term if provided
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
  
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            language: true,
            level: true,
            thumbnail: true,
            duration: true,
            lessonsCount: true,
            studentsCount: true,
            publishedAt: true,
          },
          orderBy: { publishedAt: "desc" },
        }),
        prisma.course.count({ where }),
      ]);
  
      const responseData = {
        courses,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Cache the result for 5 minutes (300 seconds)
      await cacheHelpers.set(cacheKey, responseData, 300);

      return NextResponse.json(responseData);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }
  }
  
  // POST /api/courses - Create course (Admin only)
  export async function POST(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      
      const course = await prisma.course.create({
        data: {
          ...body,
          slug: body.title.toLowerCase().replace(/\s+/g, "-"),
        },
      });

      // Invalidate course list cache
      await cacheHelpers.deletePattern('courses:*');
  
      return NextResponse.json(course, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create course" },
        { status: 500 }
      );
    }
  }
