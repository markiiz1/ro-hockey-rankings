import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  // When DATABASE_URL points to postgresql/neon, Prisma uses its native driver automatically.
  // No adapter is needed for PostgreSQL.
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = createPrismaClient()
