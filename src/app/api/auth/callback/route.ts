import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getRobloxUser } from '@/lib/roblox-auth'
import { createSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect(new URL('/admin/login?error=no_code', request.url))
    }

    // Validate state
    const cookieState = request.cookies.get('oauth_state')?.value
    if (!cookieState || cookieState !== state) {
      return NextResponse.redirect(new URL('/admin/login?error=invalid_state', request.url))
    }

    // Exchange code for token
    let accessToken: string
    try {
      accessToken = await exchangeCodeForToken(code)
    } catch (error) {
      console.error('Failed to exchange code for token:', error)
      return NextResponse.redirect(new URL('/admin/login?error=token_error', request.url))
    }

    // Fetch user info
    let user: Awaited<ReturnType<typeof getRobloxUser>>
    try {
      user = await getRobloxUser(accessToken)
    } catch (error) {
      console.error('Failed to get Roblox user:', error)
      return NextResponse.redirect(new URL('/admin/login?error=user_info_error', request.url))
    }

    // Check if user is admin or owner
    const admin = await prisma.admin.findUnique({
      where: { robloxId: user.sub },
    })

    const isAdmin = !!admin || user.sub === process.env.OWNER_ROBLOX_ID

    if (isAdmin) {
      // Admin login
      // Auto-create admin entry for owner
      if (!admin && user.sub === process.env.OWNER_ROBLOX_ID) {
        await prisma.admin.create({
          data: {
            robloxId: user.sub,
            username: user.preferred_username,
            displayName: user.name,
            role: 'owner',
          },
        })
      }

      // Create session
      await createSession({
        robloxId: user.sub,
        username: user.preferred_username,
        displayName: user.name,
        avatarUrl: user.picture,
        isAdmin: true,
        role: admin?.role ?? (user.sub === process.env.OWNER_ROBLOX_ID ? 'owner' : 'admin'),
      })

      // Clear state cookie
      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.delete('oauth_state')
      return response
    }

    // Not an admin - check if they're a tester or register them
    let tester = await prisma.tester.findUnique({
      where: { robloxId: user.sub },
    })

    if (!tester) {
      // Auto-register as tester (pending approval)
      tester = await prisma.tester.create({
        data: {
          robloxId: user.sub,
          username: user.preferred_username,
          displayName: user.name,
          avatarUrl: user.picture,
          approved: false,
        },
      })
    }

    // Create tester session
    await createSession({
      robloxId: user.sub,
      username: user.preferred_username,
      displayName: user.name,
      avatarUrl: user.picture,
      isAdmin: false,
      role: 'tester',
    })

    // Redirect based on approval status
    if (tester.approved) {
      const response = NextResponse.redirect(new URL('/tester', request.url))
      response.cookies.delete('oauth_state')
      return response
    } else {
      const response = NextResponse.redirect(new URL('/tester?pending=1', request.url))
      response.cookies.delete('oauth_state')
      return response
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/admin/login?error=default', request.url))
  }
}
