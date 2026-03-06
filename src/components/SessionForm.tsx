import { useState } from 'react'
import { db } from '../db'
import { nanoid } from '../lib/utils'
import { useAuth } from '../auth/useAuth'
import { upsertSession } from '../lib/cloudStore'
import type { Session } from '../db/schema'

export function SessionForm({ onDone }: { onDone: () => void }) {
  const [notes, setNotes] = useState('')
  const [isTutor, setIsTutor] = useState(false)
  const [duration, setDuration] = useState('')
  const { user, effectiveUserId } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const session: Session = {
      id: nanoid(),
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      isTutorSession: isTutor,
      cardsReviewed: [],
      duration: parseInt(duration) || 0,
      createdAt: Date.now(),
    }
    await db.sessions.add(session)
    if (user && effectiveUserId) {
      await upsertSession(effectiveUserId, session)
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="tutor"
          checked={isTutor}
          onChange={(e) => setIsTutor(e.target.checked)}
          className="accent-saffron-600"
        />
        <label htmlFor="tutor" className="text-sm">Tutor session</label>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 resize-none"
          rows={4}
          placeholder="What did you work on? What was hard? What to follow up on..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-24 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
          placeholder="30"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-stone-500">Cancel</button>
        <button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-saffron-600 text-white hover:bg-saffron-700 transition-colors">Save</button>
      </div>
    </form>
  )
}
