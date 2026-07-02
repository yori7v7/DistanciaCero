# Migration Scripts

## Status

- Scope: mock-only.
- Network: none.
- Supabase: none.
- `.env.local`: not read.
- LocalStorage real data: not read.
- Real data: not allowed.
- Production migration: not supported.

## Current Script

`validate-mock-snapshot.mjs` validates sanitized toy snapshots only.

Run examples:

```powershell
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-pass.json
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-check.json
node scripts/migration/validate-mock-snapshot.mjs scripts/migration/fixtures/mock-snapshot-nogo.json
```

Expected fixture results:

- `mock-snapshot-pass.json`: `PASS`, exit `0`.
- `mock-snapshot-check.json`: `CHECK`, exit `2`.
- `mock-snapshot-nogo.json`: `NO-GO`, exit `1`.

## Safety Rules

- Do not use this for a real migration.
- Do not point it at real snapshots.
- Do not add real intimate content to fixtures.
- Do not use Supabase URL, keys, tokens, passwords, service-role or project refs.
- Do not read `.env.local`.
- Do not read browser LocalStorage.
- Keep real snapshots and private reports outside the repo.
