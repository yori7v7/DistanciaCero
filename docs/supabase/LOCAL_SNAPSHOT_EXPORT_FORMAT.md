# Local Snapshot Export Format

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Script created: no.
- Real snapshot generated: no.
- Real data exported: no.
- Runtime connection: none.
- LocalStorage: still active source and fallback.
- Supabase touched: no.
- Storage touched: no.
- Production-ready: no.

## Objective

The future local snapshot should represent current local content in a portable
format before any migration dry-run transforms it into remote-shaped payloads.

The snapshot should:

- Represent local content without requiring the UI during transformation.
- Serve as a future input for `MIGRATION_DRY_RUN_PLAN.md`.
- Allow offline validation before any network or Supabase step.
- Avoid touching Supabase before explicit approval.
- Keep LocalStorage as the active runtime source until app integration is
  approved.

## Format Principles

- JSON serializable.
- No secrets.
- No tokens.
- No keys.
- No real UUIDs in docs.
- No personal emails in docs.
- Explicit snapshot version.
- Source metadata.
- Counts by type.
- Clear separation between content, identity, media and local state.
- Sanitized reports only when discussing results in Git or chat.

## Conceptual Structure

Example shape only. Values are placeholders, not real content and not real
identifiers.

```json
{
  "snapshotVersion": "local-snapshot-v1",
  "exportedAt": "<ISO_TIMESTAMP>",
  "source": {
    "app": "distancia-cero",
    "runtime": "local",
    "storage": "localStorage",
    "exportMode": "dry-run-input"
  },
  "relationshipSpaceHint": {
    "localSpaceKey": "<LOCAL_SPACE_KEY>",
    "remoteSpaceHint": "<PRIVATE_MAPPING_REQUIRED>"
  },
  "identities": [
    {
      "localIdentityKey": "local-yori",
      "displayName": "<DISPLAY_NAME_PLACEHOLDER>",
      "roleHint": "owner",
      "remoteProfileHint": "<PRIVATE_MAPPING_REQUIRED>"
    },
    {
      "localIdentityKey": "local-ale",
      "displayName": "<DISPLAY_NAME_PLACEHOLDER>",
      "roleHint": "partner",
      "remoteProfileHint": "<PRIVATE_MAPPING_REQUIRED>"
    }
  ],
  "content": {
    "monthlyLetters": [],
    "openWhenLetters": [],
    "reasons": [],
    "promises": [],
    "importantDates": [],
    "wishlist": [],
    "diary": [],
    "blackHoleGallery": [],
    "playlist": []
  },
  "media": [
    {
      "localRef": "<LOCAL_MEDIA_REF>",
      "type": "<MEDIA_TYPE>",
      "title": "<TITLE_PLACEHOLDER>",
      "storageStatus": "not_uploaded",
      "notes": "<SANITIZED_NOTES>"
    }
  ],
  "localState": {
    "hidden": [],
    "locked": [],
    "unlocked": [],
    "restored": [],
    "edited": [],
    "legacyIds": []
  },
  "counts": {
    "identities": 2,
    "monthlyLetters": 0,
    "openWhenLetters": 0,
    "reasons": 0,
    "promises": 0,
    "importantDates": 0,
    "wishlist": 0,
    "diary": 0,
    "blackHoleGallery": 0,
    "playlist": 0,
    "media": 0,
    "hidden": 0,
    "locked": 0,
    "unlocked": 0,
    "restored": 0,
    "edited": 0,
    "legacyIds": 0
  },
  "warnings": [
    {
      "type": "unmapped_author",
      "localRef": "<LOCAL_ITEM_REF>",
      "message": "<SANITIZED_WARNING>"
    }
  ]
}
```

## Snapshot Blocks

### identities

Each identity entry should describe a local identity without storing real remote
values in docs.

Required conceptual fields:

- `localIdentityKey`.
- `displayName` placeholder.
- `roleHint`.
- `remoteProfileHint` placeholder.

Rules:

- `local-yori` and `local-ale` remain local identifiers only.
- Remote profile mapping stays private and outside Git/chat.
- Unknown or legacy authors must remain explicitly unresolved.

