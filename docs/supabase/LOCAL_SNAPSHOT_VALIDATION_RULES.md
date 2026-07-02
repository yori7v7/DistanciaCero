# Local Snapshot Validation Rules

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Script created: no.
- Real snapshot generated: no.
- Real data read: no.
- Runtime connection: none.
- LocalStorage: still active source and fallback.
- Supabase touched: no.
- Storage touched: no.
- Production-ready: no.
- Private snapshot workflow documented: yes, in
  `PRIVATE_SNAPSHOT_WORKFLOW.md`.

## Objective

These rules define how a future local snapshot should be validated before any
migration dry-run.

The validation should:

- Prevent corrupt, duplicated, incomplete or sensitive data from entering a
  dry-run.
- Avoid touching Supabase with unsafe payloads.
- Produce sanitized reports.
- Keep validation local and offline until a later explicit approval.
- Keep the app disconnected and LocalStorage as the active runtime source.

## Structure Validations

A future snapshot should be treated as invalid unless:

- `snapshotVersion` exists.
- `exportedAt` exists and is a valid date.
- `source` exists.
- `relationshipSpaceHint` exists as a placeholder or conceptual mapping block.
- `identities` exists.
- `content` exists.
- `media` exists.
- `localState` exists.
- `counts` exists.
- `warnings` exists.
- Each block uses the expected array or object shape documented in
  `LOCAL_SNAPSHOT_EXPORT_FORMAT.md`.

## Count Validations

The validator should compare declared counts with the actual snapshot arrays.

Required checks:

- Total counts match arrays.
- Counts by type match content groups.
- Omitted items are reported.
- Warnings are reported.
- Media pending Storage is reported.
- Potential duplicates are reported.

Count mismatches should be `NO-GO` unless a future phase defines a safe
exception path.

## Content Validations

Each future item should be checked for:

- `localId` or `legacyId`.
- `type`.
- Serializable payload.
- Clear visibility state where applicable.
- `hidden`, `locked`, `restored` or edited state where applicable.
- Parseable dates, or explicit `invalid` / `missing` date markers.
- Preserved ordering, or explicit `missing` ordering markers.
- No fields that are impossible to map without a warning.

Unknown content types should be `NO-GO` unless the item is omitted and reported
sanely.

## Identity Validations

Identity validation must preserve local identity without pretending local ids
are remote ids.

Required checks:

- Local `createdBy` exists or is marked `legacy` / `unknown`.
- Local `updatedBy` exists or is marked `legacy` / `unknown`.
- owner_b/owner_a identity is preserved as `localIdentityKey`.
- Real emails are not used in docs.
- Real UUIDs are not used in docs.
- No remote profile is assumed without explicit private mapping.

Unresolved identity can be `CHECK` when the item remains usable with a
documented fallback. It becomes `BLOCKED` or `NO-GO` when authorship is required
for a future payload and no safe fallback exists.

## Duplicate Validations

Duplicate detection should include:

- `legacyId` / `localId` matching.
- Type + title + date matching when applicable.
- Similar content detection only as a warning.

Rules:

- Do not resolve duplicates automatically without human review.
- Do not choose a winner silently.
- Report duplicate candidates with sanitized labels.
- Keep enough local references to support review without exposing full intimate
  content in docs or chat.

## Media Validations

Media validation must keep Storage out of scope.

Required checks:

- No real file is uploaded.
- `media.localRef` is not a private absolute path in docs.
- `storageStatus` is `not_uploaded`.
- Media pending Storage is marked as a warning.
- No bucket or policy is assumed without a future dedicated phase.

Any validation path that requires uploading media, generating signed URLs or
using a bucket before approval is `NO-GO`.

## Security Validations

Future validation must fail if it detects:

- Secrets.
- service-role.
- anon/publishable key.
- JWT, access token or refresh token.
- Passwords.
- Real Supabase URL.
- Real project ref.
- Real UUID.
- Personal real emails.
- Private absolute paths in docs.
- Real intimate content in documentation.

Future validation of a real export must assume the input lives outside the repo
under the privacy rules in `PRIVATE_SNAPSHOT_WORKFLOW.md`.

Allowed in documentation:

- Placeholders.
- Synthetic labels such as `owner_a`, `partner_a`, `owner_b` and
  `external_user`.
- Existing `example.invalid` placeholder emails.
- Placeholder variable names such as `VITE_*`.
- Words like service-role only inside warnings or prohibitions.

## Result Levels

- `PASS`: snapshot is valid for a local no-network dry-run.
- `CHECK`: snapshot is usable, but warnings require review.
- `NO-GO`: snapshot is unsafe, incomplete or too risky.
- `BLOCKED`: a human decision, identity mapping or migration rule is missing.

## NO-GO Criteria

- Secrets detected.
- Identity cannot be resolved and no safe fallback exists.
- Counts are inconsistent.
- Critical duplicates lack a human decision.
- Critical dates are invalid.
- Media requires Storage without a policy.
- Payload is not serializable.
- Content type is unknown and not mapped.
- Snapshot contains real sensitive data and someone tries to share it in chat
  or docs.
- Validation tries to connect to Supabase.
- Validation tries to use service-role.

## Expected Future Report

A future sanitized validation report should feed the dry-run report format
documented in `MIGRATION_DRY_RUN_REPORT_FORMAT.md`. It should include:

- Counts by type.
- Total count.
- Warnings by category.
- `NO-GO` reasons.
- Sanitized omitted items.
- Sanitized duplicate candidates.
- Media pending Storage.
- Final result: `PASS`, `CHECK`, `NO-GO` or `BLOCKED`.

The report must not include full intimate content, secrets, tokens, keys,
passwords, real UUIDs, real project refs, private URLs or personal real emails.

## Relationship With Migration Dry-Run

- Validation happens before the dry-run.
- The dry-run must not run if validation returns `NO-GO`.
- The dry-run may run with `CHECK` only after human approval.
- The dry-run must not insert data by default.
- The dry-run report should remain sanitized and should not imply production
  readiness.

## Suggested Next Phase

Historical next phase completed/superseded:

- Controlled lab insert planning is now documented in
  `CONTROLLED_LAB_INSERT_PLAN.md`.

Current next phase:

- Private snapshot workflow is now documented in
  `PRIVATE_SNAPSHOT_WORKFLOW.md`.
- Next suggested phase: private snapshot manual export guidance or private
  export normalizer design.
- Still no real snapshot, real LocalStorage read by scripts, real dry-run, real
  insert, runtime change, `src`, SQL, Supabase Dashboard, Supabase CLI,
  `.env.local`, private files, Storage or reset.

## Non-Goals

- No validation script.
- No real snapshot generation.
- No real data read.
- No LocalStorage read.
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
