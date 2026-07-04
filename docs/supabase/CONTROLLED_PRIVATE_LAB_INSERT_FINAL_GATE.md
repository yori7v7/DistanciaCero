# Controlled Private Lab Insert Final Gate

## Status

- Status: documentary design.
- Insert executed: no.
- SQL created: no.
- Script created: no.
- Supabase touched: no.
- Storage touched: no.
- Production allowed: no.
- App connection: none.

This document defines the final mandatory review before any real controlled
private insert in the disposable Supabase lab. It does not create SQL, create a
script, execute an insert, touch Supabase, touch Storage or connect the app.

## Purpose

The final gate exists to:

- require a last review before any real lab insert;
- prevent accidental insert execution;
- prevent production use;
- prevent media and playlist insert before policy exists;
- keep private data out of Git, docs and chat;
- confirm rollback before the lab is touched.

## Future Private Inputs

The future insert phase may require these private inputs, conceptually:

- private local export JSON;
- private dry-run report sanitized JSON;
- private insert manifest sanitized JSON;
- private identity mapping;
- lab environment confirmation.

None of these inputs may be committed. Do not paste them in chat. Do not
document real private paths.

## Minimum Required State

Before any insert is allowed:

- repo is clean;
- `npm.cmd run migration:mock` passes;
- `node scripts/verify-supabase-isolation.mjs` passes;
- `npm.cmd run build` succeeds;
- `npm.cmd audit` reports 0 vulnerabilities;
- private export validation is `CHECK` or `PASS` with zero no-go reasons;
- private dry-run is `CHECK` or `PASS` with zero no-go reasons;
- private manifest is `CHECK` or `PASS` with zero no-go reasons;
- `selectedItemsCount` is `14`;
- `deferredItemsCount` is `4`;
- identity missing count is `0`;
- unknown identity count is `0`;
- conflicts count is `0`;
- duplicate candidates count is `0`;
- the user gives explicit GO.

## Allowed First Insert Items

Only the 14 selected items are eligible for the first controlled lab insert:

| Collection | Count |
| --- | ---: |
| `monthlyLetters` | 2 |
| `openWhenLetters` | 2 |
| `reasons` | 2 |
| `promises` | 2 |
| `importantDates` | 2 |
| `futureDreams` | 2 |
| `timeline` | 2 |

## Blocked First Insert Items

These 4 items remain blocked for the first insert:

| Collection | Count | Reason |
| --- | ---: | --- |
| `blackHoleGallery` | 2 | `media_pending_storage` |
| `playlist` | 2 | `playlist_source_pending_review` |

Blocking reasons:

- Storage/media policy is still pending;
- playlist source policy is still pending;
- media and playlist must not be included in selected insert items.

## Identity Mapping Gate

- `local-yori` and `local-ale` must be resolved privately.
- Real UUIDs must not be documented.
- Real emails must not be documented.
- `service-role` must not be used.
- If private mapping is not confirmed, insert is blocked.
- Mapping must happen locally and privately, not in chat.

## Supabase Lab Gate

Before any future insert, confirm:

- target is a disposable lab;
- target is not production;
- app remains disconnected;
- Storage will not be touched;
- `service-role` will not be used in frontend;
- prior RLS security gate remains accepted;
- schema, RLS and base fixtures exist in the lab.

## Future Insert Execution Rule

Any future insert execution path must:

- require explicit user GO;
- print a sanitized summary before execution;
- confirm `selectedItemsCount` is `14`;
- confirm `deferredItemsCount` is `4`;
- abort if any no-go reason exists;
- abort if media or playlist appears in selected items;
- abort if target is production;
- abort if private identity mapping is missing;
- abort if `service-role` is detected;
- abort if repo is dirty;
- abort if migration mock checks fail;
- abort if Supabase isolation verifier fails;
- abort if build fails;
- abort if audit fails.

## Rollback Gate

Before any future insert, choose one rollback strategy:

- reset or destroy the full disposable lab;
- rollback by `migrationRunId`, if implemented;
- private delete batch, if implemented.

For the first insert, the documentary preference remains lab reset or lab
destruction as the primary rollback. `migrationRunId` is recommended if a
future script implements it.

No rollback is executed in this phase.

## Future Post-Insert Verification

If an insert is ever executed later, the follow-up verification must:

- count inserted rows;
- validate 14 new `content_items`;
- validate 0 new `media_assets`;
- validate 0 Storage objects;
- validate deferred items were not inserted;
- validate member read access through RLS;
- validate external user denial;
- generate a sanitized report;
- keep the app disconnected.

## Immediate NO-GO Conditions

Insert planning or execution is immediately blocked if any of these are true:

- repo is dirty;
- build fails;
- Supabase isolation verifier fails;
- audit fails;
- manifest is missing;
- manifest selected count is not `14`;
- manifest deferred count is not `4`;
- media or playlist appears in selected items;
- no-go reasons count is greater than `0`;
- conflicts count is greater than `0`;
- critical duplicate count is greater than `0`;
- identity mapping is missing;
- target is production;
- app is connected accidentally;
- `.env.local` is touched;
- `service-role` is detected;
- Storage is required;
- private export or manifest is inside the repo;
- intimate content appears in docs or chat.

## Suggested Next Phase

Recommended next direction:

- design a controlled insert script with sanitized fixtures only; or
- create a controlled insert script dry-run/no-network first.

Still blocked:

- No Supabase touch.
- No insert.
- No SQL creation or execution.
- No Dashboard or CLI use.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private content in Git or chat.
