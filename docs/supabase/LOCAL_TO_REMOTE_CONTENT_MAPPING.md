# Local to Remote Content Mapping

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Migration executed: no.
- Runtime connection: none.
- LocalStorage: still active source and fallback.
- Storage touched: no.
- Production-ready: no.

## Purpose

This document maps current local content concepts to future remote Supabase
tables. It does not implement migration, does not execute SQL, does not connect
the app and does not store real identifiers.

## Current Local Sources

The current local/content contract includes:

- monthly letters.
- open when letters.
- reasons.
- promises.
- important dates.
- wishlist / cosas por vivir, represented by `futureDreams`.
- diary / timeline, represented by `timeline`.
- black-hole gallery, represented by `blackHoleGallery`.
- playlist and scene music metadata where applicable.
- profile / identity selector metadata for local identity.
- opened/read state for monthly/open-when cards.
- unlock/simulation state.
- generic local content, overrides and hidden ids per collection.

Important current local origins:

- Base JSON data: `src/data/*.json`.
- Generic local items: `content.<collection>`.
- Generic overrides: `overrides.<collection>`.
- Generic hidden ids: `hidden.<collection>`.
- Legacy monthly letters: `distancia-cero-local-monthly-letters`.
- Legacy open-when letters: `distancia-cero-local-open-when`.
- Monthly opened/read: `distancia-cero-monthly-letter-${id}`.
- Open-when opened/read: `distancia-cero-open-when-${id}`.
- Simulation unlocked: `distancia-cero-sim-unlocked`.

## Conceptual Remote Destinations

Remote mapping must use only existing or already documented conceptual tables:

- `relationship_spaces`.
- `universe_members`.
- `profiles`.
- `content_items`.
- `content_events`.
- `media_assets`.
- Future `user_content_state` remains an open documented decision; do not
  invent SQL for it in this phase.

## Mapping Table

