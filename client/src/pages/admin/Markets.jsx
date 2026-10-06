import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Ban, Trash2, Store } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import SearchFilterBar from '../../components/admin/SearchFilterBar.jsx'
import TablePagination from '../../components/admin/TablePagination.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'
const PAGE_SIZE = 10
export default function Markets() {
  const { markets, suspendMarket, deleteMarket } = useAdmin()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: 'all' })
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return markets.filter((m) => {
      if (filters.status !== 'all' && m.status !== filters.status) return false
      if (!q) return true
      return m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q)
    })
  }, [markets, search, filters])
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-forest-deep">Markets</h1>
      <SearchFilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search markets…"
        filters={[{ key: 'status', label: 'Status', options: [{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended' }] }]}
        activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) }} onClear={() => { setFilters({ status: 'all' }); setSearch(''); setPage(1) }} />
      {filtered.length === 0 ? <EmptyState icon={Store} title="No markets found" /> : (
        <div className="rounded-2xl border border-forest/8 bg-cream-soft overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-forest/5 text-xs uppercase text-forest/60"><tr>
              <th className="px-4 py-3">Market</th><th className="px-4 py-3 hidden md:table-cell">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-forest/6">{pageData.map((m) => (
              <tr key={m.id} className="hover:bg-forest/[0.03]">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-forest/70 hidden md:table-cell">{m.location}</td>
                <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">
                  <Link to={`/admin/markets/${m.id}`} className="rounded-lg p-2 text-forest/50 hover:bg-forest/5"><Eye size={16} /></Link>
                  <button type="button" onClick={() => setConfirm({ id: m.id, name: m.name, action: 'suspend' })} className="rounded-lg p-2 text-forest/50 hover:bg-red-50"><Ban size={16} /></button>
                  <button type="button" onClick={() => setConfirm({ id: m.id, name: m.name, action: 'delete' })} className="rounded-lg p-2 text-forest/50 hover:bg-red-50"><Trash2 size={16} /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="px-4 border-t border-forest/6"><TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} /></div>
        </div>
      )}
      <ConfirmModal open={!!confirm} title={confirm?.action === 'delete' ? 'Delete market?' : 'Suspend market?'} message={confirm ? `${confirm.action} ${confirm.name}?` : ''} confirmLabel={confirm?.action === 'delete' ? 'Delete' : 'Suspend'} danger onConfirm={() => { if (confirm?.action === 'delete') deleteMarket(confirm.id); else suspendMarket(confirm.id); setConfirm(null) }} onCancel={() => setConfirm(null)} />
    </div>
  )
}
