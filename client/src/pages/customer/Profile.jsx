import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Mail, MapPin, Pencil, Phone, User as UserIcon } from 'lucide-react'
import PageLayout from '../../components/PageLayout.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import AuthInput from '../../components/auth/AuthInput.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { STORAGE_KEYS, isPlainObject, readJSON, writeJSON } from '../../utils/storage.js'
import { validateEmail, validatePhone, validateRequired } from '../../utils/authValidation.js'

const DEFAULT_PREFS = { emailNotifications: true, orderNotifications: true, reviewReminders: false }

function Toggle({ checked, onChange, label, description, id }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-forest/10 last:border-b-0">
      <div>
        <label htmlFor={id} className="text-sm text-forest-deep">
          {label}
        </label>
        {description && <p className="text-xs text-forest-deep/50 mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
          checked ? 'bg-forest-deep' : 'bg-forest/20'
        }`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone ?? '', city: user.city ?? '' })
  const [errors, setErrors] = useState({})

  const [prefs, setPrefs] = useState(() => readJSON(`${STORAGE_KEYS.profile}:${user.id}`, DEFAULT_PREFS, isPlainObject))
  useEffect(() => {
    writeJSON(`${STORAGE_KEYS.profile}:${user.id}`, prefs)
  }, [prefs, user.id])

  const setPref = (key) => (value) => {
    setPrefs((p) => ({ ...p, [key]: value }))
    showToast('Preference saved')
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    const v = { name: validateRequired(form.name, 'Full name'), email: validateEmail(form.email), phone: validatePhone(form.phone), city: validateRequired(form.city, 'City') }
    setErrors(v)
    if (Object.values(v).some(Boolean)) return
    updateUser(form)
    setEditing(false)
    showToast('Profile updated')
  }

  return (
    <PageLayout eyebrow="Your account" title="Profile" subtitle="Manage your personal information and preferences.">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-8 lg:gap-10 items-start">
        {/* Header card */}
        <div className="border border-forest/10 bg-cream-soft p-6 md:p-8 flex flex-col items-center text-center">
          <Avatar src={user.avatar} name={user.name} size={88} />
          <p className="mt-4 font-display text-2xl text-forest-deep">{user.name}</p>
          <p className="text-sm text-forest-deep/55">{user.email}</p>
          <span className="mt-3 inline-block text-[11px] uppercase tracking-widest2 text-olive border border-olive/40 px-3 py-1">{user.role}</span>
          {user.role === 'farmer' && (
            <Link to="/farmer" className="mt-5 inline-flex items-center gap-2 text-sm text-forest-deep hover:text-olive transition-colors">
              <LayoutDashboard size={15} aria-hidden="true" /> Go to Farmer Portal
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {/* Personal information */}
          <section className="border border-forest/10 bg-cream-soft p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-forest-deep">Personal Information</h2>
              {!editing && (
                <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-sm text-forest-deep hover:text-olive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive">
                  <Pencil size={14} aria-hidden="true" /> Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={save} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AuthInput label="Full Name" icon={UserIcon} required value={form.name} onChange={set('name')} error={errors.name} />
                  <AuthInput label="Email" type="email" icon={Mail} required value={form.email} onChange={set('email')} error={errors.email} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AuthInput label="Phone" type="tel" icon={Phone} required value={form.phone} onChange={set('phone')} error={errors.phone} />
                  <AuthInput label="City" icon={MapPin} required value={form.city} onChange={set('city')} error={errors.city} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-2.5 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ name: user.name, email: user.email, phone: user.phone ?? '', city: user.city ?? '' })
                      setErrors({})
                      setEditing(false)
                    }}
                    className="px-4 py-2.5 text-sm text-forest-deep/60 hover:text-forest-deep"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div>
                  <dt className="text-forest-deep/50 text-xs mb-1">Full Name</dt>
                  <dd className="text-forest-deep">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-forest-deep/50 text-xs mb-1">Email</dt>
                  <dd className="text-forest-deep">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-forest-deep/50 text-xs mb-1">Phone</dt>
                  <dd className="text-forest-deep">{user.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-forest-deep/50 text-xs mb-1">City</dt>
                  <dd className="text-forest-deep">{user.city || '—'}</dd>
                </div>
              </dl>
            )}
          </section>

          {/* Preferences */}
          <section className="border border-forest/10 bg-cream-soft p-6 md:p-8">
            <h2 className="font-display text-xl text-forest-deep mb-2">Account Preferences</h2>
            <div>
              <Toggle id="pref-email" label="Email Notifications" description="Receipts, account and security emails." checked={prefs.emailNotifications} onChange={setPref('emailNotifications')} />
              <Toggle id="pref-orders" label="Order Notifications" description="Updates when an order is confirmed or ready." checked={prefs.orderNotifications} onChange={setPref('orderNotifications')} />
              <Toggle id="pref-reviews" label="Review Reminders" description="A nudge to review something you recently bought." checked={prefs.reviewReminders} onChange={setPref('reviewReminders')} />
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  )
}
