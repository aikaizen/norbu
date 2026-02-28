import { useStats } from '../hooks/useStats'

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-5 text-center">
      <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{label}</p>
    </div>
  )
}

export function Stats() {
  const stats = useStats()

  if (!stats) return <div className="animate-pulse h-40 rounded-xl bg-stone-100 dark:bg-stone-800" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Stats</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Cards due today" value={stats.dueToday} />
        <StatBox label="Total cards" value={stats.totalCards} />
        <StatBox label="Decks" value={stats.totalDecks} />
        <StatBox label="Study days" value={stats.studyDays} />
        <StatBox label="Sessions logged" value={stats.totalSessions} />
        <StatBox label="Tutor sessions" value={stats.tutorSessions} />
      </div>
    </div>
  )
}
