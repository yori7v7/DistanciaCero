import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

export const SUPABASE_CLIENT_FACTORY_IMPLEMENTED = true

const STATUS_DISABLED = 'disabled'
const STATUS_READY = 'ready'
const STATUS_ENV_MISSING = 'env-missing'
const STATUS_ENV_INVALID = 'env-invalid'

const ERROR_MESSAGES = Object.freeze({
  SUPABASE_REMOTE_DISABLED: 'Remote Supabase content is disabled. No client was created.',
  SUPABASE_ENV_MISSING: 'Required public Supabase environment variables are missing. No client was created.',
  SUPABASE_ENV_INVALID: 'Supabase environment configuration is invalid. No client was created.'
})

let defaultSupabaseClient = null

function getDefaultEnv() {
  return import.meta.env || {}
}

function getSafeEnv(env) {
  return env && typeof env === 'object' ? env : {}
}

function getTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidHttpsUrl(value) {
  try {
    const parsedUrl = new URL(value)
    return (
      parsedUrl.protocol === 'https:' &&
      Boolean(parsedUrl.hostname) &&
      !parsedUrl.username &&
      !parsedUrl.password
    )
  } catch (error) {
    return false
  }
}

function inspectSupabaseEnv(env) {
  const safeEnv = getSafeEnv(env)
  const remoteEnabled = isRemoteContentEnabled(safeEnv)

  if (!remoteEnabled) {
    return {
      status: STATUS_DISABLED,
      remoteEnabled: false,
      missing: [],
      hasUrl: false,
      hasPublicKey: false,
      keySource: null,
      url: '',
      key: ''
    }
  }

  const url = getTrimmedString(safeEnv.VITE_SUPABASE_URL)
  const publishableKey = getTrimmedString(
    safeEnv.VITE_SUPABASE_PUBLISHABLE_KEY
  )
  const anonKey = getTrimmedString(safeEnv.VITE_SUPABASE_ANON_KEY)
  const key = publishableKey || anonKey
  let keySource = null
  if (publishableKey) keySource = 'publishable'
  else if (anonKey) keySource = 'anon'
  const missing = []

  if (!url) missing.push('VITE_SUPABASE_URL')
  if (!key) {
    missing.push(
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'VITE_SUPABASE_ANON_KEY'
    )
  }

  if (missing.length > 0) {
    return {
      status: STATUS_ENV_MISSING,
      remoteEnabled: true,
      missing,
      hasUrl: Boolean(url),
      hasPublicKey: Boolean(key),
      keySource,
      url,
      key
    }
  }

  if (!isValidHttpsUrl(url)) {
    return {
      status: STATUS_ENV_INVALID,
      remoteEnabled: true,
      missing: [],
      hasUrl: true,
      hasPublicKey: true,
      keySource,
      url,
      key
    }
  }

  return {
    status: STATUS_READY,
    remoteEnabled: true,
    missing: [],
    hasUrl: true,
    hasPublicKey: true,
    keySource,
    url,
    key
  }
}

function getErrorCode(status) {
  if (status === STATUS_DISABLED) return 'SUPABASE_REMOTE_DISABLED'
  if (status === STATUS_ENV_MISSING) return 'SUPABASE_ENV_MISSING'
  return 'SUPABASE_ENV_INVALID'
}

export class SupabaseEnvironmentError extends Error {
  /**
   * @param {string} code
   * @param {string} status
   * @param {string[]} [missing]
   */
  constructor(code, status, missing = []) {
    super(ERROR_MESSAGES[code] || ERROR_MESSAGES.SUPABASE_ENV_INVALID)
    this.name = 'SupabaseEnvironmentError'
    this.code = code
    this.status = status
    this.missing = Object.freeze(Array.isArray(missing) ? [...missing] : [])
  }
}

/**
 * Returns true only for the explicit remote opt-in string "true".
 *
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isRemoteContentEnabled(env = getDefaultEnv()) {
  return getSafeEnv(env).VITE_REMOTE_CONTENT_ENABLED === 'true'
}

/**
 * Returns a safe environment summary without exposing URL or key values.
 *
 * @param {Record<string, unknown>} [env]
 * @returns {{
 *   status: string,
 *   remoteEnabled: boolean,
 *   missing: readonly string[],
 *   hasUrl: boolean,
 *   hasPublicKey: boolean,
 *   keySource: 'publishable'|'anon'|null
 * }}
 */
export function getSupabaseEnvStatus(env = getDefaultEnv()) {
  const inspected = inspectSupabaseEnv(env)

  return Object.freeze({
    status: inspected.status,
    remoteEnabled: inspected.remoteEnabled,
    missing: Object.freeze([...inspected.missing]),
    hasUrl: inspected.hasUrl,
    hasPublicKey: inspected.hasPublicKey,
    keySource: inspected.keySource
  })
}

/**
 * Creates a new passive Supabase client after explicit environment validation.
 * It does not execute queries or start application listeners.
 *
 * @param {Record<string, unknown>} [env]
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 * @throws {SupabaseEnvironmentError}
 */
export function createSupabaseClient(env = getDefaultEnv()) {
  const inspected = inspectSupabaseEnv(env)

  if (inspected.status !== STATUS_READY) {
    throw new SupabaseEnvironmentError(
      getErrorCode(inspected.status),
      inspected.status,
      inspected.missing
    )
  }

  return createSupabaseJsClient(inspected.url, inspected.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

/**
 * Lazily creates the default client. Custom env objects create isolated clients
 * and never populate the default singleton, which keeps smoke tests contained.
 *
 * @param {Record<string, unknown>} [env]
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseClient(env) {
  if (env !== undefined) return createSupabaseClient(env)

  if (!defaultSupabaseClient) {
    defaultSupabaseClient = createSupabaseClient(getDefaultEnv())
  }

  return defaultSupabaseClient
}
