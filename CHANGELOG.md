# Changelog

## 2026-03-06

### Verified
- Ran full validation on current `main`:
  - `npm run lint`
  - `npm run test -- --run`
  - `npm run build`
- Validation status: all checks passed.

### Added
- Added structured upgrade roadmap in [`TODO.md`](/Users/adilislam/Desktop/tibetan/norbu/TODO.md) with two tracks:
  - curriculum
  - ux

## 2026-03-05

### Fixed
- Prevented community sync failures from blocking starter deck/card seeding.
- Removed invalid system-authored community seed writes that violated Firestore rules.
- Sanitized Firestore writes to strip `undefined` values (including FSRS optional fields).
- Added local starter-data backfill so users do not land in empty states.

### Changed
- Removed automatic `Community Cards` deck imports from user libraries.
- Added a dedicated Community section (`/community`) for discovery/import flows.
- Community now supports explicit actions:
  - import an entire community deck (with cards),
  - add community cards to one of your existing decks.
- Legacy `Community Cards` deck/card artifacts are filtered out during sync.
- Batch write operations are chunked at safe limits to avoid Firestore batch-size failures when card volume grows.

### Added
- Regression tests for starter seed safety and starter backfill behavior.
