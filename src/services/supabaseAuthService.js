/**
 * Supabase Auth Service
 *
 * Wrapper around Supabase Auth. Provides login/logout/signup and session
 * management. When VITE_REMOTE_CONTENT_ENABLED is not 'true', all methods
 * return the fake local identity, keeping the app running in local-only mode.
 */

import { getSupabaseClient, isRemoteContentEnabled } from '../integrations/supabase/client'
import { getCurrentUser, setCurrentUser, getCurrentUserId } from './authService'
import { getProfileById } from './profileService'

// ---- state -----------------------------------------------------------------

let supabaseSession = null
let sessionListeners = []

function notifyListeners() {
  sessionListeners.forEach((fn) => {
    try {
      fn(supabaseSession)
    } catch (_) {
      // listener errors must not break other listeners
    }
  })
}

// ---- helpers ---------------------------------------------------------------

function isRemoteAvailable() {
  if (!isRemoteContentEnabled()) return false
  try {
    getSupabaseClient() // throws if env is misconfigured
    return true
  } catch (_) {
    return false
  }
}

// ---- public API ------------------------------------------------------------

/**
 * Sign in with email + password.
 * On success the Supabase session is stored and the local identity selector
 * is updated to match the authenticated profile.
 */
export async function signInWithEmail(email, password) {
  if (!isRemoteAvailable()) {
    return { user: getCurrentUser(), session: null, mode: 'local-dev' }
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
 * The profile row is NOT created here — bootstrap_space() must be called
 * separately or the profile must be inserted by an admin/trigger.
 */
export async function signUpWithEmail(email, password, displayName) {
  if (!isRemoteAvailable()) {
    return {
      user: null,
      session: null,
      mode: 'local-dev',
      error: { code: 'remote-disabled', message: 'Registro remoto deshabilitado.' }
    }
  }

  const client = getSupabaseClient()

  // Create Auth user
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

  // Supabase may require email confirmation. If the user is created but not
  // confirmed, there's no session yet — that's fine, we return what we have.
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
export async function signOut() {
  if (!isRemoteAvailable()) {
    setCurrentUser('local-yori')
    return
  }

  try {
    const client = getSupabaseClient()
    await client.auth.signOut()
  } catch (_) {
    // Even if the remote call fails, clear local state
  }

  supabaseSession = null
  notifyListeners()
  setCurrentUser('local-yori')
}

/**
 * Returns the current Supabase session (or null if local-only / logged out).
 */
export function getSupabaseSession() {
  if (!isRemoteAvailable()) return null
  return supabaseSession
}

/**
 * Returns true if we have a live Supabase session.
 */
export function isSupabaseAuthenticated() {
  return isRemoteAvailable() && supabaseSession !== null
}

/**
 * Returns the Supabase user id (UUID) or null.
 */
export function getSupabaseUserId() {
  if (!supabaseSession) return null
  return supabaseSession.user?.id || null
}

/**
 * Returns the Supabase client instance for direct calls (queries, storage, etc.).
 * Returns null if remote is not available.
 */
export function getAuthenticatedClient() {
  if (!isSupabaseAuthenticated()) return null
  try {
    return getSupabaseClient()
  } catch (_) {
    return null
  }
}

/**
 * Register a listener for session changes.
 * Returns an unsubscribe function.
 */
export function onSessionChange(listener) {
  sessionListeners.push(listener)
  return () => {
    sessionListeners = sessionListeners.filter((fn) => fn !== listener)
  }
}

/**
 * Try to restore a session from Supabase (e.g. on page reload).
 * Call once at app startup.
 */
export async function restoreSession() {
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

    // Update local identity
    const profile = getProfileById(data.session.user.id)
    if (profile) {
      setCurrentUser(profile.id)
    }

    return data.session
  } catch (err) {
    console.warn('[auth] restoreSession failed:', err.message)
    supabaseSession = null
    notifyListeners()
    return null
  }
}
