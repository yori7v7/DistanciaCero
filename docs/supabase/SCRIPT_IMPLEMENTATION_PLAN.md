# Snapshot/Dry-Run Script Implementation Plan

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: first mock-only validator created in S4.6.4.48.
- Script created: yes, mock-only.
- `scripts/migration/` folder created: yes.
- Mock dry-run report script created: yes, in S4.6.4.50.
- Mock migration smoke-test runner created: yes, in S4.6.4.52.
- Real migration script created: no.
- Real snapshot generated: no.
- Real LocalStorage read: no.
- Real data exported: no.
- Dry-run executed: no.
- Supabase touched: no.
- Runtime touched: no.
- App connection: none.
- Storage touched: no.
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
- `scripts/migration/fixtures/mock-snapshot-pass.json`.
- `scripts/migration/fixtures/mock-snapshot-check.json`.
- `scripts/migration/fixtures/mock-snapshot-nogo.json`.
- `scripts/migration/README.md`.

Other future options still require separate approval:

- Docs-only examples as conceptual input.

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

- Review mock migration smoke-check outputs, then decide whether to expand
  mock-only coverage in a separate future phase.
- Still no real data.
- Still no real LocalStorage read.
- Still no real snapshot generation.
- Still no dry-run execution.
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
