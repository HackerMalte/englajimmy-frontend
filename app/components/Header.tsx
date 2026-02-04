'use client'

import Link from 'next/link'
import { useState } from 'react'
import { NavButtons, type NavItem } from './NavButtons'

const defaultNavItems: NavItem[] = [
  { label: 'Hem', href: '/' },
  { label: 'Datum', href: '#datum' },
  { label: 'RSVP', href: '/rsvp' },
]

type HeaderProps = {
  logoHref?: string
  navItems?: NavItem[]
}

export function Header({ logoHref = '/', navItems = defaultNavItems }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <Link
          href={logoHref}
          className="text-white font-serif text-xl sm:text-2xl tracking-wide"
          onClick={() => setMenuOpen(false)}
        >
          Engla & Jimmy
        </Link>

        {/* Desktop: nav buttons */}
        <div className="hidden sm:block">
          <NavButtons items={navItems} orientation="row" />
        </div>

        {/* Mobile: burger button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="sm:hidden p-2 text-white aria-expanded:opacity-70"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Stäng meny' : 'Öppna meny'}
        >
          <span className="sr-only">{menuOpen ? 'Stäng' : 'Meny'}</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile: dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-black/95 backdrop-blur-sm px-4 py-4">
          <NavButtons
            items={navItems}
            orientation="column"
            onItemClick={() => setMenuOpen(false)}
          />
        </div>
      )}
    </header>
  )
}
