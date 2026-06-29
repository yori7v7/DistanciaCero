-- S4.6.4.17 verification query draft.
-- Read-only draft only.
-- Not executed.
-- SQL Editor privileged execution does not prove RLS end-to-end.
-- Do not paste secrets or UUIDs.
-- Do not modify data.
-- This file plans checks for the disposable Supabase lab only.
-- It does not connect the app and does not touch Storage objects.

-- ============================================================================
-- 1. Synthetic expected counts
-- ============================================================================

select
  expected.fixture_table,
  expected.expected_count,
  actual.actual_count
from (
  values
    ('profiles', 4),
    ('relationship_spaces', 2),
    ('universe_members', 3),
    ('content_items', 7),
    ('content_events', 1),
    ('media_assets', 1)
) as expected(fixture_table, expected_count)
join lateral (
  select case expected.fixture_table
    when 'profiles' then (
      select count(*)
      from public.profiles
      where local_slug in ('owner_a', 'partner_a', 'owner_b', 'external_user')
    )
    when 'relationship_spaces' then (
      select count(*)
      from public.relationship_spaces
      where slug in (
        'space-a-s4-6-4-13-candidate',
        'space-b-s4-6-4-13-candidate'
      )
    )
    when 'universe_members' then (
      select count(*)
      from public.universe_members as member
      join public.relationship_spaces as space
        on space.id = member.space_id
      join public.profiles as profile
        on profile.id = member.user_id
      where space.slug in (
        'space-a-s4-6-4-13-candidate',
        'space-b-s4-6-4-13-candidate'
      )
      and profile.local_slug in ('owner_a', 'partner_a', 'owner_b')
    )
    when 'content_items' then (
      select count(*)
      from public.content_items
      where source in (
        'synthetic-fixture-s4-6-4-13-candidate',
        'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
      )
    )
    when 'content_events' then (
      select count(*)
      from public.content_events
      where payload ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
    )
    when 'media_assets' then (
      select count(*)
      from public.media_assets
      where path like 's4_6_4_13_candidate/%'
    )
  end as actual_count
) as actual on true
order by expected.fixture_table;

-- ============================================================================
-- 2. Synthetic count status
-- ============================================================================

select
  expected.fixture_table,
  expected.expected_count,
  actual.actual_count,
  case
    when actual.actual_count = expected.expected_count then 'PASS'
    else 'CHECK'
  end as status
from (
  values
    ('profiles', 4),
    ('relationship_spaces', 2),
    ('universe_members', 3),
    ('content_items', 7),
    ('content_events', 1),
    ('media_assets', 1)
) as expected(fixture_table, expected_count)
join lateral (
  select case expected.fixture_table
    when 'profiles' then (
      select count(*)
      from public.profiles
      where local_slug in ('owner_a', 'partner_a', 'owner_b', 'external_user')
    )
    when 'relationship_spaces' then (
      select count(*)
      from public.relationship_spaces
      where slug in (
        'space-a-s4-6-4-13-candidate',
        'space-b-s4-6-4-13-candidate'
      )
    )
    when 'universe_members' then (
      select count(*)
      from public.universe_members as member
      join public.relationship_spaces as space
        on space.id = member.space_id
      join public.profiles as profile
        on profile.id = member.user_id
      where space.slug in (
        'space-a-s4-6-4-13-candidate',
        'space-b-s4-6-4-13-candidate'
      )
      and profile.local_slug in ('owner_a', 'partner_a', 'owner_b')
    )
    when 'content_items' then (
      select count(*)
      from public.content_items
      where source in (
        'synthetic-fixture-s4-6-4-13-candidate',
        'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
      )
    )
    when 'content_events' then (
      select count(*)
      from public.content_events
      where payload ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
    )
    when 'media_assets' then (
      select count(*)
      from public.media_assets
      where path like 's4_6_4_13_candidate/%'
    )
  end as actual_count
) as actual on true
order by expected.fixture_table;

-- ============================================================================
-- 3. Basic FK chain
-- ============================================================================

select
  'relationship_spaces.created_by profiles' as check_name,
  count(*) as missing_count,
  case when count(*) = 0 then 'PASS' else 'CHECK' end as status
from public.relationship_spaces as space
left join public.profiles as profile
  on profile.id = space.created_by
where space.slug in (
  'space-a-s4-6-4-13-candidate',
  'space-b-s4-6-4-13-candidate'
)
and profile.id is null
union all
select
  'universe_members.space_id relationship_spaces',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.universe_members as member
left join public.relationship_spaces as space
  on space.id = member.space_id
where member.space_id in (
  select id
  from public.relationship_spaces
  where slug in (
    'space-a-s4-6-4-13-candidate',
    'space-b-s4-6-4-13-candidate'
  )
)
and space.id is null
union all
select
  'universe_members.user_id profiles',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.universe_members as member
