import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db'
import { addDiamond, earnsEasyDiamond, earnsGoodDiamond } from '../lib/diamonds'

describe('diamonds', () => {
  beforeEach(async () => {
    await db.settings.clear()
  })

  it('earnsEasyDiamond always returns true', () => {
    expect(earnsEasyDiamond()).toBe(true)
  })

  it('earnsGoodDiamond returns false when no last review', () => {
    expect(earnsGoodDiamond(undefined)).toBe(false)
  })

  it('earnsGoodDiamond returns false when reviewed recently', () => {
    const oneDayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000
    expect(earnsGoodDiamond(oneDayAgo)).toBe(false)
  })

  it('earnsGoodDiamond returns true when reviewed 7+ days ago', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    expect(earnsGoodDiamond(eightDaysAgo)).toBe(true)
  })

  it('addDiamond creates settings if none exist', async () => {
    await addDiamond()
    const settings = await db.settings.get('singleton')
    expect(settings?.diamonds).toBe(1)
  })

  it('addDiamond increments existing diamond count', async () => {
    await db.settings.put({ id: 'singleton', diamonds: 5 })
    await addDiamond()
    const settings = await db.settings.get('singleton')
    expect(settings?.diamonds).toBe(6)
  })

  it('addDiamond is safe under rapid sequential calls', async () => {
    await db.settings.put({ id: 'singleton', diamonds: 0 })
    await Promise.all([addDiamond(), addDiamond(), addDiamond()])
    const settings = await db.settings.get('singleton')
    expect(settings?.diamonds).toBe(3)
  })
})
