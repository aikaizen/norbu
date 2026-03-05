# Changelog

## 2026-03-05

### Fixed
- Prevented community sync failures from blocking starter deck/card seeding.
- Removed invalid system-authored community seed writes that violated Firestore rules.
- Sanitized Firestore writes to strip `undefined` values (including FSRS optional fields).
- Added local starter-data backfill so users do not land in empty states.

### Changed
- Community card propagation is now deck-aware:
  - published community cards now include source deck metadata.
  - imported shared cards are placed into deterministic deck mappings for all users.
- Batch write operations now chunk at safe limits to avoid Firestore batch-size failures when card volume grows.

### Added
- Regression tests for starter seed safety and starter backfill behavior.
