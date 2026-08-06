/**
 * Supabase Sync Service
 *
 * Local-first sync engine:
 * - On login: pull all content from Supabase and hydrate localStorage.
 * - On write: save to localStorage (instant) then push to Supabase (background).
 * - On conflict: last-write-wins (for 2 users this is acceptable).
 *
 * Components keep using contentService synchronously — zero changes needed.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContentItem, OverrideMap } from '../types/content'
import { isSupabaseAuthenticated, getAuthenticatedClient, getSupabaseUserId } from './supabaseAuthService'
import * as localContentRepository from '../repositories/localContentRepository'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { getLocalSpaceId } from '../utils/localIdentityStore'

interface SupabaseContentRow {
  id: string
  space_id: string
  collection: string
  local_id: string | null
  base_id: string | null
  kind: 'local' | 'override' | 'hidden'
  data: Record<string, unknown>
  schema_version: number
  created_by: string
  updated_by: string
  deleted_at: string | null
  source: string
}

// ---- helpers ---------------------------------------------------------------

let _cachedSpaceId: string | null = null
let lastSyncError: string | null = null

/**
 * Returns the last sync error message (or null if the last sync attempt was
 * clean). Lets future UI show "tus cambios están solo locales" when the
 * remote sync fails.
 */
export function getLastSyncError(): string | null {
  return lastSyncError
}

/**
 * Clears the cached space id. MUST be called on sign-out so the next account
 * cannot resolve (and read) the previous account's space — prevents
 * cross-account data leakage.
 */
export function resetSpaceIdCache(): void {
  _cachedSpaceId = null
}

function canSync(): boolean {
  return isRemoteContentEnabled() && isSupabaseAuthenticated()
}

/**
 * Resolves the real Supabase space UUID from the user's memberships.
 * Cached after first successful lookup.
 */
async function resolveSpaceId(): Promise<string | null> {
  if (_cachedSpaceId) return _cachedSpaceId

  const client = getAuthenticatedClient()
  if (!client) return null

  try {
    const { data, error } = await client
      .from('universe_members')
      .select('space_id')
      .limit(1)
      .single()

    if (error || !data) return null

    _cachedSpaceId = (data as { space_id: string }).space_id
    return _cachedSpaceId
  } catch (err) {
    console.warn('[sync] resolveSpaceId failed:', (err as Error).message)
    return null
  }
}

async function getSpaceId(): Promise<string> {
  const realId = await resolveSpaceId()
  return realId || getLocalSpaceId()
}

// ---- pull: hydrate localStorage from Supabase ------------------------------

/**
 * Fetch ALL content for the current space from Supabase and write it into
 * localStorage. Called once after successful login.
 */
export async function pullFromSupabase(): Promise<{ synced: number; error: string | null }> {
  if (!canSync()) {
    return { synced: 0, error: 'Remote not available or not authenticated.' }
  }

  const client = getAuthenticatedClient()
  if (!client) {
    return { synced: 0, error: 'No authenticated client.' }
  }

  const spaceId = await getSpaceId()

  try {
    // TODO(sync): proper pagination — PostgREST caps a single response at 1000
    // rows. For spaces with >1000 items, loop over pages with
    // .range(offset, offset + pageSize - 1) instead of a single fetch.
    // TODO(sync): merge instead of wholesale replace — pull currently overwrites
    // localStorage, which clobbers any offline edits made since the last sync.
    // Merge by _supabaseId/local_id (and kind) with last-write-wins on
    // updated_at. (Review finding: "pullFromSupabase overwrites local changes".)
    const { data, error } = await client
      .from('content_items')
      .select('*')
      .eq('space_id', spaceId)
      .is('deleted_at', null)
      .range(0, 999)

    if (error) {
      lastSyncError = error.message || 'Error fetching content.'
      return { synced: 0, error: lastSyncError }
    }

    if (!data || data.length === 0) {
      return { synced: 0, error: null }
    }

    // Group by collection and kind
    const collections: Record<string, ContentItem[]> = {}
    const overrides: Record<string, OverrideMap> = {}
    const hiddenIds: Record<string, string[]> = {}

    for (const item of data as SupabaseContentRow[]) {
      const col = item.collection
      if (!collections[col]) collections[col] = []
      if (!overrides[col]) overrides[col] = {}
      if (!hiddenIds[col]) hiddenIds[col] = []

      if (item.kind === 'local') {
        collections[col].push({
          ...item.data,
          id: item.local_id || item.id,
          _supabaseId: item.id,
          isLocal: true,
          createdBy: item.created_by,
          updatedBy: item.updated_by,
          createdAt: item.data.created_at as string,
          updatedAt: item.data.updated_at as string,
          source: item.source,
          spaceId: item.space_id
        })
      } else if (item.kind === 'override') {
        overrides[col][item.base_id!] = {
          ...item.data,
          id: item.base_id,
          _supabaseId: item.id
        }
      } else if (item.kind === 'hidden' && item.base_id != null) {
        hiddenIds[col].push(item.base_id)
      }
    }

    let synced = 0

    for (const [col, items] of Object.entries(collections)) {
      if (items.length > 0) {
        localContentRepository.saveCollectionItems(col, items)
        synced += items.length
      }
    }

    for (const [col, patches] of Object.entries(overrides)) {
      if (Object.keys(patches).length > 0) {
        localContentRepository.saveCollectionOverrides(col, patches)
        synced += Object.keys(patches).length
      }
    }

    for (const [col, ids] of Object.entries(hiddenIds)) {
      if (ids.length > 0) {
        localContentRepository.saveCollectionHiddenIds(col, ids)
        synced += ids.length
      }
    }

    await pullLegacyLetters(client, spaceId)

    return { synced, error: null }
  } catch (err) {
    lastSyncError = (err as Error).message || 'Unexpected sync error.'
    return { synced: 0, error: lastSyncError }
  }
}

