import { useState, useEffect, useRef, type ReactNode, type FormEvent } from 'react'
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
    console.warn('[auth] ensureSpaceSetup:', (err as Error).message)
  }
}

function AuthBackground({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      bg-[radial-gradient(circle_at_center,rgba(255,122,200,0.15),transparent_30%),rgba(3,0,8,0.94)]
      backdrop-blur-lg overflow-hidden">
      <div className="background-orbs">
        <span className="orb orb-pink"></span>
        <span className="orb orb-red"></span>
        <span className="orb orb-soft"></span>
      </div>
      <div className="energy-lines"></div>
      <div className="stars-layer"></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <span key={i}
            className="absolute bottom-0 w-1 h-1 rounded-full bg-pink opacity-25
              animate-[authParticleRise_5s_ease-in_infinite]"
            style={{ left: `${10 + i * 10}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>
      {children}
    </div>
  )
}

interface AuthGateProps {
  children: ReactNode
  onReady?: () => void
}

function AuthGate({ children, onReady }: AuthGateProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'confirm'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
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

  if (!remoteEnabled) return <>{children}</>

  // Loading
  if (checking) {
    return (
      <AuthBackground>
        <div className="flex flex-col items-center gap-4">
          <Heart className="text-pink animate-[authPulse_1.4s_ease-in-out_infinite]" size={48} />
          <p className="text-pink-soft font-semibold text-lg">Cargando tu universo...</p>
        </div>
      </AuthBackground>
    )
  }

  if (authenticated) return <>{children}</>

  // Verified email
  if (verified) {
    return (
      <AuthBackground>
        <div className="w-full max-w-md mx-4 rounded-[36px] p-10 text-center
          border border-[var(--color-border)] bg-[rgba(12,0,18,0.82)] backdrop-blur-md
          shadow-[0_0_60px_rgba(255,122,200,0.12)]">
          <div className="mb-8">
            <div className="text-5xl mb-4">💖</div>
            <h1 className="font-display text-3xl font-black mb-3 text-white-soft">¡Email verificado!</h1>
            <p className="text-muted">Tu cuenta fue confirmada. Inicia sesión para entrar.</p>
          </div>
          <button className="w-full py-3.5 rounded-full font-bold text-white
            bg-gradient-to-r from-pink to-red shadow-[0_0_25px_rgba(255,122,200,0.25)]
            hover:shadow-[0_0_40px_rgba(255,122,200,0.4)] transition-shadow flex items-center justify-center gap-2"
            onClick={() => { setVerified(false); setMode('login') }}>
            <LogIn size={18} /> Iniciar sesión
          </button>
        </div>
      </AuthBackground>
    )
  }

  // Email confirmation sent
  if (mode === 'confirm') {
    return (
      <AuthBackground>
        <div className="w-full max-w-md mx-4 rounded-[36px] p-10 text-center
          border border-[var(--color-border)] bg-[rgba(12,0,18,0.82)] backdrop-blur-md
          shadow-[0_0_60px_rgba(255,122,200,0.12)]">
          <div className="mb-8">
            <Heart className="text-pink mx-auto mb-4" size={40} />
            <h1 className="font-display text-3xl font-black mb-3 text-white-soft">¡Revisa tu correo!</h1>
            <p className="text-muted">
              Enviamos un enlace de confirmación a <strong className="text-pink-soft">{email}</strong>.
              Haz click en el enlace y luego inicia sesión.
            </p>
          </div>
          <button className="w-full py-3.5 rounded-full font-bold text-white
            bg-gradient-to-r from-pink to-red shadow-[0_0_25px_rgba(255,122,200,0.25)]
            hover:shadow-[0_0_40px_rgba(255,122,200,0.4)] transition-shadow flex items-center justify-center gap-2"
            onClick={() => setMode('login')}>
            <LogIn size={18} /> Ir al inicio de sesión
          </button>
        </div>
      </AuthBackground>
    )
  }

  const isLogin = mode === 'login'

  const handleLogin = async (e: FormEvent) => {
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
    } catch (err) { setError((err as Error).message || 'Error inesperado.') }
    finally { setBusy(false) }
  }

  const handleSignup = async (e: FormEvent) => {
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
    } catch (err) { setError((err as Error).message || 'Error inesperado.') }
    finally { setBusy(false) }
  }

  // Login/Signup form card
  const cardClasses = `w-full max-w-md mx-4 rounded-[36px] p-10 text-center
    border border-[var(--color-border)] bg-[rgba(12,0,18,0.82)] backdrop-blur-md
    shadow-[0_24px_48px_rgba(0,0,0,0.4),0_0_60px_rgba(255,122,200,0.1)]
    animate-[authCardIn_0.5s_ease_both]`

  const inputClasses = `w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[rgba(255,255,255,0.05)]
    border border-[var(--color-border)] text-white-soft placeholder:text-muted/50
    focus:outline-none focus:border-pink/50 focus:bg-[rgba(255,255,255,0.08)]
    transition-colors disabled:opacity-50`

  return (
    <AuthBackground>
      <div className={cardClasses}>
        <div className="mb-8">
          <div className="small-pill" style={{ margin: '0 auto 16px' }}>
            <Sparkles size={14} />
            <span>Distancia Cero</span>
          </div>
          <h1 className="font-display text-3xl font-black mb-2 text-white-soft">
            {isLogin ? 'Bienvenida de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="text-muted text-sm">
            {isLogin ? 'Bienvenida de vuelta' : 'Únete a este universo'}
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input className={inputClasses} type="text" placeholder="Tu nombre"
                value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                disabled={busy} autoComplete="name" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input className={inputClasses} type="email" placeholder="Correo electrónico"
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={busy} autoComplete="email" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input className={inputClasses} type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white-soft"
              onClick={() => setShowPassword((s) => !s)} tabIndex={-1}
              aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,45,85,0.1)] border border-[rgba(255,45,85,0.25)] text-red text-sm">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          <button className="w-full py-3.5 mt-2 rounded-full font-bold text-white
            bg-gradient-to-r from-pink to-red shadow-[0_0_25px_rgba(255,122,200,0.25)]
            hover:shadow-[0_0_40px_rgba(255,122,200,0.4)] transition-shadow
            flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit" disabled={busy}>
            {busy ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn size={18} /> Entrar</>
            ) : (
              <><UserPlus size={18} /> Crear cuenta</>
            )}
          </button>

          <button type="button" className="text-sm text-muted hover:text-pink-soft transition-colors bg-transparent border-0 cursor-pointer disabled:opacity-50"
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
