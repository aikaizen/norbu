import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { SessionForm } from '../components/SessionForm'
import { formatDate } from '../lib/utils'

export function Sessions() {
  const [showForm, setShowForm] = useState(false)
  const sessions = useLiveQuery(() =>
    db.sessions.orderBy('createdAt').reverse().toArray()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Session Log</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm rounded-lg px-3 py-1.5 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          + Log session
        </button>
      </div>

      {showForm && (
        <div className="card-surface p-4">
          <SessionForm onDone={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-3">
        {sessions?.map((session) => (
          <div key={session.id} className="card-surface p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{formatDate(session.date)}</span>
              <div className="flex gap-2">
                {session.isTutorSession && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-saffron-100 dark:bg-saffron-950/40 text-saffron-700 dark:text-saffron-400">tutor</span>
                )}
                {session.duration > 0 && (
                  <span className="text-xs text-stone-400">{session.duration}m</span>
                )}
              </div>
            </div>
            {session.notes && (
              <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap">{session.notes}</p>
            )}
          </div>
        ))}
        {sessions?.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">No sessions logged yet.</p>
        )}
      </div>
    </div>
  )
}
