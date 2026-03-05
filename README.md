# Norbu

Norbu is a Tibetan flashcard trainer with spaced repetition (FSRS), Google sign-in, cloud sync, and a shared Community Cards deck.

## Stack

- React + TypeScript + Vite
- Dexie (IndexedDB) for local runtime cache
- Firebase Auth (Google)
- Firestore for user data + community cards
- Vercel/Netlify static hosting

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env template and fill Firebase web app values:

```bash
cp .env.example .env
```

3. Enable Google sign-in in Firebase Auth.
4. Add your local domain (for dev) and production domain in Firebase Authorized Domains.
5. Apply Firestore rules from [`firebase/firestore.rules`](/Users/adilislam/Desktop/tibetan/norbu/firebase/firestore.rules).

6. Run app:

```bash
npm run dev
```

## Data Model (Firestore)

- `profiles/{uid}`
- `users/{uid}/decks/{deckId}`
- `users/{uid}/cards/{cardId}`
- `users/{uid}/sessions/{sessionId}`
- `users/{uid}/settings/singleton`
- `users/{uid}/reviewLogs/{autoId}`
- `communityCards/{communityCardId}`

On login, the app syncs Firestore -> Dexie. Writes (decks/cards/reviews/sessions/settings) are mirrored back to Firestore.

## Community Cards

All user-created cards are automatically published to `communityCards` and copied into each user's `Community Cards` deck during sync.

## Deploy

### Vercel

```bash
npm run deploy:vercel
```

### Netlify

```bash
npm run deploy
```

## Quality checks

```bash
npm run lint
npm run test -- --run
npm run build
```
