import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthScreen } from './components/AuthScreen'
import { useAuth } from './auth/useAuth'
import { hasFirebaseConfig } from './lib/firebase'

const Home = lazy(async () => import('./pages/Home').then((m) => ({ default: m.Home })))
const Decks = lazy(async () => import('./pages/Decks').then((m) => ({ default: m.Decks })))
const Curriculum = lazy(async () => import('./pages/Curriculum').then((m) => ({ default: m.Curriculum })))
const Community = lazy(async () => import('./pages/Community').then((m) => ({ default: m.Community })))
const DeckDetail = lazy(async () => import('./pages/DeckDetail').then((m) => ({ default: m.DeckDetail })))
const Review = lazy(async () => import('./pages/Review').then((m) => ({ default: m.Review })))
const Sessions = lazy(async () => import('./pages/Sessions').then((m) => ({ default: m.Sessions })))
const Stats = lazy(async () => import('./pages/Stats').then((m) => ({ default: m.Stats })))
const Admin = lazy(async () => import('./pages/Admin').then((m) => ({ default: m.Admin })))
const AdminUserDetail = lazy(async () => import('./pages/AdminUserDetail').then((m) => ({ default: m.AdminUserDetail })))

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
            <Route path="/curriculum" element={<Curriculum />} />
            <Route path="/community" element={<Community />} />
            <Route path="/decks/:deckId" element={<DeckDetail />} />
            <Route path="/decks/:deckId/review/:mode" element={<Review />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/user/:userId" element={<AdminUserDetail />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
