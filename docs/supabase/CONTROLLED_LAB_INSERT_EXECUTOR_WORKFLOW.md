# Controlled Lab Insert Executor Workflow

## Status

- Status: documentary design.
- Executor script created: yes.
- Fixture/no-network mode: yes.
- Private validate/no-network mode: yes, added in S4.6.5.40.
- Insert executed: no.
- Supabase touched: no.
- Private payload read by Codex: no.
- Storage touched: no.
- Production allowed: no.
- App connection: none.

This document defines the workflow for a future controlled lab insert executor.
S4.6.5.38 creates the first fixture/no-network script with sanitized fixtures.
S4.6.5.40 adds `private-validate-no-network`, which requires the payload path to
be outside the repo and still does not touch Supabase, insert data, touch
Storage or connect the app. This phase still does not read the private real
payload.

## Purpose

The future executor should:

- use a private insert payload JSON outside the repo;
- insert only the 14 allowed `content_items` into the disposable lab;
- exclude media, playlist, Storage and `content_events`;
- require explicit user GO;
- avoid automatic insert behavior;
- print only sanitized status and counts.

The private payload already exists outside the repo and is recorded only as a
sanitized result in `PRIVATE_INSERT_PAYLOAD_PERSISTENCE_RESULT.md`. The payload
itself must remain private and must not be opened by Codex.

## Future Private Inputs

Conceptual future inputs, without real paths:

- private insert payload JSON outside the repo;
- private Supabase lab config;
- private identity/profile/space mapping;
- optional `migrationRunId`;
- optional rollback marker.

Rules:

- do not commit private inputs;
- do not paste private inputs in chat;
- do not document real paths;
- do not print the full payload;
- do not use `service-role` unless a future justified phase explicitly approves
  it. By default, `service-role` remains prohibited.

## First Insert Scope

The first future insert must be limited to `content_items` only.

Allowed rows:

| Collection | Rows |
| --- | ---: |
| `monthlyLetters` | 2 |
| `openWhenLetters` | 2 |
| `reasons` | 2 |
| `promises` | 2 |
| `importantDates` | 2 |
| `futureDreams` | 2 |
| `timeline` | 2 |

Expected total:

- `14` rows.

Excluded from the first insert:

- `blackHoleGallery`;
- `playlist`;
- `media_assets`;
- `storage`;
- `content_events`;
- Auth users;
- `relationship_spaces`;
- `universe_members`;
- RLS policies;
- schema changes.

## Mandatory Gates Before Insert

Before any insert can run, all of these must be true:

- disposable lab confirmed;
- production blocked;
- app disconnected;
- Storage blocked;
- private payload outside the repo confirmed;
- payload rows equals `14`;
- `noGoReasons` equals `0`;
- private remote mapping confirmed;
- rollback plan defined;
- executor script audited;
- dry-run/no-write PASS;
- user gives explicit GO.

## Recommended Future Modes

### Fixture/No-Network Mode

- Uses a payload mock or sanitized fixture.
- Does not touch Supabase.
- Does not insert.
- Validates executor gates and stdout shape first.

### Private Payload Validate Mode

- Reads the private payload outside the repo.
- Does not touch Supabase.
- Does not insert.
- Prints only sanitized status, counts and gate results.
- Requires `--confirm-private-payload-outside-repo`.
- Rejects payload files inside the repo or inside `.git`.

### Lab Dry-Run/No-Write Mode

- May verify controlled lab configuration in a later approved phase.
- Does not insert.
- Uses no `service-role` by default.
- Prints only sanitized target and gate status.

### Lab Insert Mode

- Separate future phase.
- Requires explicit user GO.
- Disposable lab only.
- Inserts only `content_items`.
- Reports only sanitized summary.

## Future Executor Security

The future executor must not:

- print the payload;
- print intimate content;
- print real UUIDs;
- print real emails;
- print tokens or keys;
- print full URLs;
- print private paths;
- use production;
- touch Storage;
- modify schema or RLS;
- create Auth users;
- delete data;
- reset anything;
- connect the app.

## Allowed Future Stdout

A future executor may print only sanitized fields such as:

- `executorStatus`;
- `mode`;
- `target`: `lab-only`;
- `payloadRowsCount`;
- `insertedRowsCount`, if applicable;
- `skippedRowsCount`;
- `deferredRowsCount`;
- `targetTable`: `content_items`;
- `noStorageTouched`: `true`;
- `appStillDisconnected`: `true`;
- `productionBlocked`: `true`;
- `rollbackMarker`: sanitized value or placeholder;
- `output`: `sanitized`;
- `exitCode`.

It must not print payload rows, private file names, private paths, secrets,
Data URLs, full playlist URLs or intimate content.

## NO-GO Conditions

The executor workflow is `NO-GO` if:

- payload is inside the repo;
- payload rows is not `14`;
- payload includes media or playlist rows;
- payload includes a Data URL;
- payload includes Storage data;
- payload includes `content_events`;
- Supabase target is not confirmed as disposable lab;
- target appears production-like;
- private remote mapping is missing;
- `service-role` is used without explicit future authorization;
- script attempts schema, RLS, Auth, Storage, reset or delete operations;
- app is connected before approval;
- explicit user GO is missing.

## Rollback Concept

Each future insert should use:

- `migrationRunId`;
- `sourceLocalRef`;
- enough metadata to identify only the 14 inserted rows.

Rollback rules:

- rollback must identify only those 14 rows;
- rollback real execution must be a separate phase or explicit command;
- no automatic delete without explicit GO;
- lab reset or destruction remains the simplest fallback for the disposable
  lab.

## Suggested Next Phase

Recommended next sequence:

1. Audit the private validate/no-network mode.
2. Run private payload validation only after that audit and explicit approval.
3. Design lab dry-run/no-write separately.
4. Consider real lab insert only at the end, with explicit user GO.

## S4.6.5.38 Fixture/No-Network Script

S4.6.5.38 creates
`../../scripts/migration/execute-controlled-lab-insert.mjs` and four sanitized
fixtures. The script validates a lab-only mock payload, requires
`--mode fixture-no-network`, `--confirm-no-supabase`,
`--confirm-no-insert` and `--confirm-lab-only`, and prints only a sanitized JSON
summary. It does not touch Supabase, does not write files, does not read private
payloads and does not insert data.

Expected fixture results:

- PASS fixture: `PASS`, exit `0`, `plannedRowsCount` `14`,
  `insertedRowsCount` `0`.
- Row-count fixture: `NO-GO`, exit `1`.
- Media fixture: `NO-GO`, exit `1`.
- Production fixture: `NO-GO`, exit `1`.

## S4.6.5.40 Private Validate/No-Network Mode

S4.6.5.40 adds `--mode private-validate-no-network` to
`../../scripts/migration/execute-controlled-lab-insert.mjs`. The mode requires:

- `--confirm-no-supabase`;
- `--confirm-no-insert`;
- `--confirm-lab-only`;
- `--confirm-private-payload-outside-repo`.

The mode rejects remote URLs, payload files inside the repo and payload files
inside `.git`. It reads a local file only for structural validation, writes no
files, touches no Supabase, performs no network calls and inserts nothing.
Stdout reports `payloadFile: <outside-repository>` and never prints private
paths or payload rows.

S4.6.5.40 tests this mode only with a sanitized mock payload copied to a
temporary folder outside the repo, then deletes the temporary file. The private
real payload remains unread by Codex.

Still blocked:

- No Supabase touch.
- No insert.
- No SQL creation or execution.
- No Dashboard or CLI use.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private content in Git or chat.