| Local source | Local key / origin | Remote table | Remote type/category | Required fields | Optional fields | Migration risk | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Base monthly letters | `src/data/monthlyLetters.json` | `content_items` | `collection=monthlyLetters`, `kind=local` or `kind=base-import` pending decision | `space_id`, `collection`, `kind`, `data`, `source` | `local_id`, `created_by`, `updated_by`, `created_at`, `updated_at` | High | Legacy content may lack clear authorship. Do not invent author metadata. |
| Legacy local monthly letters | `distancia-cero-local-monthly-letters` | `content_items` | `collection=monthlyLetters`, `kind=local` | `space_id`, `collection`, `kind`, `local_id`, `data`, `source` | `created_by`, `updated_by`, timestamps | High | Preserve legacy local ids as metadata if needed. |
| Monthly letter overrides | `overrides.monthlyLetters` | `content_items` | `collection=monthlyLetters`, `kind=override` | `space_id`, `collection`, `kind`, `base_id`, `data`, `source` | `updated_by`, `updated_at` | High | Override target must map to the imported/base item. |
| Monthly hidden ids | `hidden.monthlyLetters` | `content_items` | `collection=monthlyLetters`, `kind=hidden`, `is_hidden=true` | `space_id`, `collection`, `kind`, `base_id`, `data`, `source` | `updated_by`, `updated_at` | Medium | Restore means removing or neutralizing the hidden marker, not hard delete. |
| Monthly opened/read | `distancia-cero-monthly-letter-${id}` | Future `user_content_state` or `content_items.data` pending decision | `state=opened` | `profile_id`, `space_id`, mapped content id | `opened_at` | Medium | Current value is only `opened`; never migrate `"false"`. |
| Base open-when letters | `src/data/openWhen.json` | `content_items` | `collection=openWhenLetters`, `kind=local` or `kind=base-import` pending decision | `space_id`, `collection`, `kind`, `data`, `source` | `local_id`, `created_by`, `updated_by`, timestamps | High | Locked/unlocked presentation state must be preserved in `data`. |
| Legacy local open-when letters | `distancia-cero-local-open-when` | `content_items` | `collection=openWhenLetters`, `kind=local` | `space_id`, `collection`, `kind`, `local_id`, `data`, `source` | `created_by`, `updated_by`, timestamps | High | Legacy local ids need explicit duplicate detection. |
| Open-when overrides | `overrides.openWhenLetters` | `content_items` | `collection=openWhenLetters`, `kind=override` | `space_id`, `collection`, `kind`, `base_id`, `data`, `source` | `updated_by`, `updated_at` | High | Must map `base_id` to a remote content item. |
| Open-when hidden ids | `hidden.openWhenLetters` | `content_items` | `collection=openWhenLetters`, `kind=hidden`, `is_hidden=true` | `space_id`, `collection`, `kind`, `base_id`, `data`, `source` | `updated_by`, `updated_at` | Medium | Preserve locked/unlocked data separately from hidden visibility. |
| Open-when opened/read | `distancia-cero-open-when-${id}` | Future `user_content_state` or `content_items.data` pending decision | `state=opened` | `profile_id`, `space_id`, mapped content id | `opened_at` | Medium | Do not treat opened/read as content authorship. |
| Reasons | `src/data/reasons.json`, `content.reasons`, `overrides.reasons`, `hidden.reasons` | `content_items` | `collection=reasons`, `kind=local|override|hidden` | `space_id`, `collection`, `kind`, `data`, `source`; plus `local_id` or `base_id` by kind | `created_by`, `updated_by`, timestamps | Medium | Preserve ordering and edited/hidden state. |
| Promises | `src/data/promises.json`, `content.promises`, `overrides.promises`, `hidden.promises` | `content_items` | `collection=promises`, `kind=local|override|hidden` | `space_id`, `collection`, `kind`, `data`, `source`; plus `local_id` or `base_id` by kind | `created_by`, `updated_by`, timestamps | Medium | Avoid duplicate promises when both local and base versions exist. |
| Important dates | `src/data/importantDates.json`, `content.importantDates`, `overrides.importantDates`, `hidden.importantDates` | `content_items` | `collection=importantDates`, `kind=local|override|hidden` | `space_id`, `collection`, `kind`, `data`, `source`; plus `local_id` or `base_id` by kind | `created_by`, `updated_by`, timestamps | High | Preserve date semantics and upcoming/locked style data. |
| Wishlist / cosas por vivir | `src/data/futureDreams.json`, `content.futureDreams`, `overrides.futureDreams`, `hidden.futureDreams` | `content_items` | `collection=futureDreams`, `kind=local|override|hidden` | `space_id`, `collection`, `kind`, `data`, `source`; plus `local_id` or `base_id` by kind | `created_by`, `updated_by`, timestamps | Medium | Collection name remains `futureDreams` unless a later contract renames it. |
| Diary / timeline | `src/data/timeline.json`, `content.timeline`, `overrides.timeline`, `hidden.timeline` | `content_items` | `collection=timeline`, `kind=local|override|hidden` | `space_id`, `collection`, `kind`, `data`, `source`; plus `local_id` or `base_id` by kind | `created_by`, `updated_by`, timestamps | High | Preserve page/chapter/date ordering and any display metadata. |
| Black-hole gallery | `src/data/blackHoleGallery.json`, `content.blackHoleGallery`, `overrides.blackHoleGallery`, `hidden.blackHoleGallery` | `content_items`, later `media_assets` | `collection=blackHoleGallery`, `kind=local|override|hidden`; media metadata pending | `space_id`, `collection`, `kind`, `data`, `source`; media requires `bucket`, `path` only in a future Storage phase | `created_by`, `updated_by`, `mediaAssetId` | Critical | Do not upload media or create Storage references in this phase. |
| Playlist | `src/data/playlist.json`, `content.playlist`, `overrides.playlist`, `hidden.playlist` | `content_items` | `collection=playlist`, `kind=local|override|hidden` | `space_id`, `collection`, `kind`, `data`, `source`; plus `local_id` or `base_id` by kind | `created_by`, `updated_by`, external URL metadata if safe | Medium | Do not treat external music metadata as uploaded media. |
| Scene music state | Scene music local UI state if present | Pending, likely local-only initially | `preference/state` pending decision | none until a future state contract exists | volume/unlock values if approved | Medium | Keep local until a user preference/state table is designed. |
| Profile / identity selector metadata | local identity store / `local-yori` / `local-ale` / local space | `profiles`, `relationship_spaces`, `universe_members` | profile, space, membership | verified Auth-backed `profiles.id`, verified `relationship_spaces.id`, membership role | `profiles.local_slug`, display metadata | Critical | Local ids are not remote UUIDs and must be mapped privately. |
| Unlock / simulation state | `distancia-cero-sim-unlocked` | Pending, likely local-only initially | local-only dev/test state | none | `is_simulation_unlocked` only if a future table approves it | Medium | Do not migrate test/simulation state as production truth without decision. |
| Content update events | `distancia-cero-content-updated` runtime event | `content_events` only for remote audit events | `action` / audit entry | `space_id`, `action`, `created_at` | `content_item_id`, `collection`, `actor_id`, sanitized payload | High | Browser refresh events are not audit logs. Future audit must be trusted. |

