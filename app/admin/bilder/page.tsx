import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Header } from '../../components/Header'
import { DownloadAllButton } from './DownloadAllButton'
import { SaveFileButton } from './SaveFileButton'

type Photo = {
  id: number
  storage_key: string
  thumb_url?: string | null
  uploader_name?: string | null
  caption?: string | null
  content_type: string
  size_bytes: number
  width?: number | null
  height?: number | null
  duration_seconds?: number | null
  created_at: string
  url?: string | null
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

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function getPhotos(): Promise<Photo[]> {
  const apiBase =
    process.env.RSVP_API_URL ??
    process.env.NEXT_PUBLIC_RSVP_API_URL ??
    'https://englajimmy-backend-production.up.railway.app'

  // Server-side only: never fall back to a NEXT_PUBLIC_* value, which ships to the browser.
  const apiKey = process.env.RSVP_API_KEY ?? ''
  const headers: HeadersInit = {}
  if (apiKey) headers['X-API-Key'] = apiKey

  const res = await fetch(`${apiBase}/photos?limit=500`, { headers, cache: 'no-store' })
  if (!res.ok) throw new Error(`Kunde inte hämta bilder (${res.status})`)
  const data = await res.json()
  return Array.isArray(data) ? (data as Photo[]) : []
}

export default async function AdminPhotosPage({
  searchParams,
}: {
  searchParams?: { cleaned?: string }
}) {
  if (cookies().get('admin_auth')?.value !== '1') {
    redirect('/admin')
  }

  let photos: Photo[] = []
  let loadError: string | null = null
  try {
    photos = await getPhotos()
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Något gick fel när bilderna hämtades.'
  }

  const totalBytes = photos.reduce((sum, photo) => sum + (photo.size_bytes ?? 0), 0)
  const videoCount = photos.filter((photo) => photo.content_type.startsWith('video/')).length
  const uploaders = new Set(
    photos.map((photo) => photo.uploader_name?.trim()).filter((name): name is string => !!name)
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20 sm:pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl text-black">Admin – Bilder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Allt gästerna har laddat upp. Bara ni ser den här sidan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/admin"
                className="px-4 py-2 text-sm text-black rounded border border-gray-300 hover:bg-gray-50"
              >
                OSA-listan
              </a>
              <DownloadAllButton
                items={photos.map((photo) => ({
                  id: photo.id,
                  url: photo.url ?? null,
                  uploader_name: photo.uploader_name,
                  storage_key: photo.storage_key,
                  size_bytes: photo.size_bytes,
                  created_at: photo.created_at,
                }))}
              />
              <form action="/admin/bilder/cleanup" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-black rounded border border-gray-300 hover:bg-gray-50"
                  title="Tar bort filer i lagringen som inte hör till någon uppladdning"
                >
                  Städa överblivna filer
                </button>
              </form>
              <form action="/admin/logout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-black rounded border border-gray-300 hover:bg-gray-50"
                >
                  Logga ut
                </button>
              </form>
            </div>
          </div>

          {searchParams?.cleaned && (
            <p className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-black">
              Städning klar: {searchParams.cleaned} överblivna fil(er) borttagna.
            </p>
          )}

          {loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {loadError}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Filer</p>
                  <p className="text-2xl font-semibold text-black">{photos.length}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Filmer</p>
                  <p className="text-2xl font-semibold text-black">{videoCount}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Gäster</p>
                  <p className="text-2xl font-semibold text-black">{uploaders.size}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Storlek</p>
                  <p className="text-2xl font-semibold text-black">{formatBytes(totalBytes)}</p>
                </div>
              </div>

              {photos.length === 0 ? (
                <p className="text-sm text-gray-500">Inga bilder uppladdade än.</p>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <li
                      key={photo.id}
                      className="rounded-xl border border-gray-200 overflow-hidden bg-white flex flex-col"
                    >
                      <div className="aspect-square bg-gray-100">
                        {photo.content_type.startsWith('video/') ? (
                          // eslint-disable-next-line jsx-a11y/media-has-caption -- guest clips have no captions
                          <video
                            src={photo.url ?? undefined}
                            controls
                            poster={photo.thumb_url ?? undefined}
                            preload={photo.thumb_url ? 'none' : 'metadata'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- presigned URL, expires; not a static asset
                          <img
                            src={photo.thumb_url ?? photo.url ?? undefined}
                            alt={photo.caption ?? ''}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-3 text-xs text-gray-600 space-y-1 flex-1">
                        <p className="text-black font-medium truncate">
                          {photo.uploader_name?.trim() || 'Okänd gäst'}
                        </p>
                        <p>{formatDate(photo.created_at)}</p>
                        <p>
                          {formatBytes(photo.size_bytes)}
                          {photo.width && photo.height ? ` · ${photo.width}×${photo.height}` : ''}
                          {photo.duration_seconds
                            ? ` · ${Math.round(photo.duration_seconds)} s`
                            : ''}
                        </p>
                        {photo.caption && <p className="text-black italic">{photo.caption}</p>}
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
                        <SaveFileButton
                          id={photo.id}
                          url={photo.url ?? ''}
                          contentType={photo.content_type}
                          uploaderName={photo.uploader_name}
                        />
                        <form action="/admin/bilder/delete" method="post">
                          <input type="hidden" name="id" value={photo.id} />
                          <button
                            type="submit"
                            className="text-xs text-red-600 hover:opacity-70"
                          >
                            Ta bort
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
