/**
 * Supabase Auth Service
 *
 * Wrapper around Supabase Auth. Provides login/logout/signup and session
 * management. When VITE_REMOTE_CONTENT_ENABLED is not 'true', all methods
 * return the fake local identity, keeping the app running in local-only mode.
 */

import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isRemoteContentEnabled } from '../integrations/supabase/client'
import { getCurrentUser, setCurrentUser } from './authService'
import { getProfileById } from './profileService'

type SessionListener = (session: Session | null) => void

interface AuthResult {
  user: User | null
  session: Session | null
  mode: 'local-dev' | 'remote'
  error?: { code: string; message: string } | null
  needsEmailConfirmation?: boolean
}

// ---- state -----------------------------------------------------------------

let supabaseSession: Session | null = null
let sessionListeners: SessionListener[] = []

function notifyListeners(): void {
  sessionListeners.forEach((fn) => {
    try {
      fn(supabaseSession)
    } catch {
      // listener errors must not break other listeners
    }
  })
}

// ---- helpers ---------------------------------------------------------------

function isRemoteAvailable(): boolean {
  if (!isRemoteContentEnabled()) return false
  try {
    getSupabaseClient() // throws if env is misconfigured
    return true
  } catch {
    return false
  }
}

// ---- public API ------------------------------------------------------------

/**
 * Sign in with email + password.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isRemoteAvailable()) {
    return { user: getCurrentUser() as unknown as User, session: null, mode: 'local-dev' }
  }

  const client = getSupabaseClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })

  if (error) {
    return {
      user: null,
      session: null,
      mode: 'remote',
      error: {
        code: error.code || 'auth-error',
        message: error.message || 'Error al iniciar sesión.'
      }
    }
  }

  supabaseSession = data.session
  notifyListeners()

  // Map Supabase user to local identity
  const profile = getProfileById(data.user.id)
  if (profile) {
    setCurrentUser(profile.id)
  }

  return {
    user: data.user,
    session: data.session,
    mode: 'remote',
    error: null
  }
}

/**
 * Create a new account with email + password.
 */
export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthResult> {
  if (!isRemoteAvailable()) {
    return {
      user: null,
      session: null,
      mode: 'local-dev',
      error: { code: 'remote-disabled', message: 'Registro remoto deshabilitado.' }
    }
  }

  const client = getSupabaseClient()

  const { data: signUpData, error: signUpError } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName }
    }
  })

  if (signUpError) {
    return {
      user: null,
      session: null,
      mode: 'remote',
      error: {
        code: signUpError.code || 'signup-error',
        message: signUpError.message || 'Error al crear cuenta.'
      }
    }
  }

  supabaseSession = signUpData.session
  notifyListeners()

  if (signUpData.session && signUpData.user) {
    const profile = getProfileById(signUpData.user.id)
    if (profile) {
      setCurrentUser(profile.id)
    }
  }

  return {
    user: signUpData.user,
    session: signUpData.session,
    mode: 'remote',
    needsEmailConfirmation: !signUpData.session,
    error: null
  }
}

/**
 * Sign out. Clears Supabase session and resets to local identity.
 */
export async function signOut(): Promise<void> {
  if (!isRemoteAvailable()) {
    setCurrentUser('local-user1')
    return
  }

  try {
    const client = getSupabaseClient()
    await client.auth.signOut()
  } catch {
    // Even if the remote call fails, clear local state
  }

  supabaseSession = null
  notifyListeners()
  setCurrentUser('local-user1')
}

/**
 * Returns the current Supabase session (or null if local-only / logged out).
 */
export function getSupabaseSession(): Session | null {
  if (!isRemoteAvailable()) return null
  return supabaseSession
}

/**
 * Returns true if we have a live Supabase session.
 */
export function isSupabaseAuthenticated(): boolean {
  return isRemoteAvailable() && supabaseSession !== null
}

/**
 * Returns the Supabase user id (UUID) or null.
 */
export function getSupabaseUserId(): string | null {
  if (!supabaseSession) return null
  return supabaseSession.user?.id || null
}

/**
 * Returns the Supabase client instance for direct calls (queries, storage, etc.).
 */
export function getAuthenticatedClient() {
  if (!isSupabaseAuthenticated()) return null
  try {
    return getSupabaseClient()
  } catch {
    return null
  }
}

/**
 * Register a listener for session changes.
 * Returns an unsubscribe function.
 */
export function onSessionChange(listener: SessionListener): () => void {
  sessionListeners.push(listener)
  return () => {
    sessionListeners = sessionListeners.filter((fn) => fn !== listener)
  }
}

/**
 * Try to restore a session from Supabase (e.g. on page reload).
 */
export async function restoreSession(): Promise<Session | null> {
  if (!isRemoteAvailable()) return null

  try {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.getSession()

    if (error || !data.session) {
      supabaseSession = null
      notifyListeners()
      return null
    }

    supabaseSession = data.session
    notifyListeners()

    const profile = getProfileById(data.session.user.id)
    if (profile) {
      setCurrentUser(profile.id)
    }

    return data.session
  } catch (err) {
    console.warn('[auth] restoreSession failed:', (err as Error).message)
    supabaseSession = null
    notifyListeners()
    return null
  }
}
