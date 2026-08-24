'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const API_BASE =
  process.env.NEXT_PUBLIC_RSVP_API_URL ?? 'https://englajimmy-backend-production.up.railway.app'

/** Mirrors the backend allowlist in storage.py. */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
]
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

const MAX_IMAGE_BYTES = 25 * 1024 * 1024
const MAX_VIDEO_BYTES = 200 * 1024 * 1024

/** Long edge for uploaded photos: plenty for printing, a fraction of the bytes. */
const MAX_IMAGE_DIMENSION = 2560
const JPEG_QUALITY = 0.85

/** How many files travel together. Small batches keep memory and progress sane on phones. */
const BATCH_SIZE = 4
const MAX_FILES_PER_BATCH_REQUEST = 30

const NAME_STORAGE_KEY = 'englajimmy_uploader_name'

type ItemStatus = 'queued' | 'processing' | 'uploading' | 'done' | 'error'

type Item = {
  id: string
  file: File
  status: ItemStatus
  progress: number
  error?: string
  previewUrl?: string
  isVideo: boolean
}

type UploadTarget = { key: string; url: string; fields: Record<string, string> }

function isVideoType(type: string) {
  return ALLOWED_VIDEO_TYPES.includes(type)
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Some phones hand over an empty MIME type. Fall back to the extension so a
 * valid photo is not rejected before it is even tried.
 */
function resolveType(file: File): string {
  if (file.type) return file.type.split(';')[0].trim().toLowerCase()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const byExt: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
  }
  return byExt[ext] ?? ''
}

function rejectReason(file: File): string | null {
  const type = resolveType(file)
  if (!type) return 'Okänd filtyp'
  const isVideo = isVideoType(type)
  if (!isVideo && !ALLOWED_IMAGE_TYPES.includes(type)) return 'Filtypen stöds inte'
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > limit) return `För stor (max ${limit / (1024 * 1024)} MB)`
  return null
}

/**
 * Shrink a photo in the browser before it leaves the phone. A 12 MP iPhone
 * photo drops from ~5 MB to well under 1 MB, which is the difference between
 * an upload that finishes on venue wifi and one that does not.
 *
 * Falls back to the original file whenever decoding fails — an unshrunk upload
 * beats a lost photo.
 */
async function downscaleImage(
  file: File
): Promise<{ blob: Blob; type: string; width?: number; height?: number }> {
  const originalType = resolveType(file)
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height))

    // Already small and already a web-friendly format: send it untouched.
    if (scale === 1 && originalType !== 'image/heic' && originalType !== 'image/heif') {
      bitmap.close()
      return { blob: file, type: originalType, width, height }
    }

    const targetWidth = Math.round(width * scale)
    const targetHeight = Math.round(height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no 2d context')
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    )
    if (!blob) throw new Error('toBlob failed')
    return { blob, type: 'image/jpeg', width: targetWidth, height: targetHeight }
  } catch {
    return { blob: file, type: originalType }
  }
}

/** Best-effort duration and dimensions for a video, so the couple can sort clips later. */
async function readVideoMetadata(
  file: File
): Promise<{ width?: number; height?: number; duration?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    const done = (result: { width?: number; height?: number; duration?: number }) => {
      URL.revokeObjectURL(url)
      resolve(result)
    }
    video.preload = 'metadata'
    video.onloadedmetadata = () =>
      done({
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
        duration: Number.isFinite(video.duration) ? video.duration : undefined,
      })
    video.onerror = () => done({})
    video.src = url
  })
}

/** POST straight to the bucket, reporting progress. Presigned forms need `file` last. */
function uploadToBucket(
  target: UploadTarget,
  blob: Blob,
  contentType: string,
  filename: string,
  onProgress: (fraction: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    Object.entries(target.fields).forEach(([key, value]) => form.append(key, value))
    form.append('file', blob, filename)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', target.url)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Uppladdning misslyckades (${xhr.status})`))
    xhr.onerror = () => reject(new Error('Nätverksfel under uppladdning'))
    xhr.onabort = () => reject(new Error('Uppladdningen avbröts'))
    xhr.send(form)
  })
}

