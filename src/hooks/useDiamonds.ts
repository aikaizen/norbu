import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useDiamonds(): number {
  return useLiveQuery(async () => {
    const s = await db.settings.get('singleton')
    return s?.diamonds ?? 0
  }) ?? 0
}
