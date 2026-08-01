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
    return { synced: 0, error: (err as Error).message || 'Unexpected sync error.' }
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
    const { error, data } = await client.from('content_items').insert({
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
    } else if (data && (data as any[]).length > 0 && (data as any[])[0]?.id) {
      // Save the Supabase-generated ID back to the local item so updates don't create duplicates
      localContentRepository.updateCollectionItem(collection, String(item.id), { _supabaseId: (data as any[])[0].id } as any)
    }
  } catch (err) {
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
      console.warn('[sync] pushUpdate failed:', error.message)
    }
  } catch (err) {
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

      if (error) console.warn('[sync] pushOverride update failed:', error.message)
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

      if (error) console.warn('[sync] pushOverride create failed:', error.message)
    }
  } catch (err) {
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

    if (error) console.warn('[sync] pushDeleteOverride failed:', error.message)
  } catch (err) {
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
      console.warn('[sync] pushDelete failed:', error.message)
    }
  } catch (err) {
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
      await client.from('content_items').insert({
        space_id: spaceId, collection, base_id: String(baseId),
        kind: 'hidden', data: {}, is_hidden: true, schema_version: 1,
        created_by: userId, updated_by: userId, source: 'user'
      })
    }
  } catch (err) { console.warn('[sync] pushHide error:', (err as Error).message) }
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
  } catch (err) { console.warn('[sync] pushRestore error:', (err as Error).message) }
}

// ---- helpers ---------------------------------------------------------------

function sanitizeItemData(item: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!item) return {}
  const { _supabaseId, id, isLocal, isOverridden, createdBy, updatedBy, createdAt, updatedAt, source, spaceId, ...data } = item
  return data as Record<string, unknown>
}
