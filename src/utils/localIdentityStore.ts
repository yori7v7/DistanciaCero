import { DEFAULT_LOCAL_USER_ID, DEFAULT_SPACE_ID } from '../constants/localUsers'

const CURRENT_USER_KEY = 'distancia-cero-local-current-user'
const CURRENT_SPACE_KEY = 'distancia-cero-local-current-space'

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

function safeGetItem(key: string): string | null {
  if (!canUseLocalStorage()) return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Keep fake/dev identity storage non-throwing.
  }
}

function safeRemoveItem(key: string): void {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Keep fake/dev identity storage non-throwing.
  }
}

function normalizeStoredValue(value: string | null, fallback: string): string {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''
  return normalizedValue || fallback
}

export function getLocalCurrentUserId(): string {
  return normalizeStoredValue(safeGetItem(CURRENT_USER_KEY), DEFAULT_LOCAL_USER_ID)
}

export function setLocalCurrentUserId(userId: string): string {
  const safeUserId = normalizeStoredValue(userId, DEFAULT_LOCAL_USER_ID)
  safeSetItem(CURRENT_USER_KEY, safeUserId)
  return safeUserId
}

export function getLocalSpaceId(): string {
  return normalizeStoredValue(safeGetItem(CURRENT_SPACE_KEY), DEFAULT_SPACE_ID)
}

export function setLocalSpaceId(spaceId: string): string {
  const safeSpaceId = normalizeStoredValue(spaceId, DEFAULT_SPACE_ID)
  safeSetItem(CURRENT_SPACE_KEY, safeSpaceId)
  return safeSpaceId
}

export function clearLocalIdentity(): void {
  safeRemoveItem(CURRENT_USER_KEY)
  safeRemoveItem(CURRENT_SPACE_KEY)
}
