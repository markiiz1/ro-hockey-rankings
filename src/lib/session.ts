import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback_secret'
)

export interface SessionData {
  robloxId: string
  username: string
  displayName: string
  avatarUrl?: string
  isAdmin: boolean
  role?: string
}

const SESSION_COOKIE_NAME = 'ro-hockey-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SESSION_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)
    return payload as unknown as SessionData
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
