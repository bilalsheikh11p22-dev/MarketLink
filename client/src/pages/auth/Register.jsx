import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Mail, MapPin, Phone, Sprout, User } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import AuthInput from '../../components/auth/AuthInput.jsx'
import PasswordInput from '../../components/auth/PasswordInput.jsx'
import RoleSelector from '../../components/auth/RoleSelector.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../../utils/authValidation.js'
import { defaultRouteForRole } from '../../config/auth.js'

const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Grains']

const emptyForm = { name: '', farmName: '', email: '', phone: '', password: '', confirmPassword: '', city: '', farmLocation: '', categories: [], farmDescription: '', agree: false }

export default function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [role, setRole] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pending, setPending] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggleCategory = (c) =>
    setForm((f) => ({ ...f, categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c] }))

  const validate = () => {
    const isFarmer = role === 'farmer'
    const e = {
      name: validateRequired(form.name, 'Full name'),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
      confirmPassword: form.confirmPassword !== form.password ? 'Passwords do not match' : '',
      city: validateRequired(form.city, 'City'),
      agree: form.agree ? '' : 'You must agree to the Terms & Conditions'
    }
    if (isFarmer) {
      e.farmName = validateRequired(form.farmName, 'Farm name')
      e.farmLocation = validateRequired(form.farmLocation, 'Farm location')
      e.categories = form.categories.length ? '' : 'Choose at least one category'
      e.farmDescription = form.farmDescription.trim().length >= 15 ? '' : 'Add a few words about your farm (15+ characters)'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    setFormError('')
    if (Object.values(v).some(Boolean)) {
      setFormError('Please complete all required fields.')
      return
    }

    setSubmitting(true)
    const result = await register({ ...form, role })
    setSubmitting(false)

    if (!result.ok) {
      setFormError(result.error)
      return
    }
    if (result.pending) {
      setPending(true)
      return
    }
    showToast(`Welcome to MarketLink, ${form.name.split(' ')[0]}!`)
    navigate(defaultRouteForRole(result.user.role), { replace: true })
  }

  if (pending) {
    return (
      <AuthLayout title="Application Submitted" subtitle="Thanks for registering as a farmer." wide>
        <div className="border border-olive/40 bg-olive/10 p-7">
          <p className="text-forest-deep">
            Farmer accounts require approval before selling. We&apos;ll review <strong>{form.farmName}</strong> and email {form.email} once it&apos;s approved — usually within 1–2 business days.
          </p>
          <Link to="/login" className="inline-block mt-6 text-sm text-forest-deep hover:text-olive underline-offset-4 hover:underline">
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (!role) {
    return (
      <AuthLayout title="Join MarketLink" subtitle="Connect with local markets, farmers, and fresh food." wide>
        <RoleSelector value={role} onChange={setRole} />
        <p className="text-center text-sm text-forest-deep/65 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-deep hover:text-olive underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </AuthLayout>
    )
  }

  const isFarmer = role === 'farmer'

  return (
    <AuthLayout title={isFarmer ? 'Farmer Registration' : 'Create Your Account'} subtitle={isFarmer ? 'Tell us about your farm — approval usually takes 1–2 business days.' : 'Shop fresh products and discover local markets.'} wide>
      <button type="button" onClick={() => setRole(null)} className="inline-flex items-center gap-2 text-sm text-forest-deep/60 hover:text-olive transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive">
        <ArrowLeft size={15} aria-hidden="true" /> Change account type
      </button>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="border border-red-600/30 bg-red-50 text-red-700 text-sm px-4 py-3">
            {formError}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AuthInput label="Full Name" icon={User} required value={form.name} onChange={set('name')} error={errors.name} placeholder="Your name" />
          {isFarmer && <AuthInput label="Farm Name" icon={Building2} required value={form.farmName} onChange={set('farmName')} error={errors.farmName} placeholder="e.g. Khan Family Farm" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AuthInput label="Email" type="email" icon={Mail} autoComplete="email" required value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
          <AuthInput label="Phone Number" type="tel" icon={Phone} required value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+92 3xx xxxxxxx" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PasswordInput autoComplete="new-password" required value={form.password} onChange={set('password')} error={errors.password} hint={!errors.password ? 'At least 8 characters' : undefined} />
          <PasswordInput label="Confirm Password" autoComplete="new-password" required value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AuthInput label="City" icon={MapPin} required value={form.city} onChange={set('city')} error={errors.city} placeholder="Karachi" />
          {isFarmer && <AuthInput label="Farm Location" icon={Sprout} required value={form.farmLocation} onChange={set('farmLocation')} error={errors.farmLocation} placeholder="e.g. Malir" />}
        </div>

        {isFarmer && (
          <>
            <div>
              <p className="text-sm text-forest-deep mb-2">
                Product Categories<span className="text-olive"> *</span>
              </p>
              <div role="group" aria-label="Product categories" className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((c) => {
                  const active = form.categories.includes(c)
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      aria-pressed={active}
                      className={`px-3.5 py-2 text-xs border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive ${
                        active ? 'bg-forest-deep text-cream border-forest-deep' : 'border-forest/20 text-forest-deep/70 hover:border-olive/60'
                      }`}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
              {errors.categories && (
                <p role="alert" className="mt-1.5 text-xs text-red-700">
                  {errors.categories}
                </p>
              )}
            </div>

            <AuthInput
              label="Short Farm Description"
              multiline
              rows={3}
              required
              value={form.farmDescription}
              onChange={set('farmDescription')}
              error={errors.farmDescription}
              placeholder="What do you grow, and what makes your farm different?"
            />
          </>
        )}

        <label className="flex items-start gap-3 text-sm text-forest-deep/70 cursor-pointer select-none">
          <input type="checkbox" checked={form.agree} onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-forest-deep" aria-invalid={Boolean(errors.agree)} />
          <span>
            I agree to the <span className="text-forest-deep underline underline-offset-4">Terms &amp; Conditions</span> and{' '}
            <span className="text-forest-deep underline underline-offset-4">Privacy Policy</span>.
          </span>
        </label>
        {errors.agree && (
          <p role="alert" className="text-xs text-red-700 -mt-3">
            {errors.agree}
          </p>
        )}

        {isFarmer && <p className="text-xs text-forest-deep/55 border-t border-forest/10 pt-4">Farmer accounts require approval before selling.</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          {submitting ? 'Creating account…' : isFarmer ? 'Submit Farmer Registration' : 'Create Customer Account'}
        </button>

        <p className="text-center text-sm text-forest-deep/65">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-deep hover:text-olive underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
