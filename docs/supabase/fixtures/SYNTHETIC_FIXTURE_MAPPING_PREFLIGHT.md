# S4.6.4.8 Synthetic Fixture Mapping Preflight

Status: PREFLIGHT ONLY
Scope: disposable Supabase lab only
Runtime impact: none
App connection: none
Storage: untouched
Fixtures: not applied
Reset: not applied
RLS end-to-end: not tested yet
Production readiness: no

## 1. Purpose

This phase prepares criteria for a future private mapping between conceptual
users and Auth UUIDs from the disposable Supabase lab. It does not apply SQL,
does not run fixtures and does not version real UUIDs.

The mapping, if needed later, must stay outside Git until a future explicitly
approved phase defines how to use it safely.

## 2. Preconditions

- Schema draft was applied manually in the disposable lab.
- RLS draft was applied manually in the disposable lab.
- Four synthetic Auth users were created manually.
- The app remains disconnected from Supabase.
- Fixtures remain unapplied.
- Reset remains unapplied.
- Storage remains untouched.
- RLS end-to-end remains untested.

## 3. Conceptual Users

Only these conceptual users are in scope:

- `owner_a`
- `partner_a`
- `owner_b`
- `external_user`

## 4. Private Mapping Rules

- Do not save real UUIDs in Git.
- Do not paste real UUIDs in chat.
- Do not include real UUIDs in screenshots.
- Do not save real project ref.
- Do not save passwords.
- Do not save tokens or keys.
- Do not use service-role.
- The private mapping, if needed in a future phase, must live outside the repo.
- Any mapping must be visually reviewed against the lab Dashboard before use.
- If there is any doubt between conceptual user and UUID, stop.

## 5. Private Table, Not Commitable

The table below is a private template only. Do not fill it in Git.

| Conceptual user | Private Auth UUID      | Verification status |
| --------------- | ---------------------- | ------------------- |
| owner_a         | private, do not commit | pending             |
| partner_a       | private, do not commit | pending             |
| owner_b         | private, do not commit | pending             |
| external_user   | private, do not commit | pending             |

## 6. Future Fixture Phase GO/NO-GO Criteria

GO only if:

- The project is still disposable.
- There is no real data.
- The four conceptual users exist.
- The private mapping was reviewed outside the repo.
- There are no real UUIDs in Git.
- There are no sensitive screenshots.
- A future fixture apply phase is explicitly approved.

NO-GO if:

- Real data exists.
- There is any doubt with the mapping.
- Real UUIDs are detected in files.
- Real project ref is detected in docs.
- Tokens, keys, passwords or service-role are detected.
- The user is in real production.
- Anyone attempts to connect the app.
- Anyone attempts to apply fixtures without approval.

## 7. What This Does Not Prove

- It does not prove RLS end-to-end.
- It does not prove memberships.
- It does not prove access as an authenticated user.
- It does not apply fixtures.
- It does not execute reset.
- It does not connect backend.
- It does not prepare production.

## 8. Next Recommended Phase

S4.6.4.9 - Synthetic fixture apply dry-review.

That phase would be a dry, documentary review of fixture SQL before any
application. It must not apply fixtures yet, must not use Supabase CLI, must not
put real UUIDs in Git and must not connect the app.
