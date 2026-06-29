-- Distancia Cero - S4.6.4.13 synthetic fixture reset candidate template.
-- SQL CANDIDATE TEMPLATE ONLY.
-- NOT APPLIED.
-- NOT A GUARANTEED ROLLBACK.
-- DO NOT RUN DIRECTLY FROM GIT.
-- Copy this file to a private scratch location outside the repo before use.
-- Replace placeholders only in that private scratch copy.
-- Never commit real UUIDs, project refs, tokens, keys, passwords or secrets.
-- Do not use against production or any project containing real data.
-- Do not touch Auth users or Storage objects from this file.
-- This reset only targets synthetic rows created by the S4.6.4.13 candidate.
-- Primary rollback remains destroying the disposable Supabase lab project.

begin;

-- ============================================================================
-- 1. Fail-fast placeholder guard
-- ============================================================================
-- This block intentionally aborts if any placeholder remains. The versioned file
-- is therefore blocked for direct execution from Git. A future private scratch
-- copy must replace every placeholder outside the repo before manual use.

do $$
declare
  placeholder_values text[] := array[
    '__OWNER_A_AUTH_UUID__',
    '__PARTNER_A_AUTH_UUID__',
    '__OWNER_B_AUTH_UUID__',
    '__EXTERNAL_USER_AUTH_UUID__',
    '__SPACE_A_UUID__',
    '__SPACE_B_UUID__',
    '__CONTENT_REASON_A_UUID__',
    '__CONTENT_PROMISE_A_UUID__',
    '__CONTENT_REASON_B_UUID__',
    '__CONTENT_OVERRIDE_A_UUID__',
    '__CONTENT_HIDDEN_A_UUID__',
    '__CONTENT_MONTHLY_A_UUID__',
    '__CONTENT_OPEN_WHEN_A_UUID__',
    '__MEDIA_ASSET_A_UUID__',
    '__CONTENT_EVENT_A_UUID__'
  ];
  unresolved_count integer;
begin
  select count(*)
    into unresolved_count
  from unnest(placeholder_values) as placeholder_value
  where position('__' in placeholder_value) > 0;

  if unresolved_count > 0 then
    raise exception
      'S4.6.4.13 reset candidate blocked: replace all placeholders in a private scratch copy outside Git before running.';
  end if;
end $$;

-- ============================================================================
-- 2. Pre-reset synthetic scope check
-- ============================================================================
-- Deletions below require both explicit private UUIDs and stable synthetic
-- markers. If marker drift is detected, the reset aborts instead of widening.

do $$
begin
  if exists (
    select 1
    from public.content_items
    where id in (
      '__CONTENT_REASON_A_UUID__'::uuid,
      '__CONTENT_PROMISE_A_UUID__'::uuid,
      '__CONTENT_REASON_B_UUID__'::uuid,
      '__CONTENT_OVERRIDE_A_UUID__'::uuid,
      '__CONTENT_HIDDEN_A_UUID__'::uuid,
      '__CONTENT_MONTHLY_A_UUID__'::uuid,
      '__CONTENT_OPEN_WHEN_A_UUID__'::uuid
    )
    and source not in (
      'synthetic-fixture-s4-6-4-13-candidate',
      'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
    )
  ) then
    raise exception 'S4.6.4.13 reset blocked: content item UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.content_events
    where id = '__CONTENT_EVENT_A_UUID__'::uuid
    and coalesce(payload ->> 'synthetic_fixture_batch', '') <> 's4_6_4_13_candidate'
  ) then
    raise exception 'S4.6.4.13 reset blocked: content event UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.media_assets
    where id = '__MEDIA_ASSET_A_UUID__'::uuid
    and path not like 's4_6_4_13_candidate/%'
  ) then
    raise exception 'S4.6.4.13 reset blocked: media asset UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.relationship_spaces
    where id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid)
    and coalesce(slug, '') not in (
      'space-a-s4-6-4-13-candidate',
      'space-b-s4-6-4-13-candidate'
    )
  ) then
    raise exception 'S4.6.4.13 reset blocked: space UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.profiles
    where id in (
      '__OWNER_A_AUTH_UUID__'::uuid,
      '__PARTNER_A_AUTH_UUID__'::uuid,
      '__OWNER_B_AUTH_UUID__'::uuid,
      '__EXTERNAL_USER_AUTH_UUID__'::uuid
    )
    and coalesce(local_slug, '') not in (
      'owner_a',
      'partner_a',
      'owner_b',
      'external_user'
    )
  ) then
    raise exception 'S4.6.4.13 reset blocked: profile UUID conflict is not synthetic.';
  end if;
end $$;

-- ============================================================================
-- 3. Delete synthetic dependents first
-- ============================================================================

delete from public.content_events
where id = '__CONTENT_EVENT_A_UUID__'::uuid
  and payload ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
  and space_id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid);

