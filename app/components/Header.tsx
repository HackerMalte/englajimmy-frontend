import { NavButtons, type NavItem } from './NavButtons'

const defaultNavItems: NavItem[] = [
  { label: 'HEM', href: '#hem' },
  { label: 'INFO', href: '#info' },
  { label: 'OSA', href: '#osa' },
]

type HeaderProps = {
  navItems?: NavItem[]
}

export function Header({ navItems = defaultNavItems }: HeaderProps) {
  return (
    <header className="w-screen py-6 sticky top-0 z-50" style={{ backgroundColor: 'var(--pastel-green)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16 sm:h-20">
        <a href="#hem">
          <img src="/images/ej_logo.svg" alt="E&J Logo" className="h-20 sm:h-28 w-auto" />
        </a>
        <NavButtons items={navItems} orientation="row" />
      </div>
    </header>
  )
}
