import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Ban, CheckCircle, ExternalLink } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
export default function FarmerDetails() {
  const { id } = useParams()
  const { farmers, products, orders, suspendFarmer, activateFarmer } = useAdmin()
  const farmer = farmers.find((f) => f.id === id)
  const [confirm, setConfirm] = useState(null)
  if (!farmer) return <div className="text-center py-20 text-forest/60">Not found. <Link to="/admin/farmers" className="text-olive">Back</Link></div>
  const fps = products.filter((p) => p.farmerId === id).slice(0, 8)
  const fos = orders.filter((o) => o.farmerId === id).slice(0, 5)
  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/admin/farmers" className="inline-flex items-center gap-1.5 text-sm text-forest/55"><ArrowLeft size={16} /> Back</Link>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6">
        <h1 className="font-display text-2xl">{farmer.name}</h1>
        <p className="text-forest/60">{farmer.farm}</p>
        <div className="mt-2"><StatusBadge status={farmer.status} /></div>
        <p className="mt-3 text-sm text-forest/70">{farmer.description}</p>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div><dt className="text-xs text-forest/45">Email</dt><dd>{farmer.email}</dd></div>
          <div><dt className="text-xs text-forest/45">Phone</dt><dd>{farmer.phone}</dd></div>
          <div><dt className="text-xs text-forest/45">Location</dt><dd>{farmer.location}</dd></div>
          <div><dt className="text-xs text-forest/45">Market</dt><dd>{farmer.marketName || '—'}</dd></div>
          <div><dt className="text-xs text-forest/45">Rating</dt><dd>{farmer.rating || '—'}</dd></div>
          <div><dt className="text-xs text-forest/45">Joined</dt><dd>{farmer.joined}</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {farmer.status === 'approved' ? <button type="button" onClick={() => setConfirm('suspend')} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"><Ban size={14} className="inline mr-1" />Suspend</button>
          : <button type="button" onClick={() => setConfirm('activate')} className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-2 text-sm text-sage"><CheckCircle size={14} className="inline mr-1" />Activate</button>}
          <Link to={`/farmers/${farmer.id}`} className="rounded-xl border border-forest/15 px-4 py-2 text-sm inline-flex items-center gap-1"><ExternalLink size={14} /> Public</Link>
        </div>
      </div>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-5"><h2 className="font-display text-lg mb-2">Products</h2>
        {fps.length === 0 ? <p className="text-sm text-forest/50">None</p> : <ul className="text-sm divide-y divide-forest/6">{fps.map((p) => <li key={p.id} className="py-2"><Link to={`/admin/products/${p.id}`} className="hover:text-olive">{p.name}</Link></li>)}</ul>}
      </div>
      <ConfirmModal open={!!confirm} title={confirm === 'suspend' ? 'Suspend?' : 'Activate?'} message={`${confirm} ${farmer.name}?`} confirmLabel={confirm === 'suspend' ? 'Suspend' : 'Activate'} danger={confirm === 'suspend'} onConfirm={() => { if (confirm === 'suspend') suspendFarmer(farmer.id); else activateFarmer(farmer.id); setConfirm(null) }} onCancel={() => setConfirm(null)} />
    </div>
  )
}
