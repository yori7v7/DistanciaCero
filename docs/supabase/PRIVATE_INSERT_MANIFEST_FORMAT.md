# Private Insert Manifest Format

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Real manifest generated: no.
- Script created: yes, with sanitized fixtures only.
- Insert executed: no.
- Supabase touched: no.
- Storage touched: no.
- Production-ready: no.
- App connection: none.

This document defines the sanitized manifest format that should be reviewed
before any future controlled private lab insert. S4.6.5.17 creates a local-only
generator for sanitized fixtures only. This document still does not create a
real manifest, does not read the private export and does not touch Supabase.

## Purpose

The future insert manifest should:

- explicitly select the 14 clean items for the first controlled lab insert;
- explicitly defer the 4 pending media and playlist items;
- avoid full intimate payloads;
- avoid Data URLs;
- avoid private absolute paths;
- avoid secrets;
- support human review before any insert decision;
- make rollback grouping explicit before any write happens.

## Manifest Basis

The manifest should derive from the sanitized private dry-run result and the
controlled private lab insert policy.

- `totalItems`: `18`.
- `plannedOperationsCount`: `18`.
- `selectedItemsCount`: `14`.
- `deferredItemsCount`: `4`.
- `conflictsCount`: `0`.
- `duplicateCandidatesCount`: `0`.
- `noGoReasonsCount`: `0`.
- Identity missing count: `0`.
- Unknown identity count: `0`.
- `mediaPending`: `2`.
- `playlistPending`: `2`.

## Selection Decision

Included in the first insert manifest:

| Collection | Count |
| --- | ---: |
| `monthlyLetters` | 2 |
| `openWhenLetters` | 2 |
| `reasons` | 2 |
| `promises` | 2 |
| `importantDates` | 2 |
| `futureDreams` | 2 |
| `timeline` | 2 |

Deferred from the first insert manifest:

| Collection | Count | Reason |
| --- | ---: | --- |
| `blackHoleGallery` | 2 | `media_pending_storage` |
| `playlist` | 2 | `playlist_source_pending_review` |

## Conceptual Manifest Shape

This example is sanitized and not a real manifest.

```json
{
  "manifestVersion": "private-insert-manifest-v1",
  "generatedAt": "<ISO_TIMESTAMP>",
  "source": {
    "dryRunReportVersion": "private-local-export-dry-run-v1",
    "validationStatus": "CHECK",
    "dryRunStatus": "CHECK",
    "inputFile": "<outside-repository>"
  },
  "policy": {
    "policyName": "clean_content_items_only",
    "selectedMode": "clean_content_items_only",
    "labOnly": true,
    "productionAllowed": false
  },
  "target": {
    "environment": "disposable_lab",
    "tables": ["content_items"],
    "excludedTables": ["media_assets", "storage", "content_events"]
  },
  "counts": {
    "sourceTotalItems": 18,
    "selectedItemsCount": 14,
    "deferredItemsCount": 4,
    "selectedByCollection": {
      "monthlyLetters": 2,
      "openWhenLetters": 2,
      "reasons": 2,
      "promises": 2,
      "importantDates": 2,
      "futureDreams": 2,
      "timeline": 2
    },
    "deferredByCollection": {
      "blackHoleGallery": 2,
      "playlist": 2
    }
  },
  "identityMapping": {
    "local-yori": "<private_mapping_required>",
    "local-ale": "<private_mapping_required>",
    "status": "pending_private_resolution"
  },
  "selectedItems": [
    {
      "manifestItemId": "manifest-item-001",
      "sourceCollection": "monthlyLetters",
      "targetTable": "content_items",
      "remoteType": "monthly_letter",
      "localRef": "<sanitized-local-ref>",
      "identityKey": "local-yori",
      "hasPayload": true,
      "payloadIncludedInManifest": false,
      "status": "selected_for_lab_insert",
      "warningCodes": [],
      "requiredBeforeInsert": [
        "identity_mapping_confirmed",
        "lab_space_confirmed",
        "user_go_confirmed"
      ],
      "rollbackGroup": "<future_migration_run_id>"
    }
  ],
  "deferredItems": [
    {
      "sourceCollection": "blackHoleGallery",
      "targetTable": "media_assets",
      "remoteType": "gallery_item",
      "localRef": "<sanitized-local-ref>",
      "status": "deferred",
      "reasonCode": "media_pending_storage",
      "requiredFutureDecision": "storage_policy_and_upload_phase_required",
      "insertAllowedNow": false
    }
  ],
  "safety": {
    "payloadIncluded": false,
    "dataUrlsIncluded": false,
    "privatePathsIncluded": false,
    "secretsIncluded": false,
    "productionAllowed": false
  },
  "rollback": {
    "migrationRunId": "<future_migration_run_id>",
    "rollbackGroup": "<future_migration_run_id>",
    "insertedAt": "<future_insert_timestamp>",
    "insertedBy": "<private_operator_label>",
    "labOnly": true,
    "deleteByMigrationRunId": "possible_if_implemented",
    "primaryRollback": "reset_or_destroy_disposable_lab"
  },
  "nextRecommendedAction": "review_manifest_before_any_insert"
}
```

