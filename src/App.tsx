import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Decks } from './pages/Decks'
import { Review } from './pages/Review'
import { Sessions } from './pages/Sessions'
import { Stats } from './pages/Stats'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/decks/:deckId/review" element={<Review />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
