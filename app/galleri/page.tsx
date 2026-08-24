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
  if (!res.ok) throw new Error(`Kunde inte hämta galleriet (${res.status})`)
  const data = await res.json()
  return Array.isArray(data) ? (data as GalleryItem[]) : []
}

export default async function GalleryPage() {
  let items: GalleryItem[] = []
  let loadError: string | null = null
  try {
    items = await getGallery()
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Något gick fel.'
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

          {loadError ? (
            <p className="text-center text-sm text-gray-600">{loadError}</p>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </main>
    </>
  )
}
