/** Shared helpers for the admin photo route handlers. */

export function apiConfig() {
  const base =
    process.env.RSVP_API_URL ??
    process.env.NEXT_PUBLIC_RSVP_API_URL ??
    'https://englajimmy-backend-production.up.railway.app'
  // Server-side only: never fall back to a NEXT_PUBLIC_* value, which ships to the browser.
  const key = process.env.RSVP_API_KEY ?? ''
  const headers: HeadersInit = {}
  if (key) headers['X-API-Key'] = key
  return { base, headers }
}

/** Same redirect-target logic the admin login route uses (Railway sits behind a proxy). */
export function redirectUrl(request: Request, path: string) {
  const origin = request.headers.get('origin')
  if (origin) return new URL(path, origin)

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  if (forwardedHost) return new URL(path, `${forwardedProto}://${forwardedHost}`)

  return new URL(path, request.url)
}
