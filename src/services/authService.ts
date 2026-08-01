import type { LocalUser, AuthSession } from '../types/identity'
import { DEFAULT_LOCAL_USER_ID } from '../constants/localUsers'
import { getLocalCurrentUserId, setLocalCurrentUserId } from '../utils/localIdentityStore'
import { getProfileById } from './profileService'
import { isSupabaseAuthenticated, getSupabaseSession, getSupabaseUserId } from './supabaseAuthService'

function getDefaultUser(): LocalUser {
  const user = getProfileById(DEFAULT_LOCAL_USER_ID)
  if (!user) throw new Error(`Default local user '${DEFAULT_LOCAL_USER_ID}' not found in LOCAL_USERS`)
  return user
}

export function getCurrentUserId(): string {
  if (isSupabaseAuthenticated()) {
    const supabaseId = getSupabaseUserId()
    if (supabaseId) return supabaseId
  }

  const storedUserId = getLocalCurrentUserId()
  return getProfileById(storedUserId)?.id || DEFAULT_LOCAL_USER_ID
}

export function getCurrentUser(): LocalUser {
  if (isSupabaseAuthenticated()) {
    const session = getSupabaseSession()
    if (session?.user) {
      return {
        id: session.user.id,
        slug: '',
        displayName: session.user.user_metadata?.display_name || session.user.email || 'Usuario',
        role: 'member',
        avatar: null
      }
    }
  }

  return getProfileById(getCurrentUserId()) || getDefaultUser()
}

export function setCurrentUser(userId: string): LocalUser {
  if (isSupabaseAuthenticated()) {
    return getCurrentUser()
  }

  const nextUser = getProfileById(userId)
  if (!nextUser) return getCurrentUser()

  setLocalCurrentUserId(nextUser.id)
  return nextUser
}

export function isAuthenticated(): boolean {
  if (isSupabaseAuthenticated()) return true
  return true // local mode is always authenticated
}

export function getSession(): AuthSession {
  if (isSupabaseAuthenticated()) {
    const session = getSupabaseSession()
    if (session) {
      return {
        mode: 'remote',
        user: {
          id: session.user.id,
          slug: '',
          displayName: session.user.user_metadata?.display_name || session.user.email || 'Usuario',
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
