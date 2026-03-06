# TODO

## Curriculum
1. Define the learning path as explicit levels (`letters` -> `core words` -> `phrases` -> `practice`), with graduation criteria per level.
2. Add curriculum metadata to decks/cards (`level`, `unit`, `lessonOrder`, `prerequisites`) so sequencing is deterministic.
3. Build release gates so users unlock new deck units only after hitting mastery thresholds in prior units.
4. Create a content QA workflow:
   - canonical source per card,
   - transliteration validation,
   - meaning review status (`draft`, `reviewed`, `approved`).
5. Add versioned curriculum imports so future deck updates can be applied without duplicating cards.
6. Add curriculum analytics:
   - completion by level/unit,
   - stuck learners (cards repeatedly failed),
   - retention by unit after 7/30 days.

## UX
1. Redesign onboarding into one guided first-run path: sign-in -> choose goal -> start first lesson in under 30 seconds.
2. Promote Community as its own primary experience:
   - profile discovery,
   - deck browsing with filters/sorting,
   - one-click import with clear conflict handling.
3. Improve deck ergonomics:
   - search, sort, and pin decks,
   - deck stats inline (due now, new, mastery),
   - bulk card actions.
4. Improve study flow:
   - session goals (e.g. 10 cards),
   - progress indicators during review,
   - clear end-of-session summary with next-step CTA.
5. Add card editing UX:
   - edit history,
   - duplicate detection,
   - merge suggestions for near-identical cards.
6. Add trust/reliability UX:
   - sync status indicator,
   - last successful cloud sync timestamp,
   - explicit error banner with retry action.

## Official Packet (Tibetan Language Hand Out Packet.pdf)
1. OCR and structure:
   - run OCR for all 29 pages,
   - split content by packet units/sections,
   - store as versioned source JSON (`packet_version`, `unit`, `page_ref`).
2. Curriculum mapping:
   - create packet-aligned decks and units,
   - assign lesson order and prerequisites,
   - tag cards with source page references for traceability.
3. Content generation:
   - generate cards for letters, core vocabulary, and example phrases,
   - create unit checkpoint quizzes from packet exercises,
   - add distractor pools for meaning/phonetic recall.
4. Quality control:
   - add reviewer workflow for transliteration and meaning accuracy,
   - deduplicate near-identical packet cards,
   - lock approved canonical cards and version updates.
5. Product integration:
   - show a learner-facing “Packet Path” in Curriculum,
   - unlock unit-by-unit progression,
   - report mastery and retention per packet unit.
