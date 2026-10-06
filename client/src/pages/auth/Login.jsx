import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Mail } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthInput from '../../components/auth/AuthInput.jsx'
import PasswordInput from '../../components/auth/PasswordInput.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn.js'
import { validateEmail, validateRequired } from '../../utils/authValidation.js'
import { defaultRouteForRole } from '../../config/auth.js'

export default function Login() {
const { login, googleLogin } = useAuth()
const { showToast } = useToast()
const navigate = useNavigate()
const location = useLocation()

const [form, setForm] = useState({ email: '', password: '', remember: true })
const [errors, setErrors] = useState({})
const [formError, setFormError] = useState('')
const [submitting, setSubmitting] = useState(false)
const [googleBusy, setGoogleBusy] = useState(false)

const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

const validate = () => ({
  email: validateEmail(form.email),
  password: validateRequired(form.password, 'Password')
})

const goAfterLogin = (user) => {
  navigate(location.state?.from?.pathname ?? defaultRouteForRole(user.role), { replace: true })
}

const handleSubmit = async (e) => {
  e.preventDefault()
  const v = validate()
  setErrors(v)
  setFormError('')
  if (Object.values(v).some(Boolean)) return

  setSubmitting(true)
  const result = await login(form)
  setSubmitting(false)

  if (!result.ok) {
    setFormError(result.error)
    return
  }
  showToast(`Welcome back, ${result.user.name.split(' ')[0]}!`)
  goAfterLogin(result.user)
}

const handleGoogleCredential = async (credential) => {
  setGoogleBusy(true)
  setFormError('')
  const result = await googleLogin(credential, form.remember)
  setGoogleBusy(false)
  if (!result.ok) {
    setFormError(result.error)
    return
  }
  showToast(`Welcome, ${result.user.name.split(' ')[0]}!`)
  goAfterLogin(result.user)
}

const { buttonRef, available: googleAvailable } = useGoogleSignIn(handleGoogleCredential)

return (
  <AuthLayout title="Welcome Back" subtitle="Log in to save favorites, track orders and reserve pickups.">
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <p role="alert" className="border border-red-600/30 bg-red-50 text-red-700 text-sm px-4 py-3">
          {formError}
        </p>
      )}

      <AuthInput label="Email" type="email" icon={Mail} autoComplete="email" required value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />

      <div>
        <PasswordInput autoComplete="current-password" required value={form.password} onChange={set('password')} error={errors.password} placeholder="••••••••" />
        <div className="mt-3 flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-forest-deep/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
              className="h-4 w-4 accent-forest-deep"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-forest-deep hover:text-olive underline-offset-4 hover:underline focus:outline-none focus-visible:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {submitting ? 'Logging in…' : 'Login'}
      </button>

      <div className="flex items-center gap-4 text-xs text-forest-deep/40">
        <span className="h-px flex-1 bg-forest/15" />
        or
        <span className="h-px flex-1 bg-forest/15" />
      </div>

      {/* Google renders its own branded button into this div once VITE_GOOGLE_CLIENT_ID is configured. */}
      <div className="relative">
        <div ref={buttonRef} className={`flex justify-center ${googleAvailable ? '' : 'hidden'}`} />
        {googleBusy && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-cream/80 text-sm text-forest-deep">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Signing in…
          </div>
        )}
        {!googleAvailable && (
          <button
            type="button"
            disabled
            title="Google sign-in isn't configured yet — set VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID."
            className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 text-sm border border-forest/20 text-forest-deep/40 cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.95a9 9 0 0 0 0 8.06l3-2.33Z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
            </svg>
            Continue with Google
          </button>
        )}
      </div>

      <p className="text-center text-sm text-forest-deep/65 mt-2">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-forest-deep hover:text-olive underline-offset-4 hover:underline">
          Create account
        </Link>
      </p>
    </form>
  </AuthLayout>
)
}
