import { NextRequest, NextResponse } from 'next/server'

// Cache: robloxId -> { url, expiresAt }
const cache = new Map<string, { url: string; expiresAt: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ robloxId: string }> }
) {
  try {
    const { robloxId } = await params

    if (!robloxId || !/^\d+$/.test(robloxId)) {
      return NextResponse.json({ imageUrl: null })
    }

    // Check cache first (prevents getting different URLs on every refresh)
    const cached = cache.get(robloxId)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ imageUrl: cached.url })
    }

    // Fetch fresh URL from Roblox
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return NextResponse.json({ imageUrl: null })
    }

    const data = await res.json()

    if (data.errors || !data.data?.[0]?.imageUrl) {
      return NextResponse.json({ imageUrl: null })
    }

    const imageUrl = data.data[0].imageUrl

    // Cache for 1 hour
    cache.set(robloxId, { url: imageUrl, expiresAt: Date.now() + CACHE_TTL })

    return NextResponse.json({ imageUrl })
  } catch {
    return NextResponse.json({ imageUrl: null })
  }
}
