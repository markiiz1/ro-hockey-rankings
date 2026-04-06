import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const disciplines = await prisma.discipline.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(disciplines)
  } catch (error) {
    console.error('Get disciplines error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch disciplines' },
      { status: 500 }
    )
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
    const { name, displayName, description, icon, order } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    const discipline = await prisma.discipline.create({
      data: {
        name,
        displayName: displayName ?? '',
        description: description ?? '',
        icon: icon ?? '',
        order: order ?? 0,
      },
    })

    return NextResponse.json(discipline, { status: 201 })
  } catch (error) {
    console.error('Create discipline error:', error)
    return NextResponse.json(
      { error: 'Failed to create discipline' },
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
    const { id, name, displayName, description, icon, order, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    const discipline = await prisma.discipline.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(discipline)
  } catch (error) {
    console.error('Update discipline error:', error)
    return NextResponse.json(
      { error: 'Failed to update discipline' },
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

    await prisma.discipline.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Discipline deleted successfully' })
  } catch (error) {
    console.error('Delete discipline error:', error)
    return NextResponse.json(
      { error: 'Failed to delete discipline' },
      { status: 500 }
    )
  }
}
