import { useStats } from '../hooks/useStats'

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card-surface p-5 text-center">
      <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">{value}</p>
      <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">{label}</p>
    </div>
  )
}

export function Stats() {
  const stats = useStats()

  if (!stats) return <div className="animate-pulse h-40 rounded-xl bg-stone-100 dark:bg-stone-800" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Stats</h1>

      <div className="rounded-2xl bg-gradient-to-br from-saffron-50 to-saffron-100/50 dark:from-saffron-950/30 dark:to-saffron-900/10 border border-saffron-200/60 dark:border-saffron-800/40 p-6 text-center shadow-glow">
        <p className="text-4xl font-bold text-saffron-600 dark:text-saffron-400">◆ {stats.diamonds}</p>
        <p className="text-sm text-saffron-700/70 dark:text-saffron-400/60 mt-1">diamonds earned</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Phonetics ready" value={stats.phoneticsDue} />
        <StatBox label="Meanings ready" value={stats.meaningDue} />
        <StatBox label="Total cards" value={stats.totalCards} />
        <StatBox label="Decks" value={stats.totalDecks} />
        <StatBox label="Study days" value={stats.studyDays} />
        <StatBox label="Sessions logged" value={stats.totalSessions} />
      </div>
    </div>
  )
}