delete from public.media_assets
where id = '__MEDIA_ASSET_A_UUID__'::uuid
  and bucket = 'relationship-media-synthetic'
  and path like 's4_6_4_13_candidate/%'
  and space_id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid);

delete from public.content_items
where id in (
    '__CONTENT_REASON_A_UUID__'::uuid,
    '__CONTENT_PROMISE_A_UUID__'::uuid,
    '__CONTENT_REASON_B_UUID__'::uuid,
    '__CONTENT_OVERRIDE_A_UUID__'::uuid,
    '__CONTENT_HIDDEN_A_UUID__'::uuid,
    '__CONTENT_MONTHLY_A_UUID__'::uuid,
    '__CONTENT_OPEN_WHEN_A_UUID__'::uuid
  )
  and space_id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid)
  and source in (
    'synthetic-fixture-s4-6-4-13-candidate',
    'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
  )
  and (
    local_id like 'synthetic-%-s4-6-4-13'
    or base_id like 'base-%-synthetic-s4-6-4-13'
    or data ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
  );

-- ============================================================================
-- 4. Delete synthetic memberships and spaces
-- ============================================================================

delete from public.universe_members
where space_id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid)
  and user_id in (
    '__OWNER_A_AUTH_UUID__'::uuid,
    '__PARTNER_A_AUTH_UUID__'::uuid,
    '__OWNER_B_AUTH_UUID__'::uuid,
    '__EXTERNAL_USER_AUTH_UUID__'::uuid
  );

delete from public.relationship_spaces
where id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid)
  and slug in (
    'space-a-s4-6-4-13-candidate',
    'space-b-s4-6-4-13-candidate'
  )
  and name in (
    'Synthetic Space A S4.6.4.13',
    'Synthetic Space B S4.6.4.13'
  );

-- ============================================================================
-- 5. Delete synthetic profiles last
-- ============================================================================
-- This deletes only public.profiles rows. It does not delete Auth users.

delete from public.profiles
where id in (
    '__OWNER_A_AUTH_UUID__'::uuid,
    '__PARTNER_A_AUTH_UUID__'::uuid,
    '__OWNER_B_AUTH_UUID__'::uuid,
    '__EXTERNAL_USER_AUTH_UUID__'::uuid
  )
  and local_slug in (
    'owner_a',
    'partner_a',
    'owner_b',
    'external_user'
  )
  and display_name in (
    'Synthetic Owner A S4.6.4.13',
    'Synthetic Partner A S4.6.4.13',
    'Synthetic Owner B S4.6.4.13',
    'Synthetic External User S4.6.4.13'
  );

-- ============================================================================
-- 6. Candidate post-checks
-- ============================================================================
-- These checks are read-only within the transaction and return remaining
-- synthetic rows targeted by this reset candidate.

select 'profiles' as fixture_table, count(*) as remaining_synthetic_count
from public.profiles
where id in (
  '__OWNER_A_AUTH_UUID__'::uuid,
  '__PARTNER_A_AUTH_UUID__'::uuid,
  '__OWNER_B_AUTH_UUID__'::uuid,
  '__EXTERNAL_USER_AUTH_UUID__'::uuid
)
and local_slug in ('owner_a', 'partner_a', 'owner_b', 'external_user')
union all
select 'relationship_spaces', count(*)
from public.relationship_spaces
where id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid)
and slug in (
  'space-a-s4-6-4-13-candidate',
  'space-b-s4-6-4-13-candidate'
)
union all
select 'universe_members', count(*)
from public.universe_members
where space_id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid)
and user_id in (
  '__OWNER_A_AUTH_UUID__'::uuid,
  '__PARTNER_A_AUTH_UUID__'::uuid,
  '__OWNER_B_AUTH_UUID__'::uuid,
  '__EXTERNAL_USER_AUTH_UUID__'::uuid
)
union all
select 'content_items', count(*)
from public.content_items
where id in (
  '__CONTENT_REASON_A_UUID__'::uuid,
  '__CONTENT_PROMISE_A_UUID__'::uuid,
  '__CONTENT_REASON_B_UUID__'::uuid,
  '__CONTENT_OVERRIDE_A_UUID__'::uuid,
  '__CONTENT_HIDDEN_A_UUID__'::uuid,
  '__CONTENT_MONTHLY_A_UUID__'::uuid,
  '__CONTENT_OPEN_WHEN_A_UUID__'::uuid
)
and source in (
  'synthetic-fixture-s4-6-4-13-candidate',
  'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
)
union all
select 'content_events', count(*)
from public.content_events
where id = '__CONTENT_EVENT_A_UUID__'::uuid
and payload ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
union all
select 'media_assets', count(*)
from public.media_assets
where id = '__MEDIA_ASSET_A_UUID__'::uuid
and path like 's4_6_4_13_candidate/%';

commit;

-- End of S4.6.4.13 reset candidate template.
-- In Git, this file is intentionally blocked by placeholders and remains not applied.
