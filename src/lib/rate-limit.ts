import { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

export function checkRateLimit(request: NextRequest, limit?: number, windowMs?: number) {
  if (!rateLimit(request, limit, windowMs)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
}
