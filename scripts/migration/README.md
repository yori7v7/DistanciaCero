# Migration Scripts

## Status

- Scope: mock-only plus private local export validator, private dry-run
  normalizer, private insert manifest generator and controlled insert preflight
  no-network script tested only with sanitized fixtures.
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
- Do not add real intimate content to fixtures.
- Do not use Supabase URL, keys, tokens, passwords, service-role or project refs.
- Do not read `.env.local`.
- Do not read browser LocalStorage.
- Do not use these scripts to validate real data.
- Keep real snapshots and private reports outside the repo.
