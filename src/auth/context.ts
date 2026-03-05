import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../lib/cloudStore'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  syncing: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
