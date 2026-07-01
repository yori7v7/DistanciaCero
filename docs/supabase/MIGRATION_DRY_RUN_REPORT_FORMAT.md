# Migration Dry-Run Report Format

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Script created: no.
- Dry-run executed: no.
- Real data read: no.
- Runtime connection: none.
- Supabase connection: none.
- LocalStorage: still active source and fallback.
- Storage touched: no.
- Production-ready: no.

## Objective

The future migration dry-run report should summarize the result of a local
no-network dry-run before any insert into Supabase.

The report should:

- Enable human review before controlled lab inserts.
- Show counts, conflicts, warnings and blockers.
- Avoid exposing full intimate content.
- Keep output sanitized.
- Make the next recommended action explicit.

## Report Principles

- JSON or Markdown serializable.
- No secrets.
- No tokens.
- No keys.
- No passwords.
- No real Supabase URL.
- No real project ref.
- No real UUIDs.
- No personal real emails.
- No full intimate content.
- Counts and summaries before full payloads.
- Sanitized legacy/local ids only.
- No private absolute paths in docs.

## Conceptual JSON Structure

Example shape only. Values are placeholders, not real content and not real
identifiers.

```json
{
  "reportVersion": "migration-dry-run-report-v1",
  "generatedAt": "<ISO_TIMESTAMP>",
  "sourceSnapshotVersion": "<SNAPSHOT_VERSION>",
  "validationStatus": "PASS",
  "dryRunStatus": "CHECK",
  "counts": {
    "totalInputItems": 0,
    "totalValidItems": 0,
    "totalSkippedItems": 0,
    "totalWarnings": 0,
    "totalConflicts": 0,
    "totalDuplicateCandidates": 0,
    "totalMediaPendingStorage": 0,
    "byContentType": {
      "monthlyLetters": 0,
      "openWhenLetters": 0,
      "reasons": 0,
      "promises": 0,
      "importantDates": 0,
      "wishlist": 0,
      "diary": 0,
      "blackHoleGallery": 0,
      "playlist": 0
    },
    "byRemoteTable": {
      "profiles": 0,
      "relationship_spaces": 0,
      "universe_members": 0,
      "content_items": 0,
      "content_events": 0,
      "media_assets": 0
    },
    "byOperationType": {
      "insert": 0,
      "update": 0,
      "skip": 0,
      "manual_review": 0
    }
  },
  "plannedOperations": [
    {
      "operation": "insert",
      "remoteTable": "content_items",
      "remoteType": "<REMOTE_TYPE_OR_CATEGORY>",
      "localSource": "<LOCAL_SOURCE>",
      "localRef": "<SANITIZED_LOCAL_OR_LEGACY_ID>",
      "status": "CHECK",
      "reason": "<SANITIZED_REASON>",
      "warningsCount": 0,
      "requiresHumanReview": true
    }
  ],
  "skippedItems": [],
  "warnings": [],
  "conflicts": [],
  "duplicateCandidates": [],
  "identityMapping": [],
  "mediaPending": [],
  "unmappedFields": [],
  "noGoReasons": [],
  "nextRecommendedAction": "human_review_before_any_insert"
}
```

## Status Values

- `PASS`: ready for review before a controlled insert decision.
- `CHECK`: usable with warnings and requires human approval.
- `NO-GO`: must not be inserted.
- `BLOCKED`: missing human decision, identity mapping, migration rule or
  policy.
- `ABORTED`: dry-run stopped for safety.

## Required Counts

The report should include:

- Total input items.
- Total valid items.
- Total skipped items.
- Total warnings.
- Total conflicts.
- Total duplicate candidates.
- Total media pending Storage.
- Counts by content type.
- Counts by planned remote table.
- Counts by operation type: `insert`, `update`, `skip` and `manual_review`.

Count mismatches should appear in `noGoReasons` or `conflicts`, not be hidden.

## Planned Operations

Each future operation should be reported in sanitized form.

Required fields:

- `operation`: `insert`, `update`, `skip` or `manual_review`.
- `remoteTable`.
- `remoteType` or category.
- `localSource`.
- Sanitized `localId` or `legacyId`.
- `status`.
- `reason`.
- `warningsCount`.
- `requiresHumanReview`.

