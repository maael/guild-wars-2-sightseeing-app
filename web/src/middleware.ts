/* eslint-disable @next/next/no-server-import-in-page */
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import fetch from 'isomorphic-fetch'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const existing = (request.cookies as any).get('gw2-account')
  console.info('existing', existing)
  const apiKey = ''
  const res = await fetch('https://api.guildwars2.com/v2/account', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }).then((r) => r.json())
  const cookie = {
    name: res.name,
    access: res.access,
  }
  ;(response.cookies as any).set('gw2-account', JSON.stringify(cookie))
  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:route*',
}
