import { NavButtons, type NavItem } from './NavButtons'

const defaultNavItems: NavItem[] = [
  { label: 'HEM', href: '#hem' },
  { label: 'DATUM', href: '#datum' },
  { label: 'OSA', href: '#osa' },
]

type HeaderProps = {
  navItems?: NavItem[]
}

export function Header({ navItems = defaultNavItems }: HeaderProps) {
  return (
    <header className="w-screen py-6" style={{ backgroundColor: 'var(--pastel-green)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-center h-16 sm:h-20">
        <NavButtons items={navItems} orientation="row" />
      </div>
    </header>
  )
}