export function PhotoUploader() {
  const [items, setItems] = useState<Item[]>([])
  const [uploaderName, setUploaderName] = useState('')
  const [busy, setBusy] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrls = useRef<string[]>([])

  useEffect(() => {
    const saved = window.localStorage.getItem(NAME_STORAGE_KEY)
    if (saved) setUploaderName(saved)
  }, [])

  useEffect(() => {
    let active = true
    fetch(`${API_BASE}/photos/count`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && typeof data.count === 'number') setTotalCount(data.count)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Release preview blobs when the component goes away.
  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    },
    []
  )

  const patchItem = useCallback((id: string, patch: Partial<Item>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const incoming: Item[] = []
    const rejected: string[] = []

    Array.from(fileList).forEach((file, index) => {
      const reason = rejectReason(file)
      if (reason) {
        rejected.push(`${file.name}: ${reason}`)
        return
      }
      const type = resolveType(file)
      const isVideo = isVideoType(type)
      let previewUrl: string | undefined
      if (!isVideo) {
        previewUrl = URL.createObjectURL(file)
        objectUrls.current.push(previewUrl)
      }
      incoming.push({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        status: 'queued',
        progress: 0,
        previewUrl,
        isVideo,
      })
    })

    setBanner(rejected.length ? `Hoppade över ${rejected.length} fil(er): ${rejected.join(', ')}` : null)
    if (incoming.length) setItems((current) => [...current, ...incoming])
  }

  async function uploadBatch(batch: Item[], name: string) {
    // Shrink first: the presigned policy pins the final size, so it has to be known up front.
    const prepared = await Promise.all(
      batch.map(async (item) => {
        patchItem(item.id, { status: 'processing', progress: 0 })
        const type = resolveType(item.file)
        if (item.isVideo) {
          const meta = await readVideoMetadata(item.file)
          return { item, blob: item.file as Blob, type, ...meta }
        }
        const { blob, type: outType, width, height } = await downscaleImage(item.file)
        return { item, blob, type: outType, width, height, duration: undefined }
      })
    )

    const response = await fetch(`${API_BASE}/photos/upload-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: prepared.map((entry) => ({
          content_type: entry.type,
          size_bytes: entry.blob.size,
        })),
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const message =
        typeof data.detail === 'string'
          ? data.detail
          : data.detail?.[0]?.msg ?? `Kunde inte förbereda uppladdning (${response.status})`
      prepared.forEach((entry) => patchItem(entry.item.id, { status: 'error', error: message }))
      return
    }

    const { targets } = (await response.json()) as { targets: UploadTarget[] }

    await Promise.all(
      prepared.map(async (entry, index) => {
        const target = targets[index]
        try {
          patchItem(entry.item.id, { status: 'uploading', progress: 0 })
          await uploadToBucket(target, entry.blob, entry.type, entry.item.file.name, (fraction) =>
            patchItem(entry.item.id, { progress: fraction })
          )

          const record = await fetch(`${API_BASE}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storage_key: target.key,
              uploader_name: name || null,
              width: entry.width ?? null,
              height: entry.height ?? null,
              duration_seconds: entry.duration ?? null,
            }),
          })
          if (!record.ok) {
            const data = await record.json().catch(() => ({}))
            throw new Error(
              typeof data.detail === 'string' ? data.detail : `Kunde inte spara (${record.status})`
            )
          }

          patchItem(entry.item.id, { status: 'done', progress: 1 })
          setTotalCount((current) => (current === null ? current : current + 1))
        } catch (error) {
          patchItem(entry.item.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Något gick fel',
          })
        }
      })
    )
  }

  async function handleUpload() {
    const pending = items.filter((item) => item.status === 'queued' || item.status === 'error')
    if (!pending.length || busy) return

    setBusy(true)
    setBanner(null)
    const name = uploaderName.trim().slice(0, 255)
    if (name) window.localStorage.setItem(NAME_STORAGE_KEY, name)

    try {
      for (let start = 0; start < pending.length; start += BATCH_SIZE) {
        const batch = pending.slice(start, start + BATCH_SIZE)
        // eslint-disable-next-line no-await-in-loop -- sequential batches keep phone memory low
        await uploadBatch(batch, name)
      }
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrls.current = []
    setItems([])
    setBanner(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const doneCount = items.filter((item) => item.status === 'done').length
  const errorCount = items.filter((item) => item.status === 'error').length
  const pendingCount = items.filter(
    (item) => item.status === 'queued' || item.status === 'error'
  ).length
  const allDone = items.length > 0 && doneCount === items.length

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="uploader_name" className="block text-sm text-black mb-1.5">
          Ditt namn <span className="text-gray-500">(så vi vet vem vi ska tacka)</span>
        </label>
        <input
          id="uploader_name"
          type="text"
          value={uploaderName}
          onChange={(event) => setUploaderName(event.target.value)}
          maxLength={255}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-black placeholder-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-[#B8D4E3] focus:border-[#B8D4E3]"
          placeholder="Anna Andersson"
        />
      </div>

      <div>
        <input
          ref={inputRef}
          id="photo_input"
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
        <label
          htmlFor="photo_input"
          className="flex flex-col items-center justify-center gap-2 w-full px-6 py-12 border-2 border-dashed rounded-[var(--box-radius)] cursor-pointer hover:opacity-80 transition-opacity text-center"
          style={{ borderColor: 'var(--pastel-green-dark)', backgroundColor: 'var(--cream)' }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            addFiles(event.dataTransfer.files)
          }}
        >
          <span className="font-script text-2xl text-black">Välj bilder</span>
          <span className="text-sm text-black">
            Tryck här för att öppna kamerarullen, eller dra in filer
          </span>
          <span className="text-xs text-gray-500">
            Bilder och korta filmer · max {MAX_IMAGE_BYTES / (1024 * 1024)} MB per bild,{' '}
            {MAX_VIDEO_BYTES / (1024 * 1024)} MB per film
          </span>
        </label>
      </div>

      {banner && (
        <p className="text-sm text-amber-700" role="status">
          {banner}
        </p>
      )}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="w-14 h-14 shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset
                  <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">Film</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-black truncate">{item.file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(item.file.size)}
                  {item.status === 'processing' && ' · förbereder…'}
                  {item.status === 'uploading' && ` · ${Math.round(item.progress * 100)} %`}
                  {item.status === 'done' && ' · klar'}
                </p>
                {item.status === 'uploading' && (
                  <div className="mt-1 h-1 w-full rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.round(item.progress * 100)}%`,
                        backgroundColor: 'var(--pastel-green-dark)',
                      }}
                    />
                  </div>
                )}
                {item.status === 'error' && (
                  <p className="text-xs text-red-600">{item.error}</p>
                )}
              </div>
              <span aria-hidden className="text-lg">
                {item.status === 'done' ? '✓' : item.status === 'error' ? '!' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={busy || pendingCount === 0}
            className="w-full py-3 text-sm font-medium text-black rounded hover:opacity-80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--pastel-green)' }}
          >
            {busy
              ? 'Laddar upp…'
              : errorCount > 0 && pendingCount > 0
                ? `Försök igen (${pendingCount})`
                : `Ladda upp ${pendingCount} fil(er)`}
          </button>

          {allDone && (
            <div className="text-center">
              <p className="font-script text-2xl text-black mb-1">Tack!</p>
              <p className="text-sm text-black mb-4">
                {doneCount} fil(er) har landat hos Engla &amp; Jimmy.
              </p>
              <button
                type="button"
                onClick={reset}
                className="text-sm font-medium text-black px-6 py-2 rounded hover:opacity-80 transition-colors"
                style={{ backgroundColor: 'var(--gul)' }}
              >
                Ladda upp fler
              </button>
            </div>
          )}
        </div>
      )}

      {totalCount !== null && (
        <p className="text-center text-xs text-gray-500">
          {totalCount} bilder och filmer har delats så här långt
        </p>
      )}
    </div>
  )
}
