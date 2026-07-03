# Controlled Lab Insert Plan

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Script created: no.
- Data inserted: no.
- Runtime connection: none.
- New Supabase connection: none.
- Scope: future disposable lab only.
- LocalStorage: still active source and fallback.
- Storage touched: no.
- Production-ready: no.

## Objective

This plan defines how a future controlled insert of migrated content would be
performed in the disposable lab only after snapshot validation, dry-run report
review and insert gate approval.

The plan should:

- Avoid accidental writes.
- Avoid production.
- Avoid duplicates.
- Keep rollback/reset clear.
- Keep the app disconnected during any future insert.
- Keep LocalStorage as the active runtime source.

## Required Preconditions

Before any future controlled lab insert:

- Real snapshot generated in an approved phase.
- Snapshot validation is `PASS`, or `CHECK` with approval.
- Local no-network dry-run has been executed.
- Dry-run report has been reviewed.
- Migration insert gate is `PASS`, or `CHECK` with approval.
- Identity and mapping are resolved.
- Critical duplicates are resolved.
- Media/Storage is excluded or explicitly decided.
- Private insert policy is documented when using the private dry-run result.
- Private insert manifest format is documented before any future manifest is
  generated.
- Disposable lab is confirmed.
- Production is ruled out.
- Rollback/reset is confirmed.
- RLS E2E security gate remains PASS.
- App remains disconnected.

## Insert Principles

- Insert must be minimal and reversible.
- Start with a small subset.
- Do not insert real media yet.
- Do not use service-role in frontend.
- Do not use production.
- Do not mix real data with synthetic fixtures without an explicit decision.
- Do not touch runtime.
- Do not connect UI.
- Do not perform a massive insert on the first attempt.

## Recommended Strategy

| Phase | Action | Scope |
| --- | --- | --- |
| A | Prepare sanitized payload from an approved dry-run. | Future approved phase only. |
| B | Human review of the selected subset. | Future approved phase only. |
| C | Insert a small subset in the disposable lab. | Future approved phase only. |
| D | Run read-only count verification. | Future approved phase only. |
| E | Run post-insert RLS verification. | Future approved phase only. |
| F | Review content through read-only REST or SQL. | Future approved phase only. |
| G | Decide whether to expand the subset or reset the lab. | Human decision. |
| H | Document the sanitized result. | Docs-only result record. |

This document does not execute any of those phases.

## Recommended Initial Subset

- Non-media content only.
- Few items per type.
- Prefer simple reasons, promises and dates.
- Avoid long intimate letters in the first insert.
- Avoid gallery / black-hole content until Storage is designed.
- Avoid playlist/audio until asset handling is designed.

## Future Post-Insert Verification

Future verification should include:

- Counts by table.
- Counts by type/category.
- Relationship space validation.
- `createdBy` and `updatedBy` validation.
- `hidden`, `locked` and `restored` validation.
- Ordering validation.
- RLS validation with synthetic users.
- Confirmation that anon remains blocked.

## Rollback

- Prefer reset or destruction of the disposable lab if anything fails.
- Do not depend on complex manual rollback.
- Do not touch production.
- Keep LocalStorage as the active source.
- Document whether a subset was inserted and how it would be cleaned up.

## NO-GO Criteria

- App is connected before the insert.
- Runtime was touched.
- `.env.local` was touched without an approved phase.
- Storage is required but policies are missing.
- service-role appears in frontend.
- Production target is ambiguous.
- Sensitive data lacks explicit approval.
- Critical duplicates remain unresolved.
- Identity is unresolved.
- RLS E2E security gate is not current.
- Rollback is unclear.
- Dry-run report is `NO-GO`.
- Insert gate is `NO-GO`.

## Expected Future Output

A future controlled insert result should include:

- Result: `PASS`, `CHECK`, `NO-GO` or `BLOCKED`.
- Subset inserted or not inserted.
- Read-only counts.
- Post-insert RLS result.
- Risks detected.
- Next human decision.

The output must not include secrets, tokens, keys, passwords, real Supabase URLs,
real project refs, real UUIDs, personal real emails, private absolute paths or
full intimate content.

## Relationship With Future Phases

- This plan comes after snapshot validation, dry-run report and insert gate.
- It does not create a script.
- It does not insert data.
- It does not connect runtime.
- It does not touch SQL.
- It does not authorize production.
- It does not imply app/backend readiness.

## Suggested Next Phase

Historical next phase completed/superseded:

- The global Supabase docs consistency audit ran in S4.6.4.43.
- S4.6.4.44 repairs obsolete next-phase references.

Current next phase:

- Controlled private lab insert policy is documented in
  `CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md`.
- Private insert manifest format is documented in
  `PRIVATE_INSERT_MANIFEST_FORMAT.md`.
- Recommended first private lab insert scope is 14 clean `content_items`.
- `blackHoleGallery` and `playlist` are deferred until Storage/media and
  playlist source policies exist.
- Next suggested phase: design or create a local-only manifest generator with
  sanitized fixtures before any private manifest, insert script, SQL or insert
  execution.
- Still no insert, runtime change, SQL creation/execution, Supabase Dashboard,
  Supabase CLI, `.env.local`, private files, Storage or reset.

## Non-Goals

- No insert script.
- No data insert.
- No real snapshot generation.
- No real data read.
- No LocalStorage read.
- No dry-run execution.
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
