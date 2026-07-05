# Controlled Private Lab Insert Script Design

## Status

- Status: documentary design.
- Preflight/no-network script created: yes, in S4.6.5.22 with sanitized
  fixtures only.
- Lab insert script created: no.
- SQL created: no.
- Insert executed: no.
- Supabase touched: no.
- Storage touched: no.
- Production allowed: no.
- App connection: none.

This document designs the future controlled private lab insert script. S4.6.5.22
creates only the preflight/no-network script with sanitized fixtures. It still
does not create a lab insert script, create SQL, execute an insert, touch
Supabase, touch Storage or connect the app.

## Purpose

The future script should:

- perform the first private controlled insert in the disposable lab;
- insert only 14 clean `content_items`;
- defer `blackHoleGallery` and `playlist`;
- prevent production use;
- prevent `service-role`;
- prevent media and Storage writes;
- prevent accidental insert without explicit GO;
- produce a sanitized report.

## Tentative Future Script

Tentative path:

```txt
scripts/migration/insert-private-lab-content-items.mjs
```

Status:

- Future only.
- Do not create it in this phase.
- Implement it first with sanitized fixtures or no-network mode before any real
  Supabase execution is considered.

## Future Inputs

Conceptual future inputs, without real paths:

- private insert manifest sanitized JSON;
- private identity mapping JSON;
- lab Supabase URL or another approved lab connection mechanism;
- user explicit GO;
- optional `migrationRunId`.

Rules:

- private manifest stays outside the repo;
- private identity mapping stays outside the repo;
- private values are not pasted in chat;
- private files are not committed;
- `service-role` is not used.

## Mandatory Gates Before Insert

The future script must abort if:

- repo is dirty;
- `npm.cmd run migration:mock` fails;
- `node scripts/verify-supabase-isolation.mjs` fails;
- `npm.cmd run build` fails;
- `npm.cmd audit` fails;
- manifest status is not `CHECK` or `PASS`;
- `selectedItemsCount` is not `14`;
- `deferredItemsCount` is not `4`;
- `noGoReasonsCount` is greater than `0`;
- selected items contain `gallery_item`;
- selected items contain `playlist_item`;
- selected items contain warning codes;
- selected items contain `pending_review`;
- identity mapping is not confirmed;
- lab is not confirmed as disposable;
- production is detected;
- `service-role` is detected;
- Storage is required;
- explicit GO is missing.

## First Insert Scope

Insert only:

| Collection | Count |
| --- | ---: |
| `monthlyLetters` | 2 |
| `openWhenLetters` | 2 |
| `reasons` | 2 |
| `promises` | 2 |
| `importantDates` | 2 |
| `futureDreams` | 2 |
| `timeline` | 2 |

Expected total:

- 14 `content_items`.

Do not insert:

- `blackHoleGallery`;
- `playlist`;
- `media_assets`;
- Storage objects;
- `content_events` in the first version;
- `relationship_spaces`;
- `universe_members`.

## Conceptual Remote Mapping

Destination table:

- `content_items`.

Conceptual fields expected by the future implementation:

- private `relationship_space_id` or `space_id`;
- `type`;
- payload JSON;
- `created_by` and `updated_by` resolved from private mapping;
- `local_ref` or `source_local_ref`;
- `migration_run_id`;
- `created_at` and `updated_at`, if applicable;
- `visibility` or `status`, if applicable;
- sanitized migration metadata.

Do not document real UUIDs. Do not document full payload. Do not document real
emails.

## Identity Mapping

- `local-yori` and `local-ale` must resolve to remote lab profiles.
- Mapping happens outside the repo.
- Missing mapping aborts.
- Mapping to a nonexistent user aborts.
- Full UUIDs must not be printed.
- Real emails must not be printed.
- `service-role` must not be used.

## Credential Safety

- No `service-role`.
- No frontend `service-role`.
- No tokens in docs.
- No tokens in the manifest.
- No `.env.local` in this phase.
- Future private configuration should use local private environment variables
  or a private file outside the repo.
- Never print a full key or token.
- Abort if `service_role` is detected.

## Future Execution Modes

### Preflight/No-Network Mode

- Reads a manifest fixture.
- Validates gates.
- Does not touch Supabase.
- Prints what it would insert.

### Lab Insert Mode

- Requires explicit GO.
- Requires disposable lab confirmation.
- Requires private identity mapping.
- Inserts 14 `content_items`.
- Prints a sanitized report.

Implementation order:

- Preflight/no-network with fixtures exists in
  `scripts/migration/preflight-private-lab-insert.mjs`.
- Next audit it.
- Only after that consider lab insert mode.

## Required Pre-Insert Summary

Before any real insert, the future script must print:

- environment: `disposable_lab`;
- `selectedItemsCount`: `14`;
- `deferredItemsCount`: `4`;
- target table: `content_items`;
- excluded: `media_assets`, Storage, playlist and gallery;
- `migrationRunId` placeholder or resolved private value;
- identity mapping status: confirmed;
- GO required.

## Future Post-Insert Report

If the script ever inserts later, its sanitized report should include:

- `insertedItemsCount`;
- `expectedInsertedItemsCount`: `14`;
- `failedItemsCount`;
- `skippedItemsCount`;
- `deferredItemsCount`: `4`;
- `insertedByCollection`;
- `migrationRunId`;
- RLS verification pending;
- rollback recommendation;
- no full payload;
- no secrets.

## Rollback Design

The future script should attach:

- `migrationRunId`;
- `source_local_ref`;
- migration metadata.

Rollback strategies:

- lab reset or destruction remains the primary rollback;
- delete by `migrationRunId` is possible if implemented;
- no automatic rollback without explicit GO;
- no deletion outside the `migrationRunId`.

## Future RLS/Post-Insert Verification

After any future insert, a separate phase must:

- read as owner/member;
- deny `external_user`;
- count 14 `content_items`;
- count 0 `media_assets`;
- count 0 Storage objects;
- confirm deferred items were not inserted;
- produce a sanitized report.

## NO-GO Conditions

The future script is `NO-GO` if:

- production is detected;
- `service-role` is detected;
- selected count is not `14`;
- deferred count is not `4`;
- no-go reasons count is greater than `0`;
- media or playlist is selected;
- identity mapping is missing;
- manifest inside the repo contains real payload;
- private export is in the repo;
- `.env.local` is touched;
- app is connected accidentally;
- Storage is required;
- manual SQL is required without a plan;
- user has not given explicit GO.

## Suggested Next Phases

Recommended sequence:

1. Audit the controlled insert preflight/no-network script.
2. Design private config and mapping workflow.
3. Only with explicit GO, consider lab insert script execution.

Still blocked:

- No Supabase touch.
- No insert.
- No SQL creation or execution.
- No Dashboard or CLI use.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private content in Git or chat.