async function pullLegacyLetters(client: SupabaseClient, spaceId: string): Promise<void> {
  try {
    const { data } = await client
      .from('content_items')
      .select('*')
      .eq('space_id', spaceId)
      .eq('collection', 'monthlyLetters')
      .eq('kind', 'local')
      .is('deleted_at', null)
      .range(0, 999)

    if (data && data.length > 0) {
      localContentRepository.saveLegacyMonthlyLetters(data.map((item: SupabaseContentRow) => ({
        ...item.data,
        id: item.local_id || item.id,
        _supabaseId: item.id
      })))
    }
  } catch { /* best-effort */ }

  try {
    const { data } = await client
      .from('content_items')
      .select('*')
      .eq('space_id', spaceId)
      .eq('collection', 'openWhen')
      .eq('kind', 'local')
      .is('deleted_at', null)
      .range(0, 999)

    if (data && data.length > 0) {
      localContentRepository.saveLegacyOpenWhenLetters(data.map((item: SupabaseContentRow) => ({
        ...item.data,
        id: item.local_id || item.id,
        _supabaseId: item.id
      })))
    }
  } catch { /* best-effort */ }
}

// ---- push: background sync to Supabase -------------------------------------

export async function pushCreateToSupabase(collection: string, item: ContentItem): Promise<void> {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()
  const userId = getSupabaseUserId()

  try {
    // .select('id').single() is REQUIRED: without it, supabase-js v2 returns
    // data: null on insert, so _supabaseId would never be backfilled and every
    // update would create a duplicate row (and deletes would never sync).
    const { error, data } = await client
      .from('content_items')
      .insert({
        space_id: spaceId,
        collection,
        local_id: String(item.id),
        kind: 'local',
        data: sanitizeItemData(item),
        schema_version: 1,
        created_by: userId,
        updated_by: userId,
        source: 'user'
      })
      .select('id')
      .single()

    if (error) {
      lastSyncError = error.message
      console.warn('[sync] pushCreate failed:', error.message)
    } else if (data?.id) {
      // Save the Supabase-generated ID back to the local item so updates don't create duplicates
      localContentRepository.updateCollectionItem(collection, String(item.id), { _supabaseId: data.id } as any)
    }
  } catch (err) {
    lastSyncError = (err as Error).message
    console.warn('[sync] pushCreate error:', (err as Error).message)
  }
}

