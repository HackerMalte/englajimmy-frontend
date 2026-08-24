import Link from 'next/link'
import { Header } from '../components/Header'
import { GalleryGrid, type GalleryItem } from '../components/GalleryGrid'

export const metadata = {
  title: 'Galleriet · Engla & Jimmy',
  description: 'Bilder och filmer från bröllopet, delade av våra gäster.',
}

// Presigned URLs expire, so never serve this from a cache.
export const dynamic = 'force-dynamic'

async function getGallery(): Promise<GalleryItem[]> {
  const apiBase =
    process.env.RSVP_API_URL ??
    process.env.NEXT_PUBLIC_RSVP_API_URL ??
    'https://englajimmy-backend-production.up.railway.app'

  const res = await fetch(`${apiBase}/photos/gallery?limit=500`, { cache: 'no-store' })
  if (!res.ok) {
    // Keep the status in the server log where it is useful; guests should
    // never be shown an HTTP code on a wedding site.
    console.error(`[galleri] GET /photos/gallery failed: ${res.status}`)
    throw new Error('gallery-unavailable')
  }
  const data = await res.json()
  return Array.isArray(data) ? (data as GalleryItem[]) : []
}

export default async function GalleryPage() {
  let items: GalleryItem[] = []
  let failed = false
  try {
    items = await getGallery()
  } catch (err) {
    console.error('[galleri] could not load gallery', err)
    failed = true
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-20 sm:pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="font-script text-4xl sm:text-5xl text-black mb-3">Galleriet</h1>
            <p className="text-black text-sm max-w-md mx-auto">
              Bilder och filmer från vår dag, delade av er som var där.
            </p>
            <Link
              href="/bilder"
              className="inline-block mt-6 px-6 py-2.5 text-sm font-medium text-black rounded hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--pastel-green)' }}
            >
              Dela dina bilder
            </Link>
          </div>

          {failed ? (
            <div className="text-center py-20">
              <p className="font-script text-3xl text-black mb-3">Galleriet är snart här</p>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Vi kunde inte hämta bilderna just nu. Prova igen om en liten stund — dina
                uppladdade bilder är kvar.
              </p>
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </main>
    </>
  )
}
