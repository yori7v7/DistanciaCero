import { useState, useEffect, useRef } from 'react'
import { LogIn, UserPlus, Heart, Mail, Lock, User, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react'
import {
  signInWithEmail,
  signUpWithEmail,
  restoreSession,
  getAuthenticatedClient,
  onSessionChange
} from '../services/supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { pullFromSupabase } from '../services/supabaseSyncService'
import { notifyAllContentUpdated } from '../services/contentService'

/**
 * After login/signup, ensures the user has a profile and space.
 */
async function ensureSpaceSetup() {
  const client = getAuthenticatedClient()
  if (!client) return
  try {
    const { data: memberships, error } = await client
      .from('universe_members')
      .select('space_id')
      .limit(1)
    if (error || !memberships?.length) {
      await client.rpc('bootstrap_space', {
        space_name: 'Distancia Cero',
        space_slug: 'distancia-cero'
      }).catch(() => {})
    }
  } catch (err) {
    console.warn('[auth] ensureSpaceSetup:', err.message)
  }
}

/**
 * Background wrapper used by all auth screens.
 */
function AuthBackground({ children }) {
  return (
    <div className="auth-gate">
      <div className="background-orbs">
        <span className="orb orb-pink"></span>
        <span className="orb orb-red"></span>
        <span className="orb orb-soft"></span>
      </div>
      <div className="energy-lines"></div>
      <div className="stars-layer"></div>
      <div className="auth-gate__particles">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="auth-gate__particle"
            style={{ left: `${10 + i * 10}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>
      {children}
    </div>
  )
}

function AuthGate({ children, onReady }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remoteEnabled] = useState(() => isRemoteContentEnabled())
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(remoteEnabled)
  const [verified, setVerified] = useState(false)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=signup') || hash.includes('type=email_change')) {
      setVerified(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (!remoteEnabled) { setChecking(false); return }
    let cancelled = false
    restoreSession().then(async (session) => {
      if (cancelled) return
      if (session) {
        await ensureSpaceSetup()
        setAuthenticated(true)
        pullFromSupabase().then(() => {
          notifyAllContentUpdated()
          if (onReadyRef.current) onReadyRef.current()
        })
      }
      setChecking(false)
    })
    const unsubscribe = onSessionChange((session) => {
      if (session) setAuthenticated(true)
      else setAuthenticated(false)
    })
    return () => { cancelled = true; unsubscribe() }
  }, [remoteEnabled])

  if (!remoteEnabled) return children

  // ---- Loading ----
  if (checking) {
    return (
      <AuthBackground>
        <div className="auth-gate__card auth-gate__card--center">
          <Heart className="auth-gate__loading-icon" size={48} />
          <p className="auth-gate__loading-text">Cargando tu universo...</p>
        </div>
      </AuthBackground>
    )
  }

  if (authenticated) return children

  // ---- Verified ----
  if (verified) {
    return (
      <AuthBackground>
        <div className="auth-gate__card">
          <div className="auth-gate__header">
            <div className="auth-gate__verified-icon">💖</div>
            <h1 className="auth-gate__title">¡Email verificado!</h1>
            <p className="auth-gate__subtitle">
              Tu cuenta fue confirmada. Inicia sesión para entrar.
            </p>
          </div>
          <button className="auth-gate__submit" onClick={() => { setVerified(false); setMode('login') }}>
            <LogIn size={18} /> Iniciar sesión
          </button>
        </div>
      </AuthBackground>
    )
  }

  // ---- Confirm ----
  if (mode === 'confirm') {
    return (
      <AuthBackground>
        <div className="auth-gate__card">
          <div className="auth-gate__header">
            <Heart className="auth-gate__logo" size={40} />
            <h1 className="auth-gate__title">¡Revisa tu correo!</h1>
            <p className="auth-gate__subtitle">
              Enviamos un enlace de confirmación a <strong>{email}</strong>.
              Haz click en el enlace y luego inicia sesión.
            </p>
          </div>
          <button className="auth-gate__submit" onClick={() => setMode('login')}>
            <LogIn size={18} /> Ir al inicio de sesión
          </button>
        </div>
      </AuthBackground>
    )
  }

  // ---- Handlers ----
  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password.trim()) { setError('Llena todos los campos.'); return }
    setBusy(true)
    try {
      const result = await signInWithEmail(email.trim(), password)
      if (result.error) { setError(result.error.message) }
      else {
        await ensureSpaceSetup()
        setAuthenticated(true)
        await pullFromSupabase()
        notifyAllContentUpdated()
        if (onReadyRef.current) onReadyRef.current()
      }
    } catch (err) { setError(err.message || 'Error inesperado.') }
    finally { setBusy(false) }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password.trim() || !displayName.trim()) { setError('Llena todos los campos.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setBusy(true)
    try {
      const result = await signUpWithEmail(email.trim(), password, displayName.trim())
      if (result.error) { setError(result.error.message) }
      else if (result.needsEmailConfirmation) { setMode('confirm') }
      else {
        await ensureSpaceSetup()
        setAuthenticated(true)
        await pullFromSupabase()
        notifyAllContentUpdated()
        if (onReadyRef.current) onReadyRef.current()
      }
    } catch (err) { setError(err.message || 'Error inesperado.') }
    finally { setBusy(false) }
  }

  const isLogin = mode === 'login'

  return (
    <AuthBackground>
      <div className="auth-gate__card">
        <div className="auth-gate__header">
          <div className="small-pill" style={{ margin: '0 auto 16px' }}>
            <Sparkles size={14} />
            <span>Distancia Cero</span>
          </div>
          <h1 className="auth-gate__title">
            {isLogin ? 'Bienvenida de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="auth-gate__subtitle">
            {isLogin ? 'Nuestro universo te extraña, Alecita 💖' : 'Únete al universo de Ale & Yori'}
          </p>
        </div>

        <form className="auth-gate__form" onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <div className="auth-gate__field">
              <User className="auth-gate__field-icon" size={18} />
              <input className="auth-gate__input" type="text" placeholder="Nombre (ej: Ale, Yori)"
                value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                disabled={busy} autoComplete="name" />
            </div>
          )}
          <div className="auth-gate__field">
            <Mail className="auth-gate__field-icon" size={18} />
            <input className="auth-gate__input" type="email" placeholder="Correo electrónico"
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={busy} autoComplete="email" />
          </div>
          <div className="auth-gate__field">
            <Lock className="auth-gate__field-icon" size={18} />
            <input className="auth-gate__input" type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            <button type="button" className="auth-gate__password-toggle"
              onClick={() => setShowPassword((s) => !s)} tabIndex={-1}
              aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="auth-gate__error">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          <button className="auth-gate__submit" type="submit" disabled={busy}>
            {busy ? (
              <span className="auth-gate__spinner" />
            ) : isLogin ? (
              <><LogIn size={18} /> Entrar</>
            ) : (
              <><UserPlus size={18} /> Crear cuenta</>
            )}
          </button>

          <button type="button" className="auth-gate__switch"
            onClick={() => { setError(null); setMode(isLogin ? 'signup' : 'login') }}
            disabled={busy}>
            {isLogin ? '¿No tienes cuenta? Crea una aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
      </div>
    </AuthBackground>
  )
}

export default AuthGate
