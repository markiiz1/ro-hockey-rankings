import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const discipline = searchParams.get('discipline')
    const tier = searchParams.get('tier')
    const region = searchParams.get('region')
    const position = searchParams.get('position')

    const where: Record<string, unknown> = {}

    if (discipline) {
      where.discipline = { name: discipline }
    }
    if (tier) {
      where.tier = tier
    }
    if (region) {
      where.region = region
    }
    if (position) {
      where.position = position
    }

    const tryouts = await prisma.tryout.findMany({
      where,
      include: {
        player: true,
        discipline: true,
      },
      orderBy: [
        { elo: 'desc' },
      ],
    })

    return NextResponse.json(tryouts)
  } catch (error) {
    console.error('Get tryouts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tryouts' },
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

    const body = await request.json()
    const { playerId, disciplineId, tier, tierLabel, elo, notes, region, position, puckHandling, scoring, defense, passing, saves, positioning, rebound, goalieDefense } = body

    if (!playerId || !disciplineId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId, disciplineId, tier' },
        { status: 400 }
      )
    }

    const tryoutRegion = region || 'EU'
    const tryoutPosition = position || 'Field'
    const tryoutElo = elo ?? 1000

    // Verify player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Verify discipline exists
    const discipline = await prisma.discipline.findUnique({
      where: { id: disciplineId },
    })

    if (!discipline) {
      return NextResponse.json(
        { error: 'Discipline not found' },
        { status: 404 }
      )
    }

    // Check 14-day cooldown
    const existingTryout = await prisma.tryout.findFirst({
      where: {
        playerId,
        disciplineId,
        region: tryoutRegion,
        position: tryoutPosition,
      },
    })

    if (existingTryout) {
      const daysSinceLastTryout = (Date.now() - new Date(existingTryout.date).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastTryout < 14) {
        const daysLeft = Math.ceil(14 - daysSinceLastTryout)
        return NextResponse.json(
          { error: `Tryout cooldown active. ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining.` },
          { status: 429 }
        )
      }
    }

    // ELO logic: if re-tryouting and new ELO is worse, use the lower ELO
    let finalElo = tryoutElo
    if (existingTryout && tryoutElo < existingTryout.elo) {
      finalElo = tryoutElo // Player got worse — they lose ELO
    } else if (existingTryout && tryoutElo >= existingTryout.elo) {
      finalElo = tryoutElo // Player improved or same — use new ELO
    }

    const ratingFields = {
      puckHandling: puckHandling ?? null,
      scoring: scoring ?? null,
      defense: defense ?? null,
      passing: passing ?? null,
      saves: saves ?? null,
      positioning: positioning ?? null,
      rebound: rebound ?? null,
      goalieDefense: goalieDefense ?? null,
    }

    // Check if tester is approved (if not admin)
    if (!session.isAdmin && session.role === 'tester') {
      const tester = await prisma.tester.findUnique({
        where: { robloxId: session.robloxId },
      })

      if (!tester || !tester.approved) {
        return NextResponse.json(
          { error: 'Tester not approved by admin' },
          { status: 403 }
        )
      }

      let tryout;
      if (existingTryout) {
        tryout = await prisma.tryout.update({
          where: { id: existingTryout.id },
          data: {
            tier,
            tierLabel: tierLabel ?? '',
            elo: finalElo,
            notes: notes ?? '',
            reviewedBy: session.robloxId,
            testerId: tester.id,
            date: new Date(),
            ...ratingFields,
          },
          include: { player: true, discipline: true },
        })
      } else {
        tryout = await prisma.tryout.create({
          data: {
            playerId,
            disciplineId,
            tier,
            tierLabel: tierLabel ?? '',
            elo: finalElo,
            notes: notes ?? '',
            reviewedBy: session.robloxId,
            testerId: tester.id,
            region: tryoutRegion,
            position: tryoutPosition,
            ...ratingFields,
          },
          include: { player: true, discipline: true },
        })
      }

      return NextResponse.json(tryout, { status: 201 })
    }

    // Admin flow
    if (!session.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    let tryout;
    if (existingTryout) {
      tryout = await prisma.tryout.update({
        where: { id: existingTryout.id },
        data: {
          tier,
          tierLabel: tierLabel ?? '',
          elo: finalElo,
          notes: notes ?? '',
          reviewedBy: session.robloxId,
          date: new Date(),
          ...ratingFields,
        },
        include: { player: true, discipline: true },
      })
    } else {
      tryout = await prisma.tryout.create({
        data: {
          playerId,
          disciplineId,
          tier,
          tierLabel: tierLabel ?? '',
          elo: finalElo,
          notes: notes ?? '',
          reviewedBy: session.robloxId,
          region: tryoutRegion,
          position: tryoutPosition,
          ...ratingFields,
        },
        include: { player: true, discipline: true },
      })
    }

    // Log the action
    await prisma.adminLog.create({
      data: {
        adminId: session.robloxId,
        action: 'create_tryout',
        details: `Created/updated tryout for player ${player.username} in ${discipline.name} (${tryoutRegion}/${tryoutPosition}) with tier ${tier}, ELO ${finalElo}`,
      },
    })

    return NextResponse.json(tryout, { status: 201 })
  } catch (error) {
    console.error('Create tryout error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to create tryout: ${message}` },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, tier, tierLabel, elo, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const tryout = await prisma.tryout.update({
      where: { id },
      data: {
        ...(tier !== undefined && { tier }),
        ...(tierLabel !== undefined && { tierLabel }),
        ...(elo !== undefined && { elo }),
        ...(notes !== undefined && { notes }),
        reviewedBy: session.robloxId,
        date: new Date(),
      },
      include: {
        player: true,
        discipline: true,
      },
    })

    // Log the action
    await prisma.adminLog.create({
      data: {
        adminId: session.robloxId,
        action: 'update_tryout',
        details: `Updated tryout ${id} for player ${tryout.player.username} in discipline ${tryout.discipline.name}`,
      },
    })

    return NextResponse.json(tryout)
  } catch (error) {
    console.error('Update tryout error:', error)
    return NextResponse.json(
      { error: 'Failed to update tryout' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      )
    }

    // Fetch tryout info for logging before deletion
    const tryout = await prisma.tryout.findUnique({
      where: { id },
      include: {
        player: true,
        discipline: true,
      },
    })

    if (!tryout) {
      return NextResponse.json(
        { error: 'Tryout not found' },
        { status: 404 }
      )
    }

    await prisma.tryout.delete({
      where: { id },
    })

    // Log the action
    await prisma.adminLog.create({
      data: {
        adminId: session.robloxId,
        action: 'delete_tryout',
        details: `Deleted tryout for player ${tryout.player.username} in discipline ${tryout.discipline.name}`,
      },
    })

    return NextResponse.json({ message: 'Tryout deleted successfully' })
  } catch (error) {
    console.error('Delete tryout error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tryout' },
      { status: 500 }
    )
  }
}
