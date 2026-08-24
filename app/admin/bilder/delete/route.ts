import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { apiConfig, redirectUrl } from '../_shared'

export async function POST(request: Request) {
  if (cookies().get('admin_auth')?.value !== '1') {
    return NextResponse.redirect(redirectUrl(request, '/admin'))
  }

  const formData = await request.formData()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.redirect(redirectUrl(request, '/admin/bilder'))
  }

  const { base, headers } = apiConfig()
  await fetch(`${base}/photos/${id}`, { method: 'DELETE', headers, cache: 'no-store' })

  return NextResponse.redirect(redirectUrl(request, '/admin/bilder'))
}
