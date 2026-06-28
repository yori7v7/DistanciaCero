# S4.6.4.6 Synthetic Auth Users Manual Guide

Status: GO MANUAL AUTH USERS
Scope: disposable Supabase lab only
Runtime impact: none
App connection: none
Storage: untouched
Fixtures: not applied
Reset: not applied

## 1. Mandatory Preflight

Before creating any Auth user manually, confirm all items below:

- The Supabase project is disposable.
- The project contains no real data.
- The project contains no real users.
- The app is not connected to Supabase.
- `.env.local` is not touched.
- Service-role is not used.
- Passwords, UUIDs, tokens, keys and real project ref are not shared.

Stop immediately if any item cannot be confirmed.

## 2. Conceptual Users

Create only these synthetic conceptual users:

- `owner_a`
- `partner_a`
- `owner_b`
- `external_user`

These names are labels for the disposable lab. They must not represent real
people or real Distancia Cero data.

## 3. Documentary Placeholder Emails

Safe documentary placeholders:

- `owner-a@example.invalid`
- `partner-a@example.invalid`
- `owner-b@example.invalid`
- `external-user@example.invalid`

If the Supabase Dashboard does not accept `example.invalid`, use controlled,
non-personal test emails. Do not save those emails in Git. Do not share them in
chat if they reveal personal information. Do not use real personal emails.

## 4. Passwords

- Use strong generated temporary passwords.
- Do not save passwords in Git.
- Do not paste passwords in chat.
- Do not document passwords in issues, commits or repo files.
- Keep passwords only in a private temporary place if needed for later lab
  tests.

## 5. Metadata

- Do not use real names.
- Do not use Ale/Alecita/Yori/Diego.
- If the Dashboard allows user metadata, leave it empty or use only minimal
  synthetic labels such as `owner_a`, `partner_a`, `owner_b`,
  `external_user`.

## 6. Safe Manual Steps

These steps are intentionally written without any real project ref:

1. Open the Supabase Dashboard for the disposable lab project.
2. Go to Authentication / Users or the equivalent Users section.
3. Create the first synthetic user manually.
4. Use the matching test email for that conceptual user.
5. Use a strong temporary password.
6. Confirm or auto-confirm the user only if the Dashboard offers it and it is
   needed for later lab tests.
7. Repeat the same process for all four conceptual users.
8. Do not touch Storage.
9. Do not touch API keys.
10. Do not touch `.env.local`.
11. Do not copy tokens.
12. Do not connect the app.
13. Do not apply fixtures yet.

## 7. Private Local Record, Not Commitable

If UUIDs are needed for a later approved fixture phase, keep the mapping outside
Git in a private temporary note. Do not commit it, paste it in chat, attach it to
issues or include it in screenshots.

| Conceptual user | Email used                        | Auth user UUID              |
| --------------- | --------------------------------- | --------------------------- |
| owner_a         | private test email, do not commit | private UUID, do not commit |
| partner_a       | private test email, do not commit | private UUID, do not commit |
| owner_b         | private test email, do not commit | private UUID, do not commit |
| external_user   | private test email, do not commit | private UUID, do not commit |

## 8. Sanitized Report Template

The user may paste this sanitized result in ChatGPT/Codex:

```text
S4.6.4.6 AUTH USERS SANITIZED RESULT

Project scope:
- Disposable Supabase lab only: yes/no
- Real data present: no
- Real users present: no
- App connected to Supabase: no
- Storage touched: no
- .env.local touched: no
- Service-role used/shared: no
- Tokens/keys/passwords shared: no

Manual Auth users:
- owner_a created: yes/no
- partner_a created: yes/no
- owner_b created: yes/no
- external_user created: yes/no

Sensitive values:
- Emails shared in Git/chat: no
- Passwords shared in Git/chat: no
- Auth UUIDs shared in Git/chat: no
- Project ref shared in Git/chat: no

Fixtures:
- synthetic_fixture_apply_draft.sql applied: no
- synthetic_reset_draft.sql applied: no

Notes/issues:
- <sanitized notes only>

Verdict:
- READY FOR POST-AUTH-USERS LAB RESULT DOCS / NO-GO
```

## 9. Stop Conditions

Stop and do not continue if any of these happens:

- The Dashboard asks for real personal data.
- The user is tempted to paste project ref, key, token or password.
- Users are accidentally created in production.
- Storage, Auth providers or API settings are changed unexpectedly.
- Any real data appears.

## 10. Explicit Non-Goals

- No users are created by this document.
- No SQL is executed by this document.
- No fixtures are applied.
- No reset is applied.
- No Storage is touched.
- No app connection is authorized.
- No tokens, keys, passwords, UUIDs or real project refs belong in Git.
