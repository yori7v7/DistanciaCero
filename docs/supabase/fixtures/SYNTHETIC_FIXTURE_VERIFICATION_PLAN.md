# S4.6.4.16 Synthetic Fixture Verification Plan

Status: PLANNING ONLY
Scope: disposable Supabase lab only
Runtime impact: none
App connection: none
Storage: untouched
Reset: not applied
Fixture apply: manually applied in lab
RLS end-to-end: not tested yet
Production readiness: no

## 1. Purpose

This phase only plans how to verify the synthetic fixture that was manually
applied in the disposable Supabase lab. It does not execute SQL, does not touch
Supabase, does not connect the app and does not test RLS yet.

## 2. Prior State

- Schema draft was applied manually.
- RLS draft was applied manually.
- 4 synthetic Auth users were created manually.
- Synthetic fixture was applied manually with success in SQL Editor.
- Sanitized counts:
  - profiles: 4
  - relationship_spaces: 2
  - universe_members: 3
  - content_items: 7
  - content_events: 1
  - media_assets: 1
- Reset was not applied.
- Storage was not touched.
- App was not connected.
- RLS end-to-end was not tested.

## 3. Future Verification Plan

These checks are proposed for a later approved phase only:

- Verify synthetic counts by table.
- Verify the basic FK chain.
- Verify synthetic memberships.
- Verify that `external_user` has no membership.
- Verify that `media_assets` contains metadata only and no Storage object.
- Verify that no real data exists in the synthetic fixture scope.
- Verify that reset remains available but blocked.
- Verify that SQL Editor privileged execution is not treated as an RLS test.

## 4. Future RLS Test Strategy

A separate future phase should plan and approve authenticated-user RLS testing.
This document does not implement or execute that strategy.

Rules for that future strategy:

- Do not use service-role.
- Do not use Supabase CLI.
- Do not connect the app yet.
- Do not paste tokens in Git or chat.
- Do not paste JWTs.
- Do not use real users.
- Do not use real data.
- Any Auth/RLS test must be explicitly approved before it happens.

## 5. Stop Conditions

Stop immediately if any of these appear:

- Real data is detected.
- The project is wrong.
- The target is real production.
- Tokens, JWTs, keys, passwords or service-role are involved.
- Accidental app connection.
- Storage touched.
- Reset executed without approval.
- RLS is assumed as tested without a real authenticated-user test.

## 6. Next Recommended Phase

S4.6.4.17 - Fixture verification query draft.

That phase may create query docs/drafts to verify counts, FKs and memberships.
It must not execute SQL yet. It must not connect the app. It must not test RLS
end-to-end yet.
