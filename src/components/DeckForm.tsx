import { useState } from 'react'
import { db } from '../db'
import { nanoid } from '../lib/utils'

export function DeckForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await db.decks.add({
      id: nanoid(),
      name: name.trim(),
      language: 'tibetan',
      description: desc.trim(),
      createdAt: Date.now(),
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Deck name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="e.g. Vajrasattva Mantra"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="optional"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-amber-700 text-white hover:bg-amber-800">Create</button>
      </div>
    </form>
  )
}
