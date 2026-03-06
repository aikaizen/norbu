import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const links = [
  { to: '/', label: 'Home', icon: '◈' },
  { to: '/decks', label: 'Decks', icon: '⊞' },
  { to: '/curriculum', label: 'Curriculum', icon: '◬' },
  { to: '/community', label: 'Community', icon: '◎' },
  { to: '/sessions', label: 'Log', icon: '⊟' },
  { to: '/stats', label: 'Stats', icon: '◉' },
]

export function NavBar() {
  const { role } = useAuth()

  const allLinks = role === 'admin'
    ? [...links, { to: '/admin', label: 'Admin', icon: '⚙' }]
    : links

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-t border-stone-200/60 dark:border-stone-800/60 z-50 md:relative md:border-t-0 md:border-r md:h-screen md:w-16 md:flex-col">
      <ul className="flex md:flex-col justify-around md:justify-start md:pt-8 md:gap-6">
        {allLinks.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-4 text-xs gap-1 transition-colors
                ${isActive
                  ? 'text-saffron-600 dark:text-saffron-400'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`
              }
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="md:hidden">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
