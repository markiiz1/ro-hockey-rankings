import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  })
  const prisma = new PrismaClient({ adapter })

  const deleted = await prisma.tryout.deleteMany()
  console.log(`Deleted ${deleted.count} tryouts.`)

  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
