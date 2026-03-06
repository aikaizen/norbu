import { describe, expect, it } from 'vitest'
import type { Role } from '../auth/context'
import type { UserProfile } from '../lib/cloudStore'

function determineRole(email: string | null): Role {
  return email === 'adil.islam@gmail.com' ? 'admin' : 'student'
}

function mergeProfileRole(existing: UserProfile['role'] | undefined, computed: Role): Role {
  return existing ?? computed
}

describe('role determination', () => {
  it('assigns admin role for adil.islam@gmail.com', () => {
    expect(determineRole('adil.islam@gmail.com')).toBe('admin')
  })

  it('assigns student role for other emails', () => {
    expect(determineRole('someone@example.com')).toBe('student')
  })

  it('assigns student role for null email', () => {
    expect(determineRole(null)).toBe('student')
  })

  it('preserves existing teacher role on merge', () => {
    expect(mergeProfileRole('teacher', 'student')).toBe('teacher')
  })

  it('preserves existing admin role on merge', () => {
    expect(mergeProfileRole('admin', 'student')).toBe('admin')
  })

  it('falls back to computed role when no existing role', () => {
    expect(mergeProfileRole(undefined, 'admin')).toBe('admin')
    expect(mergeProfileRole(undefined, 'student')).toBe('student')
  })
})
