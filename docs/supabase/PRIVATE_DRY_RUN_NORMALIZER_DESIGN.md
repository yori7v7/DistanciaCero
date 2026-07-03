# Private Dry-Run Normalizer Design

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implemented: no.
- Script created: no.
- Private export read: no.
- Real snapshot generated: no.
- Real dry-run executed: no.
- Supabase touched: no.
- Insert executed: no.
- Storage touched: no.
- App connection: none.

This document records the design for a future private local-only dry-run
normalizer. It does not create `dry-run-private-local-export.mjs`, does not read
the private export, does not generate a real migration snapshot and does not
write to Supabase.

## Purpose

The future normalizer should take a private UI export v2 that has already been
validated, normalize it conceptually into an internal migration snapshot shape
and produce a sanitized dry-run report of planned operations.

It exists to:

- map local sections to future remote operation categories;
- prepare human review before any insert decision;
- keep Supabase, SQL and Storage fully blocked;
- avoid printing intimate content;
- report media and playlist risk without uploading or resolving anything;
- keep the app disconnected while migration planning remains local.

## Future Conceptual Script

Tentative name:

```txt
dry-run-private-local-export.mjs
```

Status:

- Future only.
- Do not create in this phase.
- Local-only.
- No network.
- No Supabase.
- No `.env.local`.
- No LocalStorage.
- Accept one explicit local JSON file path outside the repo.
- Reject remote URLs.
- Produce only sanitized output.

## Expected Future Input

The future input should be:

- a manual JSON v2 export from the UI;
- stored outside the repo;
- validated first with `validate-private-local-export.mjs`;
- allowed to be `CHECK` only for reviewed playlist/media warnings;
- free of `errors` and `noGoReasons`;
- not pasted in chat;
- not committed to Git.

Before normalization, the previous validation must confirm:

- valid JSON;
- `version: 2`;
- complete `content`, `overrides` and `hidden` blocks;
- `errors count: 0`;
- `noGoReasons count: 0`;
- `identity_missing` resolved;
- `important_date_legacy_date` resolved;
- playlist/media warnings accepted as reviewable `CHECK`.

## Collection Normalization

The future normalizer should produce planned content operations, not remote
payloads ready for insert.

| Export section | Conceptual type | Preservation rules | Destination concept |
| --- | --- | --- | --- |
| `monthlyLetters` | `monthly_letter` | Preserve title, month or label, preview, content, locked state, local id and metadata. | Future `content_items`. |
| `openWhenLetters` | `open_when_letter` | Preserve title, mood or label, preview, content, locked state, local id and metadata. | Future `content_items`. |
| `reasons` | `reason` | Preserve text or payload, order if present, hidden state when applicable and metadata. | Future `content_items`. |
| `promises` | `promise` | Preserve text or payload, order if present, hidden state when applicable and metadata. | Future `content_items`. |
| `importantDates` | `important_date` | Use `YYYY-MM-DD` dates when present. Preserve title, description, status and metadata. Legacy dates after the local fix should become `CHECK` or `NO-GO` by severity. | Future `content_items`. |
| `futureDreams` | `wishlist_item` or `future_dream` | Preserve title, text, status, order and metadata. | Future `content_items`. |
| `timeline` | `timeline_event` | Use `YYYY-MM-DD` dates. Preserve title, subtitle, description, order and metadata. | Future `content_items`. |
| `blackHoleGallery` | `gallery_item` | Do not insert Data URLs as media. Mark planned content as `mediaPending` when needed. | Future `content_items`, future `media_assets` pending. |
| `playlist` | `playlist_item` | Mark links or paths as `externalLinkPresent` or `sourcePendingReview`; do not print full values. | Future `content_items`. |

## Remote Mapping Concept

The future dry-run must not create or modify remote rows. It may only describe
what would be needed later.

- `relationship_spaces`: expected to already exist in the lab; do not create.
- `universe_members`: expected to already exist in the lab; do not create.
- `content_items`: main future destination for normalized content.
- `media_assets`: future destination for media metadata only after Storage
  design; currently blocked.
- `content_events`: optional future audit layer, not part of the first private
  dry-run.
- Storage: blocked.

## Identity

The future normalizer should map local author labels conceptually, not resolve
real Auth UUIDs.

