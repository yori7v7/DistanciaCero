# Private Dry-Run Result

## Status

- Result: sanitized.
- Executed manually by the user from a local terminal.
- Private export included in repo: no.
- Private export read by Codex: no.
- Supabase touched: no.
- Insert executed: no.
- Storage touched: no.
- Runtime touched: no.
- Real data in repo: no.

This document records only the sanitized result reported by the user after
running:

```txt
node scripts/migration/dry-run-private-local-export.mjs <private-export-path>
```

The private export JSON, private path, full payload, Data URLs, playlist URLs,
local refs, secrets and intimate content are intentionally not included.

## Summary

- `validationStatus`: `CHECK`.
- `dryRunStatus`: `CHECK`.
- Expected `CHECK` reason: media and playlist items require later policy
  decisions.
- `sourceVersion`: `2`.
- `totalItems`: `18`.
- `plannedOperationsCount`: `18`.
- `plannedContentItemsCount`: `18`.
- `skippedItemsCount`: `0`.
- `conflictsCount`: `0`.
- `duplicateCandidatesCount`: `0`.
- `noGoReasonsCount`: `0`.
- `exitCode`: `2`.
- `nextRecommendedAction`:
  `review_pending_media_playlist_or_warnings_before_any_insert`.

## Collection Counts

| Collection | Count |
| --- | ---: |
| `monthlyLetters` | 2 |
| `openWhenLetters` | 2 |
| `reasons` | 2 |
| `promises` | 2 |
| `importantDates` | 2 |
| `futureDreams` | 2 |
| `timeline` | 2 |
| `blackHoleGallery` | 2 |
| `playlist` | 2 |

## Identity

- `local-ale`: detected as `known_local_label`.
- `local-yori`: detected as `known_local_label`.
- `missingCount`: `0`.
- `unknownCount`: `0`.
- Real UUIDs printed: no.
- Real emails printed: no.

## Pending Decisions

### Media

- `mediaPending.count`: `2`.
- Reason: `data_url_detected`.
- Required future decision:
  `storage_policy_and_upload_phase_required`.
- Storage remains out of scope.
- Data URLs are not included here.

### Playlist

- `playlistPending.count`: `2`.
- Reason: `playlist_source_pending_review`.
- Required future decision: `playlist_source_policy_required`.
- Full playlist URLs are not included here.

These pending items are expected and do not block designing the next controlled
insert policy phase. They do block any automatic insert.

## Warnings

- `media_pending_storage`: 2.
- `playlist_source_pending_review`: 2.

Warnings are recorded as code-only summaries. This document contains no full
content, Data URLs, full playlist URLs, private absolute paths, local refs,
secrets or full export payload.

## Confirmed Prior Fixes

- `identity_missing` no longer appears.
- `important_date_legacy_date` no longer appears.

This confirms the earlier local export warning fix for letter metadata and
stable important-date formatting.

## Interpretation

The private export is suitable for designing a controlled private insert policy.
It is not ready for automatic insert.

Current interpretation:

- Content normalization produced 18 planned `content_items`.
- No skipped items, conflicts, duplicate candidates or no-go reasons were
  reported.
- Identity labels are known local labels.
- Media and playlist remain pending by design.
- Any future insert must be manual, lab-only and controlled.
- A future insert policy should either exclude pending-review items, insert them
  as `pending_review`, or block them until Storage/playlist policy is designed.

## Suggested Next Phase

The controlled private insert policy is documented in
`CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md`, and the manifest format is
documented in `PRIVATE_INSERT_MANIFEST_FORMAT.md`. The next step is to design or
create a local-only manifest generator using sanitized fixtures.

Open decision:

- First insert should select 14 clean items.
- `blackHoleGallery` and `playlist` should be deferred from the first insert.
- Future manifest must record selected and deferred counts without payloads.

Still blocked:

- No insert.
- No Supabase touch.
- No SQL execution.
- No Dashboard or CLI use.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private export content in Git or chat.
