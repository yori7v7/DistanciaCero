// ─── Tipos base para el sistema de identidad ───

/** Rol de usuario local */
export type UserRole = 'owner' | 'partner' | 'member'

/** Perfil de usuario local */
export interface LocalUser {
  id: string
  slug: string
  displayName: string
  role: UserRole
  avatar: string | null
}

/** Espacio de relación */
export interface RelationshipSpace {
  id: string
  name: string
  members: string[]
  createdAt: string
}

/** Sesión de autenticación */
export interface AuthSession {
  mode: 'local-dev' | 'remote'
  user: LocalUser | null
}

/** Estado de autenticación de Supabase */
export interface SupabaseAuthState {
  isAuthenticated: boolean
  userId: string | null
  session: unknown | null
}
