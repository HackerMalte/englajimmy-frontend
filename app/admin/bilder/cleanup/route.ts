import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiConfig, redirectUrl } from '../_shared'

export async function POST(request: Request) {
  if (cookies().get('admin_auth')?.value !== '1') {
    return NextResponse.redirect(redirectUrl(request, '/admin'))
  }

  const { base, headers } = apiConfig()
  let deleted = 0
  try {
    const res = await fetch(`${base}/photos/cleanup-orphans`, {
      method: 'POST',
      headers,
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      deleted = Number(data?.deleted ?? 0)
    }
  } catch {
    // Surface nothing beyond a zero count; the page reloads either way.
  }

  return NextResponse.redirect(redirectUrl(request, `/admin/bilder?cleaned=${deleted}`))
}
