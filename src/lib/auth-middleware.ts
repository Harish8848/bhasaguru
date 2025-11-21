import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@/lib/prisma/client';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error('Forbidden: Admin access required');
  }
  
  return session;
}

export async function requireModerator() {
  const session = await requireAuth();
  
  if (![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role as UserRole)) {
    throw new Error('Forbidden: Moderator access required');
  }
  
  return session;
}

export async function optionalAuth() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch {
    return null;
  }
}