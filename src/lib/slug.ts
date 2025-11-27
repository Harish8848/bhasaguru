import { prisma } from '@/lib/prisma';
import { JobListing,Article } from './prisma/client';

export {
    requireAuth,
    requireAdmin,
    requireModerator,
    optionalAuth,
} from './auth-middleware';


export function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  export async function generateUniqueSlug(
    text: string,
    model: 'course' | 'article' | 'job',
    existingSlug?: string
  ): Promise<string> {
    let slug = generateSlug(text);
    let counter = 1;
  
    while (true) {
      const exists = await checkSlugExists(slug, model, existingSlug);
      if (!exists) break;
      slug = `${generateSlug(text)}-${counter}`;
      counter++;
    }
  
    return slug;
  }
  
  async function checkSlugExists(
    slug: string,
    model: 'course' | 'article' | 'job',
    excludeSlug?: string
  ): Promise<boolean> {
    const where: any = { slug };
    if (excludeSlug) {
      where.slug = { not: excludeSlug };
    }

    const modelMap = {
      course: prisma.course,
      article: prisma.article,
      job: prisma.jobListing,
    };

    const count = await (modelMap[model] as any).count({ where });
    return count > 0;
  }
