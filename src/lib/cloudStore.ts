import type { User } from 'firebase/auth'
import type { Role } from '../auth/context'
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
import { ensureStarterData, getStarterDecks, STARTER_DECK_IDS, getStarterCards } from '../db/seeds'

const LEGACY_COMMUNITY_DECK_ID = 'deck-community-cards'
const MAX_BATCH_WRITES = 450

export interface UserProfile {
  id: string
  displayName: string
  email: string
  photoURL: string
  role: 'admin' | 'teacher' | 'student'
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
  teacherRecommended?: boolean
}

export interface CommunityDeckSummary {
  id: string
  ownerId: string
  ownerName: string
  sourceDeckId: string
  name: string
  description: string
  cardCount: number
  lastUpdatedAt: number
  teacherRecommended: boolean
}

export interface CommunityCardItem {
  id: string
  ownerId: string
  ownerName: string
  sourceCardId: string
  sourceDeckId: string
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

function getCommunitySourceDeckId(communityCard: CommunityCard) {
  if (communityCard.sourceDeckId) return communityCard.sourceDeckId
  if (communityCard.sourceCardId.startsWith('alphabet-')) return 'deck-alphabet'
  if (communityCard.sourceCardId.startsWith('sadhana-')) return 'deck-sadhana-core'
  return LEGACY_COMMUNITY_DECK_ID
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

function isImportedCommunityCard(card: Card) {
  return card.deckId === LEGACY_COMMUNITY_DECK_ID || card.id.startsWith('community-') || Boolean(card.sourceCommunityId)
}

export async function ensureProfile(user: User): Promise<UserProfile> {
  const role: UserProfile['role'] =
    user.email === 'adil.islam@gmail.com' ? 'admin' : 'student'

  const profile: UserProfile = {
    id: user.uid,
    displayName: user.displayName ?? user.email ?? 'Norbu Student',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    role,
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
      role: existingData.role ?? role,
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
  const operations: Array<(batch: WriteBatch) => void> = []

  for (const deck of getStarterDecks()) {
    if (existingDeckIds.has(deck.id)) continue
    operations.push((batch) => batch.set(doc(deckCollection(userId), deck.id), stripUndefined(deck)))
  }

  for (const card of getStarterCards()) {
    if (existingCardIds.has(card.id)) continue
    operations.push((batch) => batch.set(doc(cardCollection(userId), card.id), stripUndefined(card)))
  }

  if (!settingsSnap.exists()) {
    operations.push((batch) => batch.set(settingsDoc(userId), { id: 'singleton', diamonds: 0 } satisfies Settings))
  }

  await commitWriteOperations(operations)
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
      teacherRecommended: false,
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
    if (deck.id === LEGACY_COMMUNITY_DECK_ID) continue
    operations.push((batch) => batch.set(doc(deckCollection(userId), deck.id), stripUndefined(deck), { merge: true }))
  }

  for (const card of snapshot.cards) {
    if (card.deckId === LEGACY_COMMUNITY_DECK_ID || card.id.startsWith('community-')) continue
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

  try {
    await publishExistingUserCardsToCommunity(user)
  } catch (communitySyncError) {
    console.warn('Community publish sync failed. Continuing with baseline decks.', communitySyncError)
  }

  const [deckSnap, cardSnap, sessionSnap, settingsSnap] = await Promise.all([
    getDocs(query(deckCollection(userId))),
    getDocs(query(cardCollection(userId))),
    getDocs(query(sessionCollection(userId))),
    getDoc(settingsDoc(userId)),
  ])

  const decks = deckSnap.docs
    .map((d) => d.data() as Deck)
    .filter((deck) => deck.id !== LEGACY_COMMUNITY_DECK_ID)
  const cards = cardSnap.docs
    .map((d) => d.data() as Card)
    .filter((card) => card.deckId !== LEGACY_COMMUNITY_DECK_ID && !card.id.startsWith('community-'))
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

export async function publishCardToCommunity(user: User, card: Card, role: Role): Promise<void> {
  if (isImportedCommunityCard(card)) return

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
    teacherRecommended: role === 'teacher' || role === 'admin',
  }

  await setDocSafe(doc(communityCollection(), communityCardId), communityCard, { merge: true })
}

function normalizeCommunityCard(raw: CommunityCard): CommunityCardItem | null {
  const ownerId = raw.authorId
  if (!ownerId) return null

  return {
    id: raw.id,
    ownerId,
    ownerName: raw.authorName || 'Norbu Student',
    sourceCardId: raw.sourceCardId,
    sourceDeckId: getCommunitySourceDeckId(raw),
    front: raw.front,
    tags: raw.tags ?? [],
    difficulty: raw.difficulty ?? 1,
    createdAt: raw.createdAt ?? Date.now(),
  }
}

function toCommunityDeckKey(ownerId: string, sourceDeckId: string) {
  return `${ownerId}::${sourceDeckId}`
}

export async function listCommunityDecks(): Promise<CommunityDeckSummary[]> {
  const communitySnap = await getDocs(query(communityCollection()))
  if (communitySnap.empty) return []

  const grouped = new Map<string, CommunityDeckSummary>()

  for (const cardDoc of communitySnap.docs) {
    const raw = cardDoc.data() as CommunityCard
    const card = normalizeCommunityCard(raw)
    if (!card) continue

    const key = toCommunityDeckKey(card.ownerId, card.sourceDeckId)
    const starterDeck = getStarterDecks().find((deck) => deck.id === card.sourceDeckId)
    const name = raw.sourceDeckName?.trim() || starterDeck?.name || 'Shared Deck'
    const description = raw.sourceDeckDescription?.trim() || starterDeck?.description || `Shared cards from ${card.ownerName}`

    const existing = grouped.get(key)
    if (existing) {
      existing.cardCount += 1
      existing.lastUpdatedAt = Math.max(existing.lastUpdatedAt, card.createdAt)
      if (raw.teacherRecommended) existing.teacherRecommended = true
      continue
    }

    grouped.set(key, {
      id: key,
      ownerId: card.ownerId,
      ownerName: card.ownerName,
      sourceDeckId: card.sourceDeckId,
      name,
      description,
      cardCount: 1,
      lastUpdatedAt: card.createdAt,
      teacherRecommended: Boolean(raw.teacherRecommended),
    })
  }

  return Array.from(grouped.values()).sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt)
}

export async function listCommunityCardsForDeck(deck: Pick<CommunityDeckSummary, 'ownerId' | 'sourceDeckId'>): Promise<CommunityCardItem[]> {
  const communitySnap = await getDocs(query(communityCollection()))
  if (communitySnap.empty) return []

  return communitySnap.docs
    .map((docSnap) => normalizeCommunityCard(docSnap.data() as CommunityCard))
    .filter((card): card is CommunityCardItem => Boolean(card))
    .filter((card) => card.ownerId === deck.ownerId && card.sourceDeckId === deck.sourceDeckId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function listAllProfiles(): Promise<UserProfile[]> {
  const profilesSnap = await getDocs(query(collection(requireCloud(), 'profiles')))
  return profilesSnap.docs.map((d) => d.data() as UserProfile)
}

export async function setUserRole(userId: string, role: UserProfile['role']): Promise<void> {
  const ref = profileDoc(userId)
  await setDocSafe(ref, { role, updatedAt: Date.now() } as UserProfile, { merge: true })
}

export async function getUserDecks(userId: string): Promise<Deck[]> {
  const snap = await getDocs(query(deckCollection(userId)))
  return snap.docs.map((d) => d.data() as Deck)
}

export async function getUserCards(userId: string): Promise<Card[]> {
  const snap = await getDocs(query(cardCollection(userId)))
  return snap.docs.map((d) => d.data() as Card)
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const snap = await getDocs(query(sessionCollection(userId)))
  return snap.docs.map((d) => d.data() as Session)
}

export async function getUserSettings(userId: string): Promise<Settings> {
  const snap = await getDoc(settingsDoc(userId))
  return snap.exists() ? (snap.data() as Settings) : { id: 'singleton', diamonds: 0 }
}

export async function getUserReviewLogs(userId: string): Promise<ReviewLog[]> {
  const snap = await getDocs(query(reviewLogCollection(userId)))
  return snap.docs.map((d) => d.data() as ReviewLog)
}
