import { LOCAL_USERS } from '../constants/localUsers'

export function getProfiles() {
  return LOCAL_USERS
}

export function getProfileById(id) {
  return LOCAL_USERS.find((user) => String(user.id) === String(id)) || null
}

export function getDisplayName(userId) {
  return getProfileById(userId)?.displayName || ''
}
