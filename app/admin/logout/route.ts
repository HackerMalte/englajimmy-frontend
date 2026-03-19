import { NextResponse } from 'next/server'

function redirectUrl(request: Request, path: string) {
  const origin = request.headers.get('origin')
  if (origin) return new URL(path, origin)

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  if (forwardedHost) return new URL(path, `${forwardedProto}://${forwardedHost}`)

  return new URL(path, request.url)
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(redirectUrl(request, '/admin'))
  response.cookies.set({
    name: 'admin_auth',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
