import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const player = await prisma.player.findUnique({
      where: { id },
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
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Get player by ID error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.player.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Player deleted successfully' })
  } catch (error) {
    console.error('Delete player error:', error)
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { robloxId, username, displayName, avatarUrl } = body

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...(robloxId !== undefined && { robloxId }),
        ...(username !== undefined && { username }),
        ...(displayName !== undefined && { displayName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      include: {
        tryouts: {
          include: {
            discipline: true,
          },
        },
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Update player error:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
}
