'use client'

import { useState } from 'react'
import { ZIP_LIMITS, buildZip, safeSegment, type ZipEntry } from './zip'

export type DownloadItem = {
  id: number
  url: string | null
  uploader_name?: string | null
  storage_key: string
  size_bytes: number
  created_at?: string
}

type DownloadAllButtonProps = {
  items: DownloadItem[]
}

/** Files are fetched straight from the bucket, so a few at a time is plenty. */
const CONCURRENCY = 4

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

/** Anna-Andersson/2026-08-24_1327_005.jpg */
function zipPath(item: DownloadItem): string {
  const extension = item.storage_key.split('.').pop() ?? 'bin'
  const folder = safeSegment(item.uploader_name?.trim() || '') || '_okand-gast'
  const stamp = (item.created_at ?? '').slice(0, 16).replace('T', '_').replace(':', '')
  const id = String(item.id).padStart(3, '0')
  return `${folder}/${stamp || 'utan-datum'}_${id}.${extension}`
}

/**
 * Zips every upload in the browser and saves it, one folder per guest.
 *
 * The bytes go bucket → browser directly, never through the API, so this does
 * not put gigabytes through a container sized for JSON. The tradeoff is that
 * the archive is assembled in the browser, so it is bounded by what this
 * machine can hold — past that, download_photos.py in the backend repo has no
 * such ceiling.
 */
export function DownloadAllButton({ items }: DownloadAllButtonProps) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const usable = items.filter((item) => item.url)
  const totalBytes = usable.reduce((sum, item) => sum + (item.size_bytes ?? 0), 0)
  const tooBig = totalBytes > ZIP_LIMITS.maxTotalBytes || usable.length > ZIP_LIMITS.maxEntries

  async function handleDownload() {
    if (busy || usable.length === 0) return
    setBusy(true)
    setError(null)
    setDone(0)

    try {
      const entries: ZipEntry[] = new Array(usable.length)
      let cursor = 0

      // Fixed pool of workers pulling from a shared cursor, so memory stays
      // bounded by CONCURRENCY rather than by the number of files.
      const worker = async () => {
        for (;;) {
          const index = cursor
          cursor += 1
          if (index >= usable.length) return
          const item = usable[index]
          const response = await fetch(item.url as string)
          if (!response.ok) throw new Error(`Kunde inte hämta fil ${item.id} (${response.status})`)
          entries[index] = { path: zipPath(item), data: await response.arrayBuffer() }
          setDone((current) => current + 1)
        }
      }

      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, usable.length) }, worker))

      const blob = buildZip(entries)
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = 'englajimmy-bilder.zip'
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Give the browser a moment to start the save before releasing the blob.
      setTimeout(() => URL.revokeObjectURL(href), 30_000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel under nedladdningen.')
    } finally {
      setBusy(false)
    }
  }

  if (usable.length === 0) return null

  if (tooBig) {
    return (
      <p className="text-xs text-gray-600 max-w-xs">
        {formatBytes(totalBytes)} är för mycket för en zip i webbläsaren. Använd{' '}
        <code className="text-black">download_photos.py</code> i backend-repot i stället.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="px-4 py-2 text-sm text-black rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        title="Laddar ner alla filer som en zip, sorterade i mappar per gäst"
      >
        {busy
          ? `Laddar ner… ${done}/${usable.length}`
          : `Ladda ner alla (${formatBytes(totalBytes)})`}
      </button>
      {error && (
        <p className="text-xs text-red-600 max-w-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
