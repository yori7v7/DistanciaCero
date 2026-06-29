-- Distancia Cero - S4.6.4.13 synthetic fixture apply candidate template.
-- SQL CANDIDATE TEMPLATE ONLY.
-- NOT APPLIED.
-- DO NOT RUN DIRECTLY FROM GIT.
-- Copy this file to a private scratch location outside the repo before use.
-- Replace placeholders only in that private scratch copy.
-- Never commit real UUIDs, project refs, tokens, keys, passwords or secrets.
-- Do not use real data, real emails or private names as fixture data.
-- Do not use Supabase CLI from this file.
-- Do not touch Storage objects from this file.
-- This setup uses SQL Editor privileges only for synthetic lab setup.
-- It does not prove RLS end-to-end with authenticated users.
-- App/CRUD remain disconnected and LocalStorage remains the active runtime.

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
      'S4.6.4.13 fixture candidate blocked: replace all placeholders in a private scratch copy outside Git before running.';
  end if;
end $$;

-- ============================================================================
-- 2. Marker and conflict guard
-- ============================================================================
-- Schema has no synthetic_fixture_batch column. Stable markers use available
-- columns: profiles.local_slug, relationship_spaces.slug, content_items.source,
-- content_items.data JSON, content_events.payload JSON and media_assets.path.

do $$
begin
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
    raise exception 'S4.6.4.13 fixture candidate blocked: profile UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.relationship_spaces
    where id in (
      '__SPACE_A_UUID__'::uuid,
      '__SPACE_B_UUID__'::uuid
    )
    and coalesce(slug, '') not in (
      'space-a-s4-6-4-13-candidate',
      'space-b-s4-6-4-13-candidate'
    )
  ) then
    raise exception 'S4.6.4.13 fixture candidate blocked: space UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.relationship_spaces
    where slug in (
      'space-a-s4-6-4-13-candidate',
      'space-b-s4-6-4-13-candidate'
    )
    and id not in (
      '__SPACE_A_UUID__'::uuid,
      '__SPACE_B_UUID__'::uuid
    )
  ) then
    raise exception 'S4.6.4.13 fixture candidate blocked: synthetic space slug conflict uses a different UUID.';
  end if;

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
    raise exception 'S4.6.4.13 fixture candidate blocked: content item UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.content_events
    where id = '__CONTENT_EVENT_A_UUID__'::uuid
    and coalesce(payload ->> 'synthetic_fixture_batch', '') <> 's4_6_4_13_candidate'
  ) then
    raise exception 'S4.6.4.13 fixture candidate blocked: content event UUID conflict is not synthetic.';
  end if;

  if exists (
    select 1
    from public.media_assets
    where id = '__MEDIA_ASSET_A_UUID__'::uuid
    and path not like 's4_6_4_13_candidate/%'
  ) then
    raise exception 'S4.6.4.13 fixture candidate blocked: media asset UUID conflict is not synthetic.';
  end if;
end $$;

-- ============================================================================
-- 3. Profiles
-- ============================================================================

insert into public.profiles (id, local_slug, display_name, avatar_url)
values
  ('__OWNER_A_AUTH_UUID__'::uuid, 'owner_a', 'Synthetic Owner A S4.6.4.13', null),
  ('__PARTNER_A_AUTH_UUID__'::uuid, 'partner_a', 'Synthetic Partner A S4.6.4.13', null),
  ('__OWNER_B_AUTH_UUID__'::uuid, 'owner_b', 'Synthetic Owner B S4.6.4.13', null),
  ('__EXTERNAL_USER_AUTH_UUID__'::uuid, 'external_user', 'Synthetic External User S4.6.4.13', null)
on conflict (id) do update
set local_slug = excluded.local_slug,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url
where public.profiles.local_slug in (
  'owner_a',
  'partner_a',
  'owner_b',
  'external_user'
);

-- ============================================================================
-- 4. Relationship spaces
-- ============================================================================

