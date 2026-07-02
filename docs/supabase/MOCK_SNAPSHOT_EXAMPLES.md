# Mock Snapshot Examples

## Status

- Status: SANITIZED DOCUMENTARY EXAMPLES ONLY.
- Real data: no.
- Real snapshot generated: no.
- Real LocalStorage read: no.
- Script created: no.
- Dry-run executed: no.
- Insert executed: no.
- Supabase touched: no.
- Runtime touched: no.
- App connection: none.
- Production-ready: no.

## Purpose

These examples document small sanitized shapes that future validators and
scripts may use as references.

They are meant to show:

- A minimal valid snapshot.
- A snapshot that should produce `CHECK` warnings.
- A snapshot fragment that should produce `NO-GO`.
- A sanitized dry-run report.
- A human-readable sanitized summary.

These examples are not real snapshots, not fixtures and not migration payloads.

## Example Rules

- Use placeholders.
- Do not use real intimate content.
- Do not use real URLs.
- Do not use keys, tokens or passwords.
- Do not use real UUIDs.
- Do not use personal real emails.
- Do not use private absolute paths.
- Do not represent real media.
- Do not represent real Ale/Yori data except generic mock placeholders.
- Do not insert these examples into Supabase.

## Example A: Minimal Snapshot PASS

Conceptual JSON only. This is a minimal sanitized example with coherent counts
and no warnings.

```json
{
  "snapshotVersion": "local-snapshot-v1",
  "exportedAt": "<ISO_TIMESTAMP>",
  "source": {
    "app": "distancia-cero",
    "runtime": "local",
    "storage": "localStorage",
    "exportMode": "mock-example"
  },
  "relationshipSpaceHint": {
    "localSpaceKey": "mock-space-alpha",
    "remoteSpaceHint": "<PRIVATE_MAPPING_REQUIRED>"
  },
  "identities": [
    {
      "localIdentityKey": "mock-profile-yori",
      "displayName": "<DISPLAY_NAME_PLACEHOLDER>",
      "roleHint": "owner",
      "remoteProfileHint": "<PRIVATE_MAPPING_REQUIRED>"
    },
    {
      "localIdentityKey": "mock-profile-ale",
      "displayName": "<DISPLAY_NAME_PLACEHOLDER>",
      "roleHint": "partner",
      "remoteProfileHint": "<PRIVATE_MAPPING_REQUIRED>"
    }
  ],
  "content": {
    "monthlyLetters": [],
    "openWhenLetters": [],
    "reasons": [
      {
        "localId": "mock-reason-001",
        "type": "reason",
        "collection": "reasons",
        "source": "mock",
        "createdBy": "mock-profile-yori",
        "updatedBy": "mock-profile-yori",
        "order": 1,
        "data": {
          "title": "<MOCK_REASON_TITLE>",
          "body": "<MOCK_REASON_BODY>"
        }
      }
    ],
    "promises": [
      {
        "localId": "mock-promise-001",
        "type": "promise",
        "collection": "promises",
        "source": "mock",
        "createdBy": "mock-profile-ale",
        "updatedBy": "mock-profile-ale",
        "order": 1,
        "data": {
          "title": "<MOCK_PROMISE_TITLE>",
          "status": "planned"
        }
      }
    ],
    "importantDates": [
      {
        "localId": "mock-date-001",
        "type": "importantDate",
        "collection": "importantDates",
        "source": "mock",
        "createdBy": "mock-profile-yori",
        "updatedBy": "mock-profile-yori",
        "order": 1,
        "data": {
          "title": "<MOCK_DATE_TITLE>",
          "date": "<ISO_DATE_PLACEHOLDER>"
        }
      }
    ],
    "wishlist": [],
    "diary": [],
    "blackHoleGallery": [],
    "playlist": []
  },
  "media": [],
  "localState": {
    "hidden": [],
    "locked": [],
    "unlocked": [],
    "restored": [],
    "edited": [],
    "legacyIds": []
  },
  "counts": {
    "identities": 2,
    "monthlyLetters": 0,
    "openWhenLetters": 0,
    "reasons": 1,
    "promises": 1,
    "importantDates": 1,
    "wishlist": 0,
    "diary": 0,
    "blackHoleGallery": 0,
    "playlist": 0,
    "media": 0,
    "hidden": 0,
    "locked": 0,
    "unlocked": 0,
    "restored": 0,
    "edited": 0,
    "legacyIds": 0
  },
  "warnings": []
}
```

Expected validation result: `PASS`.

## Example B: Snapshot CHECK With Warnings

Conceptual JSON only. This example has coherent counts, but requires human
review because it contains legacy identity ambiguity, media pending Storage and
a missing optional date.

