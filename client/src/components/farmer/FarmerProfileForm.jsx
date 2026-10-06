import { useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-forest-deep/70">{label}</span>
      {children}
      {error && <span className="text-xs text-red-700/80">{error}</span>}
    </label>
  )
}

const inputClass =
  'bg-white border border-forest/15 px-4 py-2.5 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 transition-colors'

export default function FarmerProfileForm({ profile, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    farmName: profile.farmName,
    specialty: profile.specialty,
    location: profile.location,
    bio: profile.bio
  })
  const [errors, setErrors] = useState({})

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.farmName.trim()) next.farmName = 'Farm name is required.'
    if (!form.location.trim()) next.location = 'Location is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      <Field label="Full Name" error={errors.name}>
        <input type="text" value={form.name} onChange={update('name')} className={inputClass} />
      </Field>

      <Field label="Email" error={errors.email}>
        <input type="email" value={form.email} onChange={update('email')} className={inputClass} />
      </Field>

      <Field label="Phone">
        <input type="tel" value={form.phone} onChange={update('phone')} className={inputClass} />
      </Field>

      <Field label="Farm Name" error={errors.farmName}>
        <input type="text" value={form.farmName} onChange={update('farmName')} className={inputClass} />
      </Field>

      <Field label="Specialty">
        <input type="text" value={form.specialty} onChange={update('specialty')} className={inputClass} />
      </Field>

      <Field label="Location" error={errors.location}>
        <input type="text" value={form.location} onChange={update('location')} className={inputClass} />
      </Field>

      <Field label="Bio">
        <textarea rows={4} value={form.bio} onChange={update('bio')} className={`${inputClass} resize-none`} />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="px-6 py-3 bg-forest-deep text-cream text-sm hover:bg-forest-light transition-colors">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 border border-forest/20 text-forest-deep text-sm hover:border-olive/60 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
