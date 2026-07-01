# Supabase Remote Repository Contract

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implementation: not implemented.
- App connection: none.
- Runtime impact: none.
- LocalStorage: still active source and fallback.
- Supabase lab security gate: PASS.
- UI integration: pending.
- Production-ready: no.

## Architectural Principle

The future remote repository must preserve the current application boundaries:

- `contentService` remains the public facade for content workflows.
- `contentRepository` may decide which backend is active only after an explicit
  future phase approves that selector.
- `localContentRepository` remains the safe local fallback.
- Future `remoteContentRepository` must implement the same logical contract as
  the local path, even if its internals are async or cached.
- Visual components must not call Supabase directly.
- Scenes, music controllers and presentation surfaces must not depend directly
  on Supabase.
- Supabase client creation must stay isolated behind the approved integration
  boundary.

## Expected Logical Contract

This is a future contract shape, not code. Names are placeholders for design
discussion and may be adapted before implementation.

| Operation | Purpose | Notes |
| --- | --- | --- |
| `listContent(scope/type/filters)` | List content items for a relationship space and collection/type. | Must enforce active profile and space context; preserve current ordering where applicable. |
| `getContent(id)` | Fetch one content item by remote identity. | Must not allow cross-space discovery. |
| `createContent(payload)` | Create a new content item. | Must preserve authorship metadata and avoid inventing legacy authors. |
| `updateContent(id, patch)` | Update an existing content item. | Must preserve immutable fields unless an explicit flow allows them. |
| `softDeleteContent(id)` | Hide or soft-delete content. | Must map to current hidden behavior and avoid hard delete by default. |
| `restoreContent(id)` | Restore hidden content. | Must respect membership and hidden metadata. |
| `listEvents(filters)` | List audit/content events. | Must be scoped to the active relationship space. |
| `appendEvent(event)` | Append an audit/content event. | Should become trusted via trigger/RPC/admin flow before production use. |
| `listMediaAssets(filters)` | List media metadata. | Must not expose private media outside the active space. |
| `getCurrentProfile()` | Resolve the authenticated profile for the current session. | Must not use local fake IDs as remote UUIDs. |
| `getCurrentRelationshipSpace()` | Resolve the active relationship space. | Must use verified remote mapping, not local IDs as UUIDs. |
| `subscribeToContentChanges()` | Optional future realtime hook. | Must remain off until conflict/version strategy exists. |

## Compatibility Rules

- Keep `createdBy` and `updatedBy` semantics.
- Preserve local/edited/hidden/restored metadata equivalents.
- Preserve current ordering where the UI depends on it.
- Keep local fallback available if remote mode fails or is disabled.
- Avoid duplicating local and remote content.
- Avoid hiding local content behind remote data without an explicit migration
  state.
- Avoid visual changes in scenes during the first connection phase.
- Preserve export/import v2 as offline backup until a reviewed migration plan
  replaces it.
- Do not change `contentService` return semantics until a compatibility plan is
  approved.

## Feature Flag Strategy

The app must stay local by default. Remote or hybrid modes require a future
explicit phase, safe environment validation and tests.

Conceptual placeholder flags:

```txt
VITE_CONTENT_BACKEND=local|remote|hybrid
VITE_SUPABASE_ENABLED=false|true
```

Current safe default:

```txt
VITE_CONTENT_BACKEND=local
VITE_SUPABASE_ENABLED=false
```

Rules:

- `local` is the default and only currently allowed runtime mode.
- `remote` and `hybrid` must not activate if required public env vars are
  missing or invalid.
- A future selector must fail closed to local mode before runtime adoption.
- No frontend flag may enable service-role or administrative credentials.
- Missing env must be reported through sanitized diagnostics.
- Do not silently fall back in ways that hide critical remote data errors
  without telemetry or sanitized logs.
- Feature flag names are placeholders; implementing or renaming flags requires
  a separate approved phase.

## Gradual Strategy

Recommended path:

| Phase | Goal | Runtime impact |
| --- | --- | --- |
| A | Docs contract and feature flag strategy. | None. |
| B | Contract tests/mocks without real Supabase. | None or isolated test-only. |
| C | Implement `remoteContentRepository` behind an off-by-default flag. | No active app connection. |
| D | Connect one small non-critical feature. | Controlled pilot only. |
| E | Controlled remote CRUD. | Limited, measured and reversible. |
| F | Gradual migration. | Requires backup, mapping and rollback. |
| G | Storage/media. | Requires private bucket policies and cleanup. |
| H | Production readiness. | Requires final gates and human approval. |

## NO-GO Criteria

- Runtime changes before this contract is reviewed.
- `App.jsx` touched without a specific approved plan.
- Visual components talk directly to Supabase.
- Scenes depend directly on Supabase.
- service-role appears in frontend, Vite env or Git.
- Local and remote data are mixed without mapping and migration state.
- Storage is touched before private policies and cleanup strategy.
- `.env.local` is filled before an approved configuration phase.
- The disposable lab is treated as production.
- Remote/hybrid mode hides critical errors through silent fallback.

## Next Recommended Phase

Design a migration dry-run plan as docs-only work.

That phase should not touch runtime, `src`, SQL, Supabase Dashboard, Supabase
CLI, `.env.local`, private files, Storage or reset.

## Non-Goals

- No runtime changes.
- No `src` changes.
- No repository implementation.
- No Supabase client invocation.
- No SQL execution.
- No `.env.local` changes.
- No Storage work.
- No app connection.
- No production readiness claim.
