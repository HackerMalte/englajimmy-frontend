/**
 * Shared between the server component that renders the first page and the
 * client component that fetches the rest.
 *
 * Deliberately its own module: exporting it from GalleryGrid.tsx meant a
 * 'use client' file, and a server component importing from one receives client
 * reference proxies rather than plain values — the page requested
 * `?limit=undefined` and the API answered 422.
 */
export const GALLERY_PAGE_SIZE = 25
