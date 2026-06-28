# Supabase Post Auth Users Lab Result

Status: AUTH USERS CREATED MANUALLY
Scope: disposable Supabase lab only
Runtime impact: none
App connection: none
Storage: untouched
Fixtures: not applied
Reset: not applied
RLS end-to-end: not tested yet
Production readiness: no

## 1. Sanitized Result

```text
S4.6.4.6 AUTH USERS SANITIZED RESULT

Project scope:
- Disposable Supabase lab only: yes
- Real data present: no
- Real users present: no
- App connected to Supabase: no
- Storage touched: no
- .env.local touched: no
- Service-role used/shared: no
- Tokens/keys/passwords shared: no

Manual Auth users:
- owner_a created: yes
- partner_a created: yes
- owner_b created: yes
- external_user created: yes

Sensitive values:
- Emails shared in Git/chat: placeholder-only, no personal emails
- Passwords shared in Git/chat: no
- Auth UUIDs shared in Git/chat: yes, visible in screenshot
- Project ref shared in Git/chat: yes, visible in screenshot
- Tokens/keys shared in Git/chat: no
- Service-role shared in Git/chat: no

Fixtures:
- synthetic_fixture_apply_draft.sql applied: no
- synthetic_reset_draft.sql applied: no

Notes/issues:
- Four synthetic Auth users were created manually in the disposable lab.
- A dashboard screenshot exposed lab-only Auth UUIDs and project ref in chat.
- No passwords, tokens, API keys, service-role key, real users, real data, Storage changes, .env.local changes, app connection, fixtures or reset were involved.

Verdict:
- READY FOR POST-AUTH-USERS LAB RESULT DOCS
```

## 2. Synthetic Users

Only these conceptual users were created manually:

- `owner_a`
- `partner_a`
- `owner_b`
- `external_user`

This document intentionally contains no Auth UUIDs, passwords, real project ref
or real emails.

## 3. Security Note

- Dashboard screenshots can expose Auth UUIDs and project ref.
- Dashboard screenshots must not be added to Git.
- UUIDs, project ref, passwords and tokens must not be pasted in docs.
- The lab remains disposable.
- The primary rollback remains destroying the disposable Supabase project.

## 4. What This Does Not Prove

- It does not prove RLS end-to-end.
- It does not prove memberships.
- It does not prove access as a real authenticated user.
- It does not connect the app.
- It does not validate backend readiness.
- It does not enable production.
- It does not authorize fixtures yet.

## 5. Next Recommended Phase

S4.6.4.8 - Post-auth-users documentation review and fixture mapping preflight.

Do not apply fixtures yet. Do not use UUIDs in Git. Any UUID mapping must stay
private and outside the repo until an explicit approved phase says otherwise.
