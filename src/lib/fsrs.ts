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

export function isDue(state: FSRSState): boolean {
  return state.due <= Date.now()
}

export function getDueCount(states: FSRSState[]): number {
  return states.filter(isDue).length
}
