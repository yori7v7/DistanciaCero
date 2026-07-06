# Private Insert Payload Persistence Workflow

## Status

- Status: documentary design.
- Optional fixture implementation: yes, in S4.6.5.34.
- Real payload generated manually outside the repo: yes, recorded only as a
  sanitized result in `PRIVATE_INSERT_PAYLOAD_PERSISTENCE_RESULT.md`.
- Real payload included in repo: no.
- Real payload read by Codex: no.
- Script modified: yes, with optional `--out` writing tested only with
  sanitized fixtures.
- Insert executed: no.
- Supabase touched: no.
- Storage touched: no.
- Production allowed: no.
- App connection: none.

This document defines a workflow for saving a private insert payload JSON
outside the repository. S4.6.5.34 adds optional `--out` support to the builder
and tests it only with sanitized fixtures. S4.6.5.36 records that the user later
generated the private payload outside the repo and reported only a sanitized
summary. The payload itself remains private and outside the repo. This workflow
does not touch Supabase, touch Storage or execute an insert.

## Purpose

The future workflow should:

- define how a private insert payload JSON will be saved outside the repo;
- prevent intimate content from entering Git, docs or chat;
- prepare a local private review before any controlled insert;
- keep Supabase untouched during payload persistence;
- keep the app disconnected.

## Future Private Inputs

Conceptual future inputs, without real paths:

- private local export v2 JSON;
- private insert manifest sanitized JSON;
- private identity mapping JSON;
- optional private output path outside the repository;
- optional `migrationRunId`.

Rules:

- no private input is committed;
- no private JSON is pasted in chat;
- no real paths are documented;
- full payload is not printed;
- private files remain outside the repo.

## Future Private Output

The future output is:

- private insert payload JSON outside the repo.

It must:

- contain 14 `content_items`;
- exclude `blackHoleGallery`;
- exclude `playlist`;
- exclude `media_assets`;
- exclude `storage`;
- exclude `content_events`;
- include `migrationRunId` privately, if used;
- include `sourceLocalRef` or equivalent privately;
- be marked lab-only / not production;
- never be saved inside the repo.

## Allowed Sanitized Stdout

A persistence command may print only:

- `payloadBuildStatus`;
- `outputFile`: `<outside-repository>`;
- `payloadRowsCount`: `14`;
- `deferredItemsCount`: `4`;
- `rowsByCollection`;
- `identityResolvedCount`: `14`;
- `missingLocalRefsCount`: `0`;
- `noGoReasonsCount`: `0`;
- `noSupabaseTouched`: `true`;
- `noInsertExecuted`: `true`;
- `noNetwork`: `true`;
- `payloadPrinted`: `false`.

## Prohibited Stdout And Docs Content

Do not print or document:

- full payload;
- letter, promise or reason text;
- intimate content;
- Data URLs;
- full URLs;
- private absolute paths;
- real UUIDs;
- real emails;
- keys or tokens;
- `service-role`;
- passwords.

## Future Write Gate

The builder may write a private payload file only if all of these are true:

- output path is outside the repo;
- export, manifest and mapping inputs are outside the repo;
- `selectedItemsCount` is `14`;
- `payloadRowsCount` is `14`;
- `deferredItemsCount` is `4`;
- `missingLocalRefsCount` is `0`;
- `identityResolvedCount` is `14`;
- `noGoReasonsCount` is `0`;
- media and playlist remain excluded;
- Supabase is not touched;
- insert is not executed;
- the user gives explicit GO to write the private file.
- the command includes `--out <output-file.json>` and
  `--confirm-write-private-output`.

## Private File Rules

Suggested conceptual name:

```txt
private-insert-payload-lab-only-<timestamp>.json
```

Rules:

- the file must live outside the repo;
- do not open or paste its contents in chat;
- do not upload it to Git;
- treat it as sensitive;
- it may be deleted after insert/rollback if no longer needed.

## Future Validations

Before any private payload file is accepted for later use, validate:

- output path is outside the repo;
- output does not appear in `git status`;
- payload contains no media or playlist items;
- payload contains no Data URLs;
- payload contains no Storage objects;
- payload contains only 14 `content_items`;
- private identity mapping is confirmed;
- payload is lab-only;
- production is blocked.

## Relationship To Real Insert

A persistent private payload does not authorize automatic insert.

Any real insert remains a separate future phase and requires:

- audited insert script;
- disposable lab confirmation;
- private remote mapping confirmed against lab profiles;
- rollback defined;
- explicit user GO.

## Rollback And Cleanup

- The private payload file may be deleted manually after use.
- If `migrationRunId` is used, document it only in sanitized form.
- Do not delete remote data in this phase.
- Do not reset anything in this phase.

## S4.6.5.36 Sanitized Persistence Result

S4.6.5.36 records the private payload persistence result in
`PRIVATE_INSERT_PAYLOAD_PERSISTENCE_RESULT.md`. The reported status is `PASS`:
14 selected items, 14 payload rows, 4 deferred items, 0 missing local refs,
0 noGoReasons, identity mapping confirmed, `outputWritten: true`,
`outputFile: <outside-repository>`, no network, no Supabase, no Storage and no
insert.

The private payload is sensitive. It must stay outside the repo, must not be
pasted in chat, must not be opened by Codex and must not be used for insert
without a future explicit phase.

## Suggested Next Phase

Recommended next direction:

- design the controlled lab insert executor workflow;
- create any insert executor first as fixture/no-network or dry-run/no-write;
- keep real Supabase insert blocked until a future explicit GO.

Still blocked:

- No Supabase touch.
- No insert.
- No SQL creation or execution.
- No Dashboard or CLI use.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private content in Git or chat.
