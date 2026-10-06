import { useState } from 'react'
import { getStockStatus } from '../../data/farmerProducts.js'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import ProductImage from '../image/ProductImage.jsx'

const STATUS_STYLES = {
  'In Stock': 'border-sage text-sage',
  'Low Stock': 'border-olive text-olive',
  'Sold Out': 'border-red-300 text-red-700 bg-red-50'
}

function StockControl({ product }) {
  const { updateStock } = useFarmer()
  const { showToast } = useToast()
  const [draft, setDraft] = useState(String(product.stock))

  const save = async (next) => {
    try { await updateStock(product.id, next); setDraft(String(next)); showToast('Stock updated') }
    catch (e) { setDraft(String(product.stock)); showToast(e.message || 'Could not update stock') }
  }
  const commit = () => { const next = Math.max(0, Math.floor(Number(draft) || 0)); if (next !== product.stock) save(next) }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          save(Math.max(0, product.stock - 1))
        }}
        aria-label={`Decrease stock for ${product.name}`}
        className="h-8 w-8 flex items-center justify-center border border-forest/15 text-forest-deep hover:bg-cream-soft transition-colors"
      >
        −
      </button>
      <input
        type="number"
        min="0"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        aria-label={`Stock for ${product.name}`}
        className="w-16 text-center border border-forest/15 py-1.5 text-sm text-forest-deep"
      />
      <button
        type="button"
        onClick={() => {
          save(product.stock + 1)
        }}
        aria-label={`Increase stock for ${product.name}`}
        className="h-8 w-8 flex items-center justify-center border border-forest/15 text-forest-deep hover:bg-cream-soft transition-colors"
      >
        +
      </button>
    </div>
  )
}

export default function InventoryTable({ products, suggestions = {} }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto border border-forest/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest/10 text-left text-forest-deep/50 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Category</th>
              <th className="px-4 py-3 font-normal">Current Stock</th>
              <th className="px-4 py-3 font-normal">Unit</th>
              <th className="px-4 py-3 font-normal">Suggested (est.)</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const status = getStockStatus(p.stock)
              return (
                <tr key={p.id} className="border-b border-forest/10 last:border-b-0">
                  <td className="px-4 py-3 text-forest-deep"><div className="flex items-center gap-3"><div className="h-10 w-10 shrink-0 overflow-hidden bg-cream-soft"><ProductImage product={p} alt="" /></div>{p.name}</div></td>
                  <td className="px-4 py-3 text-forest-deep/60">{p.category}</td>
                  <td className="px-4 py-3">
                    <StockControl product={p} />
                  </td>
                  <td className="px-4 py-3 text-forest-deep/60">{p.unit}</td>
                  <td className="px-4 py-3 text-forest-deep/60 text-xs">{suggestions[p.id] != null ? `${suggestions[p.id]} ${p.unit}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 text-[11px] uppercase tracking-wide border ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-forest-deep/50 text-xs">
                    {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-4">
        {products.map((p) => {
          const status = getStockStatus(p.stock)
          return (
            <div key={p.id} className="border border-forest/10 bg-cream-soft p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 min-w-0"><div className="h-10 w-10 shrink-0 overflow-hidden bg-cream"><ProductImage product={p} alt="" /></div><p className="text-forest-deep font-medium truncate">{p.name}</p></div>
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide border ${STATUS_STYLES[status]}`}>{status}</span>
              </div>
              <p className="text-forest-deep/50 text-xs mb-3">{p.category} · {p.unit}{suggestions[p.id] != null ? ` · suggested ${suggestions[p.id]} (est.)` : ''}</p>
              <StockControl product={p} />
            </div>
          )
        })}
      </div>
    </>
  )
}
