'use client'

import { useState } from 'react'

import { extensionFor, saveMedia } from '../../lib/saveMedia'

type SaveFileButtonProps = {
  id: number
  url: string
  contentType: string
  uploaderName?: string | null
}

/**
 * Saves one file from the admin gallery.
 *
 * This replaces an <a href={presignedUrl} download> which did not work: the
 * download attribute is ignored for cross-origin URLs, so clicking it opened
 * the image in a tab rather than saving it. Going through saveMedia also means
 * the share sheet is offered on a phone, so the file can go to Photos.
 *
 * Unlike the public gallery, the filename here carries the guest's name — this
 * page is already behind the admin cookie and knowing who sent what is the
 * whole point of it.
 */
export function SaveFileButton({ id, url, contentType, uploaderName }: SaveFileButtonProps) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function handleClick() {
    if (busy) return
    setBusy(true)
    setFailed(false)
    try {
      const who = (uploaderName ?? '').trim().replace(/\s+/g, '-') || 'okand-gast'
      await saveMedia(url, `${who}-${String(id).padStart(3, '0')}.${extensionFor(url, contentType)}`, contentType)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="text-xs text-black underline hover:opacity-70 disabled:opacity-60"
    >
      {busy ? 'Sparar…' : failed ? 'Försök igen' : 'Ladda ner'}
    </button>
  )
}
