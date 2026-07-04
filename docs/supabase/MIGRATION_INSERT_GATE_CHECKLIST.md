# Migration Insert Gate Checklist

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Script created: no.
- Data inserted: no.
- Runtime connection: none.
- New Supabase connection: none.
- LocalStorage: still active source and fallback.
- Storage touched: no.
- Production-ready: no.

## Objective

This gate defines the checklist that must pass before any future controlled
insert of migrated content into Supabase.

The gate should:

- Prevent unsafe, duplicated, incomplete or badly mapped data from being
  inserted.
- Require human review before any write.
- Keep disposable lab and production separated.
- Avoid confusing the RLS security gate PASS with migration readiness.
- Confirm that the app remains disconnected before any future insert.

## Required Preconditions

Before any future insert is allowed, these preconditions must be true:

- Snapshot/export format approved.
- Snapshot validation rules approved.
- Dry-run plan approved.
- Dry-run report format approved.
- Real snapshot validated locally.
- Real dry-run executed locally without network.
- Dry-run report reviewed.
- Dry-run result is `PASS`, or `CHECK` with explicit human approval.
- Identity and mapping are resolved.
- Critical duplicates are resolved.
- Media/Storage is excluded or explicitly decided.
- First private insert policy is documented, if the input is the private
  dry-run result.
- Private insert manifest format is documented before any manifest generation.
- Disposable lab is confirmed.
- Rollback/reset plan is confirmed.
- Target is not production.
- App remains disconnected.

## Security Checklist

- No service-role in frontend.
- No service-role in docs.
- No tokens, JWTs or passwords in reports.
- No real Supabase URL in docs.
- No real project ref in docs.
- No real UUIDs in docs.
- No personal real emails in docs.
- No full intimate content in shared reports.
- No real media upload without Storage policies.
- No `.env.local` before an approved phase.
- No runtime connection.

Any security item that fails is `NO-GO` unless a later approved phase defines a
safe exception and documents it before any insert.

## Data Checklist

- Counts are consistent.
- Remote types are valid.
- Required fields are present.
- Optional fields are reviewed.
- Dates are parseable or explicitly marked.
- Order is preserved.
- `hidden`, `locked`, `restored` and edited states are preserved.
- `createdBy` and `updatedBy` are resolved or marked legacy.
- `localId` or `legacyId` is preserved as metadata where applicable.
- Duplicate candidates are reviewed.
- Omitted items are documented.
- Warnings are accepted or resolved.

## Destination Checklist

- Target relationship space is confirmed as a disposable lab space.
- Synthetic profiles or lab mapping is confirmed.
- RLS E2E security gate remains PASS.
- Fixture/lab state is known.
- Synthetic fixtures and real data are not mixed without an explicit decision.
- Production is not the target.
- Reset or lab destruction remains available as rollback.

## Required Human Decisions

Human review must decide:

- Which content may be inserted first.
- Which content remains local temporarily.
- What happens with media.
- How legacy content without author metadata is handled.
- How duplicates are resolved.
- Whether Ale has a real account, invitation flow or controlled access model.
- Whether the lab is destroyed after tests.
- When a remote feature flag may be allowed.

These decisions must be recorded without secrets, real UUIDs, real project refs,
personal real emails or full intimate content.

## Gate States

- `PASS`: controlled lab insert planning may proceed.
- `CHECK`: proceed only with explicit human approval.
- `NO-GO`: insert is not allowed.
- `BLOCKED`: missing decision, mapping, identity, Storage policy or rollback.
- `ABORTED`: critical risk detected.

## NO-GO Criteria

- Secrets detected.
- service-role in frontend.
- Write target is production.
- `.env.local` was touched before an approved phase.
- Runtime was connected before feature flag approval.
- Snapshot validation is `NO-GO`.
- Dry-run report is `NO-GO`.
- Critical duplicates are unresolved.
- Identity is unresolved.
- Storage is required but policies are missing.
- Rollback does not exist.
- Lab versus production is ambiguous.
- Real sensitive data is included without explicit approval.

## Expected Future Output

A future gate report should include:

- Gate result.
- Checklist status: `PASS`, `CHECK`, `NO-GO`, `BLOCKED` or `ABORTED`.
- Pending decisions.
- Required human approval.
- Recommended next action.

The output must not include secrets, tokens, keys, passwords, real Supabase URLs,
real project refs, real UUIDs, personal real emails, private absolute paths or
full intimate content.

## Relationship With Future Phases

- This gate comes after snapshot validation and dry-run report review.
- Passing this gate only permits planning a controlled lab insert.
- The controlled lab insert plan is documented in
  `CONTROLLED_LAB_INSERT_PLAN.md`.
- It does not execute inserts.
- It does not connect the app.
- It does not imply backend readiness or production readiness.
- Production remains `NO-GO`.

## Suggested Next Phase

Historical next phase completed/superseded:

- The global Supabase docs consistency audit ran in S4.6.4.43.
- S4.6.4.44 repairs obsolete next-phase references.

Current next phase:

- Controlled private lab insert policy is documented in
  `CONTROLLED_PRIVATE_LAB_INSERT_POLICY.md`.
- Private insert manifest format is documented in
  `PRIVATE_INSERT_MANIFEST_FORMAT.md`.
- Private insert manifest generator exists with sanitized fixtures only.
- Private insert manifest result is documented in
  `PRIVATE_INSERT_MANIFEST_RESULT.md` as sanitized `CHECK`: 14 selected, 4
  deferred, 0 noGoReasons.
- Recommended first insert scope is 14 clean `content_items`; media and playlist
  are deferred.
- Next suggested phase: design a manifest review gate before any insert, or
  design a controlled lab insert script with sanitized fixtures only.
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
