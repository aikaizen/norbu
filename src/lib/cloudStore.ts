import type { User } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  type DocumentData,
  type DocumentReference,
  getDoc,
  getDocs,
  query,
  setDoc,
  type SetOptions,
  type WriteBatch,
  writeBatch,
} from 'firebase/firestore'
import { dbCloud } from './firebase'
import { clearLocalData, getLocalDataSnapshot, replaceLocalData } from '../db'
import type { Card, Deck, ReviewLog, Session, Settings } from '../db/schema'
import { ensureStarterData, STARTER_DECKS, getStarterCards } from '../db/seeds'
import { getInitialFSRSState } from './fsrs'

export const COMMUNITY_DECK_ID = 'deck-community-cards'
const MAX_BATCH_WRITES = 450
const STARTER_DECK_IDS = new Set(STARTER_DECKS.map((deck) => deck.id))

const COMMUNITY_DECK: Deck = {
  id: COMMUNITY_DECK_ID,
  name: 'Community Cards',
  language: 'tibetan',
  description: 'Cards shared by Norbu users',
  createdAt: Date.now(),
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  photoURL: string
  createdAt: number
  updatedAt: number
}

interface CommunityCard {
  id: string
  authorId: string
  authorName: string
  sourceCardId: string
  sourceDeckId?: string
  sourceDeckName?: string
  sourceDeckDescription?: string
  front: Card['front']
  tags: string[]
  difficulty: number
  createdAt: number
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefined(item))
      .filter((item) => item !== undefined) as T
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (nested === undefined) continue
      result[key] = stripUndefined(nested)
    }
    return result as T
  }

  return value
}

async function setDocSafe<T extends DocumentData>(
  reference: DocumentReference<T>,
  data: T,
  options?: SetOptions,
) {
  const cleanData = stripUndefined(data)
  if (options) {
    await setDoc(reference, cleanData, options)
    return
  }
  await setDoc(reference, cleanData)
}

async function commitWriteOperations(operations: Array<(batch: WriteBatch) => void>) {
  if (operations.length === 0) return

  const cloud = requireCloud()
  for (let i = 0; i < operations.length; i += MAX_BATCH_WRITES) {
    const batch = writeBatch(cloud)
    const chunk = operations.slice(i, i + MAX_BATCH_WRITES)
    for (const operation of chunk) {
      operation(batch)
    }
    await batch.commit()
  }
}

function toSharedDeckId(sourceDeckId: string) {
  if (STARTER_DECK_IDS.has(sourceDeckId) || sourceDeckId === COMMUNITY_DECK_ID) {
    return sourceDeckId
  }
  if (sourceDeckId.startsWith('shared-')) {
    return sourceDeckId
  }
  return `shared-${sourceDeckId}`
}

function getCommunitySourceDeckId(communityCard: CommunityCard) {
  if (communityCard.sourceDeckId) return communityCard.sourceDeckId
  if (communityCard.sourceCardId.startsWith('alphabet-')) return 'deck-alphabet'
  if (communityCard.sourceCardId.startsWith('sadhana-')) return 'deck-sadhana-core'
  return COMMUNITY_DECK_ID
}

function requireCloud() {
  if (!dbCloud) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* env vars.')
  }
  return dbCloud
}

function deckCollection(userId: string) {
  return collection(requireCloud(), 'users', userId, 'decks')
}

function cardCollection(userId: string) {
  return collection(requireCloud(), 'users', userId, 'cards')
}

function sessionCollection(userId: string) {
  return collection(requireCloud(), 'users', userId, 'sessions')
}

function reviewLogCollection(userId: string) {
  return collection(requireCloud(), 'users', userId, 'reviewLogs')
}

function settingsDoc(userId: string) {
  return doc(requireCloud(), 'users', userId, 'settings', 'singleton')
}

function profileDoc(userId: string) {
  return doc(requireCloud(), 'profiles', userId)
}

function communityCollection() {
  return collection(requireCloud(), 'communityCards')
}

function toCommunityCardId(userId: string, cardId: string) {
  return `${userId}-${cardId}`
}

function toImportedCommunityCardId(communityCardId: string) {
  return `community-${communityCardId}`
}

function isImportedCommunityCard(card: Card) {
  return card.deckId === COMMUNITY_DECK_ID || card.id.startsWith('community-') || Boolean(card.sourceCommunityId)
}

export function makeCommunityDeckCard(source: Card, communityCardId: string): Card {
  return {
    ...source,
    id: toImportedCommunityCardId(communityCardId),
    deckId: COMMUNITY_DECK_ID,
    sourceCommunityId: communityCardId,
    fsrsPhonetics: getInitialFSRSState(),
    fsrsMeaning: getInitialFSRSState(),
    createdAt: Date.now(),
  }
}

