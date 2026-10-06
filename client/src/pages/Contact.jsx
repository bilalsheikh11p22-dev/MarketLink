import { useState } from 'react'
import PageLayout from '../components/PageLayout.jsx'
import AppImage from '../components/image/AppImage.jsx'
import { submitContact } from '../services/insightService.js'
import { SITE } from '../config/site.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const field = 'w-full border border-forest/15 bg-white px-4 py-2.5 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | failed
  const [serverError, setServerError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Please enter your name.'
    if (!EMAIL.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.message.trim().length < 10) next.message = 'Message must be at least 10 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setStatus('sending'); setServerError('')
    try { await submitContact(form); setStatus('sent'); setForm({ name: '', email: '', subject: '', message: '' }) }
    catch (err) { setServerError(err.message || 'Could not send your message.'); setStatus('failed') }
  }

  return (
    <PageLayout eyebrow="Contact" title="We'd love to hear from you" subtitle="Questions about an order, a farmer account or the marketplace? Send us a message.">
      <div className="grid gap-12 lg:grid-cols-5">
        <form onSubmit={submit} noValidate className="lg:col-span-3 grid gap-5" aria-describedby="contact-status">
          {[['name', 'Your name', 'text'], ['email', 'Email', 'email'], ['subject', 'Subject (optional)', 'text']].map(([k, label, type]) => (
            <div key={k}>
              <label htmlFor={`c-${k}`} className="mb-1.5 block text-sm text-forest-deep/70">{label}</label>
              <input id={`c-${k}`} type={type} value={form[k]} onChange={set(k)} className={field} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `c-${k}-err` : undefined} autoComplete={k === 'email' ? 'email' : k === 'name' ? 'name' : 'off'} />
              {errors[k] && <p id={`c-${k}-err`} className="mt-1 text-xs text-red-700">{errors[k]}</p>}
            </div>
          ))}
          <div>
            <label htmlFor="c-message" className="mb-1.5 block text-sm text-forest-deep/70">Message</label>
            <textarea id="c-message" rows={6} maxLength={3000} value={form.message} onChange={set('message')} className={field} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'c-message-err' : undefined} />
            {errors.message && <p id="c-message-err" className="mt-1 text-xs text-red-700">{errors.message}</p>}
          </div>
          <div id="contact-status" role="status" aria-live="polite">
            {status === 'sent' && <p className="text-sm text-sage">Thanks — your message has been received.</p>}
            {status === 'failed' && <p className="text-sm text-red-700">{serverError}</p>}
          </div>
          <button type="submit" disabled={status === 'sending'} className="w-fit bg-forest-deep px-7 py-3 text-sm text-cream hover:bg-forest-light disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-olive">{status === 'sending' ? 'Sending…' : 'Send message'}</button>
        </form>

        <aside className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[4/3] overflow-hidden bg-cream-soft"><AppImage fill src="/images/about/contact-hero.jpg" alt="" kind="generic" /></div>
          <div className="border border-forest/10 bg-cream-soft p-6 text-sm text-forest-deep/75">
            <h2 className="font-display text-lg text-forest-deep mb-3">Support</h2>
            {SITE.supportEmail || SITE.supportPhone || SITE.supportHours || SITE.address ? (
              <dl className="space-y-2">
                {SITE.supportEmail && <div><dt className="text-forest-deep/50">Email</dt><dd><a className="text-olive hover:underline" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></dd></div>}
                {SITE.supportPhone && <div><dt className="text-forest-deep/50">Phone</dt><dd>{SITE.supportPhone}</dd></div>}
                {SITE.supportHours && <div><dt className="text-forest-deep/50">Hours</dt><dd>{SITE.supportHours}</dd></div>}
                {SITE.address && <div><dt className="text-forest-deep/50">Address</dt><dd>{SITE.address}</dd></div>}
              </dl>
            ) : <p>Use the form and we will reply by email.</p>}
          </div>
        </aside>
      </div>
    </PageLayout>
  )
}