```json
{
  "snapshotVersion": "local-snapshot-v1",
  "exportedAt": "<ISO_TIMESTAMP>",
  "statusHint": "CHECK",
  "source": {
    "app": "distancia-cero",
    "runtime": "local",
    "storage": "localStorage",
    "exportMode": "mock-example"
  },
  "relationshipSpaceHint": {
    "localSpaceKey": "mock-space-alpha",
    "remoteSpaceHint": "<PRIVATE_MAPPING_REQUIRED>"
  },
  "identities": [
    {
      "localIdentityKey": "mock-profile-yori",
      "displayName": "<DISPLAY_NAME_PLACEHOLDER>",
      "roleHint": "owner",
      "remoteProfileHint": "<PRIVATE_MAPPING_REQUIRED>"
    },
    {
      "localIdentityKey": "legacy-unknown",
      "displayName": "<UNKNOWN_LEGACY_AUTHOR>",
      "roleHint": "legacy",
      "remoteProfileHint": "<UNRESOLVED>"
    }
  ],
  "content": {
    "monthlyLetters": [],
    "openWhenLetters": [],
    "reasons": [
      {
        "legacyId": "legacy-reason-001",
        "type": "reason",
        "collection": "reasons",
        "source": "legacy",
        "createdBy": "legacy-unknown",
        "updatedBy": "mock-profile-yori",
        "order": 1,
        "data": {
          "title": "<MOCK_LEGACY_REASON_TITLE>",
          "body": "<MOCK_LEGACY_REASON_BODY>"
        }
      }
    ],
    "promises": [],
    "importantDates": [
      {
        "localId": "mock-date-missing-optional-001",
        "type": "importantDate",
        "collection": "importantDates",
        "source": "mock",
        "createdBy": "mock-profile-yori",
        "updatedBy": "mock-profile-yori",
        "order": 1,
        "data": {
          "title": "<MOCK_DATE_TITLE>",
          "date": "<MISSING_OPTIONAL_DATE>"
        }
      }
    ],
    "wishlist": [],
    "diary": [],
    "blackHoleGallery": [],
    "playlist": []
  },
  "media": [
    {
      "localRef": "mock-media-ref-001",
      "type": "image",
      "title": "<MOCK_MEDIA_TITLE>",
      "storageStatus": "not_uploaded",
      "notes": "<SANITIZED_MEDIA_PENDING_STORAGE>"
    }
  ],
  "localState": {
    "hidden": [],
    "locked": [],
    "unlocked": [],
    "restored": [],
    "edited": [],
    "legacyIds": ["legacy-reason-001"]
  },
  "counts": {
    "identities": 2,
    "monthlyLetters": 0,
    "openWhenLetters": 0,
    "reasons": 1,
    "promises": 0,
    "importantDates": 1,
    "wishlist": 0,
    "diary": 0,
    "blackHoleGallery": 0,
    "playlist": 0,
    "media": 1,
    "hidden": 0,
    "locked": 0,
    "unlocked": 0,
    "restored": 0,
    "edited": 0,
    "legacyIds": 1
  },
  "warnings": [
    {
      "type": "unmapped_author",
      "localRef": "legacy-reason-001",
      "message": "<SANITIZED_WARNING_LEGACY_AUTHOR_REQUIRES_REVIEW>"
    },
    {
      "type": "media_pending_storage",
      "localRef": "mock-media-ref-001",
      "message": "<SANITIZED_WARNING_STORAGE_OUT_OF_SCOPE>"
    },
    {
      "type": "missing_date",
      "localRef": "mock-date-missing-optional-001",
      "message": "<SANITIZED_WARNING_OPTIONAL_DATE_MISSING>"
    }
  ]
}
```

Expected validation result: `CHECK`.

## Example C: Snapshot NO-GO

Conceptual fragment only. This shape should be rejected before any dry-run.

```json
{
  "snapshotVersion": "local-snapshot-v1",
  "exportedAt": "<ISO_TIMESTAMP>",
  "content": {
    "reasons": [
      {
        "localId": "mock-unknown-001",
        "type": "unknownTypeWithoutMapping",
        "collection": "reasons",
        "createdBy": "<UNRESOLVED_IDENTITY>",
        "data": {
          "title": "<MOCK_TITLE>",
          "body": "<MOCK_BODY>"
        }
      }
    ]
  },
  "counts": {
    "reasons": 3
  },
  "warnings": [
    {
      "type": "secret_placeholder_detected",
      "localRef": "mock-unknown-001",
      "message": "<SECRET_PLACEHOLDER_DETECTED_DO_NOT_USE_REAL_SECRET>"
    }
  ]
}
```

Expected validation result: `NO-GO`.

Reasons:

- Counts are inconsistent: one reason item is present, but `counts.reasons` is
  `3`.
- Content type has no mapping.
- Identity is unresolved.
- Secret placeholder category is present and must fail if it is ever replaced
  by a real secret.

## Example D: Dry-Run Report PASS/CHECK

Conceptual JSON only. This report is sanitized and does not contain full
payloads or intimate content.

