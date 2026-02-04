import Link from 'next/link'

export type NavItem = {
  label: string
  href: string
}

type NavButtonsProps = {
  items: NavItem[]
  className?: string
  /** Render as column (e.g. mobile menu) or row */
  orientation?: 'row' | 'column'
  onItemClick?: () => void
}

export function NavButtons({
  items,
  className = '',
  orientation = 'row',
  onItemClick,
}: NavButtonsProps) {
  return (
    <nav
      className={`flex gap-6 ${orientation === 'column' ? 'flex-col' : 'flex-row'} ${className}`}
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className="text-sm text-white/90 hover:text-white transition-colors whitespace-nowrap"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
