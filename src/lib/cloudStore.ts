import type { User } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { dbCloud } from './firebase'
import { clearLocalData, getLocalDataSnapshot, replaceLocalData } from '../db'
import type { Card, Deck, ReviewLog, Session, Settings } from '../db/schema'
import { STARTER_DECKS, getStarterCards } from '../db/seeds'
import { getInitialFSRSState } from './fsrs'

export const COMMUNITY_DECK_ID = 'deck-community-cards'

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
  front: Card['front']
  tags: string[]
  difficulty: number
  createdAt: number
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
    await setDoc(ref, merged, { merge: true })
    return merged
  }

  await setDoc(ref, profile)
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
    batch.set(doc(deckCollection(userId), deck.id), deck)
    writes += 1
  }

  for (const card of getStarterCards()) {
    if (existingCardIds.has(card.id)) continue
    batch.set(doc(cardCollection(userId), card.id), card)
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
  await setDoc(doc(deckCollection(userId), COMMUNITY_DECK_ID), COMMUNITY_DECK, { merge: true })
}

async function importCommunityCardsForUser(userId: string): Promise<Card[]> {
  const [communitySnap, cardSnap] = await Promise.all([
    getDocs(query(communityCollection())),
    getDocs(query(cardCollection(userId))),
  ])

  if (communitySnap.empty) return []

  const existingIds = new Set(cardSnap.docs.map((d) => d.id))
  const batch = writeBatch(requireCloud())
  const imported: Card[] = []

  for (const docSnap of communitySnap.docs) {
    const community = docSnap.data() as CommunityCard
    const importedId = toImportedCommunityCardId(community.id)
    if (existingIds.has(importedId)) continue

    const importedCard: Card = {
      id: importedId,
      deckId: COMMUNITY_DECK_ID,
      sourceCommunityId: community.id,
      front: community.front,
      tags: Array.from(new Set([...community.tags, 'community'])),
      difficulty: community.difficulty,
      fsrsPhonetics: getInitialFSRSState(),
      fsrsMeaning: getInitialFSRSState(),
      createdAt: Date.now(),
    }

    batch.set(doc(cardCollection(userId), importedId), importedCard)
    imported.push(importedCard)
  }

  if (imported.length > 0) {
    await batch.commit()
  }

  return imported
}

async function publishExistingUserCardsToCommunity(user: User) {
  const cardsSnap = await getDocs(query(cardCollection(user.uid)))
  if (cardsSnap.empty) return

  const batch = writeBatch(requireCloud())
  let count = 0

  for (const cardDoc of cardsSnap.docs) {
    const card = cardDoc.data() as Card
    if (isImportedCommunityCard(card)) continue

    const communityCardId = toCommunityCardId(user.uid, card.id)
    const communityCard: CommunityCard = {
      id: communityCardId,
      sourceCardId: card.id,
      authorId: user.uid,
      authorName: user.displayName ?? user.email ?? 'Norbu Student',
      front: card.front,
      tags: card.tags,
      difficulty: card.difficulty,
      createdAt: Date.now(),
    }

    batch.set(doc(communityCollection(), communityCardId), communityCard, { merge: true })
    count += 1
  }

  if (count > 0) {
    await batch.commit()
  }
}

async function mergeLocalSnapshotIntoCloud(userId: string) {
  const snapshot = await getLocalDataSnapshot()
  if (snapshot.decks.length === 0 && snapshot.cards.length === 0 && snapshot.sessions.length === 0) {
    return
  }

  const batch = writeBatch(requireCloud())

  for (const deck of snapshot.decks) {
    batch.set(doc(deckCollection(userId), deck.id), deck, { merge: true })
  }

  for (const card of snapshot.cards) {
    batch.set(doc(cardCollection(userId), card.id), card, { merge: true })
  }

  for (const session of snapshot.sessions) {
    batch.set(doc(sessionCollection(userId), session.id), session, { merge: true })
  }

  batch.set(settingsDoc(userId), snapshot.settings, { merge: true })
  await batch.commit()
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
}

export async function signOutClearLocal() {
  await clearLocalData()
}

export async function upsertDeck(userId: string, deck: Deck) {
  await setDoc(doc(deckCollection(userId), deck.id), deck)
}

export async function upsertCard(userId: string, card: Card) {
  await setDoc(doc(cardCollection(userId), card.id), card)
}

export async function upsertSession(userId: string, session: Session) {
  await setDoc(doc(sessionCollection(userId), session.id), session)
}

export async function upsertSettings(userId: string, settings: Settings) {
  await setDoc(settingsDoc(userId), settings)
}

export async function createReviewLog(userId: string, reviewLog: Omit<ReviewLog, 'id'>) {
  await addDoc(reviewLogCollection(userId), reviewLog)
}

export async function publishCardToCommunity(user: User, card: Card): Promise<{ communityCardId: string; communityDeckCard: Card }> {
  const communityCardId = toCommunityCardId(user.uid, card.id)
  const communityCard: CommunityCard = {
    id: communityCardId,
    sourceCardId: card.id,
    authorId: user.uid,
    authorName: user.displayName ?? user.email ?? 'Norbu Student',
    front: card.front,
    tags: card.tags,
    difficulty: card.difficulty,
    createdAt: Date.now(),
  }

  await setDoc(doc(communityCollection(), communityCardId), communityCard, { merge: true })

  const communityDeckCard = makeCommunityDeckCard(card, communityCardId)
  await setDoc(doc(cardCollection(user.uid), communityDeckCard.id), communityDeckCard, { merge: true })

  return { communityCardId, communityDeckCard }
}
