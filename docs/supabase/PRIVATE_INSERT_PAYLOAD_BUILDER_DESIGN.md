# Private Insert Payload Builder Design

## Status

- Status: documentary design.
- Script created: no.
- Real payload generated: no.
- Insert executed: no.
- Supabase touched: no.
- Storage touched: no.
- Production allowed: no.
- App connection: none.

This document designs a future private payload builder. It does not create a
script, generate private JSON, execute an insert, touch Supabase, touch Storage
or connect the app.

## Purpose

The sanitized insert manifest selects 14 items, but it intentionally does not
contain the real payload. A future payload builder should construct a private
payload for those 14 selected `content_items` from private local inputs.

The goals are:

- keep intimate payload out of the repo and chat;
- prepare review and a future controlled lab insert;
- preserve the 14 selected / 4 deferred policy;
- keep media and playlist out of payload v1;
- avoid touching Supabase in the builder phase.

## Future Private Inputs

Conceptual future inputs, without real paths:

- private local export v2 JSON;
- private insert manifest sanitized JSON;
- private identity mapping JSON;
- optional `migrationRunId`;
- private lab/space mapping.

Rules:

- no input is committed;
- no input is pasted in chat;
- no real paths are documented;
- full payloads are not printed.

## Future Private Output

Conceptual future output:

- private insert payload JSON outside the repo.

It must contain only the 14 selected `content_items`:

| Collection | Count |
| --- | ---: |
| `monthlyLetters` | 2 |
| `openWhenLetters` | 2 |
| `reasons` | 2 |
| `promises` | 2 |
| `importantDates` | 2 |
| `futureDreams` | 2 |
| `timeline` | 2 |

It must exclude:

- `blackHoleGallery`;
- `playlist`;
- `media_assets`;
- Storage;
- `content_events`.

## Manifest Versus Payload

Manifest sanitizado:

- may be documented with counts;
- does not include real payload;
- supports selection review.

Private payload:

- contains real data needed for insert;
- must never enter the repo;
- must never be pasted in chat;
- is used locally only.

## Conceptual Build Flow

The future builder should:

- read private export v2;
- read sanitized manifest;
- read private identity mapping;
- select only the 14 `selectedItems` by `localRef`;
- find each item in the correct export collection;
- map each item to a conceptual `content_items` row;
- add `migrationRunId`;
- add `source_local_ref`;
- add remote `type`;
- add private payload JSON;
- add `created_by` and `updated_by` from private mapping;
- exclude every deferred item;
- exclude media and playlist;
- print only a sanitized summary to stdout;
- write a private payload only outside the repo if the user explicitly asks.

## Mandatory Validations

The future builder must validate:

- manifest `selectedItemsCount` is `14`;
- manifest `deferredItemsCount` is `4`;
- no-go reasons count is `0`;
- identity mapping is confirmed;
- selected `localRef` values exist in the export;
- each selected item belongs to the expected collection;
- no selected item points to `gallery_item`;
- no selected item points to `playlist_item`;
- no selected item has warning codes;
- selected payload contains no Data URLs;
- selected payload contains no playlist URLs;
- no real UUID, email or secret is printed;
- no private path is printed;
- export version is `2`;
- content exists.

## Conceptual Content Items Mapping

Conceptual remote fields:

- `relationship_space_id`: `<private_space_mapping_required>`;
- `type`;
- `payload`;
- `created_by`;
- `updated_by`;
- `source_local_ref`;
- `migration_run_id`;
- `visibility` or `status`, if applicable;
- `created_at` and `updated_at`, if applicable;
- `metadata`.

Do not document real UUIDs. Do not document real payload. Do not document real
emails.

## Payload By Collection

All shapes are conceptual and must not include real content in docs:

- `monthlyLetters`: title, month or label, preview, body or content, locked.
- `openWhenLetters`: title, label or mood, preview, body or content, locked.
- `reasons`: text or body, order/status/hidden if applicable.
- `promises`: text or body, order/status/hidden if applicable.
- `importantDates`: title, date as `YYYY-MM-DD`, description/status.
- `futureDreams`: title/text/status/order.
- `timeline`: title, subtitle, date as `YYYY-MM-DD`, description/order.

## Media And Playlist

- `blackHoleGallery` does not enter payload v1.
- `playlist` does not enter payload v1.
- Data URLs stay out.
- Playlist URLs and paths stay out.
- Storage stays out.
- Media and playlist require a future phase.

## Security

- No `service-role`.
- No Supabase in the initial builder.
- No network.
- No `.env.local`.
- No LocalStorage.
- No stdout with full payload.
- No private paths.
- No keys or tokens.
- No real UUIDs or emails in stdout.
- Abort if a secret is detected.

## Future Modes

### Fixture Mode

- Uses mock export, manifest and mapping.
- Produces mock payload.
- No network.
- No Supabase.

### Private Build Mode

- Uses private files outside the repo.
- Produces private payload outside the repo.
- No network.
- No Supabase.
- Stdout is only a sanitized summary.

### Lab Insert Mode

- Separate later phase.
- Not designed in detail here.

## Future Stdout Report

The future builder should print only:

- `payloadBuildStatus`;
- `selectedItemsCount`;
- `payloadRowsCount`;
- `deferredItemsCount`;
- `excludedCollections`;
- `missingLocalRefsCount`;
- `noGoReasonsCount`;
- `outputFile`: `<outside-repository>` if applicable;
- `noSupabaseTouched`: `true`;
- `noInsertExecuted`: `true`;
- `nextRecommendedAction`.

## NO-GO Conditions

The future builder is `NO-GO` if:

- selected count is not `14`;
- deferred count is not `4`;
- a selected `localRef` is missing;
- payload includes a Data URL;
- payload includes playlist source data;
- payload includes gallery or playlist;
- identity mapping is missing;
- export is invalid;
- manifest is invalid;
- output would be inside the repo;
- Supabase is required;
- insert is attempted;
- secrets are detected;
- real content is printed to stdout or docs.

## Suggested Next Phase

Recommended next direction:

- create the payload builder script with sanitized fixtures only;
- audit it;
- then consider private local execution to generate payload outside the repo.

Still blocked:

- No real payload.
- No Supabase touch.
- No insert.
- No SQL creation or execution.
- No Dashboard or CLI use.
- No Storage.
- No runtime or app connection.
- No `.env.local`.
- No private content in Git or chat.
