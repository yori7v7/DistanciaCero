# Controlled Private Lab Insert Policy

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Insert executed: no.
- SQL created: no.
- Script created: no.
- Supabase touched: no.
- Storage touched: no.
- Production-ready: no.
- App connection: none.

This policy defines what a future first controlled private lab insert should
include and defer. It does not create SQL, does not create scripts, does not
read the private export and does not touch Supabase.

## Design Basis

The policy is based on the sanitized private dry-run result recorded in
`PRIVATE_DRY_RUN_RESULT.md`.

- `validationStatus`: `CHECK`.
- `dryRunStatus`: `CHECK`.
- `totalItems`: `18`.
- `plannedOperationsCount`: `18`.
- `plannedContentItemsCount`: `18`.
- `skippedItemsCount`: `0`.
- `conflictsCount`: `0`.
- `duplicateCandidatesCount`: `0`.
- `noGoReasonsCount`: `0`.
- `mediaPending`: `2`.
- `playlistPending`: `2`.
- Identity missing count: `0`.
- Unknown identity count: `0`.

The `CHECK` status is expected because media and playlist items require future
policy decisions.

## Recommended Decision

The first controlled private lab insert should insert only the 14 clean
`content_items`.

Included in the first insert policy:

| Collection | Count |
| --- | ---: |
| `monthlyLetters` | 2 |
| `openWhenLetters` | 2 |
| `reasons` | 2 |
| `promises` | 2 |
| `importantDates` | 2 |
| `futureDreams` | 2 |
| `timeline` | 2 |

Deferred from the first insert policy:

| Collection | Count | Reason |
| --- | ---: | --- |
| `blackHoleGallery` | 2 | `media_pending_storage` |
| `playlist` | 2 | `playlist_source_pending_review` |

## Justification

- Media requires a future Storage policy and upload phase.
- Data URLs must not be inserted as direct remote payload.
- Playlist items require a future source policy.
- The first insert should minimize risk.
- Clean `content_items` can validate the insert path, mapping and RLS behavior
  before media and playlist decisions are introduced.

## Alternatives Considered

| Option | Decision | Rationale |
| --- | --- | --- |
| Insert all 18 items. | Rejected for the first insert. | Media and playlist are still pending review. |
| Insert 14 clean items first. | Recommended. | Minimizes risk while testing `content_items`. |
| Insert nothing until Storage and playlist policy exist. | Valid but not preferred. | More conservative, but delays validation of clean content. |
| Insert all 18 as `pending_review`. | Future option only. | Requires explicit handling rules before it becomes safe. |

## Inclusion Rules

An item may enter the first insert manifest only if:

- It has no `warningCodes`.
- It does not have `media_pending_storage`.
- It does not have `playlist_source_pending_review`.
- It has a known local identity label.
- It has a mapped remote type.
- It has a stable local reference.
- It has no conflict.
- It is not a duplicate candidate.
- It does not require Storage.
- It does not require an external source policy.

## Exclusion And Defer Rules

An item must stay out of the first insert manifest if:

- It has a Data URL.
- It requires Storage or `media_assets`.
- It has a playlist link or path pending review.
- It has missing identity.
- It has an invalid date.
- It has a critical duplicate.
- It has a conflict.
- It has a no-go reason.
- It requires a human decision before insert.

Deferred items should remain available for a later Storage or playlist policy
phase, not silently discarded.

## Identity

- `local-yori` and `local-ale` must be mapped manually and privately to lab
  remote profiles before any future insert.
- Real UUIDs must not be documented.
- Real emails must not be documented.
- `service-role` must not be used in frontend or docs as a secret-bearing path.
- Identity values must not be resolved in repo docs with real values.
- If private identity mapping is missing, any future insert is blocked.

## Conceptual Remote Destination

- `content_items` is the only destination for the first insert policy.
- `media_assets` is excluded.
- Storage is excluded.
- `content_events` is optional future work and excluded from the first insert.
- `relationship_spaces` and `universe_members` are expected to already exist in
  the disposable lab and are not created by this policy.

## Security Rules

- Disposable lab only.
- Production is `NO-GO`.
- App connection remains blocked.
- No `service-role` in frontend.
- No secrets in docs.
- No intimate payload in repo.
- No private export in repo.
- No Data URLs in repo.
- No private absolute paths.
- No full playlist URLs.
- No automatic insert.

## Gate Before Any Future Insert

Before any future insert phase, all of the following must be true:

- Repo clean.
- `npm.cmd run migration:mock` PASS.
- `node scripts/verify-supabase-isolation.mjs` PASS.
- `npm.cmd run build` OK.
- `npm.cmd audit` OK.
- Private export validator is `CHECK` or `PASS` with zero no-go reasons.
- Private dry-run is `CHECK` or `PASS` with zero no-go reasons.
- This insert policy is approved.
- A sanitized insert manifest is reviewed.
- The user gives explicit GO.
- Supabase target is confirmed as a disposable lab.
- Production is ruled out.

## Rollback Concept

The primary rollback for the disposable lab can be reset or destruction of the
lab.

Before any real insert phase, decide whether the lab needs:

- delete by batch id;
- `insert_run_id`;
- `migrationRunId` metadata;
- or complete lab reset.

This phase does not execute rollback.

## Future Insert Manifest

Before any real insert, create or document a sanitized manifest with:

- `selectedItemsCount`: `14`.
- `deferredItemsCount`: `4`.
- Included collections.
- Excluded collections.
- Reason codes.
- Identity mapping status.
- No full payload.
- No secrets.
- No Data URLs.
- No private paths.

The manifest should be reviewed before any future insert command or SQL exists.

## NO-GO Conditions

The future insert phase is `NO-GO` if:

- It attempts to insert media or Data URLs.
- It attempts to insert playlist items without policy.
- Private identity mapping is missing.
- `service-role` appears as an operational requirement.
- The target is production or ambiguous.
- The app is connected accidentally.
- Any no-go reason exists.
- Critical conflicts or duplicates exist.
- The repo is dirty.
- The private export is added to the repo.
- Intimate content is pasted into chat or docs.

## Suggested Next Phase

Design the insert manifest format before creating any script.

Allowed next direction:

- Document a sanitized insert manifest format; or
- later create a local-only insert manifest generator using sanitized fixtures.

Still blocked:

- No insert.
- No SQL creation.
- No script creation in this phase.
- No Supabase touch.
- No Dashboard or CLI.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private export content in Git or chat.
