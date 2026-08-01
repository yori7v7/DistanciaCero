import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLocalCurrentUserId,
  setLocalCurrentUserId,
  getLocalSpaceId,
  setLocalSpaceId,
  clearLocalIdentity
} from '../utils/localIdentityStore'

beforeEach(() => {
  localStorage.clear()
})

describe('localIdentityStore', () => {
  it('getLocalCurrentUserId returns default when not set', () => {
    const id = getLocalCurrentUserId()
    expect(id).toBe('local-user1')
  })

  it('setLocalCurrentUserId persists value', () => {
    setLocalCurrentUserId('local-user2')
    expect(getLocalCurrentUserId()).toBe('local-user2')
  })

  it('setLocalCurrentUserId normalizes empty values to default', () => {
    setLocalCurrentUserId('')
    expect(getLocalCurrentUserId()).toBe('local-user1')
  })

  it('getLocalSpaceId returns default when not set', () => {
    const id = getLocalSpaceId()
    expect(id).toBe('distancia-cero-local-space')
  })

  it('setLocalSpaceId persists value', () => {
    setLocalSpaceId('custom-space-id')
    expect(getLocalSpaceId()).toBe('custom-space-id')
  })

  it('clearLocalIdentity removes stored values', () => {
    setLocalCurrentUserId('local-user2')
    setLocalSpaceId('custom-space')
    clearLocalIdentity()
    expect(getLocalCurrentUserId()).toBe('local-user1')
    expect(getLocalSpaceId()).toBe('distancia-cero-local-space')
  })
})
