import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Package } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import SearchFilterBar from '../../components/admin/SearchFilterBar.jsx'
import TablePagination from '../../components/admin/TablePagination.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'
const PAGE_SIZE = 10
export default function Products() {
  const { products, hideProduct, approveProduct } = useAdmin()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: 'all', status: 'all' })
  const [page, setPage] = useState(1)
  const cats = [...new Set(products.map((p) => p.category))]
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (filters.category !== 'all' && p.category !== filters.category) return false
      if (filters.status !== 'all' && p.status !== filters.status) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q) || p.farmerName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    })
  }, [products, search, filters])
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-forest-deep">Products</h1>
      <SearchFilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search products…"
        filters={[
          { key: 'category', label: 'Category', options: cats.map((c) => ({ value: c, label: c })) },
          { key: 'status', label: 'Status', options: [{ value: 'published', label: 'Published' }, { value: 'pending', label: 'Pending' }, { value: 'hidden', label: 'Hidden' }] }
        ]}
        activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) }}
        onClear={() => { setFilters({ category: 'all', status: 'all' }); setSearch(''); setPage(1) }} />
      {filtered.length === 0 ? <EmptyState icon={Package} title="No products found" /> : (
        <div className="rounded-2xl border border-forest/8 bg-cream-soft overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-forest/5 text-xs uppercase text-forest/60"><tr>
              <th className="px-4 py-3">Product</th><th className="px-4 py-3 hidden md:table-cell">Category</th><th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-forest/6">{pageData.map((p) => (
              <tr key={p.id} className="hover:bg-forest/[0.03]">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-forest/70 hidden md:table-cell">{p.category}</td>
                <td className="px-4 py-3 tabular-nums">Rs. {p.price}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">
                  <Link to={`/admin/products/${p.id}`} className="rounded-lg p-2 text-forest/50 hover:bg-forest/5"><Eye size={16} /></Link>
                  {p.status === 'published'
                    ? <button type="button" onClick={() => hideProduct(p.id)} className="rounded-lg p-2 text-forest/50 hover:bg-forest/5"><EyeOff size={16} /></button>
                    : <button type="button" onClick={() => approveProduct(p.id)} className="rounded-lg p-2 text-forest/50 hover:bg-sage/10"><Eye size={16} /></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="px-4 border-t border-forest/6"><TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  )
}
