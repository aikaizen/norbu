import { createEmptyCard, fsrs, generatorParameters, Rating, type Card as FSRSCard, type Grade } from 'ts-fsrs'
import type { FSRSState } from '../db/schema'

const f = fsrs(generatorParameters({ enable_fuzz: true }))

export { Rating }

export type RatingKey = 'again' | 'hard' | 'good' | 'easy'

export const RATING_MAP: Record<RatingKey, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
}

function stateToFSRSCard(state: FSRSState): FSRSCard {
  const empty = createEmptyCard()
  return {
    ...empty,
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsed_days,
    scheduled_days: state.scheduled_days,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state,
    last_review: state.last_review ? new Date(state.last_review) : undefined,
  }
}

function fsrsCardToState(card: FSRSCard): FSRSState {
  return {
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as 0 | 1 | 2 | 3,
    last_review: card.last_review?.getTime(),
  }
}

export function getInitialFSRSState(): FSRSState {
  const card = createEmptyCard()
  return fsrsCardToState(card)
}

export function scheduleCard(state: FSRSState, rating: RatingKey): FSRSState {
  const card = stateToFSRSCard(state)
  const now = new Date()
  const item = f.next(card, now, RATING_MAP[rating])
  return fsrsCardToState(item.card)
}

function formatInterval(ms: number): string {
  const minutes = Math.round(ms / 60000)
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.round(days / 30)
  return `${months}mo`
}

export function getSchedulePreview(state: FSRSState): Record<RatingKey, string> {
  const card = stateToFSRSCard(state)
  const now = new Date()
  const result = {} as Record<RatingKey, string>
  for (const key of ['again', 'hard', 'good', 'easy'] as RatingKey[]) {
    const item = f.next(card, now, RATING_MAP[key])
    const diffMs = item.card.due.getTime() - now.getTime()
    result[key] = formatInterval(diffMs)
  }
  return result
}

export function isDue(state: FSRSState): boolean {
  return state.due <= Date.now()
}

export function getDueCount(states: FSRSState[]): number {
  return states.filter(isDue).length
}
