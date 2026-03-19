import { cookies } from 'next/headers'
import { Header } from '../components/Header'

type Rsvp = {
  id?: number
  name: string
  email: string
  coming: boolean
  allergies?: string | null
  transport_assist?: boolean
  created_at?: string
}

function formatDate(iso?: string) {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function getRsvps(): Promise<Rsvp[]> {
  const apiBase =
    process.env.RSVP_API_URL ??
    process.env.NEXT_PUBLIC_RSVP_API_URL ??
    'https://englajimmy-backend-production.up.railway.app'

  const apiKey = process.env.RSVP_API_KEY ?? process.env.NEXT_PUBLIC_RSVP_API_KEY ?? ''
  const headers: HeadersInit = {}
  if (apiKey) headers['X-API-Key'] = apiKey

  const res = await fetch(`${apiBase}/rsvps`, {
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Kunde inte hämta OSA (${res.status})`)
  }

  const data = await res.json()
  if (Array.isArray(data)) return data as Rsvp[]
  if (Array.isArray(data?.items)) return data.items as Rsvp[]
  if (Array.isArray(data?.rsvps)) return data.rsvps as Rsvp[]
  return []
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const isAuthenticated = cookies().get('admin_auth')?.value === '1'

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-20 sm:pt-24 pb-16 px-4">
          <div className="max-w-md mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="font-serif text-2xl text-black mb-2">Admin</h1>
            <p className="text-sm text-gray-600 mb-6">
              Ange lösenord för att se OSA-listan.
            </p>

            {searchParams?.error === '1' && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                Fel losenord, forsok igen.
              </p>
            )}
            {searchParams?.error === '2' && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                ADMIN_PASSWORD saknas i miljo-variabler.
              </p>
            )}

            <form action="/admin/login" method="post" className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm text-black mb-1.5">
                  Lösenord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-black rounded focus:outline-none focus:ring-1 focus:ring-[#B8D4E3] focus:border-[#B8D4E3]"
                  placeholder="********"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 text-sm font-medium text-black rounded hover:opacity-80 transition-colors"
                style={{ backgroundColor: 'var(--pastel-green)' }}
              >
                Logga in
              </button>
            </form>
          </div>
        </main>
      </>
    )
  }

  let rsvps: Rsvp[] = []
  let loadError: string | null = null

  try {
    rsvps = await getRsvps()
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Något gick fel när OSA hämtades.'
  }

  const attending = rsvps.filter((rsvp) => rsvp.coming)
  const notAttending = rsvps.filter((rsvp) => !rsvp.coming)
  const transportAssistCount = attending.filter((rsvp) => rsvp.transport_assist).length

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20 sm:pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl text-black">Admin - OSA</h1>
              <p className="text-sm text-gray-600 mt-1">Gaster som svarat pa inbjudan.</p>
            </div>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-black rounded border border-gray-300 hover:bg-gray-50"
              >
                Logga ut
              </button>
            </form>
          </div>

          {loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {loadError}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Totalt</p>
                  <p className="text-2xl font-semibold text-black">{rsvps.length}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Kommer</p>
                  <p className="text-2xl font-semibold text-black">{attending.length}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Transporthjalp</p>
                  <p className="text-2xl font-semibold text-black">{transportAssistCount}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">
                        Namn
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">
                        E-post
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">
                        Kommer
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">
                        Allergier
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">
                        Transport
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide px-4 py-3">
                        Skapad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attending.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>
                          Inga gaster markerade som "kommer" an.
                        </td>
                      </tr>
                    ) : (
                      attending.map((rsvp, index) => (
                        <tr key={`${rsvp.email}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-black">{rsvp.name}</td>
                          <td className="px-4 py-3 text-sm text-black">{rsvp.email}</td>
                          <td className="px-4 py-3 text-sm text-black">{rsvp.coming ? 'Ja' : 'Nej'}</td>
                          <td className="px-4 py-3 text-sm text-black">{rsvp.allergies || '-'}</td>
                          <td className="px-4 py-3 text-sm text-black">
                            {rsvp.transport_assist ? 'Ja' : 'Nej'}
                          </td>
                          <td className="px-4 py-3 text-sm text-black">{formatDate(rsvp.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Visar endast gaster som svarat "Ja". Avbojt: {notAttending.length}.
              </p>
            </>
          )}
        </div>
      </main>
    </>
  )
}
