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
