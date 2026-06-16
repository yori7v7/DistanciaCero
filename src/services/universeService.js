import { LOCAL_RELATIONSHIP_SPACE } from '../constants/localUsers'
import { getLocalSpaceId } from '../utils/localIdentityStore'
import { getProfileById } from './profileService'

export function getCurrentSpaceId() {
  const storedSpaceId = getLocalSpaceId()
  return storedSpaceId || LOCAL_RELATIONSHIP_SPACE.id
}

export function getCurrentSpace() {
  return {
    ...LOCAL_RELATIONSHIP_SPACE,
    id: getCurrentSpaceId()
  }
}

export function getSpaceMembers() {
  return LOCAL_RELATIONSHIP_SPACE.members
    .map((memberId) => getProfileById(memberId))
    .filter(Boolean)
}
