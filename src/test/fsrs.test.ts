import { describe, it, expect } from 'vitest'
import { getInitialFSRSState, scheduleCard, isDue, getDueCount } from '../lib/fsrs'

describe('FSRS wrapper', () => {
  it('creates a new card state that is due now', () => {
    const state = getInitialFSRSState()
    expect(isDue(state)).toBe(true)
  })

  it('scheduling with "good" moves card into future', () => {
    const state = getInitialFSRSState()
    const next = scheduleCard(state, 'good')
    expect(next.due).toBeGreaterThan(Date.now())
    expect(next.reps).toBeGreaterThan(0)
  })

  it('scheduling with "again" keeps card due sooner than "easy"', () => {
    const state = getInitialFSRSState()
    const again = scheduleCard(state, 'again')
    const easy = scheduleCard(state, 'easy')
    expect(again.due).toBeLessThan(easy.due)
  })

  it('getDueCount counts only due cards', () => {
    const now = getInitialFSRSState()
    const future = scheduleCard(now, 'good')
    expect(getDueCount([now, future])).toBe(1)
  })
})
