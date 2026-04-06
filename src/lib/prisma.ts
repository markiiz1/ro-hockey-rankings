import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
    return new PrismaClient({ adapter: new PrismaPg(pool) })
  }
  // Development: SQLite fallback
  return new PrismaClient({ adapter: undefined })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = createPrismaClient()
}
