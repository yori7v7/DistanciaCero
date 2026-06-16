import { DEFAULT_LOCAL_USER_ID, DEFAULT_SPACE_ID } from '../constants/localUsers'

const CURRENT_USER_KEY = 'distancia-cero-local-current-user'
const CURRENT_SPACE_KEY = 'distancia-cero-local-current-space'

function canUseLocalStorage() {
  if (typeof window === 'undefined') return false

  try {
    return typeof window.localStorage !== 'undefined'
  } catch (error) {
    return false
  }
}

function safeGetItem(key) {
  if (!canUseLocalStorage()) return null

  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

function safeSetItem(key, value) {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    // Keep fake/dev identity storage non-throwing.
  }
}

function safeRemoveItem(key) {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    // Keep fake/dev identity storage non-throwing.
  }
}

function normalizeStoredValue(value, fallback) {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''
  return normalizedValue || fallback
}

export function getLocalCurrentUserId() {
  return normalizeStoredValue(safeGetItem(CURRENT_USER_KEY), DEFAULT_LOCAL_USER_ID)
}

export function setLocalCurrentUserId(userId) {
  const safeUserId = normalizeStoredValue(userId, DEFAULT_LOCAL_USER_ID)
  safeSetItem(CURRENT_USER_KEY, safeUserId)
  return safeUserId
}

export function getLocalSpaceId() {
  return normalizeStoredValue(safeGetItem(CURRENT_SPACE_KEY), DEFAULT_SPACE_ID)
}

export function setLocalSpaceId(spaceId) {
  const safeSpaceId = normalizeStoredValue(spaceId, DEFAULT_SPACE_ID)
  safeSetItem(CURRENT_SPACE_KEY, safeSpaceId)
  return safeSpaceId
}

export function clearLocalIdentity() {
  safeRemoveItem(CURRENT_USER_KEY)
  safeRemoveItem(CURRENT_SPACE_KEY)
}
