const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID!
const ROBLOX_CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET!
const ROBLOX_REDIRECT_URL = process.env.ROBLOX_REDIRECT_URL!

const ROBLOX_OAUTH_BASE = 'https://apis.roblox.com/oauth/v1'

export interface RobloxUser {
  sub: string
  name: string
  preferred_username: string
  picture?: string
}

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: ROBLOX_CLIENT_ID,
    redirect_uri: ROBLOX_REDIRECT_URL,
    response_type: 'code',
    scope: 'openid profile',
    state,
  })
  return `${ROBLOX_OAUTH_BASE}/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch(`${ROBLOX_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${ROBLOX_CLIENT_ID}:${ROBLOX_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: ROBLOX_REDIRECT_URL,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function getRobloxUser(accessToken: string): Promise<RobloxUser> {
  const response = await fetch(`${ROBLOX_OAUTH_BASE}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch user info: ${error}`)
  }

  return response.json()
}
