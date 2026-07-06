# Snapshot/Dry-Run Script Implementation Plan

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: first mock-only validator created in S4.6.4.48.
- Script created: yes, mock-only.
- `scripts/migration/` folder created: yes.
- Mock dry-run report script created: yes, in S4.6.4.50.
- Mock migration smoke-test runner created: yes, in S4.6.4.52.
- NPM mock migration shortcuts created: yes, in S4.6.4.54.
- Private local export validator script created: yes, in S4.6.5.4.
- Private dry-run normalizer design documented: yes, in S4.6.5.11.
- Private dry-run normalizer script created: yes, in S4.6.5.12 with sanitized
  fixtures only.
- Private insert manifest generator created: yes, in S4.6.5.17 with sanitized
  fixtures only.
- Private insert manifest result documented: yes, in S4.6.5.19 as sanitized
  `CHECK`.
- Controlled private lab insert final gate documented: yes, in S4.6.5.20.
- Controlled private lab insert script design documented: yes, in S4.6.5.21.
- Controlled insert preflight/no-network script created: yes, in S4.6.5.22 with
  sanitized fixtures only.
- Controlled insert preflight/no-network audit complete: yes, in S4.6.5.23.
- Private lab insert preflight result documented: yes, in S4.6.5.24 as
  sanitized `PASS`.
- Real migration script created: no.
- Real snapshot generated: no.
- Real LocalStorage read: no.
- Real data exported by Codex/repo scripts: no.
- Dry-run executed by Codex/repo scripts on real data: no.
- Private manifest read by Codex: no.
- Supabase touched: no.
- Runtime touched: no.
- App connection: none.
- Storage touched: no.
- Private snapshot workflow documented: yes, in
  `PRIVATE_SNAPSHOT_WORKFLOW.md`.
- Private snapshot validator design documented: yes, in
  `PRIVATE_SNAPSHOT_VALIDATOR_DESIGN.md`.
- Production-ready: no.

## Recommended Decision

The first future script should be a mock-only validator.

It should:

- Run without network access.
- Use only mock or sanitized examples.
- Avoid reading real LocalStorage.
- Avoid reading `.env.local`.
- Avoid touching Supabase.
- Avoid inserting data.
- Avoid modifying runtime.
- Avoid new dependencies unless a later approved phase documents them first.

This keeps the first implementation step small: validate structure and safety
rules before any real snapshot, real export, dry-run transform or Supabase
interaction exists.

## First Conceptual Future Script

Tentative name:

- `validate-mock-snapshot.mjs`

Objective:

- Validate mock snapshot structure.
- Validate mock counts.
- Validate anti-secret rules.
- Validate `PASS`, `CHECK`, `NO-GO` and `BLOCKED` classification.
- Produce sanitized output.
- Serve as the first implementation step before any real snapshot work.

S4.6.4.48 creates this script as a mock-only validator. It still does not read
real data, read LocalStorage, touch Supabase, execute a dry-run or insert data.

## Future Location Recommendation

Implemented mock-only location:

- `scripts/migration/validate-mock-snapshot.mjs`.
- `scripts/migration/dry-run-mock-snapshot.mjs`.
- `scripts/migration/run-mock-migration-checks.mjs`.
- `scripts/migration/validate-private-local-export.mjs`.
- `scripts/migration/dry-run-private-local-export.mjs`.
- `scripts/migration/generate-private-insert-manifest.mjs`.
- `scripts/migration/preflight-private-lab-insert.mjs`.
- Future only: `scripts/migration/insert-private-lab-content-items.mjs`.
- `scripts/migration/fixtures/mock-snapshot-pass.json`.
- `scripts/migration/fixtures/mock-snapshot-check.json`.
- `scripts/migration/fixtures/mock-snapshot-nogo.json`.
- `scripts/migration/fixtures/mock-local-export-pass.json`.
- `scripts/migration/fixtures/mock-local-export-check-empty.json`.
- `scripts/migration/fixtures/mock-local-export-nogo.json`.
- `scripts/migration/fixtures/mock-local-export-check-media-playlist.json`.
- `scripts/migration/fixtures/mock-private-dry-run-result-check.json`.
- `scripts/migration/fixtures/mock-private-dry-run-result-nogo.json`.
- `scripts/migration/README.md`.

Implemented npm shortcuts:

- `npm run migration:mock` runs only the mock smoke runner.
- `npm run migration:mock:validate` runs only the mock PASS validator fixture.
- `npm run migration:mock:dry-run` runs only the mock PASS dry-run fixture.

These shortcuts do not use network access, Supabase, `.env.local`,
LocalStorage real data or real migration inputs. They do not insert data and do
not replace future real snapshot or migration tests.

Private local export validator:

- `validate-private-local-export.mjs` accepts an explicit local JSON file,
  rejects remote URLs and prints only a sanitized summary.
