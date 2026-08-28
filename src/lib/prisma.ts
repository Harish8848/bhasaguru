import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

// The app uses Prisma Accelerate. `DATABASE_URL` is an Accelerate connection
// string (prisma+postgres://...). In Prisma 7, Accelerate connections are
// configured by passing `accelerateUrl` to the PrismaClient constructor.
function createPrismaClient() {
  const accelerateUrl = process.env.DATABASE_URL
  if (!accelerateUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return new PrismaClient({
    accelerateUrl,
  })
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma