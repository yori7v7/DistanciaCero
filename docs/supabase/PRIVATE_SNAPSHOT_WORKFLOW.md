# Private Snapshot Workflow

## Status

- Status: DOCUMENTARY DESIGN ONLY.
- Real snapshot generated: no.
- Real LocalStorage read by scripts: no.
- Real data in repo: no.
- Real data in chat: no.
- Supabase touched: no.
- App connection: none.
- Storage touched: no.
- Private snapshot validator design documented: yes, in
  `PRIVATE_SNAPSHOT_VALIDATOR_DESIGN.md`.
- Private dry-run normalizer design documented: yes, in
  `PRIVATE_DRY_RUN_NORMALIZER_DESIGN.md`.

## Objective

This workflow defines how to obtain a future real local export privately without
placing intimate content in Git or chat.

It exists to:

- Keep intimate content outside the repo.
- Keep images, Data URLs and local media outside the repo when applicable.
- Prepare a private input for future local validation.
- Prevent Supabase work until private validation, normalization, dry-run and
  human review pass.
- Keep the app disconnected while snapshot preparation remains local.

## Recommended Source

Use the existing backup UI in `CentroUniversoSection`.

The recommended source is a manual JSON v2 export from the app UI. Do not add a
script that reads real LocalStorage yet, and do not paste the exported JSON into
chat.

## Private Location

Store the future export in a private folder outside the repo, represented only
as:

```txt
<private-snapshot-folder>
```

Rules:

- Do not write real absolute private paths in docs.
- Do not store real snapshots in Git.
- Do not upload real snapshots to chat.
- Do not upload real snapshots to Supabase yet.
- Keep any private mapping outside Git and chat.

## Suggested Filename

Use a private filename like:

```txt
distancia-cero-local-export-private-YYYY-MM-DD.json
```

This is a placeholder convention only. This phase does not create the file. The
real file may contain intimate content and must remain private.

## Future Manual Procedure

When a future phase explicitly approves manual export:

1. Open the local app.
2. Go to Centro del Universo / respaldo.
3. Export the local JSON backup.
4. Save it in `<private-snapshot-folder>` outside the repo.
5. Do not open or paste the full content into chat.
6. Do not commit the export.
7. Do not upload it to Supabase.
8. Report only a sanitized status:
   - `file_created: yes/no`
   - `location: outside repo`
   - `approx_size: optional`
   - `pasted_in_chat: no`
   - `committed: no`
   - `supabase_touched: no`

## Current Export Coverage

The current UI export is a backup JSON v2 with:

- `content`
- `overrides`
- `hidden`

It covers the main editable collections:

- monthly letters
- open when letters
- reasons
- promises
- important dates
- wishlist / `futureDreams`
- diary / `timeline`
- black-hole gallery
- playlist

## Not Covered Or Separate

The current export does not fully cover, or may keep separate:

- opened/read state
- simulation unlock
- identity selector
- theme
- active scene
- scene music UI state
- proposal answer
- missions progress
- complete base JSON
- legacy per-letter opened keys
- real media or Data URLs as a migration-ready asset plan

Metadata such as `createdBy` and `updatedBy` travels only when it already exists
inside local items. It does not automatically cover base JSON, overrides,
hidden IDs, opened/read state, simulation state or legacy letter content.

## Risks

- The export can contain intimate content.
- Black-hole gallery entries can contain Data URLs.
- Media is not ready for Storage.
- Legacy monthly/openWhen content can lack authorship metadata.
- Base JSON and local backup data are separate sources.
- Overrides can duplicate or shadow base content.
- Playlist entries can include routes or external links.
- The backup JSON v2 must not be used directly as a remote payload.

## Future Validation Path

The future path should stay local and private:

1. Validate the private export structure.
2. Normalize it into a migration snapshot shape.
3. Run a local no-network dry-run.
4. Produce a sanitized report.
5. Perform human review.
6. Keep Supabase blocked until a later explicit gate.

## Privacy Rules

- Do not paste real JSON in chat.
- Do not commit real exports.
- Do not store intimate content in docs.
- Do not upload media or Data URLs.
- Share only counts, status and sanitized summaries.
- If content review is needed, review it locally and share only the result.

## NO-GO Criteria

Stop if any of these occur:

- Real export is inside the repo.
- Real JSON is pasted in chat.
- Data URLs or intimate content appear in docs.
- `.env.local` is touched.
- Supabase is touched.
- Storage is touched.
- A script reads real LocalStorage without a separately approved phase.
- Real dry-run or insert is attempted before validation.
- service-role appears in frontend or runtime.

## Suggested Next Phase

Choose one separately approved phase:

- Create `dry-run-private-local-export.mjs` with local-only scope and sanitized
  output.
- First test it only with fixtures mock/sanitized inside the repo.
- Do not run it on a private real export until the script is reviewed.

Do not execute this path without explicit approval.
