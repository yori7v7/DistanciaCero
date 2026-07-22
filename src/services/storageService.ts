/**
 * Storage Service
 *
 * Upload/download/delete files to/from Supabase Storage buckets.
 * Path convention: {space_id}/{filename}
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { getAuthenticatedClient, isSupabaseAuthenticated } from './supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { getLocalSpaceId } from '../utils/localIdentityStore'

type StorageBucket = 'images' | 'audio' | 'videos'

interface UploadResult {
  path: string
  url: string | null
  error: string | null
}

interface DeleteResult {
  error: string | null
}

interface FileEntry {
  name: string
  path: string
  size: number
  createdAt: string
}

// ---- helpers ---------------------------------------------------------------

function getClient(): SupabaseClient | null {
  if (!isRemoteContentEnabled() || !isSupabaseAuthenticated()) return null
  try {
    return getAuthenticatedClient()
  } catch {
    return null
  }
}

async function getSpaceId(): Promise<string> {
  const client = getClient()
  if (!client) return getLocalSpaceId()

  try {
    const { data } = await client
      .from('universe_members')
      .select('space_id')
      .limit(1)
      .single()
    return (data as { space_id?: string })?.space_id || getLocalSpaceId()
  } catch {
    return getLocalSpaceId()
  }
}

function getBucketForType(type: string): StorageBucket {
  if (type === 'audio') return 'audio'
  if (type === 'video') return 'videos'
  return 'images'
}

function getContentType(file: File): string {
  if (file.type) return file.type
  const ext = (file.name || '').split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', webm: 'video/webm'
  }
  return map[ext || ''] || 'application/octet-stream'
}

// ---- public API ------------------------------------------------------------

/**
 * Upload a file to Supabase Storage.
 */
export async function uploadFile(file: File, type = 'images'): Promise<UploadResult> {
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

    const { data: urlData } = await client.storage
      .from(bucket)
      .createSignedUrl(path, 3600)

    return {
      path: `${bucket}/${path}`,
      url: urlData?.signedUrl || null,
      error: null
    }
  } catch (err) {
    return { path: '', url: null, error: (err as Error).message || 'Upload error.' }
  }
}

/**
 * Get a public/signed URL for a stored file.
 */
export async function getFileUrl(fullPath: string, expiresIn = 3600): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  const [bucket, ...pathParts] = fullPath.split('/')
  const path = pathParts.join('/')

  try {
    const { data } = await client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    return data?.signedUrl || null
  } catch (err) {
    console.warn('[storage] getFileUrl failed:', (err as Error).message)
    return null
  }
}

/**
 * Get a public URL for a file (for reading, not downloading).
 */
export function getPublicUrl(fullPath: string): string | null {
  const client = getClient()
  if (!client) return null

  const [bucket, ...pathParts] = fullPath.split('/')
  const path = pathParts.join('/')

  try {
    const { data } = client.storage.from(bucket).getPublicUrl(path)
    return data?.publicUrl || null
  } catch (err) {
    console.warn('[storage] getPublicUrl failed:', (err as Error).message)
    return null
  }
}

/**
 * Delete a file from Storage.
 */
export async function deleteFile(fullPath: string): Promise<DeleteResult> {
  const client = getClient()
  if (!client) return { error: 'No authenticated client.' }

  const [bucket, ...pathParts] = fullPath.split('/')
  const path = pathParts.join('/')

  try {
    const { error } = await client.storage.from(bucket).remove([path])
    if (error) return { error: error.message }
    return { error: null }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

/**
 * List files in a bucket for the current space.
 */
export async function listFiles(type = 'images'): Promise<FileEntry[]> {
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
      size: (f.metadata as { size?: number })?.size || 0,
      createdAt: f.created_at
    }))
  } catch (err) {
    console.warn('[storage] listFiles failed:', (err as Error).message)
    return []
  }
}
