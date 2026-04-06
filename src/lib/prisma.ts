import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = createPrismaClient()

// ============================================================
// PRODUCTION: When deploying to Vercel with Turso, replace the
// entire content of this file with:
//
// import { PrismaClient } from '@prisma/client'
// import { PrismaLibSql } from '@prisma/adapter-libsql'
// import { createClient } from '@libsql/client'
//
// const client = createClient({
//   url: process.env.DATABASE_URL!,
//   authToken: process.env.DATABASE_AUTH_TOKEN,
// })
//
// const adapter = new PrismaLibSql(client)
//
// export const prisma = new PrismaClient({ adapter })
// ============================================================
