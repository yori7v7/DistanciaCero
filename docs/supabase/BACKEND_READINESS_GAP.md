# Supabase Backend Readiness Gap

## Status

- Disposable lab schema/RLS/fixtures/read-only verification/RLS E2E: PASS.
- App connection: none.
- Runtime: local and intact.
- `.env.local`: untouched.
- Storage: untouched.
- Reset: not applied.
- Backend production-ready: no.
- Production-ready: no.

## What The Current PASS Means

The disposable lab security gate proves the base membership and isolation rules
work for the synthetic lab data:

- Users with membership can read their allowed space.
- Users without membership are blocked from member-only data.
- Cross-space access is denied.
- Anon/no-session is blocked before protected private data access.
- The private RLS E2E security gate produced a sanitized PASS.

This validates the base security posture in the disposable lab. It does not
validate real app integration, production configuration, Storage behavior,
remote CRUD semantics, migration behavior or rollback.

## Current Post-State

- Schema applied in disposable lab: yes.
- RLS applied in disposable lab: yes.
- Synthetic Auth users created: yes.
- Synthetic fixture applied: yes.
- Read-only fixture verification: PASS.
- Private RLS E2E security gate: PASS.
- App connected to Supabase: no.
- Runtime connected to remote data: no.
- LocalStorage remains the active source: yes.
- Storage touched: no.
- Reset applied: no.
- Production-ready: no.

## Gaps Before Connecting The App

The app must remain disconnected until these gaps have an explicit plan and
review:

- Real Auth strategy: login/logout, session lifecycle, invite model and local
  fallback.
- Real profile mapping: mapping local identities to real Auth-backed profiles
  without committing UUIDs or private identifiers.
- Controlled content seed/migration: which local content moves first, what
  remains local temporarily and how idempotency is proven.
- Media/assets strategy: private Storage bucket design, `media_assets`
  references, signed URL handling and cleanup.
- Error/offline/fallback behavior: remote failures must not break the current
  local experience.
- Local/remote synchronization: cache, hydration, conflict detection and
  source-of-truth rules.
- Rollback plan: how to disable remote reads/writes and return to local-only
  mode without data loss.
- Lab vs production separation: the disposable lab must not become production
  by accident.
- Safe environment variables: public client config only, no administrative
  secrets and no real values in Git.
- Index/performance review: expected query paths need indexes and basic
  explain/review before runtime use.
- Remote CRUD tests: read/create/update/hide/restore/delete semantics must be
  tested against the repository contract.
- Multi-profile and simultaneous editing tests: owner/partner/external flows
  and conflict cases need coverage.
- Access model decision: decide whether Ale gets a real account, invite flow or
  another controlled access model.
- Migration scope decision: decide which collection or feature is piloted first
  and which content stays local temporarily.

## Risks

- Connecting runtime before adapting repositories can break the current local
  experience.
- Mixing local and remote content without a strategy can duplicate, hide or
  desynchronize data.
- Storage without a clear private policy can expose private media.
- Using service-role in frontend would be critical and is prohibited.
- Treating the disposable lab as production without reset/review is not
  acceptable.
- RLS PASS does not replace UI, repository, migration, offline or Storage
  integration tests.

## Recommendation

- Do not connect the app yet.
- Keep LocalStorage as the active source of truth.
- The remote data contract is documented in `REMOTE_REPOSITORY_CONTRACT.md`.
- The local-to-remote mapping is documented in
  `LOCAL_TO_REMOTE_CONTENT_MAPPING.md`.
- The migration dry-run plan is documented in `MIGRATION_DRY_RUN_PLAN.md`.
- A future real `remoteContentRepository` must stay behind an explicit feature
  flag.
- Keep the feature flag off by default.
- Test with one controlled screen or feature before broader rollout.
- Migrate gradually only after rollback and conflict handling are documented.

## Suggested Next Phase

Historical next phase completed/superseded:

- The snapshot/export format is now documented in
  `LOCAL_SNAPSHOT_EXPORT_FORMAT.md`.
- Snapshot validation, dry-run report format, insert gate and controlled lab
  insert planning are also documented.

Current next phase:

- If S4.6.4.44 docs consistency repair is clean, proceed to
  snapshot/dry-run script design as docs-only work.
- Still no executable script, real snapshot, real LocalStorage read, real
  dry-run, real insert, runtime change, Supabase Dashboard/CLI, `.env.local`,
  private files, Storage or reset.

## Non-Goals

- Do not connect the app.
- Do not apply SQL.
- Do not touch Supabase Dashboard or CLI.
- Do not modify runtime or `src`.
- Do not touch `.env.local`.
- Do not touch private files outside the repo.
- Do not touch Storage.
- Do not run reset.
- Do not claim backend or production readiness.
