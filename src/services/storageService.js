/**
 * Storage Service
 *
 * Upload/download/delete files to/from Supabase Storage buckets.
 * Path convention: {space_id}/{filename}
 */

import { getAuthenticatedClient, isSupabaseAuthenticated } from './supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { getLocalSpaceId } from '../utils/localIdentityStore'

// ---- helpers ---------------------------------------------------------------

function getClient() {
  if (!isRemoteContentEnabled() || !isSupabaseAuthenticated()) return null
  try {
    return getAuthenticatedClient()
  } catch (_) {
    return null
  }
}

async function getSpaceId() {
  const client = getClient()
  if (!client) return getLocalSpaceId()

  try {
    const { data } = await client
      .from('universe_members')
      .select('space_id')
      .limit(1)
      .single()
    return data?.space_id || getLocalSpaceId()
  } catch (_) {
    return getLocalSpaceId()
  }
}

function getBucketForType(type) {
  if (type === 'audio') return 'audio'
  if (type === 'video') return 'videos'
  return 'images'
}

function getContentType(file) {
  if (file.type) return file.type
  const ext = (file.name || '').split('.').pop()?.toLowerCase()
  const map = {
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm'
  }
  return map[ext] || 'application/octet-stream'
}

// ---- public API ------------------------------------------------------------

/**
 * Upload a file to Supabase Storage.
 * @param {File} file - The File object from an input
 * @param {'images'|'audio'|'videos'} type
 * @returns {{ path: string, url: string|null, error: string|null }}
 */
export async function uploadFile(file, type = 'images') {
  const client = getClient()
  if (!client) return { path: '', url: null, error: 'No authenticated client.' }

  const spaceId = await getSpaceId()
  const bucket = getBucketForType(type)
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${spaceId}/${timestamp}_${safeName}`

  try {
    const { error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        contentType: getContentType(file),
        upsert: false
      })

    if (error) {
      return { path: '', url: null, error: error.message || 'Upload failed.' }
    }

    // Get a signed URL (valid 1 hour — for display we may want longer-lived URLs)
    const { data: urlData } = await client.storage
      .from(bucket)
      .createSignedUrl(path, 3600)

    return {
      path: `${bucket}/${path}`,
      url: urlData?.signedUrl || null,
      error: null
    }
  } catch (err) {
    return { path: '', url: null, error: err.message || 'Upload error.' }
  }
}

/**
 * Get a public/signed URL for a stored file.
 * @param {string} fullPath - bucket/path format from uploadFile result
 * @param {number} expiresIn - seconds until URL expires (default 1 hour)
 */
export async function getFileUrl(fullPath, expiresIn = 3600) {
  const client = getClient()
  if (!client) return null

  const [bucket, ...pathParts] = fullPath.split('/')
  const path = pathParts.join('/')

  try {
    const { data } = await client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    return data?.signedUrl || null
  } catch (_) {
    return null
  }
}

/**
 * Get a public URL for a file (for reading, not downloading).
 * Only works for public buckets.
 */
export function getPublicUrl(fullPath) {
  const client = getClient()
  if (!client) return null

  const [bucket, ...pathParts] = fullPath.split('/')
  const path = pathParts.join('/')

  try {
    const { data } = client.storage.from(bucket).getPublicUrl(path)
    return data?.publicUrl || null
  } catch (_) {
    return null
  }
}

/**
 * Delete a file from Storage.
 * @param {string} fullPath - bucket/path format
 */
export async function deleteFile(fullPath) {
  const client = getClient()
  if (!client) return { error: 'No authenticated client.' }

  const [bucket, ...pathParts] = fullPath.split('/')
  const path = pathParts.join('/')

  try {
    const { error } = await client.storage.from(bucket).remove([path])
    if (error) return { error: error.message }
    return { error: null }
  } catch (err) {
    return { error: err.message }
  }
}

/**
 * List files in a bucket for the current space.
 * @param {'images'|'audio'|'videos'} type
 */
export async function listFiles(type = 'images') {
  const client = getClient()
  if (!client) return []

  const spaceId = await getSpaceId()
  const bucket = getBucketForType(type)

  try {
    const { data, error } = await client.storage
      .from(bucket)
      .list(spaceId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (error) return []
    return (data || []).map((f) => ({
      name: f.name,
      path: `${bucket}/${spaceId}/${f.name}`,
      size: f.metadata?.size || 0,
      createdAt: f.created_at
    }))
  } catch (_) {
    return []
  }
}
