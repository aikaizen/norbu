interface AuthScreenProps {
  mode: 'config' | 'signin'
  onSignIn?: () => Promise<void>
  error?: string | null
}

export function AuthScreen({ mode, onSignIn, error }: AuthScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Norbu</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to sync your decks and progress across devices.</p>
        </div>

        {mode === 'config' ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
            Firebase config is missing. Add `VITE_FIREBASE_*` environment variables before running the app.
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onSignIn) {
                void onSignIn()
              }
            }}
            className="w-full rounded-lg bg-amber-700 text-white py-2.5 text-sm font-medium hover:bg-amber-800"
          >
            Continue with Google
          </button>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
