import { getInitialFSRSState } from '../../lib/fsrs'
import type { Card } from '../schema'

const DECK_ID = 'deck-alphabet'

const letters = [
  { tibetan: 'ཀ', phonetic: 'ka', english: 'ka (1st letter)' },
  { tibetan: 'ཁ', phonetic: 'kha', english: 'kha (2nd letter)' },
  { tibetan: 'ག', phonetic: 'ga', english: 'ga (3rd letter)' },
  { tibetan: 'ང', phonetic: 'nga', english: 'nga (4th letter)' },
  { tibetan: 'ཅ', phonetic: 'ca', english: 'ca (5th letter)' },
  { tibetan: 'ཆ', phonetic: 'cha', english: 'cha (6th letter)' },
  { tibetan: 'ཇ', phonetic: 'ja', english: 'ja (7th letter)' },
  { tibetan: 'ཉ', phonetic: 'nya', english: 'nya (8th letter)' },
  { tibetan: 'ཏ', phonetic: 'ta', english: 'ta (9th letter)' },
  { tibetan: 'ཐ', phonetic: 'tha', english: 'tha (10th letter)' },
  { tibetan: 'ད', phonetic: 'da', english: 'da (11th letter)' },
  { tibetan: 'ན', phonetic: 'na', english: 'na (12th letter)' },
  { tibetan: 'པ', phonetic: 'pa', english: 'pa (13th letter)' },
  { tibetan: 'ཕ', phonetic: 'pha', english: 'pha (14th letter)' },
  { tibetan: 'བ', phonetic: 'ba', english: 'ba (15th letter)' },
  { tibetan: 'མ', phonetic: 'ma', english: 'ma (16th letter)' },
  { tibetan: 'ཙ', phonetic: 'tsa', english: 'tsa (17th letter)' },
  { tibetan: 'ཚ', phonetic: 'tsha', english: 'tsha (18th letter)' },
  { tibetan: 'ཛ', phonetic: 'dza', english: 'dza (19th letter)' },
  { tibetan: 'ཝ', phonetic: 'wa', english: 'wa (20th letter)' },
  { tibetan: 'ཞ', phonetic: 'zha', english: 'zha (21st letter)' },
  { tibetan: 'ཟ', phonetic: 'za', english: 'za (22nd letter)' },
  { tibetan: 'འ', phonetic: "'a", english: "'a (23rd letter)" },
  { tibetan: 'ཡ', phonetic: 'ya', english: 'ya (24th letter)' },
  { tibetan: 'ར', phonetic: 'ra', english: 'ra (25th letter)' },
  { tibetan: 'ལ', phonetic: 'la', english: 'la (26th letter)' },
  { tibetan: 'ཤ', phonetic: 'sha', english: 'sha (27th letter)' },
  { tibetan: 'ས', phonetic: 'sa', english: 'sa (28th letter)' },
  { tibetan: 'ཧ', phonetic: 'ha', english: 'ha (29th letter)' },
  { tibetan: 'ཨ', phonetic: 'a', english: 'a (30th letter)' },
]

export const ALPHABET_DECK_ID = DECK_ID

export const alphabetCards: Card[] = letters.map((l, i) => ({
  id: `alphabet-${i + 1}`,
  deckId: DECK_ID,
  front: l,
  tags: ['alphabet'],
  difficulty: 1,
  fsrsPhonetics: getInitialFSRSState(),
  fsrsMeaning: getInitialFSRSState(),
  createdAt: Date.now(),
}))