left join public.profiles as profile
  on profile.id = member.user_id
where member.space_id in (
  select id
  from public.relationship_spaces
  where slug in (
    'space-a-s4-6-4-13-candidate',
    'space-b-s4-6-4-13-candidate'
  )
)
and profile.id is null
union all
select
  'content_items.space_id relationship_spaces',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.content_items as item
left join public.relationship_spaces as space
  on space.id = item.space_id
where item.source in (
  'synthetic-fixture-s4-6-4-13-candidate',
  'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
)
and space.id is null
union all
select
  'content_events.content_item_id content_items',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.content_events as event
left join public.content_items as item
  on item.id = event.content_item_id
 and item.space_id = event.space_id
where event.payload ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
and item.id is null
union all
select
  'media_assets.content_item_id content_items',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.media_assets as media
left join public.content_items as item
  on item.id = media.content_item_id
 and item.space_id = media.space_id
where media.path like 's4_6_4_13_candidate/%'
and item.id is null;

-- ============================================================================
-- 4. Synthetic memberships
-- ============================================================================

select
  expected.space_slug,
  expected.local_slug,
  expected.expected_role,
  count(member.user_id) as actual_count,
  case when count(member.user_id) = 1 then 'PASS' else 'CHECK' end as status
from (
  values
    ('space-a-s4-6-4-13-candidate', 'owner_a', 'owner'),
    ('space-a-s4-6-4-13-candidate', 'partner_a', 'partner'),
    ('space-b-s4-6-4-13-candidate', 'owner_b', 'owner')
) as expected(space_slug, local_slug, expected_role)
left join public.relationship_spaces as space
  on space.slug = expected.space_slug
left join public.profiles as profile
  on profile.local_slug = expected.local_slug
left join public.universe_members as member
  on member.space_id = space.id
 and member.user_id = profile.id
 and member.role = expected.expected_role
group by expected.space_slug, expected.local_slug, expected.expected_role
union all
select
  'no-membership',
  'external_user',
  'none',
  count(member.user_id),
  case when count(member.user_id) = 0 then 'PASS' else 'CHECK' end
from public.profiles as profile
left join public.universe_members as member
  on member.user_id = profile.id
where profile.local_slug = 'external_user';

-- ============================================================================
-- 5. Media metadata only
-- ============================================================================

select
  'media_assets synthetic metadata' as check_name,
  count(*) as actual_count,
  case when count(*) = 1 then 'PASS' else 'CHECK' end as status
from public.media_assets
where bucket = 'relationship-media-synthetic'
  and path like 's4_6_4_13_candidate/%'
  and mime_type = 'text/plain'
  and size_bytes = 128;

select
  'media_assets unexpected synthetic metadata' as check_name,
  count(*) as unexpected_count,
  case when count(*) = 0 then 'PASS' else 'CHECK' end as status
from public.media_assets
where path like 's4_6_4_13_candidate/%'
and (
  bucket <> 'relationship-media-synthetic'
  or content_item_id is null
);

-- ============================================================================
-- 6. Real-data guard for synthetic markers
-- ============================================================================

select
  'profiles expected synthetic local_slugs' as check_name,
  count(*) as unexpected_count,
  case when count(*) = 0 then 'PASS' else 'CHECK' end as status
from public.profiles
where local_slug in ('owner_a', 'partner_a', 'owner_b', 'external_user')
and display_name not like 'Synthetic % S4.6.4.13'
union all
select
  'relationship_spaces expected synthetic slugs',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.relationship_spaces
where slug like '%s4-6-4-13-candidate'
and slug not in (
  'space-a-s4-6-4-13-candidate',
  'space-b-s4-6-4-13-candidate'
)
union all
select
  'content_items expected synthetic sources',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.content_items
where (
  source like 'synthetic-fixture%'
  or local_id like 'synthetic-%'
  or base_id like '%synthetic%'
  or data ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
)
and source not in (
  'synthetic-fixture-s4-6-4-13-candidate',
  'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
)
union all
select
  'content_events expected synthetic payload',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.content_events
where payload ->> 'fixture' = 'synthetic'
and coalesce(payload ->> 'synthetic_fixture_batch', '') <> 's4_6_4_13_candidate'
union all
select
  'media_assets expected synthetic path',
  count(*),
  case when count(*) = 0 then 'PASS' else 'CHECK' end
from public.media_assets
where (
  bucket = 'relationship-media-synthetic'
  or path like 's4_6_4_13_candidate/%'
)
and path not like 's4_6_4_13_candidate/%';

-- ============================================================================
-- Final note
-- ============================================================================
-- These queries only verify fixture rows and basic relationships.
-- They do not prove RLS end-to-end.
-- They do not prove authenticated access.
-- They do not connect the app.
-- They do not prove real Storage behavior.
