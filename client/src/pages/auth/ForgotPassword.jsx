import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Mail, Lock, KeyRound, Loader2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthInput from '../../components/auth/AuthInput.jsx'
import { validateEmail } from '../../utils/authValidation.js'
import { useToast } from '../../context/ToastContext.jsx'
import * as authService from '../../services/authService.js'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState(1) // 1 email, 2 code, 3 new password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const sendCode = async (e) => {
    e.preventDefault()
    const err = validateEmail(email)
    setError(err || '')
    if (err) return
    setSubmitting(true)
    try {
      await authService.forgotPassword(email.trim().toLowerCase())
      setStep(2)
      showToast('If that email is registered, a reset code has been sent.')
    } catch (err2) {
      setError(err2.message || 'Could not send reset code. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    setError('')
    if (!code.trim()) {
      setError('Enter the code we emailed you.')
      return
    }
    setSubmitting(true)
    try {
      await authService.verifyOtp(email.trim().toLowerCase(), code.trim())
      setStep(3)
    } catch (err) {
      setError(err.message || 'Invalid or expired code.')
    } finally {
      setSubmitting(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await authService.resetPassword(email.trim().toLowerCase(), code.trim(), password)
      showToast('Password updated. You can log in now.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Could not reset password. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email, verify the code we send you, then choose a new password."
      image="/images/auth/auth-market.jpg"
    >
      {step === 1 && (
        <form onSubmit={sendCode} noValidate className="flex flex-col gap-5">
          <AuthInput
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors disabled:opacity-60 rounded-xl"
          >
            {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {submitting ? 'Sending…' : 'Send reset code'}
          </button>
          <Link to="/login" className="text-center text-sm text-forest-deep hover:text-olive">Back to Login</Link>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyCode} noValidate className="flex flex-col gap-5">
          <p className="text-sm text-forest/70">
            We emailed a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
          </p>
          <AuthInput
            label="6-digit code"
            type="text"
            icon={KeyRound}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={error}
            placeholder="123456"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm bg-forest-deep text-cream hover:bg-forest-light disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {submitting ? 'Verifying…' : 'Verify code'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setStep(1)} className="text-forest/60 hover:text-olive">
              Change email
            </button>
            <button type="button" onClick={sendCode} disabled={submitting} className="text-forest-deep hover:text-olive disabled:opacity-60">
              Resend code
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={savePassword} noValidate className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-sage text-sm">
            <CheckCircle2 size={18} /> Code verified
          </div>
          <AuthInput
            label="New password"
            type="password"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <AuthInput
            label="Confirm password"
            type="password"
            icon={Lock}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={error}
            placeholder="Repeat password"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm bg-forest-deep text-cream hover:bg-forest-light disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {submitting ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
