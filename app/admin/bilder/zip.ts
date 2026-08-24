/**
 * Minimal ZIP writer — no dependency, no compression.
 *
 * Photos and video are already compressed, so entries are STORED. That keeps
 * this small enough to read in one sitting and avoids spending CPU re-deflating
 * JPEG data for no gain.
 *
 * No ZIP64, so the caller must stay under the classic limits: 4 GB per file,
 * 4 GB total, 65535 entries. See ZIP_LIMITS.
 */

export const ZIP_LIMITS = {
  maxEntries: 65_535,
  maxTotalBytes: 4 * 1024 ** 3 - 1,
}

/** CRC-32 (IEEE 802.3). Every zip entry carries one. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c >>> 0
  }
  return table
})()

function crc32(bytes: Uint8Array<ArrayBufferLike>): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

export type ZipEntry = { path: string; data: ArrayBuffer }

/** DOS timestamp fields. Fixed at 1980-01-01 — the real dates are in the names. */
const DOS_TIME = 0
const DOS_DATE = 0x21

export function buildZip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder()
  const body: BlobPart[] = []
  const directory: BlobPart[] = []
  let offset = 0
  let directorySize = 0

  for (const entry of entries) {
    const name = encoder.encode(entry.path)
    const crc = crc32(new Uint8Array(entry.data))
    const size = entry.data.byteLength

    const localBuffer = new ArrayBuffer(30)
    const local = new DataView(localBuffer)
    local.setUint32(0, 0x04034b50, true) // local file header
    local.setUint16(4, 20, true) // version needed
    local.setUint16(6, 0x0800, true) // UTF-8 filename
    local.setUint16(8, 0, true) // stored
    local.setUint16(10, DOS_TIME, true)
    local.setUint16(12, DOS_DATE, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, size, true) // compressed
    local.setUint32(22, size, true) // uncompressed
    local.setUint16(26, name.length, true)
    local.setUint16(28, 0, true) // no extra field
    body.push(localBuffer, name, entry.data)

    const centralBuffer = new ArrayBuffer(46)
    const central = new DataView(centralBuffer)
    central.setUint32(0, 0x02014b50, true) // central directory header
    central.setUint16(4, 20, true) // version made by
    central.setUint16(6, 20, true) // version needed
    central.setUint16(8, 0x0800, true)
    central.setUint16(10, 0, true)
    central.setUint16(12, DOS_TIME, true)
    central.setUint16(14, DOS_DATE, true)
    central.setUint32(16, crc, true)
    central.setUint32(20, size, true)
    central.setUint32(24, size, true)
    central.setUint16(28, name.length, true)
    central.setUint16(30, 0, true) // extra
    central.setUint16(32, 0, true) // comment
    central.setUint16(34, 0, true) // disk number
    central.setUint16(36, 0, true) // internal attributes
    central.setUint32(38, 0, true) // external attributes
    central.setUint32(42, offset, true) // offset of local header
    directory.push(centralBuffer, name)

    offset += 30 + name.length + size
    directorySize += 46 + name.length
  }

  const endBuffer = new ArrayBuffer(22)
  const end = new DataView(endBuffer)
  end.setUint32(0, 0x06054b50, true) // end of central directory
  end.setUint16(4, 0, true) // this disk
  end.setUint16(6, 0, true) // disk with directory
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, directorySize, true)
  end.setUint32(16, offset, true)
  end.setUint16(20, 0, true) // no comment

  return new Blob([...body, ...directory, endBuffer], { type: 'application/zip' })
}

/**
 * Folder- and filename-safe without mangling names.
 *
 * Denies the characters a filesystem rejects rather than allowing specific
 * letters. An allowlist built on \w silently mangled non-ASCII names —
 * JavaScript's \w is ASCII-only, so "Axélia Hamrén" came out as
 * "Ax-lia-Hamr-n" even with åäöÅÄÖ explicitly permitted. Denying instead keeps
 * every alphabet intact, and needs no Unicode property escapes (which require
 * an ES6 target this project does not set).
 */
export function safeSegment(text: string): string {
  return text
    .replace(/[/\\:*?"<>|\x00-\x1f]+/g, '-') // rejected by filesystems
    .replace(/\s+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '') // no leading or trailing dot/dash
    .slice(0, 60)
}
