import { describe, expect, it } from 'vitest'
import { nanoid, formatDate } from '../lib/utils'

describe('nanoid', () => {
  it('returns a valid UUID string', () => {
    const id = nanoid()
    // crypto.randomUUID() returns format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => nanoid()))
    expect(ids.size).toBe(100)
  })
})

describe('formatDate', () => {
  it('formats an ISO date string', () => {
    const result = formatDate('2026-03-06')
    expect(result).toContain('Mar')
    expect(result).toContain('6')
    expect(result).toContain('2026')
  })
})
