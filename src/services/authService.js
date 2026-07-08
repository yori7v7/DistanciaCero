import { DEFAULT_LOCAL_USER_ID } from '../constants/localUsers'
import { getLocalCurrentUserId, setLocalCurrentUserId } from '../utils/localIdentityStore'
import { getProfileById } from './profileService'
import { isSupabaseAuthenticated, getSupabaseSession, getSupabaseUserId } from './supabaseAuthService'

function getDefaultUser() {
  return getProfileById(DEFAULT_LOCAL_USER_ID)
}

export function getCurrentUserId() {
  if (isSupabaseAuthenticated()) {
    const supabaseId = getSupabaseUserId()
    if (supabaseId) return supabaseId
  }

  const storedUserId = getLocalCurrentUserId()
  return getProfileById(storedUserId)?.id || DEFAULT_LOCAL_USER_ID
}

export function getCurrentUser() {
  if (isSupabaseAuthenticated()) {
    const session = getSupabaseSession()
    if (session?.user) {
      return {
        id: session.user.id,
        displayName: session.user.user_metadata?.display_name || session.user.email,
        role: 'member',
        avatar: null
      }
    }
  }

  return getProfileById(getCurrentUserId()) || getDefaultUser()
}

export function setCurrentUser(userId) {
  if (isSupabaseAuthenticated()) {
    return getCurrentUser()
  }

  const nextUser = getProfileById(userId)
  if (!nextUser) return getCurrentUser()

  setLocalCurrentUserId(nextUser.id)
  return nextUser
}

export function isAuthenticated() {
  if (isSupabaseAuthenticated()) return true
  return true // local mode is always authenticated
}

export function getSession() {
  if (isSupabaseAuthenticated()) {
    const session = getSupabaseSession()
    if (session) {
      return {
        mode: 'remote',
        user: {
          id: session.user.id,
          displayName: session.user.user_metadata?.display_name || session.user.email,
          role: 'member',
          avatar: null
        }
      }
    }
  }

  return {
    mode: 'local-dev',
    user: getCurrentUser()
  }
}
