import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthScreen } from './components/AuthScreen'
import { useAuth } from './auth/useAuth'
import { hasFirebaseConfig } from './lib/firebase'

const Home = lazy(async () => import('./pages/Home').then((m) => ({ default: m.Home })))
const Decks = lazy(async () => import('./pages/Decks').then((m) => ({ default: m.Decks })))
const Community = lazy(async () => import('./pages/Community').then((m) => ({ default: m.Community })))
const DeckDetail = lazy(async () => import('./pages/DeckDetail').then((m) => ({ default: m.DeckDetail })))
const Review = lazy(async () => import('./pages/Review').then((m) => ({ default: m.Review })))
const Sessions = lazy(async () => import('./pages/Sessions').then((m) => ({ default: m.Sessions })))
const Stats = lazy(async () => import('./pages/Stats').then((m) => ({ default: m.Stats })))

export default function App() {
  const { user, loading, syncing, error, signInWithGoogle } = useAuth()

  if (!hasFirebaseConfig) {
    return <AuthScreen mode="config" />
  }

  if (loading || syncing) {
    return <div className="min-h-screen grid place-items-center text-sm text-stone-500">Syncing your data…</div>
  }

  if (!user) {
    return <AuthScreen mode="signin" onSignIn={signInWithGoogle} error={error} />
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-sm text-stone-500">Loading…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/community" element={<Community />} />
            <Route path="/decks/:deckId" element={<DeckDetail />} />
            <Route path="/decks/:deckId/review/:mode" element={<Review />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/stats" element={<Stats />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
