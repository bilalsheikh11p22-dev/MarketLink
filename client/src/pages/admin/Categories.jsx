import { useState } from 'react'
import { Tags } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'

/** Categories are derived from the real product catalogue (name + live product count). */
export default function Categories() {
  const { categories } = useAdmin()
  const [search, setSearch] = useState('')
  const filtered = categories.filter((c) => !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()))
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-deep">Categories</h1>
        <p className="mt-1 text-sm text-forest/55">Categories come from the products farmers list. Counts are live.</p>
      </div>
      <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" aria-label="Search categories" className="w-full max-w-md rounded-xl border border-forest/15 bg-cream-soft px-4 py-2 text-sm" />
      {filtered.length === 0 ? <EmptyState icon={Tags} title="No categories yet" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-forest/8 bg-cream-soft p-5">
              <h3 className="font-display text-lg">{c.name}</h3>
              <p className="mt-1 text-sm text-forest/60">{c.productCount} {c.productCount === 1 ? 'product' : 'products'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
