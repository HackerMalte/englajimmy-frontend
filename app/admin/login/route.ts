import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const password = String(formData.get('password') ?? '')
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!adminPassword) {
    return NextResponse.redirect(new URL('/admin?error=2', request.url))
  }

  if (password !== adminPassword) {
    return NextResponse.redirect(new URL('/admin?error=1', request.url))
  }

  const response = NextResponse.redirect(new URL('/admin', request.url))
  response.cookies.set({
    name: 'admin_auth',
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return response
}
