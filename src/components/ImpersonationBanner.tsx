import { useAuth } from '../auth/useAuth'

export function ImpersonationBanner() {
  const { impersonatingUserId, stopImpersonating } = useAuth()

  if (!impersonatingUserId) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-saffron-600 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-3">
      <span>Viewing as user <code className="font-mono text-xs bg-saffron-700 px-1.5 py-0.5 rounded">{impersonatingUserId}</code></span>
      <button
        type="button"
        onClick={stopImpersonating}
        className="text-xs rounded px-2 py-1 bg-white text-saffron-700 font-medium hover:bg-saffron-50"
      >
        Exit
      </button>
    </div>
  )
}
