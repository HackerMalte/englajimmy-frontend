import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.redirect('/admin')
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
