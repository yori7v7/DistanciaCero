# Snapshot and Dry-Run Script Design

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Script created: no.
- Real snapshot generated: no.
- Real LocalStorage read: no.
- Real data exported: no.
- Dry-run executed: no.
- Supabase touched: no.
- Runtime touched: no.
- App connection: none.
- Storage touched: no.
- Production-ready: no.

## Objective

This document describes how future snapshot/export and migration dry-run
scripts could be shaped before any implementation exists.

The future scripts should:

- Create a portable local snapshot.
- Validate a local snapshot offline.
- Transform the snapshot into conceptual remote-shaped payloads.
- Produce a sanitized dry-run report.
- Avoid inserting data by default.
- Avoid connecting the runtime.
- Avoid touching Supabase before a later approved phase.

## Conceptual Future Scripts

Tentative names only. These files are not created in this phase.

- `export-local-snapshot.mjs`: future exporter that extracts or assembles a
  snapshot.
- `validate-local-snapshot.mjs`: future validator for snapshot format,
  consistency and security.
- `dry-run-local-to-remote.mjs`: future transformer that maps snapshot content
  into conceptual remote payloads without writing.
- `summarize-dry-run-report.mjs`: future report summarizer that emits safe
  status output without exposing full private content.

## Future Location Options

Two locations remain possible for a future implementation:

- `scripts/migration/` inside the repo, only if the scripts handle generic
  formats, sanitized examples and no secrets.
- A private folder outside the repo, if the scripts handle real or intimate
  snapshots, private mappings or reports that should not be committed.

Recommendation:

- Generic design and validators may live in the repo after an approved future
  phase.
- Real snapshots and reports containing intimate content must stay outside the
  repo.
- Real snapshots must not be stored in Git.

## Conceptual Inputs

Future scripts may accept:

- Snapshot JSON, either sanitized for repo use or private for local-only use.
- Local-to-remote mapping rules from `LOCAL_TO_REMOTE_CONTENT_MAPPING.md`.
- Validation rules from `LOCAL_SNAPSHOT_VALIDATION_RULES.md`.
- No-network execution options.
- Local identity context: Yori, Ale, legacy or unknown.
- Dry-run flags.
- Safe report destination options.

Inputs must not require secrets, service-role, tokens, keys, passwords, real
project refs, real Supabase URLs, personal real emails or real UUIDs in docs.

## Conceptual Outputs

Future scripts may emit:

- Snapshot JSON.
- Validation report.
- Dry-run report.
- Sanitized Markdown summary.
- Process exit code.

Default output must not include:

- Full intimate payloads.
- Tokens.
- Keys.
- Passwords.
- JWTs.
- Real Supabase URLs.
- Real project refs.
- Personal real emails.
- Real UUIDs in committed docs or shared reports.

## Security Rules

The design must preserve these rules:

- No service-role.
- No Supabase write.
- No network by default.
- No `.env.local` read.
- No full intimate content printed by default.
- No real snapshots in the repo.
- No private absolute paths in docs.
- No real UUIDs in docs.
- No personal real emails in docs.
- No real Supabase URL or key in docs.
- No media upload.
- No Storage.
- No runtime changes.
- No app connection.

## Conceptual Modes

Future command modes may include:

- `--dry-run` only.
- `--validate` only.
- `--summary sanitized`.
- `--fail-on-warnings` as an optional strict mode.
- `--allow-check` as an optional future mode that still requires human
  confirmation.

Modes intentionally excluded in this stage:

- No insert mode.
- No network mode.
- No Storage mode.
- No runtime mode.

## Proposed Exit Codes

| Exit code | Result | Meaning |
| --- | --- | --- |
| 0 | `PASS` | Snapshot or dry-run passed the requested local check. |
| 1 | `NO-GO` | Unsafe, invalid or blocked for the requested operation. |
| 2 | `CHECK` | Usable only after human review. |
| 3 | `BLOCKED` | Missing mapping, identity or required human decision. |
| 4 | `ABORTED` | Stopped for safety. |
| 5 | `INVALID_USAGE` | Invalid arguments or unsupported mode. |

## Responsibility Split

- Export script: future extraction or assembly of a local snapshot.
- Validation script: future format, count, identity and security validation.
- Dry-run script: future transformation to conceptual remote payloads without
  writing data.
- Report script: future sanitized summaries without full content exposure.
- Insert script: explicitly out of scope.

## Design NO-GO Criteria

The future design is `NO-GO` if it:

- Requires service-role.
- Requires touching runtime.
- Requires connecting `App.jsx`.
- Requires reading `.env.local`.
- Inserts by default.
- Uploads media.
- Prints secrets.
- Stores a real snapshot in the repo.
- Mixes disposable lab and production.
- Lacks a sanitized report.
- Lacks clear exit codes.
- Requires Supabase network access in the default dry-run path.

## Suggested Next Phase

Historical next phase completed/superseded:

- Mock snapshot examples are now documented in `MOCK_SNAPSHOT_EXAMPLES.md`.

Suggested next phase:

- Design a script implementation plan as docs-only work, or decide whether to
  create a first mock-only validator in a separate future phase.
- Still no real scripts.
- Still no real data.
- Still no real snapshot generation.
- Still no real LocalStorage read or export.
- Still no real dry-run.
- Still no insert.
- Still no Supabase, CLI, Dashboard, Storage, runtime or `.env.local` changes.

## Non-Goals

- No script implementation.
- No `scripts/migration/` creation.
- No snapshot generation.
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
