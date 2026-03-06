export function Curriculum() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Curriculum</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Official packet integration and rollout plan
        </p>
      </div>

      <section className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-2">
        <h2 className="text-lg font-medium">Official Packet: Intake</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Source file: <code>Tibetan Language Hand Out Packet.pdf</code> (29 pages).
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Current status: PDF appears image-based; run OCR ingestion before content can be auto-converted into decks.
        </p>
      </section>

      <section className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-2">
        <h2 className="text-lg font-medium">What To Build From It</h2>
        <ul className="text-sm text-stone-500 dark:text-stone-400 space-y-1 list-disc pl-5">
          <li>Packet-aligned deck units (letters, pronunciation, core vocabulary, phrases).</li>
          <li>Lesson metadata per card: packet page, unit, sequence order, prerequisite unit.</li>
          <li>Checkpoint quizzes after each unit with mastery unlock thresholds.</li>
          <li>Difficulty calibration pass from real learner results (promote/demote card difficulty).</li>
        </ul>
      </section>

      <section className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-2">
        <h2 className="text-lg font-medium">Implementation Plan</h2>
        <ol className="text-sm text-stone-500 dark:text-stone-400 space-y-1 list-decimal pl-5">
          <li>OCR packet pages and store normalized text in a versioned source file.</li>
          <li>Map extracted material into structured curriculum JSON.</li>
          <li>Generate/import deck and card seeds from that JSON.</li>
          <li>Expose a learner path view in app with unit progress.</li>
        </ol>
      </section>
    </div>
  )
}
