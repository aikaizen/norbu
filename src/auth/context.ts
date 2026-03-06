import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../lib/cloudStore'

export type Role = 'admin' | 'teacher' | 'student'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  role: Role
  loading: boolean
  syncing: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  impersonatingUserId: string | null
  impersonate: (userId: string, displayName: string) => void
  stopImpersonating: () => void
  effectiveUserId: string | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