insert into public.relationship_spaces (id, name, slug, created_by)
values
  (
    '__SPACE_A_UUID__'::uuid,
    'Synthetic Space A S4.6.4.13',
    'space-a-s4-6-4-13-candidate',
    '__OWNER_A_AUTH_UUID__'::uuid
  ),
  (
    '__SPACE_B_UUID__'::uuid,
    'Synthetic Space B S4.6.4.13',
    'space-b-s4-6-4-13-candidate',
    '__OWNER_B_AUTH_UUID__'::uuid
  )
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    created_by = excluded.created_by
where public.relationship_spaces.slug in (
  'space-a-s4-6-4-13-candidate',
  'space-b-s4-6-4-13-candidate'
);

-- ============================================================================
-- 5. Universe memberships
-- ============================================================================
-- external_user intentionally has no membership.

insert into public.universe_members (space_id, user_id, role)
values
  ('__SPACE_A_UUID__'::uuid, '__OWNER_A_AUTH_UUID__'::uuid, 'owner'),
  ('__SPACE_A_UUID__'::uuid, '__PARTNER_A_AUTH_UUID__'::uuid, 'partner'),
  ('__SPACE_B_UUID__'::uuid, '__OWNER_B_AUTH_UUID__'::uuid, 'owner')
on conflict (space_id, user_id) do update
set role = excluded.role;

-- ============================================================================
-- 6. Content items
-- ============================================================================

insert into public.content_items (
  id, space_id, collection, local_id, base_id, kind, data,
  schema_version, is_hidden, created_by, updated_by, source
)
values
  (
    '__CONTENT_REASON_A_UUID__'::uuid,
    '__SPACE_A_UUID__'::uuid,
    'reasons',
    'synthetic-reason-a-s4-6-4-13',
    null,
    'local',
    '{"text":"Synthetic reason A1","synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb,
    1,
    false,
    '__OWNER_A_AUTH_UUID__'::uuid,
    '__OWNER_A_AUTH_UUID__'::uuid,
    'synthetic-fixture-s4-6-4-13-candidate'
  ),
  (
    '__CONTENT_PROMISE_A_UUID__'::uuid,
    '__SPACE_A_UUID__'::uuid,
    'promises',
    'synthetic-promise-a-s4-6-4-13',
    null,
    'local',
    '{"text":"Synthetic promise A1","synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb,
    1,
    false,
    '__PARTNER_A_AUTH_UUID__'::uuid,
    '__PARTNER_A_AUTH_UUID__'::uuid,
    'synthetic-fixture-s4-6-4-13-candidate'
  ),
  (
    '__CONTENT_REASON_B_UUID__'::uuid,
    '__SPACE_B_UUID__'::uuid,
    'reasons',
    'synthetic-reason-b-s4-6-4-13',
    null,
    'local',
    '{"text":"Synthetic reason B1","synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb,
    1,
    false,
    '__OWNER_B_AUTH_UUID__'::uuid,
    '__OWNER_B_AUTH_UUID__'::uuid,
    'synthetic-fixture-s4-6-4-13-candidate'
  ),
  (
    '__CONTENT_OVERRIDE_A_UUID__'::uuid,
    '__SPACE_A_UUID__'::uuid,
    'reasons',
    null,
    'base-reason-synthetic-s4-6-4-13',
    'override',
    '{"text":"Synthetic override reason A1","synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb,
    1,
    false,
    '__OWNER_A_AUTH_UUID__'::uuid,
    '__OWNER_A_AUTH_UUID__'::uuid,
    'synthetic-fixture-s4-6-4-13-candidate'
  ),
  (
    '__CONTENT_HIDDEN_A_UUID__'::uuid,
    '__SPACE_A_UUID__'::uuid,
    'promises',
    null,
    'base-promise-synthetic-s4-6-4-13',
    'hidden',
    '{"reason":"Synthetic hidden marker A1","synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb,
    1,
    true,
    '__PARTNER_A_AUTH_UUID__'::uuid,
    '__PARTNER_A_AUTH_UUID__'::uuid,
    'synthetic-fixture-s4-6-4-13-candidate'
  ),
  (
    '__CONTENT_MONTHLY_A_UUID__'::uuid,
    '__SPACE_A_UUID__'::uuid,
    'monthlyLetters',
    'synthetic-monthly-a-s4-6-4-13',
    null,
    'local',
    '{"month":"Synthetic month A1","title":"Synthetic monthly A1","content":"Synthetic body A1","synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb,
    1,
    false,
    null,
    null,
    'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
  ),
  (
    '__CONTENT_OPEN_WHEN_A_UUID__'::uuid,
    '__SPACE_A_UUID__'::uuid,
    'openWhenLetters',
    'synthetic-open-when-a-s4-6-4-13',
    null,
    'local',
    '{"title":"Synthetic open when A1","mood":"synthetic","content":"Synthetic body A1","synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb,
    1,
    false,
    null,
    null,
    'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
  )
