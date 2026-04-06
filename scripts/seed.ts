import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const disciplines = [
  { name: 'HM', displayName: 'HM', icon: '🏒', description: 'HM League', order: 1 },
  { name: 'EKHL', displayName: 'EKHL', icon: '🏆', description: 'Elite Kontinental Hockey League', order: 2 },
  { name: 'CBH', displayName: 'CBH', icon: '⚡', description: 'CBH League', order: 3 },
  { name: 'RHV4', displayName: 'RHV4', icon: '⭐', description: 'Roblox Hockey V4', order: 4 },
  { name: 'BMHL', displayName: 'BMHL', icon: '🏅', description: 'BMHL League', order: 5 },
]

async function seed() {
  for (const d of disciplines) {
    await prisma.discipline.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    })
    console.log('Seeded:', d.name)
  }
  console.log('All disciplines seeded!')
  await prisma.$disconnect()
}

seed().catch(console.error)
