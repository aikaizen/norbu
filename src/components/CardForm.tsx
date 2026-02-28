import { useState } from 'react'
import { db } from '../db'
import { getInitialFSRSState } from '../lib/fsrs'
import { nanoid } from '../lib/utils'

export function CardForm({ deckId, onDone }: { deckId: string; onDone: () => void }) {
  const [tibetan, setTibetan] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [english, setEnglish] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tibetan.trim() || !english.trim()) return
    await db.cards.add({
      id: nanoid(),
      deckId,
      front: { tibetan: tibetan.trim(), phonetic: phonetic.trim(), english: english.trim() },
      tags: [],
      fsrsPhonetics: getInitialFSRSState(),
      fsrsMeaning: getInitialFSRSState(),
      createdAt: Date.now(),
    })
    setTibetan(''); setPhonetic(''); setEnglish('')
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">Tibetan (Uchen script)</label>
        <input
          value={tibetan}
          onChange={(e) => setTibetan(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 font-tibetan text-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="སངས་རྒྱས་"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">Phonetic</label>
        <input
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="sangye"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">English</label>
        <input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Buddha"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700">Cancel</button>
        <button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-amber-700 text-white hover:bg-amber-800">Add card</button>
      </div>
    </form>
  )
}
