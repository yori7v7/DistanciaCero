import { LOCAL_USERS } from '../constants/localUsers'
import { isSupabaseAuthenticated, getSupabaseSession } from './supabaseAuthService'

// Simple in-memory cache for Supabase profile display names
const _displayNameCache = {}

export function getProfiles() {
  return LOCAL_USERS
}

export function getProfileById(id) {
  // Check local users first
  const local = LOCAL_USERS.find((user) => String(user.id) === String(id))
  if (local) return local

  // If Supabase session exists, check the session user
  if (isSupabaseAuthenticated()) {
    const session = getSupabaseSession()
    if (session?.user?.id === id) {
      return {
        id: session.user.id,
        displayName: session.user.user_metadata?.display_name || session.user.email || 'Usuario',
        role: 'member',
        avatar: null
      }
    }
  }

  // Check cache
  if (_displayNameCache[id]) {
    return { id, displayName: _displayNameCache[id], role: 'member', avatar: null }
  }

  return null
}

export function getDisplayName(userId) {
  if (!userId) return ''

  const profile = getProfileById(userId)
  if (profile?.displayName) return profile.displayName

  // If it's a UUID (Supabase), cache and return a fallback
  if (userId.includes('-') && userId.length > 30) {
    _displayNameCache[userId] = 'Usuario'
    return 'Usuario'
  }

  return userId
}
