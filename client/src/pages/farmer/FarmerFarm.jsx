import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import AppImage from '../../components/image/AppImage.jsx'
import { uploadImage } from '../../services/uploadService.js'
import { getMarkets } from '../../services/marketService.js'

const input = 'w-full bg-white border border-forest/15 px-3 py-2 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40'

export default function FarmerFarm() {
  const { getFarmerProfile, updateFarmerProfile, reload } = useFarmer()
  const { showToast } = useToast()
  const profile = getFarmerProfile()
  const [markets, setMarkets] = useState([])
  const [form, setForm] = useState({ farmName: '', farmDescription: '', location: '', phone: '' })
  const [marketId, setMarketId] = useState('')
  const [farmImage, setFarmImage] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { getMarkets({ limit: 100 }).then((r) => setMarkets(r.data.markets)).catch(() => {}) }, [])
  useEffect(() => {
    setForm({ farmName: profile.farmName || '', farmDescription: profile.farmDescription || '', location: profile.location || '', phone: profile.phone || '' })
    setMarketId(profile.marketId || ''); setFarmImage(profile.farmImage || '')
  }, [profile.id, profile.farmName, profile.farmDescription, profile.location, profile.phone, profile.marketId, profile.farmImage])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const onFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setError('')
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setError('Choose a JPEG, PNG or WebP image.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be 5 MB or smaller.'); return }
    setUploading(true)
    try { setFarmImage(await uploadImage('farms', file)) } catch (err) { setError(err.message) } finally { setUploading(false) }
  }
  const save = async (e) => {
    e.preventDefault(); setError('')
    if (form.farmName.trim().length < 2) { setError('Farm name is required.'); return }
    setBusy(true)
    try {
      await updateFarmerProfile({ farmName: form.farmName.trim(), farmDescription: form.farmDescription.trim(), location: form.location.trim(), phone: form.phone.trim(), farmImage })
      if (marketId !== (profile.marketId || '')) {
        const { api } = await import('../../services/api.js')
        await api('/farmers/me/profile', { method: 'PUT', body: { market: marketId || null } }); await reload()
      }
      showToast('Farm details saved')
    } catch (err) { setError(err.message || 'Could not save.') } finally { setBusy(false) }
  }
  const market = markets.find((m) => m._id === marketId)

  return (
    <form onSubmit={save} noValidate className="max-w-3xl flex flex-col gap-8">
      <div><h1 className="font-display text-3xl text-forest-deep mb-1">My Farm &amp; Stall</h1><p className="text-forest-deep/60">Shown to customers on your farmer page.</p></div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-forest-deep/70">Farm photo</p>
          <div className="aspect-[4/3] overflow-hidden border border-forest/10 bg-cream-soft"><AppImage src={farmImage} alt="Your farm" kind="farmer" /></div>
          <label className="mt-3 inline-flex cursor-pointer items-center border border-forest/25 px-4 py-2 text-sm focus-within:ring-2 focus-within:ring-olive">{uploading ? 'Uploading…' : 'Upload farm photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} disabled={uploading} className="sr-only" /></label>
        </div>
        <div className="flex flex-col gap-4">
          <label className="grid gap-1.5 text-sm text-forest-deep/70">Farm name<input className={input} value={form.farmName} onChange={set('farmName')} maxLength={100} /></label>
          <label className="grid gap-1.5 text-sm text-forest-deep/70">Location<input className={input} value={form.location} onChange={set('location')} maxLength={120} /></label>
          <label className="grid gap-1.5 text-sm text-forest-deep/70">Phone<input className={input} value={form.phone} onChange={set('phone')} maxLength={30} inputMode="tel" /></label>
        </div>
      </div>

      <label className="grid gap-1.5 text-sm text-forest-deep/70">About your farm<textarea className={input} rows={4} maxLength={1000} value={form.farmDescription} onChange={set('farmDescription')} /></label>

      <div className="border border-forest/10 bg-cream-soft p-6">
        <label className="grid gap-1.5 text-sm text-forest-deep/70">Associated market
          <select className={input} value={marketId} onChange={(e) => setMarketId(e.target.value)}><option value="">Not assigned</option>{markets.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}</select>
        </label>
        {market && <p className="mt-3 text-sm text-forest-deep/70">{market.location} · {market.openingTime}–{market.closingTime}{market.operatingDays?.length ? ` · ${market.operatingDays.join(', ')}` : ''}</p>}
        {marketId && <Link to={`/markets/${marketId}`} className="mt-2 inline-block text-sm text-olive hover:underline">View public market page →</Link>}
      </div>

      <div className="border border-forest/10 bg-cream-soft p-6 text-sm text-forest-deep/70">
        <p className="font-display text-lg text-forest-deep mb-1">Pickup times</p>
        <p>Your weekly pickup schedule and capacity are managed on the <Link to="/farmer/pickup-slots" className="text-olive hover:underline">Pickup Slots</Link> page.</p>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy || uploading} className="w-fit bg-forest-deep px-7 py-3 text-sm text-cream hover:bg-forest-light disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-olive">{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  )
}
