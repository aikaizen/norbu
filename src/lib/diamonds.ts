import { db } from '../db'

export async function addDiamond(): Promise<void> {
  const settings = await db.settings.get('singleton')
  if (!settings) {
    await db.settings.put({ id: 'singleton', diamonds: 1 })
    return
  }
  await db.settings.put({ ...settings, diamonds: settings.diamonds + 1 })
}

export function earnsEasyDiamond(): boolean {
  return true
}

export function earnsGoodDiamond(lastReview?: number): boolean {
  if (lastReview === undefined) return false
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() - lastReview >= sevenDays
}
