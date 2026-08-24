/**
 * Saving a photo or clip to the visitor's device.
 *
 * Two paths, because the good one is not universally available:
 *
 *  - Web Share: hands the file to the native share sheet. On iOS that sheet
 *    offers "Spara bild" / "Spara video", which writes into the Photos library.
 *    This is the only way a web page can get a file into Photos — there is no
 *    API that writes there directly.
 *  - Download: saves into Files / the downloads folder. Where sharing files is
 *    not supported (most desktop browsers) this is all there is.
 *
 * In both cases the bytes are fetched first rather than pointing an <a download>
 * at the bucket, because the download attribute is ignored for cross-origin
 * URLs — such a link opens the image instead of saving it.
 */

export type SaveOutcome = 'shared' | 'downloaded' | 'cancelled'

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

export function extensionFor(url: string, contentType: string): string {
  const known = EXTENSION_BY_TYPE[contentType]
  if (known) return known
  // Fall back to the extension in the storage key, which the URL still carries.
  const fromUrl = url.split('?')[0].split('.').pop()
  return fromUrl && fromUrl.length <= 5 ? fromUrl : 'jpg'
}

function download(blob: Blob, filename: string): SaveOutcome {
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(href), 30_000)
  return 'downloaded'
}

/**
 * Save one file, preferring the share sheet so phone users can put it in Photos.
 *
 * Returns 'cancelled' when the visitor dismisses the share sheet, which is not
 * an error and must not be surfaced as one.
 */
export async function saveMedia(
  url: string,
  filename: string,
  contentType: string
): Promise<SaveOutcome> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Kunde inte hämta filen (${response.status})`)
  const blob = await response.blob()

  const file = new File([blob], filename, { type: blob.type || contentType })

  // canShare must be asked about this specific file: support for sharing files
  // is narrower than support for sharing links.
  const canShareFile =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })

  if (canShareFile) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (error) {
      const name = (error as DOMException)?.name
      // Dismissing the sheet is a choice, not a failure.
      if (name === 'AbortError') return 'cancelled'
      // Safari can refuse the call when the user gesture has expired during the
      // fetch above. Saving to Files is still better than nothing.
    }
  }

  return download(blob, filename)
}
