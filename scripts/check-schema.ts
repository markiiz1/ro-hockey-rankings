import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  })
  const prisma = new PrismaClient({ adapter })

  // Check what unique constraints exist on Tryout
  // Just try a simple query to see the structure
  const result = await prisma.$queryRaw`PRAGMA index_list(Tryout)`
  console.log('Tryout indexes:', JSON.stringify(result, null, 2))

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
