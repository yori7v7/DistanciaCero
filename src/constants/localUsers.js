export const DEFAULT_LOCAL_USER_ID = 'local-user1'
export const DEFAULT_SPACE_ID = 'distancia-cero-local-space'

export const LOCAL_USERS = [
  {
    id: 'local-user1',
    slug: 'user1',
    displayName: 'Usuario 1',
    role: 'owner',
    avatar: null
  },
  {
    id: 'local-user2',
    slug: 'user2',
    displayName: 'Usuario 2',
    role: 'partner',
    avatar: null
  }
]

export const LOCAL_RELATIONSHIP_SPACE = {
  id: DEFAULT_SPACE_ID,
  name: 'Distancia Cero',
  members: ['local-user1', 'local-user2'],
  createdAt: '2026-01-01T00:00:00.000Z'
}
