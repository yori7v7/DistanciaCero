# Migration Scripts

## Status

- Scope: mock-only.
- Network: none.
- Supabase: none.
- `.env.local`: not read.
- LocalStorage real data: not read.
- Real data: not allowed.
- Production migration: not supported.

## Current Scripts

`validate-mock-snapshot.mjs` validates sanitized toy snapshots only.
It accepts explicit local file paths, rejects remote URLs and redacts
outside-repository paths in output.

`dry-run-mock-snapshot.mjs` transforms sanitized toy snapshots into sanitized
mock dry-run reports printed to stdout. It does not write report files.

`run-mock-migration-checks.mjs` runs the expected mock validator and mock
dry-run cases, then reports sanitized PASS/FAIL exit-code checks.

Run examples:

```powershell
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-pass.json
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-check.json
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-nogo.json
node scripts/migration/dry-run-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-pass.json
node scripts/migration/dry-run-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-check.json
node scripts/migration/dry-run-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-nogo.json
node scripts/migration/run-mock-migration-checks.mjs
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

The smoke runner should exit `0` when all expected mock-only exit codes match.

## Safety Rules

- Do not use this for a real migration.
- Do not point it at real snapshots.
- Do not add real intimate content to fixtures.
- Do not use Supabase URL, keys, tokens, passwords, service-role or project refs.
- Do not read `.env.local`.
- Do not read browser LocalStorage.
- Do not use these scripts to validate real data.
- Keep real snapshots and private reports outside the repo.