Allowed safe labels include:

- `local-yori`
- `local-ale`
- `owner_a`
- `partner_a`

Rules:

- Do not resolve or print real UUIDs.
- Do not print real emails.
- If identity cannot be mapped, classify as `CHECK`.
- If identity is missing from a newly-created item, classify as future
  `CHECK` or `NO-GO` according to the script rule.
- Do not invent author metadata for legacy content.

## Duplicates And Conflicts

The future dry-run should detect and report, but never merge or delete
automatically:

- duplicate local ids;
- duplicate titles inside the same collection;
- same date plus title in `importantDates` or `timeline`;
- hidden/restored ambiguity;
- override/base duplication;
- repeated media candidates;
- repeated playlist candidates.

Duplicate reports must use sanitized refs and reason codes only.

## Media And Data URLs

Rules:

- Report `dataUrlCount`.
- Do not print Data URLs.
- Do not insert Data URLs into remote JSON payloads.
- Produce `mediaPending` entries for future human review.
- Keep `media_assets` and Storage as future blocked work.

Data URL handling is a review signal, not an upload plan.

## Playlist

Rules:

- Report links and paths only as sanitized pending summaries.
- Do not download files.
- Do not validate link availability.
- Do not insert private paths.
- Leave playlist items as `CHECK` until a future source policy is approved.

## Future Dry-Run Output

The future report should be sanitized and include:

- `reportVersion`;
- `generatedAt`;
- `inputFile`: `<outside-repository>` or sanitized repo-relative path;
- `validationStatus`;
- `dryRunStatus`;
- counts by collection;
- planned operations count;
- planned `content_items` count;
- planned pending `media_assets` count;
- `skippedItems`;
- `warnings`;
- `conflicts`;
- `duplicateCandidates`;
- `identityMapping` summary;
- `mediaPending` summary;
- `playlistPending` summary;
- `noGoReasons`;
- `nextRecommendedAction`;
- exit code.

The report must not print:

- full letters;
- full reasons;
- full promises;
- full descriptions;
- Data URLs;
- full playlist URLs if sensitive;
- absolute private paths;
- tokens;
- keys;
- real UUIDs;
- personal real emails;
- full JSON payloads.

## Classification

- `PASS`: export is valid, has no errors or `noGoReasons`, warnings are zero or
  accepted, and the dry-run completed.
- `CHECK`: export is valid with `mediaPending`, `playlistPending`, minor legacy
  review items or reviewable duplicates.
- `NO-GO`: incompatible structure, critical invalid dates, missing critical
  identity or critical conflicts.
- `ABORTED security`: secrets, private paths, tokens, keys or unsafe output
  risk.
- `BLOCKED`: unrecognized format or insufficient information.

Future exit codes:

| Exit code | Result |
| --- | --- |
| 0 | `PASS` |
| 1 | `NO-GO` |
| 2 | `CHECK` |
| 3 | `BLOCKED` |
| 4 | `ABORTED security` |
| 5 | `invalid usage` |

## Relationship With Current Scripts

- `npm run migration:mock` continues to validate mock-only migration checks.
- `validate-private-local-export.mjs` validates the private UI export shape.
- The future `dry-run-private-local-export.mjs` depends conceptually on a prior
  validator result.
- No current or future dry-run script in this path should touch Supabase.
- No script should insert data.
- No script should upload media.

## Future Implementation NO-GO

Creating the future script is `NO-GO` if it:

- requires Supabase;
- requires `.env.local`;
- reads real LocalStorage;
- prints intimate content;
- saves real reports inside the repo;
- accepts remote URLs;
- prints Data URLs;
- uploads media;
- inserts data;
- requires dependencies without a separate plan;
- lacks sanitized output.

## Suggested Next Phase

Recommended next phase:

- Create `dry-run-private-local-export.mjs` using sanitized fixtures only.
- Do not run it against a private real export until a later script audit passes.
- Keep all first tests inside the repo with mock/sanitized fixture data.

Still blocked:

- No private export read in Codex.
- No real snapshot generated.
- No real LocalStorage read by scripts.
- No real dry-run with private data.
- No insert.
- No Supabase, SQL, Dashboard, CLI, Storage, `.env.local`, runtime or app
  connection.