on conflict (id) do update
set space_id = excluded.space_id,
    collection = excluded.collection,
    local_id = excluded.local_id,
    base_id = excluded.base_id,
    kind = excluded.kind,
    data = excluded.data,
    schema_version = excluded.schema_version,
    is_hidden = excluded.is_hidden,
    created_by = excluded.created_by,
    updated_by = excluded.updated_by,
    source = excluded.source
where public.content_items.source in (
  'synthetic-fixture-s4-6-4-13-candidate',
  'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
);

-- ============================================================================
-- 7. Content events
-- ============================================================================
-- action uses the schema_draft.sql allowed value "create".

insert into public.content_events (
  id, space_id, content_item_id, collection, action, actor_id, payload
)
values (
  '__CONTENT_EVENT_A_UUID__'::uuid,
  '__SPACE_A_UUID__'::uuid,
  '__CONTENT_REASON_A_UUID__'::uuid,
  'reasons',
  'create',
  '__OWNER_A_AUTH_UUID__'::uuid,
  '{"fixture":"synthetic","sensitive":false,"synthetic_fixture_batch":"s4_6_4_13_candidate"}'::jsonb
)
on conflict (id) do update
set space_id = excluded.space_id,
    content_item_id = excluded.content_item_id,
    collection = excluded.collection,
    action = excluded.action,
    actor_id = excluded.actor_id,
    payload = excluded.payload
where public.content_events.payload ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate';

-- ============================================================================
-- 8. Media assets
-- ============================================================================
-- This inserts metadata only. It does not create Storage buckets or objects.

insert into public.media_assets (
  id, space_id, content_item_id, bucket, path, mime_type, size_bytes, created_by
)
values (
  '__MEDIA_ASSET_A_UUID__'::uuid,
  '__SPACE_A_UUID__'::uuid,
  '__CONTENT_REASON_A_UUID__'::uuid,
  'relationship-media-synthetic',
  's4_6_4_13_candidate/space-a/synthetic-media-a1.txt',
  'text/plain',
  128,
  '__OWNER_A_AUTH_UUID__'::uuid
)
on conflict (id) do update
set space_id = excluded.space_id,
    content_item_id = excluded.content_item_id,
    bucket = excluded.bucket,
    path = excluded.path,
    mime_type = excluded.mime_type,
    size_bytes = excluded.size_bytes,
    created_by = excluded.created_by
where public.media_assets.path like 's4_6_4_13_candidate/%';

-- ============================================================================
-- 9. Candidate post-checks
-- ============================================================================
-- These checks are read-only within the transaction and return synthetic counts.
-- They are not RLS end-to-end tests because SQL Editor runs with privileged
-- setup context.

select 'profiles' as fixture_table, count(*) as synthetic_count
from public.profiles
where local_slug in ('owner_a', 'partner_a', 'owner_b', 'external_user')
union all
select 'relationship_spaces', count(*)
from public.relationship_spaces
where slug in (
  'space-a-s4-6-4-13-candidate',
  'space-b-s4-6-4-13-candidate'
)
union all
select 'universe_members', count(*)
from public.universe_members
where space_id in ('__SPACE_A_UUID__'::uuid, '__SPACE_B_UUID__'::uuid)
union all
select 'content_items', count(*)
from public.content_items
where source in (
  'synthetic-fixture-s4-6-4-13-candidate',
  'synthetic-fixture-legacy-adapter-s4-6-4-13-candidate'
)
union all
select 'content_events', count(*)
from public.content_events
where payload ->> 'synthetic_fixture_batch' = 's4_6_4_13_candidate'
union all
select 'media_assets', count(*)
from public.media_assets
where path like 's4_6_4_13_candidate/%';

commit;

-- End of S4.6.4.13 candidate template.
-- In Git, this file is intentionally blocked by placeholders and remains not applied.
