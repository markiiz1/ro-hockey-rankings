import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {

  const { Pool } = require('pg')
  const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
 } else {
   // Development: Use local SQLite
   const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || 'file:./dev.db',
    })
    return new PrismaClient({ adapter })
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = createPrismaClient()