export async function ensureProfile(user: User): Promise<UserProfile> {
  const profile: UserProfile = {
    id: user.uid,
    displayName: user.displayName ?? user.email ?? 'Norbu Student',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const ref = profileDoc(user.uid)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    const existingData = existing.data() as UserProfile
    const merged: UserProfile = {
      ...existingData,
      ...profile,
      createdAt: existingData.createdAt ?? profile.createdAt,
      updatedAt: Date.now(),
    }
    await setDocSafe(ref, merged, { merge: true })
    return merged
  }

  await setDocSafe(ref, profile)
  return profile
}

async function ensureStarterCloudData(userId: string) {
  const [deckSnap, cardSnap, settingsSnap] = await Promise.all([
    getDocs(query(deckCollection(userId))),
    getDocs(query(cardCollection(userId))),
    getDoc(settingsDoc(userId)),
  ])

  const existingDeckIds = new Set(deckSnap.docs.map((d) => d.id))
  const existingCardIds = new Set(cardSnap.docs.map((d) => d.id))
  const batch = writeBatch(requireCloud())
  const starterDecks = [...STARTER_DECKS, COMMUNITY_DECK]
  let writes = 0

  for (const deck of starterDecks) {
    if (existingDeckIds.has(deck.id)) continue
    batch.set(doc(deckCollection(userId), deck.id), stripUndefined(deck))
    writes += 1
  }

  for (const card of getStarterCards()) {
    if (existingCardIds.has(card.id)) continue
    batch.set(doc(cardCollection(userId), card.id), stripUndefined(card))
    writes += 1
  }

  if (!settingsSnap.exists()) {
    batch.set(settingsDoc(userId), { id: 'singleton', diamonds: 0 } satisfies Settings)
    writes += 1
  }

  if (writes > 0) {
    await batch.commit()
  }
}

async function ensureCommunityDeck(userId: string) {
  await setDocSafe(doc(deckCollection(userId), COMMUNITY_DECK_ID), COMMUNITY_DECK, { merge: true })
}

async function importCommunityCardsForUser(userId: string): Promise<Card[]> {
  const [communitySnap, cardSnap, deckSnap] = await Promise.all([
    getDocs(query(communityCollection())),
    getDocs(query(cardCollection(userId))),
    getDocs(query(deckCollection(userId))),
  ])

  if (communitySnap.empty) return []

  const existingCardIds = new Set(cardSnap.docs.map((d) => d.id))
  const existingDeckIds = new Set(deckSnap.docs.map((d) => d.id))
  const operations: Array<(batch: WriteBatch) => void> = []
  const imported: Card[] = []

  for (const docSnap of communitySnap.docs) {
    const community = docSnap.data() as CommunityCard
    if (community.authorId === userId) continue

    const importedId = toImportedCommunityCardId(community.id)
    if (existingCardIds.has(importedId)) continue

    const sourceDeckId = getCommunitySourceDeckId(community)
    const targetDeckId = toSharedDeckId(sourceDeckId)

    if (!existingDeckIds.has(targetDeckId)) {
      const starterDeck = STARTER_DECKS.find((deck) => deck.id === sourceDeckId)
      const fallbackName = community.sourceDeckName?.trim() || 'Shared Deck'
      const deckName = starterDeck ? starterDeck.name : `Shared: ${fallbackName}`
      const deckDescription = community.sourceDeckDescription?.trim() || `Shared cards from ${community.authorName}`
      const deck: Deck = {
        id: targetDeckId,
        name: deckName,
        language: 'tibetan',
        description: deckDescription,
        createdAt: Date.now(),
      }
      operations.push((batch) => batch.set(doc(deckCollection(userId), targetDeckId), stripUndefined(deck), { merge: true }))
      existingDeckIds.add(targetDeckId)
    }

    const importedCard: Card = {
      id: importedId,
      deckId: targetDeckId,
      sourceCommunityId: community.id,
      front: community.front,
      tags: Array.from(new Set([...community.tags, 'community'])),
      difficulty: community.difficulty,
      fsrsPhonetics: getInitialFSRSState(),
      fsrsMeaning: getInitialFSRSState(),
      createdAt: Date.now(),
    }

    operations.push((batch) => batch.set(doc(cardCollection(userId), importedId), stripUndefined(importedCard)))
    existingCardIds.add(importedId)
    imported.push(importedCard)
  }

  await commitWriteOperations(operations)

  return imported
}

async function publishExistingUserCardsToCommunity(user: User) {
  const [cardsSnap, decksSnap] = await Promise.all([
    getDocs(query(cardCollection(user.uid))),
    getDocs(query(deckCollection(user.uid))),
  ])
  if (cardsSnap.empty) return

  const deckById = new Map(decksSnap.docs.map((deck) => [deck.id, deck.data() as Deck]))
  const operations: Array<(batch: WriteBatch) => void> = []

  for (const cardDoc of cardsSnap.docs) {
    const card = cardDoc.data() as Card
    if (isImportedCommunityCard(card)) continue

    const sourceDeck = deckById.get(card.deckId)
    const communityCardId = toCommunityCardId(user.uid, card.id)
    const communityCard: CommunityCard = {
      id: communityCardId,
      sourceCardId: card.id,
      sourceDeckId: card.deckId,
      sourceDeckName: sourceDeck?.name ?? 'Shared Deck',
      sourceDeckDescription: sourceDeck?.description ?? '',
      authorId: user.uid,
      authorName: user.displayName ?? user.email ?? 'Norbu Student',
      front: card.front,
      tags: card.tags,
      difficulty: card.difficulty,
      createdAt: Date.now(),
    }

    operations.push((batch) => batch.set(doc(communityCollection(), communityCardId), stripUndefined(communityCard), { merge: true }))
  }

  await commitWriteOperations(operations)
}