## Identity Rules

- `createdBy` and `updatedBy` must map through a private reviewed mapping from
  local identity to `profiles.id`.
- `local-yori` and `local-ale` are local identifiers only. They must never be
  treated as remote UUIDs.
- The local relationship space id is not a remote `relationship_spaces.id`.
- Content with no clear author remains author-null or mapped to an approved
  import actor only after a separate decision.
- Legacy monthly/open-when content must not receive invented authorship.
- No real emails, real UUIDs, project refs, passwords, tokens or keys belong in
  docs.
- If Ale uses a real account, invite flow or controlled access model, that
  decision belongs to a later Auth/bootstrap phase.

## Ordering And Visibility Rules

- Preserve the original display order for base JSON, local items and merged
  lists where the UI depends on order.
- Preserve edited state by mapping overrides to `kind=override`.
- Preserve hidden/restored state by mapping hidden ids to `kind=hidden` and
  `is_hidden=true`, or an equivalent future reviewed model.
- Preserve locked/unlocked and upcoming/proximamente state in `data` unless a
  future state table is approved.
- Preserve opened/read separately from authorship and content identity.
- Avoid duplicate content by validating local ids, base ids and source markers
  before insert.
- Preserve legacy ids as metadata when needed for idempotent migration.
- Do not hard delete local or remote content during migration dry-run.

## Sensitive Content Rules

- Do not migrate secrets.
- Do not migrate tokens, JWTs, passwords or keys.
- Do not store real data samples in docs.
- Do not store real UUIDs, project refs or personal emails in docs.
- Do not upload media to Storage without a dedicated Storage phase and private
  policies.
- Do not convert private media paths into public permanent URLs.
- Do not use service-role in frontend, Vite env or Git.

## Future Migration Strategy

Recommended future path:

1. Prepare a future local snapshot shaped by
   `LOCAL_SNAPSHOT_EXPORT_FORMAT.md`.
2. Validate the snapshot with `LOCAL_SNAPSHOT_VALIDATION_RULES.md`.
3. Follow the dry-run plan documented in `MIGRATION_DRY_RUN_PLAN.md`.
4. Review the report shape documented in
   `MIGRATION_DRY_RUN_REPORT_FORMAT.md`.
5. Pass the insert gate documented in
   `MIGRATION_INSERT_GATE_CHECKLIST.md`.
6. Validate counts per collection and per kind.
7. Validate identity mapping privately, outside Git.
8. Validate duplicate detection using legacy ids and source markers.
9. Insert into a disposable lab only after explicit approval.
10. Run read-only verification of counts, FK chain and metadata.
11. Run RLS verification with synthetic users.
12. Integrate one UI feature behind an off-by-default feature flag.
13. Keep rollback to local-only mode available.

## NO-GO Criteria

- Identity mapping is missing or ambiguous.
- Local and remote content could duplicate without detection.
- Storage would be touched without private policies and cleanup plan.
- Remote mode would connect without local fallback.
- Real content would be migrated into a disposable lab without an explicit
  decision.
- service-role appears in frontend, Vite env or Git.
- `.env.local` is filled before an approved configuration phase.
- The disposable lab is treated as production.

## Next Recommended Phase

Historical next phase completed/superseded:

- Controlled lab insert planning is now documented in
  `CONTROLLED_LAB_INSERT_PLAN.md`.

Current next phase:

- If S4.6.4.44 docs consistency repair is clean, proceed to
  snapshot/dry-run script design as docs-only work.
- Still no executable script, real snapshot, real LocalStorage read, real
  dry-run, real insert, runtime change, `src`, SQL, Supabase Dashboard,
  Supabase CLI, `.env.local`, private files, Storage or reset.

## Non-Goals

- No runtime changes.
- No `src` changes.
- No repository implementation.
- No SQL changes.
- No SQL execution.
- No Supabase Dashboard or CLI work.
- No `.env.local` changes.
- No private file changes.
- No Storage work.
- No migration execution.
- No production readiness claim.
