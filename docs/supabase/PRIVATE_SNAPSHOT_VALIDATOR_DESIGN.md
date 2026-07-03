# Private Snapshot Validator Design

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Implemented: initial local-only script created in S4.6.5.4.
- Script created: yes, `scripts/migration/validate-private-local-export.mjs`.
- Private export read: no.
- Real snapshot generated: no.
- Real LocalStorage read: no.
- Supabase touched: no.
- App connection: none.
- Storage touched: no.
- Private dry-run normalizer design documented: yes, in
  `PRIVATE_DRY_RUN_NORMALIZER_DESIGN.md`.

## Purpose

This document designs a future private validator for manual JSON exports from
the Centro del Universo backup UI.

The future validator should:

- Validate a manual v2 export stored outside the repo.
- Decide whether the export can become the basis for a migration snapshot.
- Report counts by section.
- Report risks without printing intimate content.
- Detect embedded media or Data URLs.
- Detect `timeline.date` values that are not `YYYY-MM-DD`.
- Detect missing author or identity metadata.
- Detect empty or partial sections.
- Detect possible duplicates.
- Detect secrets and private paths.
- Produce sanitized output for human review.

## Conceptual Future Script

Tentative name:

```txt
validate-private-local-export.mjs
```

Status:

- Created in S4.6.5.4.
- Tested only with sanitized fixtures inside the repo.
- Do not run it on a private real export until a separate review phase approves
  that.
- It may live in `scripts/migration/` only if it does not store or print real
  data.
- It must accept an explicit local file path outside the repo.
- It must reject remote URLs.
- It must produce only a sanitized summary.

## Expected Future Input

The future input is:

- A JSON file exported manually from the Centro del Universo UI.
- Expected `version`: `2`.
- Expected `source`: Distancia Cero / Centro del Universo, or equivalent.
- Stored outside the repo.
- Passed by explicit local path.
- Not pasted in chat.
- Not committed.

## Expected Sections

The future validator should require or inspect:

- `content.monthlyLetters`
- `content.openWhenLetters`
- `content.reasons`
- `content.promises`
- `content.importantDates`
- `content.futureDreams`
- `content.timeline`
- `content.blackHoleGallery`
- `content.playlist`
- `overrides`
- `hidden`

## Structural Validations

The future validator should confirm:

- JSON parses successfully.
- `version` exists and is compatible.
- `exportedAt` exists.
- `content` exists.
- Each expected content collection exists as an array.
- `overrides` exists.
- `hidden` exists.
- Local IDs exist where required.
- Minimum fields per type exist.
- `content[].content` arrays are arrays where applicable.
- `content[].details` arrays are arrays where applicable.
- Empty export is `CHECK`, not a migration-complete `PASS`.
- Partial content is `CHECK`.
- Broken structure is `NO-GO`.

## Date Validations

Rules:

- `timeline.date` should accept `YYYY-MM-DD`.
- `importantDates.date` should be `YYYY-MM-DD` for new or updated local items
  after the local export warning fix.
- Remaining legacy or human-readable important dates should be classified under
  documented validation rules.
- `timeline.date` without a year should be `CHECK` or `NO-GO` depending on
  severity.
- `timeline.date` that looks forced or invalid should be reported.
- The validator must not invent `2026`.
- The validator must not normalize destructively.

## Identity Validations

Expected identity values are local synthetic identifiers or equivalent
placeholders, such as:

- `local-owner_a`
- `local-owner_b`
- `owner_a`
- `owner_b`

Rules:

- Legacy items without author metadata should be `CHECK`.
- Unknown authors should be `CHECK`.
- Missing identity on newly-created items should be `CHECK`.
- The report must not print real names or intimate content.

## Media Validations

The future validator should detect embedded media risk in
`blackHoleGallery.image` and any other string field that appears to contain
embedded media.

It must not print media values.

It may report only:

- `dataUrlCount`
- `approximateLargeMediaCount`
- `mediaRequiresStorageLater: yes/no`

Rules:

- Real media must stay outside the repo.
- Storage remains blocked.

## Anti-Secret Validations

The future validator should abort or sanitize if it detects:

- Real Supabase URL.
- Realistic project ref.
- Real `sb_publishable_*` value.
- JWT-like token.
- `service_role` or service-role used as a secret value.
- Real password.
- Real UUID.
- Personal real email other than `example.invalid`.
- Private absolute path.
- `access_token` or `refresh_token`.
- Common API keys.
- OAuth tokens.

## Output Privacy

The future report must not print:

- Full letters.
- Full reasons.
- Full promises.
- Full descriptions.
- Embedded media values.
- Absolute paths.
- Secrets.
- Full JSON payload.

The future report may print:

- Counts.
- Collection names.
- `PASS`, `CHECK`, `NO-GO` or `BLOCKED`.
- Warning count.
- Error count.
- Sanitized or truncated IDs if needed.
- Risk summary.
- Recommended next action.

## Classification

- `PASS`: valid structure, coherent counts, no secrets, no blockers, and enough
  coverage for the next private phase.
- `CHECK`: valid but partial, empty, legacy-without-author, media-risk, optional
  gaps or reviewable warnings.
- `NO-GO`: invalid JSON, incompatible structure, critical fields missing,
  invalid timeline dates or critical count mismatch.
- `ABORTED security`: secrets, private absolute paths, sensitive values or
  unsafe output risk.
- `BLOCKED`: unrecognized format or insufficient information to decide.

## Future Exit Codes

| Exit code | Result | Meaning |
| --- | --- | --- |
| 0 | `PASS` | Private export is valid enough for next private phase. |
| 1 | `NO-GO` | Private export is invalid, incompatible or unsafe. |
| 2 | `CHECK` | Private export is valid with review warnings. |
| 3 | `BLOCKED` | Format or decision data is insufficient. |
| 4 | `ABORTED security` | Security rules stopped execution. |
| 5 | `invalid usage` | Arguments or mode are unsupported. |

## Relationship To Mock Scripts

- The future private validator does not replace `migration:mock`.
- `migration:mock` continues validating toy fixtures only.
- `validate-private-local-export.mjs` is intended to validate one private real
  export outside the repo after a separate script review phase approves that.
- Neither path should touch Supabase.
- Neither path should insert data.

## Future Implementation NO-GO

Future implementation is `NO-GO` if it:

- Requires Supabase.
- Reads `.env.local`.
- Reads LocalStorage directly without an approved phase.
- Prints intimate content.
- Saves reports with real content inside the repo.
- Accepts remote URLs.
- Prints embedded media values.
- Lacks clear exit codes.
- Requires new dependencies without a plan.

## Suggested Next Phase

Suggested next phase:

- Create `dry-run-private-local-export.mjs` using sanitized fixtures only.
- Confirm it remains local-only and prints only sanitized output.
- Do not run it on a private real export until a separate script audit passes.

Still blocked:

- No real snapshot generated.
- No real LocalStorage read by scripts.
- No dry-run with private data.
- No insert.
- No Supabase, SQL, Dashboard, CLI, Storage, `.env.local`, runtime or app
  connection.
