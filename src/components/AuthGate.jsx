import { useState, useEffect } from 'react'
import { LogIn, UserPlus, Heart, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  restoreSession,
  isSupabaseAuthenticated,
  getAuthenticatedClient,
  onSessionChange
} from '../services/supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { pullFromSupabase } from '../services/supabaseSyncService'
import { notifyAllContentUpdated } from '../services/contentService'

/**
 * After login/signup, ensures the user has a profile and space.
 * If no space exists for the user, auto-bootstraps one.
 */
async function ensureSpaceSetup() {
  const client = getAuthenticatedClient()
  if (!client) return

  try {
    // Check if user already belongs to a space
    const { data: memberships, error } = await client
      .from('universe_members')
      .select('space_id')
      .limit(1)

    if (error) {
      console.warn('[setup] could not check memberships:', error.message)
      return
    }

    if (memberships && memberships.length > 0) {
      // User already has a space — nothing to do
      return
    }

    // No space found — bootstrap one
    const { data: spaceId, error: bootstrapError } = await client
      .rpc('bootstrap_space', {
        space_name: 'Distancia Cero',
        space_slug: 'distancia-cero'
      })

    if (bootstrapError) {
      // Space might already exist but user is not a member.
      // That's fine — an owner can add them later.
      console.warn('[setup] bootstrap skipped:', bootstrapError.message)
      return
    }

    console.log('[setup] space created:', spaceId)
  } catch (err) {
    console.warn('[setup] error:', err.message)
  }
}

/**
 * AuthGate
 *
 * When remote is enabled, shows a login/signup screen before revealing the app.
 * In local mode (VITE_REMOTE_CONTENT_ENABLED != 'true'), children render immediately.
 *
 * Props:
 *   children - the app content (rendered when authenticated or local-only)
 *   onReady  - called after successful login + data sync (optional)
 */
function AuthGate({ children, onReady }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remoteEnabled] = useState(() => isRemoteContentEnabled())
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(remoteEnabled)

  // Restore session on mount
  useEffect(() => {
    if (!remoteEnabled) {
      setChecking(false)
      return
    }

    let cancelled = false

    restoreSession().then(async (session) => {
      if (cancelled) return
      if (session) {
        await ensureSpaceSetup()
        setAuthenticated(true)
        pullFromSupabase().then(() => {
          notifyAllContentUpdated()
          if (onReady) onReady()
        })
      }
      setChecking(false)
    })

    const unsubscribe = onSessionChange((session) => {
      if (session) {
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [remoteEnabled])

  // If remote is disabled, render children directly (local-only mode)
  if (!remoteEnabled) {
    return children
  }

  // Show nothing while checking for existing session
  if (checking) {
    return (
      <div className="auth-gate auth-gate--loading">
        <Heart className="auth-gate__loading-icon" size={48} />
        <p className="auth-gate__loading-text">Cargando tu universo...</p>
      </div>
    )
  }

  // Authenticated: render children
  if (authenticated) {
    return children
  }

  // ---- Helpers ----

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Llena todos los campos.')
      return
    }

    setBusy(true)
    try {
      const result = await signInWithEmail(email.trim(), password)
      if (result.error) {
        setError(result.error.message)
      } else {
        await ensureSpaceSetup()
        setAuthenticated(true)
        await pullFromSupabase()
        notifyAllContentUpdated()
        if (onReady) onReady()
      }
    } catch (err) {
      setError(err.message || 'Error inesperado.')
    } finally {
      setBusy(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError('Llena todos los campos.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setBusy(true)
    try {
      const result = await signUpWithEmail(email.trim(), password, displayName.trim())
      if (result.error) {
        setError(result.error.message)
      } else if (result.needsEmailConfirmation) {
        setError('Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.')
        setMode('login')
      } else {
        await ensureSpaceSetup()
        setAuthenticated(true)
        await pullFromSupabase()
        notifyAllContentUpdated()
        if (onReady) onReady()
      }
    } catch (err) {
      setError(err.message || 'Error inesperado.')
    } finally {
      setBusy(false)
    }
  }

  const switchMode = () => {
    setError(null)
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
  }

  // ---- Render ----

  const isLogin = mode === 'login'

  return (
    <div className="auth-gate">
      <div className="auth-gate__card">
        <div className="auth-gate__header">
          <Heart className="auth-gate__logo" size={40} />
          <h1 className="auth-gate__title">Distancia Cero</h1>
          <p className="auth-gate__subtitle">
            {isLogin ? 'Bienvenida de vuelta, Alecita' : 'Crea tu cuenta'}
          </p>
        </div>

        <form
          className="auth-gate__form"
          onSubmit={isLogin ? handleLogin : handleSignup}
        >
          {!isLogin && (
            <div className="auth-gate__field">
              <User className="auth-gate__field-icon" size={18} />
              <input
                className="auth-gate__input"
                type="text"
                placeholder="Nombre (ej: Ale, Yori)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={busy}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-gate__field">
            <Mail className="auth-gate__field-icon" size={18} />
            <input
              className="auth-gate__input"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              autoComplete="email"
            />
          </div>

          <div className="auth-gate__field">
            <Lock className="auth-gate__field-icon" size={18} />
            <input
              className="auth-gate__input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="auth-gate__password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="auth-gate__error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            className="auth-gate__submit"
            type="submit"
            disabled={busy}
          >
            {busy ? (
              <span className="auth-gate__spinner" />
            ) : isLogin ? (
              <>
                <LogIn size={18} /> Entrar
              </>
            ) : (
              <>
                <UserPlus size={18} /> Crear cuenta
              </>
            )}
          </button>

          <button
            type="button"
            className="auth-gate__switch"
            onClick={switchMode}
            disabled={busy}
          >
            {isLogin
              ? '¿No tienes cuenta? Crea una aquí'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthGate
