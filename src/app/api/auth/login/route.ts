import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/roblox-auth'

export async function GET(request: NextRequest) {
  try {
    const state = crypto.randomUUID()

    const response = NextResponse.redirect(getAuthUrl(state))

    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login redirect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    )
  }
}
