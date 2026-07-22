import type { LocalUser, RelationshipSpace } from '../types/identity'
import { LOCAL_RELATIONSHIP_SPACE } from '../constants/localUsers'
import { getLocalSpaceId } from '../utils/localIdentityStore'
import { getProfileById } from './profileService'

export function getCurrentSpaceId(): string {
  const storedSpaceId = getLocalSpaceId()
  return storedSpaceId || LOCAL_RELATIONSHIP_SPACE.id
}

export function getCurrentSpace(): RelationshipSpace {
  return {
    ...LOCAL_RELATIONSHIP_SPACE,
    id: getCurrentSpaceId()
  }
}

export function getSpaceMembers(): LocalUser[] {
  return LOCAL_RELATIONSHIP_SPACE.members
    .map((memberId) => getProfileById(memberId))
    .filter((member): member is LocalUser => member !== null)
}