## Selected Items

Each selected item must be sanitized and include:

- `manifestItemId`: a generated manifest reference such as
  `manifest-item-001`.
- `sourceCollection`.
- `targetTable`: `content_items`.
- `remoteType`.
- `localRef`: sanitized, truncated or placeholder.
- `identityKey`: `local-yori`, `local-ale` or an unknown placeholder.
- `hasPayload`: `true`.
- `payloadIncludedInManifest`: `false`.
- `status`: `selected_for_lab_insert`.
- `warningCodes`: `[]`.
- `requiredBeforeInsert`:
  - `identity_mapping_confirmed`;
  - `lab_space_confirmed`;
  - `user_go_confirmed`.
- `rollbackGroup`: `<future_migration_run_id>`.

Selected item entries must not include:

- full text;
- full descriptions;
- letter content;
- full URLs;
- Data URLs;
- private paths;
- secrets.

## Deferred Items

Each deferred item must include:

- `sourceCollection`.
- conceptual `targetTable`.
- `remoteType`.
- `localRef`: sanitized, truncated or placeholder.
- `status`: `deferred`.
- `reasonCode`:
  - `media_pending_storage`;
  - `playlist_source_pending_review`.
- `requiredFutureDecision`:
  - `storage_policy_and_upload_phase_required`;
  - `playlist_source_policy_required`.
- `insertAllowedNow`: `false`.

Deferred items stay available for later policy phases. They must not be
silently discarded.

## Identity Mapping

- `local-yori` and `local-ale` must be resolved privately before insert.
- Real UUIDs must not be documented.
- Real emails must not be documented.
- Private mapping must not be pasted in chat.
- If mapping is missing, insert is blocked.
- The sanitized manifest may use `<private_mapping_required>`.

## Payload Policy

- A manifest committed to repo docs must not include real payload.
- A future private manifest outside the repo may contain necessary private
  references, but it must not be committed.
- Any real payload must stay in a private file outside the repo.
- Data URLs are forbidden in repo/docs manifests.
- Intimate content is forbidden in docs.

## Rollback Policy

Future rollback-related fields should include:

- `migrationRunId`.
- `rollbackGroup`.
- `insertedAt`.
- `insertedBy`.
- `labOnly`.
- `deleteByMigrationRunId`, if implemented.

The primary rollback remains reset or destruction of the disposable lab until a
more precise cleanup mechanism is designed.

This phase does not execute rollback.

## Safety Gates

Before generating or using any real manifest:

- Repo clean.
- `npm.cmd run migration:mock` PASS.
- `node scripts/verify-supabase-isolation.mjs` PASS.
- `npm.cmd run build` OK.
- `npm.cmd audit` OK.
- Private export validator is `CHECK` or `PASS` with zero no-go reasons.
- Private dry-run is `CHECK` or `PASS` with zero no-go reasons.
- Controlled insert policy is approved.
- Sanitized manifest is reviewed.
- Private identity mapping is confirmed.
- User gives explicit GO.
- Disposable lab is confirmed.
- Production is blocked.

## NO-GO Conditions

Manifest generation or use is `NO-GO` if:

- `selectedItems` includes `media_pending_storage`.
- `selectedItems` includes `playlist_source_pending_review`.
- The manifest includes a Data URL.
- The manifest includes full intimate content.
- The manifest includes a private absolute path.
- The manifest includes a real UUID.
- The manifest includes a real email.
- The manifest includes a Supabase URL, key or token.
- Identity mapping is missing for a real insert.
- `noGoReasonsCount` is greater than `0`.
- `conflictsCount` is greater than `0`.
- Critical duplicates are present.
- The app is connected accidentally.
- The target is production.
- `service-role` is used in frontend.

## Suggested Next Phase

Next recommended phase:

- Audit `generate-private-insert-manifest.mjs` before any use with the private
  dry-run result.

Still blocked:

- No private export read by Codex.
- No real manifest generated.
- No insert.
- No Supabase.
- No Dashboard or CLI.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private content in Git or chat.
