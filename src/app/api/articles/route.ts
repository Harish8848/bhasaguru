import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const language = searchParams.get("language");
      const category = searchParams.get("category");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
  
      const where: any = { status: "PUBLISHED" };
      if (language) where.language = language;
      if (category) where.category = category;
  
      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            language: true,
            category: true,
            tags: true,
            featuredImage: true,
            readTime: true,
            viewCount: true,
            authorName: true,
            publishedAt: true,
          },
          orderBy: { publishedAt: "desc" },
        }),
        prisma.article.count({ where }),
      ]);
  
      return NextResponse.json({
        articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch articles" },
        { status: 500 }
      );
    }
  }