export async function pushUpdateToSupabase(collection: string, id: string, patch: Partial<ContentItem>): Promise<void> {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()
  const userId = getSupabaseUserId()

  try {
    const items = localContentRepository.getCollectionItems(collection)
    const item = items.find((i) => String(i.id) === String(id))

    const supabaseId = item?._supabaseId as string | undefined
    if (!supabaseId) {
      if (item) {
        await pushCreateToSupabase(collection, { ...item, ...patch, id })
      }
      return
    }

    const { error } = await client
      .from('content_items')
      .update({
        data: sanitizeItemData({ ...item, ...patch }),
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', supabaseId)

    if (error) {
      lastSyncError = error.message
      console.warn('[sync] pushUpdate failed:', error.message)
    }
  } catch (err) {
    lastSyncError = (err as Error).message
    console.warn('[sync] pushUpdate error:', (err as Error).message)
  }
}

export async function pushOverrideToSupabase(collection: string, baseId: string, patch: Partial<ContentItem>): Promise<void> {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()
  const userId = getSupabaseUserId()

  try {
    const overrides = localContentRepository.getCollectionOverrides(collection)
    const existingOverride = overrides ? overrides[String(baseId)] : null

    const { data: existing } = await client
      .from('content_items')
      .select('id')
      .eq('space_id', spaceId)
      .eq('collection', collection)
      .eq('base_id', String(baseId))
      .eq('kind', 'override')
      .is('deleted_at', null)
      .limit(1)

    if (existing && existing.length > 0) {
      const supabaseId = (existing[0] as { id: string }).id
      const { error } = await client
        .from('content_items')
        .update({
          data: sanitizeItemData((existingOverride || patch) as Record<string, unknown>),
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', supabaseId)

      if (error) {
        lastSyncError = error.message
        console.warn('[sync] pushOverride update failed:', error.message)
      }
    } else {
      const { error } = await client.from('content_items').insert({
        space_id: spaceId,
        collection,
        base_id: String(baseId),
        kind: 'override',
        data: sanitizeItemData(existingOverride || patch),
        schema_version: 1,
        created_by: userId,
        updated_by: userId,
        source: 'user'
      })

      if (error) {
        lastSyncError = error.message
        console.warn('[sync] pushOverride create failed:', error.message)
      }
    }
  } catch (err) {
    lastSyncError = (err as Error).message
    console.warn('[sync] pushOverride error:', (err as Error).message)
  }
}

export async function pushDeleteOverrideToSupabase(collection: string, baseId: string): Promise<void> {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()

  try {
    const { error } = await client
      .from('content_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('space_id', spaceId)
      .eq('collection', collection)
      .eq('base_id', String(baseId))
      .eq('kind', 'override')
      .is('deleted_at', null)

    if (error) {
      lastSyncError = error.message
      console.warn('[sync] pushDeleteOverride failed:', error.message)
    }
  } catch (err) {
    lastSyncError = (err as Error).message
    console.warn('[sync] pushDeleteOverride error:', (err as Error).message)
  }
}

export async function pushDeleteToSupabase(collection: string, id: string): Promise<void> {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()

  try {
    const items = localContentRepository.getCollectionItems(collection)
    const item = items.find((i) => String(i.id) === String(id))
    const supabaseId = item?._supabaseId as string | undefined

    if (!supabaseId) return

    const { error } = await client
      .from('content_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', supabaseId)

    if (error) {
      lastSyncError = error.message
      console.warn('[sync] pushDelete failed:', error.message)
    }
  } catch (err) {
    lastSyncError = (err as Error).message
    console.warn('[sync] pushDelete error:', (err as Error).message)
  }
}

export async function pushHideToSupabase(collection: string, baseId: string): Promise<void> {
  if (!canSync()) return
  const client = getAuthenticatedClient()
  if (!client) return
  const spaceId = await getSpaceId()
  const userId = getSupabaseUserId()
  try {
    const { data: existing } = await client
      .from('content_items')
      .select('id')
      .eq('space_id', spaceId)
      .eq('collection', collection)
      .eq('base_id', String(baseId))
      .eq('kind', 'hidden')
      .is('deleted_at', null)
      .limit(1)
    if (!existing || existing.length === 0) {
      // TODO(sync): verify the `is_hidden` column actually exists in the
      // content_items table — it was added for hidden-kind rows. If the schema
      // migration didn't run, this insert fails with a 400 (column does not
      // exist) and the hide never syncs.
      await client.from('content_items').insert({
        space_id: spaceId, collection, base_id: String(baseId),
        kind: 'hidden', data: {}, is_hidden: true, schema_version: 1,
        created_by: userId, updated_by: userId, source: 'user'
      })
    }
  } catch (err) {
    lastSyncError = (err as Error).message
    console.warn('[sync] pushHide error:', (err as Error).message)
  }
}

export async function pushRestoreToSupabase(collection: string, baseId: string): Promise<void> {
  if (!canSync()) return
  const client = getAuthenticatedClient()
  if (!client) return
  const spaceId = await getSpaceId()
  try {
    await client
      .from('content_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('space_id', spaceId)
      .eq('collection', collection)
      .eq('base_id', String(baseId))
      .eq('kind', 'hidden')
      .is('deleted_at', null)
  } catch (err) {
    lastSyncError = (err as Error).message
    console.warn('[sync] pushRestore error:', (err as Error).message)
  }
}

// ---- helpers ---------------------------------------------------------------

function sanitizeItemData(item: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!item) return {}
  const { _supabaseId, id, isLocal, isOverridden, createdBy, updatedBy, createdAt, updatedAt, source, spaceId, ...data } = item
  return data as Record<string, unknown>
}
