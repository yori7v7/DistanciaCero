# S4.6.4.9 Synthetic Fixture Apply Dry Review

Status: DRY REVIEW ONLY
Scope: disposable Supabase lab only
Runtime impact: none
App connection: none
Storage: untouched
Fixtures: not applied
Reset: not applied
SQL executed: none
RLS end-to-end: not tested yet
Production readiness: no

## 1. Purpose

This phase reviews the synthetic fixture plan and draft documentally before any
future manual application. It does not execute SQL, does not modify SQL and does
not convert any draft into an applicable migration.

Fixture apply remains blocked until a future explicit manual apply phase is
approved.

## 2. Reviewed Files

- `synthetic_fixture_plan.sql`
- `synthetic_fixture_apply_draft.sql`
- `synthetic_reset_draft.sql`
- `SYNTHETIC_FIXTURE_MAPPING_PREFLIGHT.md`
- `SUPABASE_POST_AUTH_USERS_LAB_RESULT.md`
- `schema_draft.sql`
- `rls_draft.sql`

## 3. Confirmed Prior State

- Schema draft was applied manually in the disposable lab.
- RLS draft was applied manually in the disposable lab.
- Four synthetic Auth users were created manually.
- Real mapping remains private and outside the repo.
- The app remains disconnected.
- Storage remains untouched.
- Fixtures were not applied.
- Reset was not applied.
- RLS end-to-end was not tested.

## 4. Security Rules

- Do not save real UUIDs in Git.
- Do not paste real UUIDs in chat.
- Do not save real project ref.
- Do not save passwords.
- Do not save tokens or keys.
- Do not use service-role.
- Do not use real data.
- Do not use Ale/Alecita/Yori/Diego as fixture data.
- Do not add Dashboard screenshots to Git.
- The primary rollback remains destroying the disposable Supabase project.

## 5. Dry Review Checklist

- [ ] Confirm that the fixture draft remains unapplied.
- [ ] Confirm that the reset draft remains unapplied.
- [ ] Confirm that no real UUIDs are versioned.
- [ ] Confirm that no real project ref is versioned.
- [ ] Confirm that there are no secrets.
- [ ] Confirm that any future mapping will be private.
- [ ] Confirm that any future application will require explicit approval.
- [ ] Confirm that RLS end-to-end remains pending.
- [ ] Confirm that memberships remain pending for testing.
- [ ] Confirm that app connection remains pending.

## 6. Risks Before Future Application

- Incorrect conceptual mapping.
- Real UUID copied to the repo accidentally.
- Wrong project or real production.
- Fixture applied before rollback review.
- RLS not tested with authenticated users.
- Real data mixed with synthetic data.
- Reset aimed at the wrong target.

## 7. Future Phase GO Criteria

GO only if:

- The project is still disposable.
- `git status --short` is clean before any application.
- There are no sensitive values in Git.
- Private mapping was reviewed outside the repo.
- The user explicitly confirms fixture application in a future phase.
- Reset/rollback was reviewed.
- SQL remains limited to synthetic data.
- There is no app connection.

## 8. NO-GO Criteria

NO-GO if:

- Real data exists.
- Real users exist.
- There is any doubt about the project.
- There is any doubt about the mapping.
- UUIDs, project ref, passwords, tokens or keys are present in files.
- The app is connected to Supabase.
- Storage is involved.
- Supabase CLI is attempted.
- SQL is attempted without explicit approval.

## 9. Result

Fixture apply remains blocked until a future explicit manual apply phase is
approved.

## 10. Next Recommended Phase

S4.6.4.10 - Synthetic fixture apply manual preflight.

That phase still does not apply fixtures, does not execute SQL, does not use
CLI, does not connect the app and does not test RLS end-to-end.
