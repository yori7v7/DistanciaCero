import { useState } from 'react'
import type { LocalUser } from '../types/identity'
import { getCurrentUser, setCurrentUser } from '../services/authService'
import { getProfiles } from '../services/profileService'
import { getCurrentSpace } from '../services/universeService'
import { isSupabaseAuthenticated } from '../services/supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { ShieldCheck } from 'lucide-react'

function LocalIdentitySelector() {
  const [currentUser, setCurrentUserState] = useState<LocalUser>(() => getCurrentUser())
  const profiles = getProfiles()
  const space = getCurrentSpace()
  const remoteEnabled = isRemoteContentEnabled()
  const isRemoteAuth = remoteEnabled && isSupabaseAuthenticated()

  const handleUserChange = (userId: string) => {
    const nextUser = setCurrentUser(userId)
    setCurrentUserState(nextUser)
  }

  return (
    <aside className="local-identity-card" aria-label="Identidad actual">
      <div className="local-identity-copy">
        {isRemoteAuth ? (
          <span className="local-identity-kicker local-identity-kicker--live">
            <ShieldCheck size={12} /> Sesión activa
          </span>
        ) : (
          <span className="local-identity-kicker">Modo local/dev. No es login real.</span>
        )}
        <h3>{isRemoteAuth ? 'Identidad' : 'Identidad local'}</h3>
        <p>Editando como: <strong>{currentUser?.displayName || 'Usuario local'}</strong></p>
        <p>Universo: <strong>{space?.name || 'Distancia Cero'}</strong></p>
      </div>

      {!isRemoteAuth && (
        <div className="local-identity-options" role="group" aria-label="Elegir usuario local">
          {profiles.map((profile) => {
            const isActive = String(profile.id) === String(currentUser?.id)
            return (
              <button
                key={profile.id}
                type="button"
                className={`local-identity-option ${isActive ? 'is-active' : ''}`}
                aria-pressed={isActive}
                onClick={() => handleUserChange(profile.id)}
              >
                {profile.displayName}
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}

export default LocalIdentitySelector
