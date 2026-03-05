import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getInitialFSRSState } from '../lib/fsrs'
import { useAuth } from '../auth/useAuth'
import {
  listCommunityCardsForDeck,
  listCommunityDecks,
  type CommunityCardItem,
  type CommunityDeckSummary,
  upsertCard,
  upsertDeck,
} from '../lib/cloudStore'
import type { Card, Deck } from '../db/schema'

function toImportedDeckId(deck: CommunityDeckSummary) {
  return `imported-${deck.ownerId}-${deck.sourceDeckId}`
}

function toImportedCardId(card: CommunityCardItem, targetDeckId: string) {
  return `imported-${card.id}-${targetDeckId}`
}

export function Community() {
  const { user } = useAuth()
  const myDecks = useLiveQuery(() => db.decks.toArray())
  const [communityDecks, setCommunityDecks] = useState<CommunityDeckSummary[]>([])
  const [cardsByDeck, setCardsByDeck] = useState<Record<string, CommunityCardItem[]>>({})
  const [selectedDeckByCommunityDeck, setSelectedDeckByCommunityDeck] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busyDeckId, setBusyDeckId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCommunity() {
      try {
        const decks = await listCommunityDecks()
        if (!cancelled) {
          const filtered = user ? decks.filter((deck) => deck.ownerId !== user.uid) : decks
          setCommunityDecks(filtered)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCommunity()

    return () => {
      cancelled = true
    }
  }, [user])

  async function getDeckCards(deck: CommunityDeckSummary) {
    if (cardsByDeck[deck.id]) return cardsByDeck[deck.id]
    const cards = await listCommunityCardsForDeck(deck)
    setCardsByDeck((prev) => ({ ...prev, [deck.id]: cards }))
    return cards
  }

  async function addCardsToDeck(deck: CommunityDeckSummary, targetDeckId: string) {
    if (!user) return
    setBusyDeckId(deck.id)
    setMessage(null)

    try {
      const communityCards = await getDeckCards(deck)
      const candidateCards: Card[] = communityCards.map((communityCard) => ({
        id: toImportedCardId(communityCard, targetDeckId),
        deckId: targetDeckId,
        sourceCommunityId: communityCard.id,
        front: communityCard.front,
        tags: Array.from(new Set([...communityCard.tags, 'community'])),
        difficulty: communityCard.difficulty,
        fsrsPhonetics: getInitialFSRSState(),
        fsrsMeaning: getInitialFSRSState(),
        createdAt: Date.now(),
      }))

      const existing = await db.cards.bulkGet(candidateCards.map((card) => card.id))
      const newCards = candidateCards.filter((_, index) => !existing[index])

      if (newCards.length > 0) {
        await db.cards.bulkAdd(newCards)
        await Promise.all(newCards.map((card) => upsertCard(user.uid, card)))
      }

      setMessage(`${newCards.length} card${newCards.length === 1 ? '' : 's'} added to your deck.`)
    } finally {
      setBusyDeckId(null)
    }
  }

  async function importDeck(deck: CommunityDeckSummary) {
    if (!user) return
    const importedDeckId = toImportedDeckId(deck)

    setBusyDeckId(deck.id)
    setMessage(null)

    try {
      const importedDeck: Deck = {
        id: importedDeckId,
        name: `${deck.name} (from ${deck.ownerName})`,
        language: 'tibetan',
        description: deck.description,
        createdAt: Date.now(),
      }

      const existingDeck = await db.decks.get(importedDeck.id)
      if (!existingDeck) {
        await db.decks.add(importedDeck)
        await upsertDeck(user.uid, importedDeck)
      }

      await addCardsToDeck(deck, importedDeck.id)
    } finally {
      setBusyDeckId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Community</h1>
        <p className="text-xs text-stone-500">Discover decks from other learners</p>
      </div>

      {message && (
        <p className="text-sm rounded-lg border border-green-700/40 bg-green-950/20 text-green-400 px-3 py-2">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-stone-500">Loading community…</p>
      ) : (
        <div className="space-y-3">
          {communityDecks.map((deck) => {
            const selectedDeckId = selectedDeckByCommunityDeck[deck.id] ?? ''
            const isBusy = busyDeckId === deck.id

            return (
              <div key={deck.id} className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{deck.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{deck.description}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      by {deck.ownerName} • {deck.cardCount} cards
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      void importDeck(deck)
                    }}
                    className="text-sm rounded-lg px-3 py-1.5 bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-60"
                  >
                    Import deck
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      void getDeckCards(deck)
                    }}
                    className="text-sm rounded-lg px-3 py-1.5 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-60"
                  >
                    View cards
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={selectedDeckId}
                    onChange={(event) => {
                      const value = event.target.value
                      setSelectedDeckByCommunityDeck((prev) => ({ ...prev, [deck.id]: value }))
                    }}
                    className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm"
                  >
                    <option value="">Add cards to deck...</option>
                    {myDecks?.map((myDeck) => (
                      <option key={myDeck.id} value={myDeck.id}>
                        {myDeck.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isBusy || !selectedDeckId}
                    onClick={() => {
                      void addCardsToDeck(deck, selectedDeckId)
                    }}
                    className="text-sm rounded-lg px-3 py-1.5 border border-amber-700 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 disabled:opacity-60"
                  >
                    Add cards to selected deck
                  </button>
                </div>

                {cardsByDeck[deck.id] && (
                  <div className="rounded-lg border border-stone-200 dark:border-stone-800 divide-y divide-stone-200 dark:divide-stone-800">
                    {cardsByDeck[deck.id].map((card) => (
                      <div key={card.id} className="px-3 py-2 text-sm">
                        <span className="font-tibetan text-lg">{card.front.tibetan}</span>
                        <span className="text-stone-500 ml-2">{card.front.phonetic}</span>
                        <span className="text-stone-400 ml-2">— {card.front.english}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {communityDecks.length === 0 && (
            <p className="text-sm text-stone-500">No community decks yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
