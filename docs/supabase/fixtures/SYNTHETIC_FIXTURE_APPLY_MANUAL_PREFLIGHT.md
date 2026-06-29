# S4.6.4.10 Synthetic Fixture Apply Manual Preflight

Status: MANUAL PREFLIGHT ONLY
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

This document prepares a future manual application of synthetic fixtures in the
disposable Supabase lab. It does not authorize running SQL yet, does not apply
fixtures and does not modify any SQL draft.

Manual fixture application remains blocked until an explicit future apply phase
is approved.

## 2. Required Prior State

- Schema draft was applied manually in the disposable lab.
- RLS draft was applied manually in the disposable lab.
- Four synthetic Auth users were created manually.
- Mapping preflight is documented.
- Fixture apply dry-review is documented.
- Real mapping remains private and outside the repo.
- The app remains disconnected.
- Storage remains untouched.
- Fixtures remain unapplied.
- Reset remains unapplied.
- RLS end-to-end remains untested.

## 3. Checklist Before Any Future Application

- [ ] Confirm disposable project.
- [ ] Confirm it is not real production.
- [ ] Confirm there is no real data.
- [ ] Confirm there are no real users.
- [ ] Confirm the four synthetic users exist.
- [ ] Confirm private mapping outside the repo.
- [ ] Confirm there are no real UUIDs in Git.
- [ ] Confirm there is no real project ref in Git.
- [ ] Confirm there are no passwords, tokens, keys or service-role.
- [ ] Confirm `.env.local` is not touched.
- [ ] Confirm Storage remains untouched.
- [ ] Confirm the app remains disconnected.
- [ ] Confirm reset/rollback was reviewed.
- [ ] Confirm future explicit approval before running SQL.

## 4. Rules For Future Manual Application

- Use only the SQL Editor in the disposable lab Dashboard.
- Do not use Supabase CLI.
- Do not use service-role.
- Do not use app/browser runtime.
- Do not touch runtime.
- Do not touch `.env.local`.
- Do not touch Storage.
- Do not use real data.
- Do not use Ale/Alecita/Yori/Diego.
- Do not include screenshots with UUIDs or project ref.
- Do not copy sensitive results to chat.
- Primary rollback: destroy the disposable Supabase project.

## 5. NO-GO Conditions

- Wrong project.
- Any doubt that it is real production.
- Real data exists.
- Real users exist.
- Any mapping doubt exists.
- Real UUIDs are in Git.
- Real project ref is in Git.
- Tokens, keys, passwords or service-role are present.
- Someone wants to connect the app.
- Someone wants to touch Storage.
- Someone wants to use CLI.
- There is no explicit approval for fixture apply.

## 6. Result

Manual fixture application remains blocked until an explicit future apply phase is approved.

## 7. Next Recommended Phase

S4.6.4.11 - Final docs audit before any fixture apply.

That phase must audit docs, SQL drafts, Supabase isolation, absence of secrets
and Git state. It still must not apply fixtures, execute SQL or connect the app.
