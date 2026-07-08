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

import { isSupabaseAuthenticated, getAuthenticatedClient, getSupabaseUserId } from './supabaseAuthService'
import * as localContentRepository from '../repositories/localContentRepository'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { getLocalSpaceId } from '../utils/localIdentityStore'

// ---- helpers ---------------------------------------------------------------

let _cachedSpaceId = null

function canSync() {
  return isRemoteContentEnabled() && isSupabaseAuthenticated()
}

/**
 * Resolves the real Supabase space UUID from the user's memberships.
 * Cached after first successful lookup.
 */
async function resolveSpaceId() {
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

    _cachedSpaceId = data.space_id
    return _cachedSpaceId
  } catch (_) {
    return null
  }
}

async function getSpaceId() {
  const realId = await resolveSpaceId()
  return realId || getLocalSpaceId()
}

// ---- pull: hydrate localStorage from Supabase ------------------------------

/**
 * Fetch ALL content for the current space from Supabase and write it into
 * localStorage. Called once after successful login.
 *
 * Returns { synced: number, error: string|null }
 */
export async function pullFromSupabase() {
  if (!canSync()) {
    return { synced: 0, error: 'Remote not available or not authenticated.' }
  }

  const client = getAuthenticatedClient()
  if (!client) {
    return { synced: 0, error: 'No authenticated client.' }
  }

  const spaceId = await getSpaceId()

  try {
    // Fetch all non-deleted content_items for this space
    const { data, error } = await client
      .from('content_items')
      .select('*')
      .eq('space_id', spaceId)
      .is('deleted_at', null)

    if (error) {
      return { synced: 0, error: error.message || 'Error fetching content.' }
    }

    if (!data || data.length === 0) {
      return { synced: 0, error: null }
    }

    // Group by collection and kind
    const collections = {}
    const overrides = {}
    const hiddenIds = {}

    for (const item of data) {
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
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          source: item.source,
          spaceId: item.space_id
        })
      } else if (item.kind === 'override') {
        overrides[col][item.base_id] = {
          ...item.data,
          _supabaseId: item.id
        }
      } else if (item.kind === 'hidden') {
        hiddenIds[col].push(item.base_id)
      }
    }

    let synced = 0

    // Write collections to localStorage
    for (const [col, items] of Object.entries(collections)) {
      if (items.length > 0) {
        localContentRepository.saveCollectionItems(col, items)
        synced += items.length
      }
    }

    // Write overrides
    for (const [col, patches] of Object.entries(overrides)) {
      if (Object.keys(patches).length > 0) {
        localContentRepository.saveCollectionOverrides(col, patches)
        synced += Object.keys(patches).length
      }
    }

    // Write hidden ids
    for (const [col, ids] of Object.entries(hiddenIds)) {
      if (ids.length > 0) {
        localContentRepository.saveCollectionHiddenIds(col, ids)
        synced += ids.length
      }
    }

    // Legacy letter sync
    await pullLegacyLetters(client, spaceId)

    return { synced, error: null }
  } catch (err) {
    return { synced: 0, error: err.message || 'Unexpected sync error.' }
  }
}

async function pullLegacyLetters(client, spaceId) {
  try {
    const { data } = await client
      .from('content_items')
      .select('*')
      .eq('space_id', spaceId)
      .eq('collection', 'monthlyLetters')
      .eq('kind', 'local')
      .is('deleted_at', null)

    if (data && data.length > 0) {
      localContentRepository.saveLegacyMonthlyLetters(data.map((item) => ({
        ...item.data,
        id: item.local_id || item.id,
        _supabaseId: item.id
      })))
    }
  } catch (_) { /* best-effort */ }

  try {
    const { data } = await client
      .from('content_items')
      .select('*')
      .eq('space_id', spaceId)
      .eq('collection', 'openWhen')
      .eq('kind', 'local')
      .is('deleted_at', null)

    if (data && data.length > 0) {
      localContentRepository.saveLegacyOpenWhenLetters(data.map((item) => ({
        ...item.data,
        id: item.local_id || item.id,
        _supabaseId: item.id
      })))
    }
  } catch (_) { /* best-effort */ }
}

