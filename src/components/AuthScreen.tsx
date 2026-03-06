import { BrandLogo } from './BrandLogo'

interface AuthScreenProps {
  mode: 'config' | 'signin'
  onSignIn?: () => Promise<void>
  error?: string | null
}

export function AuthScreen({ mode, onSignIn, error }: AuthScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <BrandLogo sizeClassName="h-20" />
          <p className="text-sm text-stone-400 dark:text-stone-500 max-w-[260px]">
            Learn Tibetan with spaced repetition
          </p>
        </div>

        <div className="card-surface p-6 space-y-4">
          {mode === 'config' ? (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
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
              className="w-full rounded-xl bg-saffron-600 text-white py-3 text-sm font-semibold hover:bg-saffron-700 transition-colors shadow-sm"
            >
              Continue with Google
            </button>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
