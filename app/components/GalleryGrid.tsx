'use client'

import { useCallback, useEffect, useState } from 'react'

export type GalleryItem = {
  id: number
  url: string
  content_type: string
  width: number | null
  height: number | null
}

type GalleryGridProps = {
  items: GalleryItem[]
}

function isVideo(item: GalleryItem) {
  return item.content_type.startsWith('video/')
}

/**
 * Masonry-style gallery with a lightbox.
 *
 * Layout uses CSS columns rather than a JS masonry library: the browser does
 * the packing, so there is no layout pass to wait for and nothing shifts as
 * images arrive. Each tile reserves its aspect ratio up front for the same
 * reason.
 */
export function GalleryGrid({ items }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) => {
        if (current === null) return current
        return (current + delta + items.length) % items.length
      }),
    [items.length]
  )

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

  if (items.length === 0) {
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
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Öppna bild ${index + 1} av ${items.length}`}
            className="group mb-3 sm:mb-4 block w-full overflow-hidden rounded-lg bg-gray-100 break-inside-avoid focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ ['--tw-ring-color' as string]: 'var(--pastel-green-dark)' }}
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
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption -- guest clips have no captions */}
                  <video
                    src={item.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-black shadow-sm transition group-hover:bg-white">
                      ▶
                    </span>
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- presigned URL, expires; not a static asset
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bildvisning"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Stäng"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20"
          >
            ×
          </button>

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

          <div
            className="max-h-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
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
