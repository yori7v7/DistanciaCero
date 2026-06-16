import { useState } from 'react'
import { getCurrentUser, setCurrentUser } from '../services/authService'
import { getProfiles } from '../services/profileService'
import { getCurrentSpace } from '../services/universeService'

function LocalIdentitySelector() {
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser())
  const profiles = getProfiles()
  const space = getCurrentSpace()

  const handleUserChange = (userId) => {
    const nextUser = setCurrentUser(userId)
    setCurrentUserState(nextUser)
  }

  return (
    <aside className="local-identity-card" aria-label="Selector de identidad local">
      <div className="local-identity-copy">
        <span className="local-identity-kicker">Modo local/dev. No es login real.</span>
        <h3>Identidad local</h3>
        <p>Editando como: <strong>{currentUser?.displayName || 'Usuario local'}</strong></p>
        <p>Universo: <strong>{space?.name || 'Distancia Cero'}</strong></p>
      </div>

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
    </aside>
  )
}

export default LocalIdentitySelector
