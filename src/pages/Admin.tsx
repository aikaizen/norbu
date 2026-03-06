import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { listAllProfiles, setUserRole, type UserProfile } from '../lib/cloudStore'

export function Admin() {
  const { role, impersonate } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const all = await listAllProfiles()
        if (!cancelled) {
          setProfiles(all.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  if (role !== 'admin') {
    return <p className="text-sm text-stone-500 py-8 text-center">Access denied.</p>
  }

  async function toggleTeacher(profile: UserProfile) {
    setBusyUserId(profile.id)
    const newRole = profile.role === 'teacher' ? 'student' : 'teacher'
    await setUserRole(profile.id, newRole)
    setProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, role: newRole } : p))
    )
    setBusyUserId(null)
  }

  function roleBadge(r: UserProfile['role']) {
    if (r === 'admin') return 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
    if (r === 'teacher') return 'bg-saffron-100 dark:bg-saffron-950/40 text-saffron-700 dark:text-saffron-400'
    return 'bg-stone-100 dark:bg-stone-800 text-stone-500'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {loading ? (
        <p className="text-sm text-stone-500">Loading users...</p>
      ) : (
        <div className="space-y-2">
          {profiles.map((p) => (
            <div key={p.id} className="card-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {p.photoURL ? (
                    <img src={p.photoURL} alt="" className="w-8 h-8 rounded-full shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 grid place-items-center text-xs shrink-0">
                      {(p.displayName ?? 'N').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.displayName}</p>
                    <p className="text-xs text-stone-500 truncate">{p.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${roleBadge(p.role ?? 'student')}`}>
                    {p.role ?? 'student'}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  {p.role !== 'admin' && (
                    <button
                      type="button"
                      disabled={busyUserId === p.id}
                      onClick={() => { void toggleTeacher(p) }}
                      className="text-xs rounded-lg px-2 py-1 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-60"
                    >
                      {p.role === 'teacher' ? 'Demote' : 'Make Teacher'}
                    </button>
                  )}
                  <Link
                    to={`/admin/user/${p.id}`}
                    className="text-xs rounded-lg px-2 py-1 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => impersonate(p.id, p.displayName)}
                    className="text-xs rounded-lg px-2 py-1 border border-saffron-600 text-saffron-600 dark:text-saffron-400 hover:bg-saffron-50 dark:hover:bg-saffron-950/20 transition-colors"
                  >
                    Impersonate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
