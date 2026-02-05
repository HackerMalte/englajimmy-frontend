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
          className="text-sm text-gray-800 bg-pastel-green hover:opacity-80 px-4 py-2 rounded-[162px] transition-colors whitespace-nowrap uppercase tracking-wide"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
