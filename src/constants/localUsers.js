export const DEFAULT_LOCAL_USER_ID = 'local-yori'
export const DEFAULT_SPACE_ID = 'distancia-cero-local-space'

export const LOCAL_USERS = [
  {
    id: 'local-yori',
    slug: 'yori',
    displayName: 'Yori / Diego',
    role: 'owner',
    avatar: null
  },
  {
    id: 'local-ale',
    slug: 'ale',
    displayName: 'Ale / Alecita',
    role: 'partner',
    avatar: null
  }
]

export const LOCAL_RELATIONSHIP_SPACE = {
  id: DEFAULT_SPACE_ID,
  name: 'Distancia Cero',
  members: ['local-yori', 'local-ale'],
  createdAt: '2026-01-01T00:00:00.000Z'
}
