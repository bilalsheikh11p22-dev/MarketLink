import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { CATEGORIES, getStockStatus } from '../../data/farmerProducts.js'
import ProductImage from '../../components/image/ProductImage.jsx'

const STATUS_STYLES = {
  'In Stock': 'border-sage text-sage',
  'Low Stock': 'border-olive text-olive',
  'Sold Out': 'border-red-300 text-red-700 bg-red-50'
}

export default function FarmerProducts() {
  const { getProducts, deleteProduct } = useFarmer()
  const { showToast } = useToast()
  const products = getProducts()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [availability, setAvailability] = useState('All')
  const [confirmingDelete, setConfirmingDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      const matchesCategory = category === 'All' || p.category === category
      const matchesAvailability =
        availability === 'All' || (availability === 'Available' ? p.available : !p.available)
      return matchesQuery && matchesCategory && matchesAvailability
    })
  }, [products, query, category, availability])

  const handleDelete = async (id) => {
    try { await deleteProduct(id); showToast('Product deleted') } catch (e) { showToast(e.message || 'Could not delete the product') }
    setConfirmingDelete(null)
  }

  const inputClass =
    'bg-white border border-forest/15 px-4 py-2.5 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 transition-colors'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl text-forest-deep">My Products</h1>
        <Link to="/farmer/products/new" className="px-5 py-2.5 bg-forest-deep text-cream text-sm hover:bg-forest-light transition-colors text-center">
          Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className={`${inputClass} flex-1`}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputClass}>
          <option value="All">All Availability</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-forest-deep/50 py-16 text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const status = getStockStatus(p.stock)
            return (
              <div key={p.id} className="border border-forest/10 bg-cream-soft overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <ProductImage fill product={p} alt={p.name} />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wide border bg-cream/90 ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-wide text-olive mb-1">{p.category}</p>
                  <p className="font-display text-lg text-forest-deep leading-snug">{p.name}</p>
                  <div className="flex items-center justify-between mt-2 text-sm text-forest-deep/70">
                    <span>
                      Rs. {p.price} / {p.unit}
                    </span>
                    <span>★ {p.rating || '—'}</span>
                  </div>
                  <p className="text-forest-deep/50 text-xs mt-1">{p.stock} {p.unit} in stock</p>

                  <div className="flex items-center gap-3 mt-4 text-sm">
                    <Link to={`/farmer/products/${p.id}/edit`} className="text-forest-deep hover:text-olive transition-colors">
                      Edit
                    </Link>
                    {confirmingDelete === p.id ? (
                      <span className="flex items-center gap-2 text-xs">
                        <span className="text-forest-deep/60">Delete this product?</span>
                        <button type="button" onClick={() => handleDelete(p.id)} className="text-red-700/80 font-medium">
                          Yes
                        </button>
                        <button type="button" onClick={() => setConfirmingDelete(null)} className="text-forest-deep/50">
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(p.id)}
                        className="text-red-700/70 hover:text-red-700 transition-colors ml-auto"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
