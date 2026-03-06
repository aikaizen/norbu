import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { useAuth } from '../auth/useAuth'
import { BrandLogo } from './BrandLogo'

export function Layout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <NavBar />
      <main className="flex-1 pb-20 md:pb-0 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo sizeClassName="h-10" showName={false} />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{profile?.displayName ?? 'Norbu Student'}</p>
              <p className="text-xs text-stone-500">{profile?.email}</p>
            </div>
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName ?? 'Profile'}
                className="w-9 h-9 rounded-full border border-stone-200 dark:border-stone-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full border border-stone-200 dark:border-stone-700 grid place-items-center text-xs text-stone-500">
                {(profile?.displayName ?? 'N').charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                void signOut()
              }}
              className="text-xs rounded-lg border border-stone-200 dark:border-stone-700 px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Sign out
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
