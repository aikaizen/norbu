import { getInitialFSRSState } from '../../lib/fsrs'
import type { Card } from '../schema'

const DECK_ID = 'deck-sadhana-core'
export const SADHANA_DECK_ID = DECK_ID

const vocab = [
  { tibetan: 'སངས་རྒྱས་', phonetic: 'sangye', english: 'Buddha (Awakened One)', tags: ['triple-gem'] },
  { tibetan: 'ཆོས་', phonetic: 'chö', english: 'Dharma (Teachings)', tags: ['triple-gem'] },
  { tibetan: 'དགེ་འདུན་', phonetic: 'gendün', english: 'Sangha (Community)', tags: ['triple-gem'] },
  { tibetan: 'སྐྱབས་སུ་མཆི་', phonetic: 'kyabsu chi', english: 'I take refuge', tags: ['refuge'] },
  { tibetan: 'བྱང་ཆུབ་སེམས་', phonetic: 'jangchub sem', english: 'bodhicitta (awakening mind)', tags: ['bodhicitta'] },
  { tibetan: 'སེམས་ཅན་', phonetic: 'semchen', english: 'sentient beings', tags: ['bodhicitta'] },
  { tibetan: 'ཨོཾ་', phonetic: 'om', english: 'OM (body of all buddhas)', tags: ['mantra'] },
  { tibetan: 'ཨཱཿ', phonetic: 'ah', english: 'AH (speech of all buddhas)', tags: ['mantra'] },
  { tibetan: 'ཧཱུྃ་', phonetic: 'hung', english: 'HUM (mind of all buddhas)', tags: ['mantra'] },
  { tibetan: 'བཛྲ་', phonetic: 'vajra', english: 'vajra (indestructible/thunderbolt)', tags: ['mantra'] },
  { tibetan: 'གུ་རུ་', phonetic: 'guru', english: 'guru (spiritual teacher)', tags: ['mantra'] },
  { tibetan: 'བླ་མ་', phonetic: 'lama', english: 'lama (teacher/guru)', tags: ['general'] },
  { tibetan: 'རིན་པོ་ཆེ་', phonetic: 'rinpoche', english: 'rinpoche (precious one)', tags: ['general'] },
  { tibetan: 'དཀྱིལ་འཁོར་', phonetic: 'kyilkhor', english: 'mandala', tags: ['general'] },
  { tibetan: 'མེ་ལོང་', phonetic: 'melong', english: 'mirror', tags: ['general'] },
  { tibetan: 'མཆོད་པ་', phonetic: 'chöpa', english: 'offering/to offer', tags: ['offering'] },
  { tibetan: 'བསྔོ་བ་', phonetic: 'ngowa', english: 'dedication (of merit)', tags: ['dedication'] },
  { tibetan: 'དགེ་བ་', phonetic: 'gewa', english: 'virtue/merit', tags: ['dedication'] },
  { tibetan: 'བདེ་གཤེགས་', phonetic: 'deshegs', english: 'sugata (One Gone to Bliss)', tags: ['epithet'] },
  { tibetan: 'རྒྱལ་བ་', phonetic: 'gyalwa', english: 'victorious one (Jina)', tags: ['epithet'] },
  { tibetan: 'པདྨ་', phonetic: 'pema', english: 'lotus', tags: ['mantra', 'padmasambhava'] },
  { tibetan: 'སིདྡྷི་', phonetic: 'siddhi', english: 'accomplishment/attainment', tags: ['mantra'] },
  { tibetan: 'ཧཱུྃ་བཾ་', phonetic: 'hung bam', english: 'HUM BAM (seed syllables)', tags: ['mantra'] },
]

export const sadhanaCards: Card[] = vocab.map((v, i) => ({
  id: `sadhana-${i + 1}`,
  deckId: DECK_ID,
  front: { tibetan: v.tibetan, phonetic: v.phonetic, english: v.english },
  tags: v.tags,
  difficulty: i < 6 ? 1 : i < 14 ? 2 : 3,
  fsrsPhonetics: getInitialFSRSState(),
  fsrsMeaning: getInitialFSRSState(),
  createdAt: Date.now(),
}))