### content

The content block groups current local concepts by collection:

- `monthlyLetters`.
- `openWhenLetters`.
- `reasons`.
- `promises`.
- `importantDates`.
- `wishlist`.
- `diary`.
- `blackHoleGallery`.
- `playlist`.

Each future item should include, at minimum:

- `localId` or `legacyId`.
- `type`.
- `collection`.
- `source`.
- `data`.
- author hints only if known locally.
- ordering metadata where the UI depends on order.
- visibility metadata where hidden/restored state exists.

The actual snapshot may contain intimate content. Do not paste a real snapshot
in chat or commit it if it contains private bodies.

### media

Each media entry should describe local media metadata without uploading files.

Required conceptual fields:

- `localRef`.
- `type`.
- `title`.
- `storageStatus: not_uploaded`.
- `notes`.

Rules:

- Media is not uploaded automatically.
- Storage remains out of scope until a dedicated phase.
- Data URLs or private file references should not be converted to permanent
  public URLs.

### localState

Local state should be separated from content bodies:

- `hidden`.
- `locked`.
- `unlocked`.
- `restored`.
- `edited`.
- `legacyIds`.

Rules:

- Preserve order and visibility where the current UI depends on them.
- Preserve opened/read and locked/unlocked state without treating it as
  authorship.
- Preserve legacy ids for duplicate detection and idempotency.

### counts

Counts should summarize totals by type and state. Future validation must compare
these counts with the arrays in the snapshot.

### warnings

Warnings should be sanitized and should identify risk categories without
exposing private content.

Expected warning categories:

- `unmapped_author`.
- `missing_date`.
- `media_pending_storage`.
- `duplicate_candidate`.

## Future Validations

Future validation rules are documented in
`LOCAL_SNAPSHOT_VALIDATION_RULES.md`. They should confirm:

- `snapshotVersion` is present.
- `counts` match arrays.
- Each item has `localId` or `legacyId`.
- Each item has `type`.
- Dates are parseable or explicitly marked as unresolved.
- Identity is resolvable through private mapping or marked legacy/unknown.
- Media is not uploaded automatically.
- No secrets.
- No service-role.
- No private URLs.
- No keys.
- No passwords.
- No tokens or JWTs.

## Privacy Rules

- Do not paste a real future snapshot in chat if it contains intimate content.
- Use counts and sanitized status summaries for reports.
- Do not store real content samples in docs.
- Do not store real remote UUIDs, project refs, keys, tokens, passwords or
  personal emails in docs.
- Do not upload real media to Storage without a specific approved phase.
- Keep any private mapping outside Git/chat.

## Relationship With Migration Dry-Run

- The snapshot will be the future input.
- The dry-run will transform the snapshot into conceptual remote payloads.
- The dry-run must not insert by default.
- The dry-run must produce a sanitized report.
- The dry-run must keep Supabase network access disabled until a later explicit
  approval.

## NO-GO Criteria

- The format needs secrets.
- The format mixes real media with Storage without a private policy.
- The format does not preserve identity.
- The format does not preserve order or visibility.
- The format cannot detect duplicate candidates.
- The format tries to connect to Supabase.
- The format requires runtime changes before approval.
- The format requires reading real LocalStorage in this documentary phase.

## Suggested Next Phase

Historical next phase completed/superseded:

- The migration insert gate checklist is now documented in
  `MIGRATION_INSERT_GATE_CHECKLIST.md`.
- Controlled lab insert planning is now documented in
  `CONTROLLED_LAB_INSERT_PLAN.md`.

Current next phase:

- If S4.6.4.44 docs consistency repair is clean, proceed to
  snapshot/dry-run script design as docs-only work.
- Still no executable script, real snapshot, real LocalStorage read, real
  dry-run, real insert, runtime change, `src`, SQL, Supabase Dashboard,
  Supabase CLI, `.env.local`, private files, Storage or reset.

## Non-Goals

- No snapshot script.
- No real snapshot generation.
- No real data export.
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