- In S4.6.5.4 it is tested only with sanitized fixtures inside the repo.
- It must not be run against a private real export until a separate review
  phase approves that.

Private dry-run normalizer:

- `dry-run-private-local-export.mjs` exists and is tested only with sanitized
  fixtures.
- It was later run manually by the user against a private export outside the
  repo; only sanitized result counts are recorded in
  `PRIVATE_DRY_RUN_RESULT.md`.
- The controlled private lab insert policy is documented in
  `CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md`.
- The private insert manifest format is documented in
  `PRIVATE_INSERT_MANIFEST_FORMAT.md`.
- It must not touch Supabase, Storage, `.env.local`, LocalStorage real data or
  runtime.

Recommendation:

- The mock-only validator may live in the repo in a later approved phase
  because it should not handle real data or secrets.
- Future real snapshots must stay outside the repo.
- Future reports containing intimate content must stay outside the repo.
- No script should be added until a separate phase explicitly approves script
  creation.

## Permitted Inputs For The First Future Script

The first mock-only validator may accept:

- Sanitized mock examples.
- Conceptual JSON copied from docs.
- A future mock fixture file, if separately approved.
- Flags without secrets.

It must not accept or require:

- `.env.local`.
- Supabase URL or key.
- Supabase project ref.
- service-role.
- User tokens or JWTs.
- Passwords.
- Real LocalStorage.
- Real intimate content.
- Real media.
- Private absolute paths.

## Expected Outputs

The future validator should emit:

- `PASS`, `CHECK`, `NO-GO` or `BLOCKED`.
- Mock counts.
- Mock warnings.
- Sanitized errors.
- Process exit code.

Output must not include:

- Secrets.
- Full intimate payloads.
- Real URLs.
- Real keys.
- Real UUIDs.
- Personal real emails.
- Private absolute paths.

## Exit Codes

| Exit code | Result | Meaning |
| --- | --- | --- |
| 0 | `PASS` | Mock input passes validation. |
| 1 | `NO-GO` | Mock input is invalid or unsafe. |
| 2 | `CHECK` | Mock input is valid with review warnings. |
| 3 | `BLOCKED` | Required mock mapping, identity or decision is missing. |
| 4 | `ABORTED` | Safety rule stopped execution. |
| 5 | `INVALID_USAGE` | Invalid arguments or unsupported mode. |

## Anti-Network Rules

The future mock-only validator must keep network access out of scope:

- No `fetch`.
- No Supabase client.
- No imports from Supabase integrations.
- No `.env.local` read.
- No Supabase-related `process.env` requirement.
- No network writes.
- No new dependencies.

## Anti-Runtime Rules

The future mock-only validator must stay detached from app runtime:

- No `src` edits.
- No React component imports.
- No `contentService` import.
- No `contentRepository` import.
- No `localContentRepository` import.
- No `remoteContentRepository` import.
- No LocalStorage modification.
- No browser read.
- No Vite runtime dependency.

## Minimum Future Validations

The first validator should check:

- `snapshotVersion` exists.
- `counts` match mock arrays.
- Content arrays exist.
- `identities` exists.
- `warnings` entries have a consistent shape.
- Media pending Storage is reported instead of uploaded.
- No secrets.
- No real Supabase URL.
- No real key.
- No real UUID.
- No personal real email.
- No private absolute path.
- `PASS`, `CHECK`, `NO-GO` and `BLOCKED` states classify correctly.

## NO-GO Criteria

The future script design is `NO-GO` if it:

- Needs Supabase.
- Needs `.env.local`.
- Reads real LocalStorage.
- Touches runtime.
- Creates a real snapshot.
- Uses service-role.
- Prints secrets.
- Requires new dependencies without a plan.
- Generates files with real content inside the repo.
- Inserts data.
- Uploads media.
- Requires SQL, Dashboard or CLI access.

## Suggested Next Phase

Suggested next phase:

- Design or create the controlled lab insert script in fixture/no-network mode
  first, or design the private config and mapping workflow.
- Still no private export read by Codex.
- Still no real LocalStorage read by scripts.
- Still no real snapshot generation.
- Still no insert script.
- Still no insert.
- Still no Supabase, CLI, Dashboard, SQL, Storage, `.env.local`, runtime or
  app connection.

## Non-Goals

- No real snapshot/export script.
- No real dry-run script.
- No real JSON file creation.
- No real snapshot generation.
- No real LocalStorage read.
- No data export.
- No dry-run execution.
- No data insert.
- No SQL change.
- No SQL execution.
- No Supabase Dashboard or CLI work.
- No `.env.local` changes.
- No private file changes.
- No Storage work.
- No runtime changes.
- No `src` changes.
- No app connection.
- No production readiness claim.
