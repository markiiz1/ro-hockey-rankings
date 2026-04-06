import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const testers = await prisma.tester.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(testers)
  } catch (error) {
    console.error('Get testers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testers' },
      { status: 500 }
    )
  }
}

async function fetchRobloxUser(userId: string) {
  try {
    const res = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      console.error(`Roblox API returned ${res.status} for user ${userId}`)
      return null
    }
    const data = await res.json()
    if (!data.name) {
      console.error('Roblox API response missing "name" field:', data)
      return null
    }
    return data
  } catch (error) {
    console.error('Failed to fetch Roblox user:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { testerId, action, robloxId } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      )
    }

    // Owner-only: add tester by Roblox ID
    if (action === 'add') {
      if (session.role !== 'owner') {
        return NextResponse.json(
          { error: 'Only the owner can add testers' },
          { status: 403 }
        )
      }

      if (!robloxId) {
        return NextResponse.json(
          { error: 'Missing required field: robloxId' },
          { status: 400 }
        )
      }

      // Check if tester already exists
      const existing = await prisma.tester.findUnique({
        where: { robloxId: String(robloxId) },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Tester with this Roblox ID already exists' },
          { status: 409 }
        )
      }

      // Fetch Roblox user info
      const robloxUser = await fetchRobloxUser(String(robloxId))
      if (!robloxUser) {
        return NextResponse.json(
          { error: 'Roblox user not found' },
          { status: 404 }
        )
      }

      const tester = await prisma.tester.create({
        data: {
          robloxId: String(robloxId),
          username: robloxUser.name,
          displayName: robloxUser.displayName,
          avatarUrl: null,
          approved: true,
        },
      })

      return NextResponse.json(tester, { status: 201 })
    }

    if (!testerId) {
      return NextResponse.json(
        { error: 'Missing required field: testerId' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'remove') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "remove"' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      const tester = await prisma.tester.update({
        where: { id: testerId },
        data: { approved: true },
      })

      return NextResponse.json(tester)
    }

    // action === 'remove'
    await prisma.tester.delete({
      where: { id: testerId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update tester error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to update tester: ${message}` },
      { status: 500 }
    )
  }
}
