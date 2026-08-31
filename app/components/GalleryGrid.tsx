'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { GALLERY_PAGE_SIZE } from '../lib/gallery'
import { extensionFor, saveMedia } from '../lib/saveMedia'

const API_BASE =
  process.env.NEXT_PUBLIC_RSVP_API_URL ?? 'https://englajimmy-backend-production.up.railway.app'

export type GalleryItem = {
  id: number
  url: string
  thumb_url?: string | null
  content_type: string
  width: number | null
  height: number | null
}

type GalleryGridProps = {
  /** First page, rendered on the server so there is something to see immediately. */
  initialItems: GalleryItem[]
  /** How many exist in total, so we know when to stop asking for more. */
  total: number
}

function isVideo(item: GalleryItem) {
  return item.content_type.startsWith('video/')
}

function DownloadIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}

type PlacedItem = { item: GalleryItem; index: number }

/**
 * Column count, from the same breakpoints the CSS-column version used, so the
 * layout still changes at 640px and 1024px.
 *
 * matchMedia rather than a ResizeObserver or a window resize listener: it
 * reports synchronously on mount and fires reliably on change, including
 * orientation changes, without depending on a resize event arriving.
 *
 * Starts at 2 so the server render and the first client render agree; wider
 * layouts correct themselves immediately after mount.
 */
