import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LOCAL_USER_ID } from '../constants/localUsers'
import { getCachedSpaceId, resetSpaceIdCache, setCachedSpaceId } from '../services/remoteSpaceCache'
import { signOut } from '../services/supabaseAuthService'
import { resetSpaceIdCache as resetFromSyncService } from '../services/supabaseSyncService'

const mocks = vi.hoisted(() => ({
  isRemoteContentEnabled: vi.fn(),
  getSupabaseClient: vi.fn(),
  signOut: vi.fn(),
  setCurrentUser: vi.fn()
}))

vi.mock('../integrations/supabase/client', () => ({
  isRemoteContentEnabled: mocks.isRemoteContentEnabled,
  getSupabaseClient: mocks.getSupabaseClient
}))

vi.mock('../services/authService', () => ({
  getCurrentUser: vi.fn(),
  setCurrentUser: mocks.setCurrentUser
}))

beforeEach(() => {
  vi.resetAllMocks()
  resetSpaceIdCache()
  mocks.isRemoteContentEnabled.mockReturnValue(false)
  mocks.getSupabaseClient.mockReturnValue({ auth: { signOut: mocks.signOut } })
})

afterEach(() => {
  resetSpaceIdCache()
})

describe('remote space cache isolation', () => {
  it('retains the existing sync service reset API over the same cache', () => {
    setCachedSpaceId('previous-account-space')
    expect(getCachedSpaceId()).toBe('previous-account-space')

    resetFromSyncService()

    expect(getCachedSpaceId()).toBeNull()
    setCachedSpaceId('next-account-space')
    expect(getCachedSpaceId()).toBe('next-account-space')
  })

  it('clears immediately on local sign-out without creating a remote client', async () => {
    setCachedSpaceId('previous-account-space')

    const completion = signOut()

    expect(getCachedSpaceId()).toBeNull()
    expect(mocks.getSupabaseClient).not.toHaveBeenCalled()
    expect(mocks.setCurrentUser).toHaveBeenCalledWith(DEFAULT_LOCAL_USER_ID)
    await completion
  })

  it('clears before a mocked remote sign-out starts or settles', async () => {
    let finishSignOut!: () => void
    let spaceAtClientLookup: string | null | undefined
    const pendingSignOut = new Promise<void>((resolve) => { finishSignOut = resolve })
    mocks.isRemoteContentEnabled.mockReturnValue(true)
    mocks.getSupabaseClient.mockImplementation(() => {
      spaceAtClientLookup = getCachedSpaceId()
      return { auth: { signOut: mocks.signOut } }
    })
    mocks.signOut.mockReturnValue(pendingSignOut)
    setCachedSpaceId('previous-account-space')

    const completion = signOut()

    expect(getCachedSpaceId()).toBeNull()
    expect(spaceAtClientLookup).toBeNull()
    expect(mocks.signOut).toHaveBeenCalledOnce()
    expect(mocks.setCurrentUser).not.toHaveBeenCalled()
    finishSignOut()
    await completion
    expect(mocks.setCurrentUser).toHaveBeenCalledWith(DEFAULT_LOCAL_USER_ID)
  })
})
