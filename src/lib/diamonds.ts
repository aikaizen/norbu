import { db } from '../db'

export async function addDiamond(): Promise<void> {
  const count = await db.settings.where('id').equals('singleton').modify((s) => {
    s.diamonds += 1
  })
  if (count === 0) {
    await db.settings.put({ id: 'singleton', diamonds: 1 })
  }
}

export function earnsEasyDiamond(): boolean {
  return true
}

export function earnsGoodDiamond(lastReview?: number): boolean {
  if (lastReview === undefined) return false
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() - lastReview >= sevenDays
}
