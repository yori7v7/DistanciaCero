# Migration Scripts

## Status

- Scope: mock-only plus private local export validator, private dry-run
  normalizer, private insert manifest generator, controlled insert preflight
  no-network script, private insert payload builder and controlled lab insert
  executor fixture/no-network script tested only with sanitized fixtures.
- Network: none.
- Supabase: none.
- `.env.local`: not read.
- LocalStorage real data: not read.
- Real data: not allowed.
- Private real export: not read by repo tests.
- Production migration: not supported.

## Current Scripts

`validate-mock-snapshot.mjs` validates sanitized toy snapshots only.
It accepts explicit local file paths, rejects remote URLs and redacts
outside-repository paths in output.

`dry-run-mock-snapshot.mjs` transforms sanitized toy snapshots into sanitized
mock dry-run reports printed to stdout. It does not write report files.

`run-mock-migration-checks.mjs` runs the expected mock validator and mock
dry-run cases, then reports sanitized PASS/FAIL exit-code checks.

`validate-private-local-export.mjs` validates a Centro del Universo export v2
from an explicit local JSON path. It is local-only, rejects remote URLs, redacts
outside-repository paths and prints only a sanitized summary. In-repo tests use
sanitized fixtures only; do not run it against a private real export until a
separate review phase approves that.

`dry-run-private-local-export.mjs` normalizes a Centro del Universo export v2
into a sanitized dry-run report of planned `content_items` operations. It is
local-only, rejects remote URLs, redacts outside-repository paths, does not
write files and does not print full content, Data URLs or playlist URLs. In-repo
tests use sanitized fixtures only; do not run it against a private real export
until a separate review phase approves that.

`generate-private-insert-manifest.mjs` reads a sanitized dry-run report and
prints a sanitized insert manifest to stdout. It is local-only, rejects remote
URLs, redacts outside-repository paths, does not write files, does not insert
data and does not print payloads, Data URLs, full URLs or private paths. In-repo
tests use sanitized fixtures only; do not run it against the private real
dry-run result until a separate review phase approves that.

`preflight-private-lab-insert.mjs` validates a sanitized private insert
manifest plus a sanitized identity mapping before any future controlled insert.
It is preflight/no-network only: it rejects remote URLs, requires explicit
confirmation flags, does not write files, does not touch Supabase and does not
insert data. In-repo tests use sanitized fixtures only; do not run it against a
private real manifest until a separate review phase approves that.

`build-private-insert-payload.mjs` reads a sanitized export v2 fixture, a
sanitized insert manifest fixture and a sanitized identity mapping fixture,
then builds conceptual `content_items` rows in memory and prints only a
sanitized summary. It is local-only, rejects remote URLs, does not write files,
does not print payloads, does not touch Supabase and does not insert data.
Data URLs in deferred/excluded collections are allowed to exist in the input
export, but selected items with Data URLs or full URLs remain `NO-GO` and are
never printed. If a sanitized manifest uses an identity placeholder, the
builder resolves local identity only from selected export item metadata such as
`createdBy`, `updatedBy`, `created_by`, `updated_by`, `metadata`, `author`,
`identity` or `localIdentity`; stdout reports only identity counts/status and
never prints private identity metadata.

Optional output writing is available only with:

```powershell
node scripts/migration/build-private-insert-payload.mjs <export-v2.json> <manifest.json> <identity-mapping.json> --out <outside-repository-output.json> --confirm-write-private-output
```

The output path must be a local file outside the repository, must not be remote
and must have an existing parent directory. Stdout still prints only a
sanitized summary with `outputFile: <outside-repository>` and never prints the
payload. The written file is lab-only, not production, contains only the 14
`content_items` rows, and excludes media, playlist, Storage and
`content_events`.
In-repo tests use sanitized fixtures only; do not run it against private real
export/manifest/mapping files until a separate review phase approves that.

`execute-controlled-lab-insert.mjs` validates a lab-only mock private payload
and simulates the first controlled insert plan in `fixture-no-network` mode
only. It requires explicit no-Supabase/no-insert/lab-only flags, rejects remote
URLs, reads one local payload file, writes nothing, touches no Supabase and
always reports `insertedRowsCount: 0`. In-repo tests use sanitized fixtures
only; do not run it against the private real payload until a separate review
phase approves private payload validate/no-write mode.

Run examples:

