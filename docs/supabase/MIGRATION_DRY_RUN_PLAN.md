# Supabase Migration Dry-Run Plan

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- Script created: no.
- Migration executed: no.
- Runtime connection: none.
- LocalStorage: still active source and fallback.
- Supabase touched: no.
- Storage touched: no.
- Production-ready: no.

## Objective

The future dry-run should prove that local content can be transformed into
remote-shaped payloads safely before any insert.

The dry-run should:

- Take a local snapshot.
- Transform it into conceptual remote payloads.
- Validate counts, types, identity, visibility, ordering and risks.
- Report anything omitted, ambiguous or unsafe.
- Avoid inserting real data.
- Avoid touching Supabase in this phase.

## Expected Inputs

Future dry-run inputs:

- Sanitized local export/snapshot.
- `LOCAL_TO_REMOTE_CONTENT_MAPPING.md` reviewed as the mapping source.
- Selected local identity context: Yori, Ale or legacy/unknown.
- Target disposable lab relationship space selected privately.
- Visibility rules for hidden, restored, locked, unlocked and upcoming states.
- Media handling rules that keep Storage out of scope.
- Private identity mapping outside Git/chat, if the dry-run needs to resolve
  `createdBy` or `updatedBy`.

## Expected Future Outputs

The dry-run report should be sanitized and should include:

- Count summary by collection/type/kind.
- Valid item list, without private content bodies.
- Omitted item list, with safe reasons.
- Conflict list.
- Unmapped field list.
- Potential duplicate report.
- Pending media/Storage report.
- Identity resolution report using only safe labels.
- Risk report before any insert.
- Final GO/NO-GO recommendation for a later lab insert phase.

## Validations

The dry-run must validate:

- No secrets.
- No service-role.
- No real UUIDs in docs or committed reports.
- No personal emails in docs or committed reports.
- No JWTs, tokens, passwords or keys.
- No real media upload.
- No duplicate content without an explicit resolution.
- Legacy ids preserved as metadata where needed for idempotency.
- `createdBy` and `updatedBy` resolved through private mapping or marked
  legacy/unknown.
- Dates parse safely.
- Hidden, locked, restored and opened/read states are preserved or explicitly
  marked pending.
- Ordering is preserved where the UI depends on it.
- Remote type/category is valid against the mapping document.
- Media references are reported as pending Storage work, not uploaded.

## Future Execution Strategy

Recommended future sequence:

| Phase | Action | Network/Supabase |
| --- | --- | --- |
| A | Create or choose a local snapshot/export. | None. |
| B | Run transform dry-run locally without network. | None. |
| C | Produce sanitized dry-run report. | None. |
| D | Human review of counts, omissions, conflicts and risks. | None. |
| E | Controlled insert into disposable lab only with explicit approval. | Future approved phase only. |
| F | Read-only verification in lab. | Future approved phase only. |
| G | RLS verification with synthetic users. | Future approved phase only. |
| H | Rollback/reset lab if anything fails. | Future approved phase only. |

## NO-GO Criteria

- Secrets appear in inputs, docs or reports.
- Identity mapping is missing or ambiguous.
- Potential duplicates are unresolved.
- Storage is required but private policies and cleanup are not ready.
- Real sensitive content would be migrated without an explicit decision.
- service-role is proposed for frontend use.
- Any write to Supabase is attempted before explicit approval.
- Runtime is touched before feature flag implementation is approved.
- The disposable lab is confused with production.
- The report cannot explain omitted or unmapped fields safely.

## Future Rollback

- The disposable lab can be destroyed or reset in a later approved phase.
- Do not depend on manual production rollback.
- Do not mix real data with synthetic fixtures without a written plan.
- Keep LocalStorage as the active source until app integration is approved.
- Keep export/import v2 as the offline backup path until a reviewed migration
  replacement exists.

## Suggested Next Phase

Design the snapshot/export format as docs-only work.

That phase should not create migration scripts, touch runtime, modify `src`,
execute SQL, use Supabase Dashboard, use Supabase CLI, touch `.env.local`, edit
private files, touch Storage or run reset.

## Non-Goals

- No migration script.
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
