import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, EyeOff, Check, Trash2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
export default function ProductDetails() {
  const { id } = useParams()
  const { products, approveProduct, hideProduct, removeProduct } = useAdmin()
  const product = products.find((p) => String(p.id) === String(id))
  const [confirm, setConfirm] = useState(false)
  if (!product) return <div className="text-center py-20 text-forest/60">Not found. <Link to="/admin/products" className="text-olive">Back</Link></div>
  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-forest/55"><ArrowLeft size={16} /> Back</Link>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6">
        <h1 className="font-display text-2xl">{product.name}</h1>
        <div className="mt-2 flex gap-2"><StatusBadge status={product.status} /><StatusBadge status={product.availability} /></div>
        <p className="mt-3 text-sm text-forest/70">{product.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-xs text-forest/45">Category</dt><dd>{product.category}</dd></div>
          <div><dt className="text-xs text-forest/45">Price</dt><dd>Rs. {product.price} / {product.unit}</dd></div>
          <div><dt className="text-xs text-forest/45">Farmer</dt><dd><Link to={`/admin/farmers/${product.farmerId}`} className="text-olive">{product.farmerName}</Link></dd></div>
          <div><dt className="text-xs text-forest/45">Market</dt><dd>{product.marketName}</dd></div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/products/${product.id}`} className="rounded-xl border border-forest/15 px-4 py-2 text-sm inline-flex items-center gap-1"><ExternalLink size={14} /> Public</Link>
          {product.status !== 'published' && <button type="button" onClick={() => approveProduct(product.id)} className="rounded-xl bg-forest px-4 py-2 text-sm text-cream"><Check size={14} className="inline mr-1" />Approve</button>}
          {product.status === 'published' && <button type="button" onClick={() => hideProduct(product.id)} className="rounded-xl border border-forest/15 px-4 py-2 text-sm"><EyeOff size={14} className="inline mr-1" />Hide</button>}
          <button type="button" onClick={() => setConfirm(true)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"><Trash2 size={14} className="inline mr-1" />Remove</button>
        </div>
      </div>
      <ConfirmModal open={confirm} title="Remove product?" message={`Remove ${product.name}?`} confirmLabel="Remove" danger onConfirm={() => { removeProduct(product.id); setConfirm(false) }} onCancel={() => setConfirm(false)} />
    </div>
  )
}
