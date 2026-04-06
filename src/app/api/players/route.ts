import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const discipline = searchParams.get('discipline')

    const where: Record<string, unknown> = {}

    if (discipline) {
      where.tryouts = {
        some: {
          discipline: {
            name: discipline,
          },
        },
      }
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        tryouts: {
          include: {
            discipline: true,
          },
          orderBy: {
            discipline: {
              order: 'asc',
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error('Get players error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Allow admins and approved testers
    if (!session.isAdmin) {
      if (session.role !== 'tester') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
      // Verify tester is approved
      const tester = await prisma.tester.findUnique({
        where: { robloxId: session.robloxId },
      })
      if (!tester || !tester.approved) {
        return NextResponse.json(
          { error: 'Tester not approved' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { robloxId, username, displayName, avatarUrl } = body

    if (!robloxId || !username || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields: robloxId, username, displayName' },
        { status: 400 }
      )
    }

    const player = await prisma.player.create({
      data: {
        robloxId,
        username,
        displayName,
        avatarUrl,
      },
      include: {
        tryouts: {
          include: {
            discipline: true,
          },
        },
      },
    })

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Create player error:', error)
    
    // Handle unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A player with this Roblox ID already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
}
