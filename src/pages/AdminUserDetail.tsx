import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  getUserDecks,
  getUserCards,
  getUserSessions,
  getUserSettings,
  type UserProfile,
  listAllProfiles,
} from '../lib/cloudStore'
import type { Card, Deck, Session, Settings } from '../db/schema'

export function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>()
  const { role } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      try {
        const [allProfiles, userDecks, userCards, userSessions, userSettings] = await Promise.all([
          listAllProfiles(),
          getUserDecks(userId!),
          getUserCards(userId!),
          getUserSessions(userId!),
          getUserSettings(userId!),
        ])
        if (cancelled) return
        setProfile(allProfiles.find((p) => p.id === userId) ?? null)
        setDecks(userDecks)
        setCards(userCards)
        setSessions(userSessions)
        setSettings(userSettings)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [userId])

  if (role !== 'admin') {
    return <p className="text-sm text-stone-500 py-8 text-center">Access denied.</p>
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading user data...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-stone-400 hover:text-stone-700 text-sm">&larr; Admin</Link>
      </div>

      <div className="flex items-center gap-3">
        {profile?.photoURL && (
          <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{profile?.displayName ?? 'Unknown'}</h1>
          <p className="text-sm text-stone-500">{profile?.email} &middot; {profile?.role ?? 'student'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-surface p-4 text-center">
          <p className="text-2xl font-semibold">{decks.length}</p>
          <p className="text-xs text-stone-500">Decks</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-2xl font-semibold">{cards.length}</p>
          <p className="text-xs text-stone-500">Cards</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-2xl font-semibold">{sessions.length}</p>
          <p className="text-xs text-stone-500">Sessions</p>
        </div>
        <div className="card-surface p-4 text-center">
          <p className="text-2xl font-bold text-saffron-500">&#9670; {settings?.diamonds ?? 0}</p>
          <p className="text-xs text-stone-500">Diamonds</p>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Decks</h2>
        {decks.map((deck) => {
          const deckCards = cards.filter((c) => c.deckId === deck.id)
          return (
            <div key={deck.id} className="card-surface p-3">
              <p className="font-medium text-sm">{deck.name}</p>
              <p className="text-xs text-stone-500">{deckCards.length} cards &middot; {deck.description}</p>
            </div>
          )
        })}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Recent Sessions</h2>
        {sessions.length === 0 && <p className="text-sm text-stone-400">No sessions.</p>}
        {sessions.slice(0, 10).map((s) => (
          <div key={s.id} className="card-surface p-3">
            <p className="text-sm">{s.date} &middot; {s.duration}m</p>
            {s.notes && <p className="text-xs text-stone-500 mt-1">{s.notes}</p>}
          </div>
        ))}
      </section>
    </div>
  )
}
