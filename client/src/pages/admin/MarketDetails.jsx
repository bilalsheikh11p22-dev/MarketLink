import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Ban } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
export default function MarketDetails() {
  const { id } = useParams()
  const { markets, farmers, products, suspendMarket } = useAdmin()
  const market = markets.find((m) => m.id === id)
  const [confirm, setConfirm] = useState(false)
  if (!market) return <div className="text-center py-20 text-forest/60">Not found. <Link to="/admin/markets" className="text-olive">Back</Link></div>
  const mf = farmers.filter((f) => f.marketId === id)
  const mp = products.filter((p) => p.marketId === id).slice(0, 10)
  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/admin/markets" className="inline-flex items-center gap-1.5 text-sm text-forest/55"><ArrowLeft size={16} /> Back</Link>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6">
        <h1 className="font-display text-2xl">{market.name}</h1>
        <div className="mt-2"><StatusBadge status={market.status} /></div>
        <p className="mt-3 text-sm text-forest/70">{market.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-xs text-forest/45">Address</dt><dd>{market.address}</dd></div>
          <div><dt className="text-xs text-forest/45">Location</dt><dd>{market.location}</dd></div>
          <div><dt className="text-xs text-forest/45">Hours</dt><dd>{market.openingTime} – {market.closingTime}</dd></div>
          <div><dt className="text-xs text-forest/45">Days</dt><dd>{(market.operatingDays || []).join(', ')}</dd></div>
        </dl>
        <div className="mt-4 flex gap-2">
          <Link to={`/markets/${market.id}`} className="rounded-xl border border-forest/15 px-4 py-2 text-sm inline-flex items-center gap-1"><ExternalLink size={14} /> Public page</Link>
          <button type="button" onClick={() => setConfirm(true)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"><Ban size={14} className="inline mr-1" />Suspend</button>
        </div>
      </div>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-5"><h2 className="font-display text-lg mb-2">Farmers ({mf.length})</h2>
        <ul className="text-sm divide-y divide-forest/6">{mf.map((f) => <li key={f.id} className="py-2"><Link to={`/admin/farmers/${f.id}`} className="hover:text-olive">{f.name}</Link></li>)}</ul>
      </div>
      <ConfirmModal open={confirm} title="Suspend market?" message={`Suspend ${market.name}?`} confirmLabel="Suspend" danger onConfirm={() => { suspendMarket(market.id); setConfirm(false) }} onCancel={() => setConfirm(false)} />
    </div>
  )
}