// ---- push: background sync to Supabase -------------------------------------

/**
 * Push a single content item create to Supabase (fire-and-forget).
 */
export async function pushCreateToSupabase(collection, item) {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()
  const userId = getSupabaseUserId()

  try {
    const { error } = await client.from('content_items').insert({
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

    if (error) {
      console.warn('[sync] pushCreate failed:', error.message)
    }
  } catch (err) {
    console.warn('[sync] pushCreate error:', err.message)
  }
}

/**
 * Push a content item update to Supabase (fire-and-forget).
 */
export async function pushUpdateToSupabase(collection, id, patch) {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()
  const userId = getSupabaseUserId()

  try {
    // Find the Supabase id for this local item
    const items = localContentRepository.getCollectionItems(collection)
    const item = items.find((i) => String(i.id) === String(id))

    const supabaseId = item?._supabaseId
    if (!supabaseId) {
      // Item exists locally but not yet in Supabase — create it instead
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
      console.warn('[sync] pushUpdate failed:', error.message)
    }
  } catch (err) {
    console.warn('[sync] pushUpdate error:', err.message)
  }
}

/**
 * Push an OVERRIDE update to Supabase.
 * Overrides are stored in a separate localStorage key from items,
 * so they need their own lookup logic.
 */
export async function pushOverrideToSupabase(collection, baseId, patch) {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()
  const userId = getSupabaseUserId()

  try {
    // Overrides are stored by base_id in the overrides store
    const overrides = localContentRepository.getCollectionOverrides(collection)
    const existingOverride = overrides ? overrides[String(baseId)] : null

    // Try to find if this override already exists in Supabase
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
      // Update existing override
      const supabaseId = existing[0].id
      const { error } = await client
        .from('content_items')
        .update({
          data: sanitizeItemData(existingOverride || patch),
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', supabaseId)

      if (error) console.warn('[sync] pushOverride update failed:', error.message)
    } else {
      // Create new override record
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

      if (error) console.warn('[sync] pushOverride create failed:', error.message)
    }
  } catch (err) {
    console.warn('[sync] pushOverride error:', err.message)
  }
}

/**
 * Push an OVERRIDE deletion to Supabase (soft-delete).
 */
export async function pushDeleteOverrideToSupabase(collection, baseId) {
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

    if (error) console.warn('[sync] pushDeleteOverride failed:', error.message)
  } catch (err) {
    console.warn('[sync] pushDeleteOverride error:', err.message)
  }
}

/**
 * Push a content item delete (soft-delete) to Supabase (fire-and-forget).
 */
export async function pushDeleteToSupabase(collection, id) {
  if (!canSync()) return

  const client = getAuthenticatedClient()
  if (!client) return

  const spaceId = await getSpaceId()

  try {
    const items = localContentRepository.getCollectionItems(collection)
    const item = items.find((i) => String(i.id) === String(id))
    const supabaseId = item?._supabaseId

    if (!supabaseId) return

    const { error } = await client
      .from('content_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', supabaseId)

    if (error) {
      console.warn('[sync] pushDelete failed:', error.message)
    }
  } catch (err) {
    console.warn('[sync] pushDelete error:', err.message)
  }
}

export async function pushHideToSupabase(collection, baseId) {
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
      await client.from('content_items').insert({
        space_id: spaceId, collection, base_id: String(baseId),
        kind: 'hidden', data: {}, is_hidden: true, schema_version: 1,
        created_by: userId, updated_by: userId, source: 'user'
      })
    }
  } catch (err) { console.warn('[sync] pushHide error:', err.message) }
}

export async function pushRestoreToSupabase(collection, baseId) {
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
  } catch (err) { console.warn('[sync] pushRestore error:', err.message) }
}

// ---- helpers ---------------------------------------------------------------

function sanitizeItemData(item) {
  if (!item) return {}
  // Strip internal fields before sending to Supabase
  const { _supabaseId, id, isLocal, isOverridden, createdBy, updatedBy, createdAt, updatedAt, source, spaceId, ...data } = item
  return data
}