Rules:

- Do not include full payloads.
- Do not include real remote UUIDs.
- Do not claim an insert is approved just because the dry-run shaped an
  operation.
- Treat `manual_review` as a blocker until a human decision is recorded in a
  later approved phase.

## Skipped Items

Skipped items should be reported when an item cannot safely become a planned
operation.

Expected reasons:

- Missing mapping.
- Duplicate candidate.
- Unresolved identity.
- Invalid date.
- Media pending.
- Sensitive content.
- Unknown type.
- Non-serializable payload.

Skipped item entries should use sanitized local references and safe reason
codes.

## Warnings

Expected warning categories:

- `unmapped_author`.
- `missing_date`.
- `invalid_date`.
- `duplicate_candidate`.
- `media_pending_storage`.
- `local_only_state`.
- `unknown_type`.
- `legacy_metadata`.
- `order_missing`.
- `visibility_ambiguous`.

Warnings do not approve inserts. A `CHECK` report requires human review before
any future lab insert.

## Conflicts

Expected conflict categories:

- `local_id_duplicate`.
- `legacy_id_duplicate`.
- `identity_conflict`.
- `type_mismatch`.
- `remote_table_mismatch`.
- `visibility_conflict`.
- `locked_hidden_conflict`.
- `content_already_exists_candidate`.

Conflicts should be sanitized and should not expose full private content.

## Identity Mapping

The identity mapping section should report only safe labels.

Required conceptual fields:

- `localIdentityKey`.
- `remoteProfileHint` placeholder.
- `status`: `resolved`, `legacy`, `unknown` or `blocked`.

Rules:

- No personal real emails.
- No real UUIDs.
- No project refs.
- No Auth tokens.
- No assumption that local ids are remote profile ids.

## Media Pending

The media pending section should make Storage work visible without performing
it.

Required conceptual fields:

- Sanitized `localRef`.
- `type`.
- `storageStatus: not_uploaded`.
- `reason`.
- Required future decision.

Rules:

- No private absolute paths in docs.
- No bucket assumptions.
- No signed URLs.
- No uploads.

## NO-GO Reasons

Expected `NO-GO` reasons include:

- Secrets detected.
- Content too sensitive for the report.
- Identity unresolved.
- Counts inconsistent.
- Duplicate conflict unresolved.
- Storage required but policies missing.
- Unknown content type.
- service-role attempted.
- Supabase write attempted during dry-run.
- Runtime touched unexpectedly.

Any `NO-GO` reason blocks insert planning until a later phase resolves it.

## Recommended Human Markdown Summary

A future report may also include a short Markdown summary:

```md
## Migration Dry-Run Summary

- Result: CHECK
- Total input items: 0
- Valid items: 0
- Skipped items: 0
- Warnings: 0
- Conflicts: 0
- Duplicate candidates: 0
- Media pending Storage: 0
- Blockers: none reported
- Pending human decisions: <SANITIZED_DECISION_LIST>
- Next recommended action: human review before any insert
```

The Markdown summary must not include full payloads, intimate content, secrets,
tokens, keys, passwords, real UUIDs, real project refs, private URLs, private
absolute paths or personal real emails.

## Relationship With Future Phases

- Snapshot validation must pass before the dry-run.
- The dry-run report must be reviewed before any insert.
- Insert into a disposable lab requires explicit approval.
- App connection remains blocked until feature flag and controlled integration
  phases are approved.
- A successful dry-run report is not production readiness.

## Suggested Next Phase

Design the migration insert gate checklist as docs-only work.

That phase should not create scripts, generate real snapshots, read real
LocalStorage, export real data, execute dry-runs, touch runtime, modify `src`,
execute SQL, use Supabase Dashboard, use Supabase CLI, touch `.env.local`, edit
private files, touch Storage or run reset.

## Non-Goals

- No dry-run script.
- No real dry-run execution.
- No real snapshot generation.
- No real data read.
- No LocalStorage read.
- No Supabase connection.
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
