import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, hasFirebaseConfig } from '../lib/firebase'
import {
  ensureProfile,
  signOutClearLocal,
  syncCloudToLocal,
  type UserProfile,
} from '../lib/cloudStore'
import { ensureStarterData } from '../db/seeds'
import { AuthContext, type AuthContextValue, type Role } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null)
  const [impersonatingName, setImpersonatingName] = useState<string | null>(null)

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
      setError(null)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (loading) return

      if (!user) {
        setProfile(null)
        setSyncing(false)
        return
      }

      setSyncing(true)
      setError(null)

      try {
        const nextProfile = await ensureProfile(user)
        await syncCloudToLocal(user)
        if (!cancelled) {
          setProfile(nextProfile)
        }
      } catch (bootstrapError) {
        console.error('Failed to sync cloud data', bootstrapError)
        if (!cancelled) {
          // Fall back to local baseline so new users never see an empty app.
          await ensureStarterData()
          setError('Could not sync your cloud data. Please try refreshing.')
        }
      } finally {
        if (!cancelled) {
          setSyncing(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [user, loading])

  const signInWithGoogle = useCallback(async () => {
    if (!hasFirebaseConfig || !auth) {
      throw new Error('Firebase is not configured.')
    }
    try {
      await signInWithPopup(auth, googleProvider)
      setError(null)
    } catch (signInError) {
      console.error('Google sign-in failed', signInError)
      setError('Google sign-in failed. Check your Firebase OAuth config and authorized domain.')
      throw signInError
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
    await signOutClearLocal()
  }, [])

  const impersonate = useCallback((userId: string, displayName: string) => {
    setImpersonatingUserId(userId)
    setImpersonatingName(displayName)
  }, [])

  const stopImpersonating = useCallback(() => {
    setImpersonatingUserId(null)
    setImpersonatingName(null)
  }, [])

  const role: Role = profile?.role ?? 'student'
  const effectiveUserId = impersonatingUserId ?? user?.uid ?? null

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    role,
    loading,
    syncing,
    error,
    signInWithGoogle,
    signOut,
    impersonatingUserId,
    impersonate,
    stopImpersonating,
    effectiveUserId,
  }), [user, profile, role, loading, syncing, error, signInWithGoogle, signOut, impersonatingUserId, impersonate, stopImpersonating, effectiveUserId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