```json
{
  "reportVersion": "migration-dry-run-report-v1",
  "generatedAt": "<ISO_TIMESTAMP>",
  "sourceSnapshotVersion": "local-snapshot-v1",
  "validationStatus": "PASS",
  "dryRunStatus": "CHECK",
  "counts": {
    "totalInputItems": 3,
    "totalValidItems": 3,
    "totalSkippedItems": 0,
    "totalWarnings": 1,
    "totalConflicts": 0,
    "totalDuplicateCandidates": 0,
    "totalMediaPendingStorage": 1,
    "byContentType": {
      "reasons": 1,
      "promises": 1,
      "importantDates": 1
    },
    "byRemoteTable": {
      "profiles": 0,
      "relationship_spaces": 0,
      "universe_members": 0,
      "content_items": 3,
      "content_events": 3,
      "media_assets": 0
    },
    "byOperationType": {
      "insert": 3,
      "update": 0,
      "skip": 0,
      "manual_review": 1
    }
  },
  "plannedOperations": [
    {
      "operation": "insert",
      "remoteTable": "content_items",
      "remoteType": "reason",
      "localSource": "mock",
      "localRef": "mock-reason-001",
      "status": "PASS",
      "reason": "<SANITIZED_REASON_READY_FOR_REVIEW>",
      "warningsCount": 0,
      "requiresHumanReview": false
    },
    {
      "operation": "insert",
      "remoteTable": "content_items",
      "remoteType": "promise",
      "localSource": "mock",
      "localRef": "mock-promise-001",
      "status": "PASS",
      "reason": "<SANITIZED_REASON_READY_FOR_REVIEW>",
      "warningsCount": 0,
      "requiresHumanReview": false
    },
    {
      "operation": "manual_review",
      "remoteTable": "content_items",
      "remoteType": "importantDate",
      "localSource": "mock",
      "localRef": "mock-date-001",
      "status": "CHECK",
      "reason": "<SANITIZED_REASON_DATE_REQUIRES_REVIEW>",
      "warningsCount": 1,
      "requiresHumanReview": true
    }
  ],
  "skippedItems": [],
  "warnings": [
    {
      "type": "media_pending_storage",
      "localRef": "mock-media-ref-001",
      "message": "<SANITIZED_WARNING_STORAGE_OUT_OF_SCOPE>"
    }
  ],
  "conflicts": [],
  "duplicateCandidates": [],
  "identityMapping": [
    {
      "localIdentityKey": "mock-profile-yori",
      "remoteProfileHint": "<PRIVATE_MAPPING_REQUIRED>",
      "status": "resolved-in-private-mapping"
    },
    {
      "localIdentityKey": "mock-profile-ale",
      "remoteProfileHint": "<PRIVATE_MAPPING_REQUIRED>",
      "status": "resolved-in-private-mapping"
    }
  ],
  "mediaPending": [
    {
      "localRef": "mock-media-ref-001",
      "type": "image",
      "storageStatus": "not_uploaded",
      "reason": "<SANITIZED_STORAGE_DECISION_REQUIRED>",
      "requiredFutureDecision": "storage_phase_required"
    }
  ],
  "unmappedFields": [],
  "noGoReasons": [],
  "nextRecommendedAction": "human_review_before_any_insert"
}
```

Expected report result: `CHECK`, because a human decision is still required
before any insert planning.

## Human Markdown Summary Example

```md
## Migration Dry-Run Summary

- Result: CHECK
- Total input items: 3
- Valid items: 3
- Skipped items: 0
- Warnings: 1
- Conflicts: 0
- Duplicate candidates: 0
- Media pending Storage: 1
- Pending human decisions: review date handling and Storage scope
- Next recommended action: human review before any insert
```

This summary intentionally avoids full content bodies, private paths, secrets,
real URLs, real UUIDs, personal real emails and media payloads.

## Relationship With Future Scripts

- These examples are not real fixtures.
- These examples must not be inserted.
- These examples may be used as references for future tests, mocks or
  validators.
- Real snapshots must stay outside the repo if they contain intimate content.
- S4.6.4.48 creates a mock-only validator and sanitized fixture JSON files under
  `scripts/migration/`. They remain toy examples and must not be treated as
  real snapshots or migration payloads.

## NO-GO

This document or any future example is `NO-GO` if:

- A real datum appears.
- A secret appears.
- A private absolute path appears.
- An example looks executable as a real migration.
- The documentation suggests inserting these examples into Supabase.
- A real JSON file is created outside this Markdown document.
- Any example requires Supabase, SQL, Storage, runtime or app connection.

## Suggested Next Phase

Suggested next phase:

- Script implementation planning is now documented in
  `SCRIPT_IMPLEMENTATION_PLAN.md`.
- The first mock-only validator script now exists with extremely limited scope.
- Next suggested phase: review validator outputs and decide whether to expand
  mock-only validation coverage.
- Still no runtime changes.
- Still no real data.
- Still no Supabase, CLI, Dashboard, SQL, Storage or `.env.local` changes.
- Still no real snapshot generation, LocalStorage read, dry-run or insert.

## Non-Goals

- No script implementation.
- No real JSON file creation.
- No real snapshot generation.
- No real LocalStorage read.
- No data export.
- No dry-run execution.
- No data insert.
- No SQL change.
- No SQL execution.
- No Supabase Dashboard or CLI work.
- No `.env.local` changes.
- No private file changes.
- No Storage work.
- No runtime changes.
- No `src` changes.
- No app connection.
- No production readiness claim.
