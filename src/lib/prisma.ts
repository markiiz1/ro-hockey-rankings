 import { PrismaClient } from '@prisma/client'

 const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

 function createPrismaClient() {
   // Prisma natively supports PostgreSQL - no adapter needed!
   return new PrismaClient()
 }

 export const prisma = globalForPrisma.prisma || createPrismaClient()

 if (process.env.NODE_ENV !== 'production') {
   globalForPrisma.prisma = createPrismaClient()
 }