async function mergeLocalSnapshotIntoCloud(userId: string) {
  const snapshot = await getLocalDataSnapshot()
  if (snapshot.decks.length === 0 && snapshot.cards.length === 0 && snapshot.sessions.length === 0) {
    return
  }

  const operations: Array<(batch: WriteBatch) => void> = []

  for (const deck of snapshot.decks) {
    operations.push((batch) => batch.set(doc(deckCollection(userId), deck.id), stripUndefined(deck), { merge: true }))
  }

  for (const card of snapshot.cards) {
    operations.push((batch) => batch.set(doc(cardCollection(userId), card.id), stripUndefined(card), { merge: true }))
  }

  for (const session of snapshot.sessions) {
    operations.push((batch) => batch.set(doc(sessionCollection(userId), session.id), stripUndefined(session), { merge: true }))
  }

  operations.push((batch) => batch.set(settingsDoc(userId), stripUndefined(snapshot.settings), { merge: true }))
  await commitWriteOperations(operations)
}

export async function syncCloudToLocal(user: User) {
  const userId = user.uid
  await mergeLocalSnapshotIntoCloud(userId)
  await ensureStarterCloudData(userId)
  await ensureCommunityDeck(userId)

  try {
    await publishExistingUserCardsToCommunity(user)
    await importCommunityCardsForUser(userId)
  } catch (communitySyncError) {
    // Community sync is optional; baseline decks/cards must still load.
    console.warn('Community sync failed. Continuing with baseline decks.', communitySyncError)
  }

  const [deckSnap, cardSnap, sessionSnap, settingsSnap] = await Promise.all([
    getDocs(query(deckCollection(userId))),
    getDocs(query(cardCollection(userId))),
    getDocs(query(sessionCollection(userId))),
    getDoc(settingsDoc(userId)),
  ])

  const decks = deckSnap.docs.map((d) => d.data() as Deck)
  const cards = cardSnap.docs.map((d) => d.data() as Card)
  const sessions = sessionSnap.docs.map((d) => d.data() as Session)
  const settings = settingsSnap.exists()
    ? (settingsSnap.data() as Settings)
    : ({ id: 'singleton', diamonds: 0 } satisfies Settings)

  await replaceLocalData({
    decks,
    cards,
    sessions,
    settings,
  })

  // Ensure baseline decks/cards exist locally even if cloud data is partial.
  await ensureStarterData()
}

export async function signOutClearLocal() {
  await clearLocalData()
}

export async function upsertDeck(userId: string, deck: Deck) {
  await setDocSafe(doc(deckCollection(userId), deck.id), deck)
}

export async function upsertCard(userId: string, card: Card) {
  await setDocSafe(doc(cardCollection(userId), card.id), card)
}

export async function upsertSession(userId: string, session: Session) {
  await setDocSafe(doc(sessionCollection(userId), session.id), session)
}

export async function upsertSettings(userId: string, settings: Settings) {
  await setDocSafe(settingsDoc(userId), settings)
}

export async function createReviewLog(userId: string, reviewLog: Omit<ReviewLog, 'id'>) {
  await addDoc(reviewLogCollection(userId), reviewLog)
}

export async function publishCardToCommunity(user: User, card: Card): Promise<{ communityCardId: string; communityDeckCard: Card }> {
  const sourceDeckSnap = await getDoc(doc(deckCollection(user.uid), card.deckId))
  const sourceDeck = sourceDeckSnap.exists() ? (sourceDeckSnap.data() as Deck) : null
  const communityCardId = toCommunityCardId(user.uid, card.id)
  const communityCard: CommunityCard = {
    id: communityCardId,
    sourceCardId: card.id,
    sourceDeckId: card.deckId,
    sourceDeckName: sourceDeck?.name ?? 'Shared Deck',
    sourceDeckDescription: sourceDeck?.description ?? '',
    authorId: user.uid,
    authorName: user.displayName ?? user.email ?? 'Norbu Student',
    front: card.front,
    tags: card.tags,
    difficulty: card.difficulty,
    createdAt: Date.now(),
  }

  await setDocSafe(doc(communityCollection(), communityCardId), communityCard, { merge: true })

  const communityDeckCard = makeCommunityDeckCard(card, communityCardId)
  await setDocSafe(doc(cardCollection(user.uid), communityDeckCard.id), communityDeckCard, { merge: true })

  return { communityCardId, communityDeckCard }
}
