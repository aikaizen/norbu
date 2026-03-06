import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', icon: '◈' },
  { to: '/decks', label: 'Decks', icon: '⊞' },
  { to: '/curriculum', label: 'Curriculum', icon: '◬' },
  { to: '/community', label: 'Community', icon: '◎' },
  { to: '/sessions', label: 'Log', icon: '⊟' },
  { to: '/stats', label: 'Stats', icon: '◉' },
]

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 z-50 md:relative md:border-t-0 md:border-r md:h-screen md:w-16 md:flex-col">
      <ul className="flex md:flex-col justify-around md:justify-start md:pt-8 md:gap-6">
        {links.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-4 text-xs gap-1 transition-colors
                ${isActive
                  ? 'text-amber-700 dark:text-amber-500'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'}`
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