function useColumnCount(): number {
  const [columns, setColumns] = useState(2)

  useEffect(() => {
    const threeColumns = window.matchMedia('(min-width: 640px)')
    const fourColumns = window.matchMedia('(min-width: 1024px)')

    const update = () => setColumns(fourColumns.matches ? 4 : threeColumns.matches ? 3 : 2)
    update()

    threeColumns.addEventListener('change', update)
    fourColumns.addEventListener('change', update)
    // Belt and braces. update() re-reads the queries and setting the same value
    // is a no-op in React, so a second source of truth costs nothing and covers
    // a browser where one of the two misbehaves.
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      threeColumns.removeEventListener('change', update)
      fourColumns.removeEventListener('change', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return columns
}

/**
 * Distribute items into fixed columns, each one going to whichever column is
 * currently shortest.
 *
 * The point is stability on append. Placement of the first N items depends only
 * on those N items, so loading another page can never move a photo that is
 * already on screen. CSS multi-column cannot promise that: it rebalances the
 * whole set whenever content changes, which moved 19 of 25 tiles between
 * columns as soon as the second page arrived.
 *
 * Heights are estimated from the stored dimensions. Columns are equal width, so
 * relative height is simply height/width; a photo with unknown dimensions is
 * assumed 4:5, matching the tile placeholder.
 */
function packIntoColumns(items: GalleryItem[], columnCount: number): PlacedItem[][] {
  const columns: PlacedItem[][] = Array.from({ length: columnCount }, () => [])
  const heights = new Array<number>(columnCount).fill(0)

  items.forEach((item, index) => {
    const ratio = item.width && item.height ? item.height / item.width : 5 / 4
    let target = 0
    for (let column = 1; column < columnCount; column += 1) {
      if (heights[column] < heights[target]) target = column
    }
    columns[target].push({ item, index })
    heights[target] += ratio
  })

  return columns
}

/**
 * Masonry-style gallery with a lightbox.
 *
 * Layout uses CSS columns rather than a JS masonry library: the browser does
 * the packing, so there is no layout pass to wait for and nothing shifts as
 * images arrive. Each tile reserves its aspect ratio up front for the same
 * reason.
 */
export function GalleryGrid({ initialItems, total }: GalleryGridProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  // Read inside the observer callback, which would otherwise close over stale
  // values and fire the same page request repeatedly.
  const stateRef = useRef({ count: initialItems.length, loading: false, failed: false })
  stateRef.current = { count: items.length, loading: loadingMore, failed: loadError }

  const hasMore = items.length < total
  const columnCount = useColumnCount()
  const columns = useMemo(() => packIntoColumns(items, columnCount), [items, columnCount])

  const loadMore = useCallback(async () => {
    if (stateRef.current.loading) return
    setLoadingMore(true)
    setLoadError(false)
    try {
      const offset = stateRef.current.count
      const res = await fetch(
        `${API_BASE}/photos/gallery?limit=${GALLERY_PAGE_SIZE}&offset=${offset}`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error(String(res.status))
      const page = (await res.json()) as GalleryItem[]
      setItems((current) => {
        // Someone uploading while a guest scrolls shifts the offsets, so merge
        // on id rather than trusting the window to line up.
        const seen = new Set(current.map((item) => item.id))
        return [...current, ...page.filter((item) => !seen.has(item.id))]
      })
    } catch {
      setLoadError(true)
    } finally {
      setLoadingMore(false)
    }
  }, [])

  // Auto-load as the bottom of the grid comes into view. The button below is
  // kept for keyboard users and for when this fails.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        // Do not retry automatically after a failure: that would hammer a
        // struggling API while the visitor sits at the bottom of the page.
        if (stateRef.current.loading || stateRef.current.failed) return
        void loadMore()
      },
      // Start fetching before the visitor actually reaches the end.
      { rootMargin: '600px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore, items.length])

  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) => {
        if (current === null) return current
        // Reaching the end of what is loaded pulls the next page in rather than
        // jumping back to the first photo, so arrow-key browsing feels
        // continuous while more remains.
        if (delta > 0 && current === items.length - 1 && items.length < total) {
          void loadMore()
          return current
        }
        return (current + delta + items.length) % items.length
      }),
    [items.length, total, loadMore]
  )

  const save = useCallback(async (item: GalleryItem) => {
    setSaveError(null)
    setSavingId(item.id)
    try {
      // Filenames stay anonymous on purpose: the public payload carries no
      // uploader name or timestamp, and this should not reintroduce one.
      const filename = `englajimmy-${String(item.id).padStart(3, '0')}.${extensionFor(
        item.url,
        item.content_type
      )}`
      await saveMedia(item.url, filename, item.content_type)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Kunde inte spara filen.')
    } finally {
      setSavingId(null)
    }
  }, [])

  // Keyboard control while the lightbox is open, and prevent the page behind
  // it from scrolling.
  useEffect(() => {
    if (openIndex === null) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [openIndex, close, step])

  if (items.length === 0 && total === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-script text-3xl text-black mb-3">Inga bilder än</p>
        <p className="text-sm text-gray-600">
          Så fort någon delar sina bilder dyker de upp här.
        </p>
      </div>
    )
  }

  const open = openIndex === null ? null : items[openIndex]

  return (
    <>
      {saveError && (
        <p className="mb-4 text-center text-sm text-red-600" role="alert">
          {saveError}
        </p>
      )}

      {/* Explicit columns rather than CSS multi-column: appending a page must
          never re-flow photos that are already on screen. */}
      <div className="flex items-start gap-3 sm:gap-4">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            {column.map(({ item, index }) => (
          // Open and download are siblings rather than nested buttons, which
          // would be invalid markup and unreachable by keyboard.
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-lg bg-gray-100"
          >
            <div
              className="relative w-full"
              style={{
                aspectRatio:
                  item.width && item.height ? `${item.width} / ${item.height}` : '4 / 5',
              }}
            >
              {isVideo(item) ? (
                <>
                  {/* A poster still keeps the grid to images only — no video
                      metadata is fetched until a clip is actually opened. */}
                  {item.thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- presigned URL, expires; not a static asset
                    <img
                      src={item.thumb_url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/media-has-caption -- guest clips have no captions
                    <video
                      src={item.url}
                      preload="metadata"
                      muted
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-black shadow-sm transition group-hover:bg-white">
                      ▶
                    </span>
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- presigned URL, expires; not a static asset
                <img
                  src={item.thumb_url ?? item.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Öppna bild ${index + 1} av ${items.length}`}
              className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-inset"
              style={{ ['--tw-ring-color' as string]: 'var(--pastel-green-dark)' }}
            />

            {/* Always visible rather than hover-only: most guests are on a
                phone, where there is no hover state to reveal it. */}
            <button
              type="button"
              onClick={() => save(item)}
              disabled={savingId === item.id}
              aria-label="Spara den här bilden"
              title="Spara"
              className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-black shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-60 focus:outline-none focus:ring-2"
              style={{ ['--tw-ring-color' as string]: 'var(--pastel-green-dark)' }}
            >
              {savingId === item.id ? (
                <span className="text-[10px] font-medium">…</span>
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
            </button>
          </div>
            ))}
          </div>
        ))}
      </div>

      {/* Watched by the observer: crossing into view pulls the next page. */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      {hasMore && (
        <div className="mt-10 flex flex-col items-center gap-3">
          {loadError ? (
            <>
              <p className="text-sm text-gray-600">Kunde inte hämta fler bilder just nu.</p>
              <button
                type="button"
                onClick={() => void loadMore()}
                className="px-6 py-2.5 text-sm font-medium text-black rounded hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--gul)' }}
              >
                Försök igen
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="px-6 py-2.5 text-sm font-medium text-black rounded hover:opacity-80 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--pastel-green)' }}
            >
              {loadingMore ? 'Hämtar…' : `Visa fler (${total - items.length} kvar)`}
            </button>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="mt-10 text-center text-xs text-gray-500">
          Alla {items.length} bilder och filmer visas.
        </p>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bildvisning"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-sm"
          onClick={close}
        >
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                save(open)
              }}
              disabled={savingId === open.id}
              aria-label="Spara den här bilden"
              title="Spara"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              {savingId === open.id ? (
                <span className="text-xs">…</span>
              ) : (
                <DownloadIcon className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Stäng"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20"
            >
              ×
            </button>
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  step(-1)
                }}
                aria-label="Föregående"
                className="absolute left-2 sm:left-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  step(1)
                }}
                aria-label="Nästa"
                className="absolute right-2 sm:right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}

          <div className="max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            {isVideo(open) ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption -- guest clips have no captions
              <video
                src={open.url}
                controls
                autoPlay
                playsInline
                className="max-h-[85vh] w-auto rounded-lg"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- presigned URL, expires; not a static asset
              <img
                src={open.url}
                alt=""
                className="max-h-[85vh] w-auto rounded-lg object-contain"
              />
            )}
          </div>

          <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/60">
            {openIndex! + 1} / {items.length}
          </p>
        </div>
      )}
    </>
  )
}
