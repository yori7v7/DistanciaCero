import { DEFAULT_LOCAL_USER_ID } from '../constants/localUsers'
import { getLocalCurrentUserId, setLocalCurrentUserId } from '../utils/localIdentityStore'
import { getProfileById } from './profileService'

function getDefaultUser() {
  return getProfileById(DEFAULT_LOCAL_USER_ID)
}

export function getCurrentUserId() {
  const storedUserId = getLocalCurrentUserId()
  return getProfileById(storedUserId)?.id || DEFAULT_LOCAL_USER_ID
}

export function getCurrentUser() {
  return getProfileById(getCurrentUserId()) || getDefaultUser()
}

export function setCurrentUser(userId) {
  const nextUser = getProfileById(userId)
  if (!nextUser) return getCurrentUser()

  setLocalCurrentUserId(nextUser.id)
  return nextUser
}

export function isAuthenticated() {
  return true
}

export function getSession() {
  return {
    mode: 'local-dev',
    user: getCurrentUser()
  }
}