```powershell
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-pass.json
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-check.json
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-nogo.json
node scripts/migration/dry-run-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-pass.json
node scripts/migration/dry-run-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-check.json
node scripts/migration/dry-run-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-nogo.json
node scripts/migration/run-mock-migration-checks.mjs
node scripts/migration/validate-private-local-export.mjs scripts/migration/fixtures/mock-local-export-pass.json
node scripts/migration/validate-private-local-export.mjs scripts/migration/fixtures/mock-local-export-check-empty.json
node scripts/migration/validate-private-local-export.mjs scripts/migration/fixtures/mock-local-export-nogo.json
node scripts/migration/dry-run-private-local-export.mjs scripts/migration/fixtures/mock-local-export-pass.json
node scripts/migration/dry-run-private-local-export.mjs scripts/migration/fixtures/mock-local-export-check-empty.json
node scripts/migration/dry-run-private-local-export.mjs scripts/migration/fixtures/mock-local-export-nogo.json
node scripts/migration/dry-run-private-local-export.mjs scripts/migration/fixtures/mock-local-export-check-media-playlist.json
node scripts/migration/generate-private-insert-manifest.mjs scripts/migration/fixtures/mock-private-dry-run-result-check.json
node scripts/migration/generate-private-insert-manifest.mjs scripts/migration/fixtures/mock-private-dry-run-result-nogo.json
node scripts/migration/preflight-private-lab-insert.mjs scripts/migration/fixtures/mock-private-insert-manifest-check.json scripts/migration/fixtures/mock-private-identity-mapping-confirmed.json --confirm-lab-disposable --confirm-no-production --confirm-no-storage --confirm-no-insert
node scripts/migration/build-private-insert-payload.mjs scripts/migration/fixtures/mock-private-local-export-v2-selected.json scripts/migration/fixtures/mock-private-insert-manifest-check.json scripts/migration/fixtures/mock-private-identity-mapping-confirmed.json
node scripts/migration/build-private-insert-payload.mjs scripts/migration/fixtures/mock-private-local-export-v2-selected.json scripts/migration/fixtures/mock-private-insert-manifest-check.json scripts/migration/fixtures/mock-private-identity-mapping-confirmed.json --out <outside-repository-output.json> --confirm-write-private-output
node scripts/migration/execute-controlled-lab-insert.mjs scripts/migration/fixtures/mock-controlled-lab-insert-payload-pass.json --mode fixture-no-network --confirm-no-supabase --confirm-no-insert --confirm-lab-only
```

NPM shortcuts:

```powershell
npm run migration:mock
npm run migration:mock:validate
npm run migration:mock:dry-run
```

These commands are convenience wrappers for mock-only checks. They do not use
network access, Supabase, `.env.local`, browser LocalStorage or real data, and
they do not insert anything. They do not replace future real snapshot, dry-run
or migration tests.

Expected fixture results:

- `mock-snapshot-pass.json`: `PASS`, exit `0`.
- `mock-snapshot-check.json`: `CHECK`, exit `2`.
- `mock-snapshot-nogo.json`: `NO-GO`, exit `1`.
- `mock-local-export-pass.json`: `PASS`, exit `0`.
- `mock-local-export-check-empty.json`: `CHECK`, exit `2`.
- `mock-local-export-nogo.json`: `NO-GO`, exit `1`.
- `mock-local-export-check-media-playlist.json`: `CHECK`, exit `2`.
- `mock-private-dry-run-result-check.json`: `CHECK`, exit `2`.
- `mock-private-dry-run-result-nogo.json`: `NO-GO`, exit `1`.
- `mock-private-insert-manifest-check.json` with confirmed identity mapping:
  `PASS`, exit `0`.
- `mock-private-identity-mapping-missing.json`: `NO-GO`, exit `1`.
- `mock-private-insert-manifest-nogo-selected-media.json`: `NO-GO`, exit `1`.
- `mock-private-local-export-v2-selected.json` with confirmed identity mapping:
  `PASS`, exit `0`, `payloadRowsCount` `14`, `identityResolvedCount` `14`,
  `outputWritten` `false` without `--out`.
- `mock-private-local-export-v2-placeholder-identity.json` with a manifest
  identity placeholder and confirmed mapping: `PASS`, exit `0`,
  `payloadRowsCount` `14`, `identityResolvedCount` `14`.
- `mock-private-local-export-v2-missing-identity.json` with a manifest identity
  placeholder: `NO-GO`, exit `1`, `identity_mapping_missing`.
- `mock-private-local-export-v2-missing-selected.json`: `NO-GO`, exit `1`.
- `mock-private-insert-payload-expected-summary.json`: sanitized expected
  summary only; it contains no full payload.
- Deferred media Data URLs are expected to stay outside payload v1; selected
  item Data URLs and selected item URLs remain blocking.
- Optional `--out` fixture tests should write only to a temporary path outside
  the repo and remove the mock output afterward.
- `mock-controlled-lab-insert-payload-pass.json`: `PASS`, exit `0`,
  `plannedRowsCount` `14`, `insertedRowsCount` `0`.
- `mock-controlled-lab-insert-payload-nogo-row-count.json`: `NO-GO`, exit `1`.
- `mock-controlled-lab-insert-payload-nogo-media.json`: `NO-GO`, exit `1`.
- `mock-controlled-lab-insert-payload-nogo-production.json`: `NO-GO`, exit `1`.

The smoke runner should exit `0` when all expected mock-only exit codes match.

## Safety Rules

- Do not use this for a real migration.
- Do not point mock scripts at real snapshots.
- Do not run the private export validator on a real private export until a
  separate review phase approves it.
- Do not run the private dry-run normalizer on a real private export until a
  separate review phase approves it.
- Do not run the private insert manifest generator on a private real dry-run
  result until a separate review phase approves it.
- Do not run the controlled insert preflight script on a private real manifest
  until a separate review phase approves it.
- Do not run the private insert payload builder on a private real export,
  manifest or mapping until a separate review phase approves it.
- Do not run the controlled lab insert executor against a private real payload
  until a separate review phase approves private payload validate/no-write mode.
- Do not add real intimate content to fixtures.
- Do not use Supabase URL, keys, tokens, passwords, service-role or project refs.
- Do not read `.env.local`.
- Do not read browser LocalStorage.
- Do not use these scripts to validate real data.
- Keep real snapshots and private reports outside the repo.
