import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';


const cache = new Map<string, { data: any; expiresAt: number }>();

export const cacheHelpers = {
  get: async <T>(key: string): Promise<T | null> => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  },

  set: async (key: string, data: any, ttlSeconds: number = 300) => {
    cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  delete: async (key: string) => {
    cache.delete(key);
  },

  clear: async () => {
    cache.clear();
  },
};

export async function GET(request: NextRequest) {
  const cacheKey = 'courses:all';
  
  const cached = await cacheHelpers.get(cacheKey);
  if (cached) {
    return ApiResponse.success(cached);
  }
  
  const data = await prisma.course.findMany();
  await cacheHelpers.set(cacheKey, data, 600); // 10 minutes
  
  return ApiResponse.success(data);
}