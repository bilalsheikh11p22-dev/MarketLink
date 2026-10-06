import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Ban, CheckCircle, Sprout } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import SearchFilterBar from '../../components/admin/SearchFilterBar.jsx'
import TablePagination from '../../components/admin/TablePagination.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'
const PAGE_SIZE = 10
export default function Farmers() {
  const { farmers, suspendFarmer, activateFarmer } = useAdmin()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: 'all' })
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return farmers.filter((f) => {
      if (filters.status !== 'all' && f.status !== filters.status) return false
      if (!q) return true
      return f.name.toLowerCase().includes(q) || f.farm.toLowerCase().includes(q) || (f.marketName || '').toLowerCase().includes(q)
    })
  }, [farmers, search, filters])
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-forest-deep">Farmers</h1></div>
      <SearchFilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search farmer, farm, market…"
        filters={[{ key: 'status', label: 'Status', options: [{ value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended' }, { value: 'rejected', label: 'Rejected' }] }]}
        activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) }} onClear={() => { setFilters({ status: 'all' }); setSearch(''); setPage(1) }} />
      {filtered.length === 0 ? <EmptyState icon={Sprout} title="No farmers found" /> : (
        <div className="rounded-2xl border border-forest/8 bg-cream-soft overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-forest/5 text-forest/60 text-xs uppercase"><tr>
              <th className="px-4 py-3">Farmer</th><th className="px-4 py-3 hidden md:table-cell">Farm</th><th className="px-4 py-3 hidden lg:table-cell">Market</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-forest/6">{pageData.map((f) => (
              <tr key={f.id} className="hover:bg-forest/[0.03]">
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3 text-forest/70 hidden md:table-cell">{f.farm}</td>
                <td className="px-4 py-3 text-forest/60 hidden lg:table-cell">{f.marketName || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">
                  <Link to={`/admin/farmers/${f.id}`} className="rounded-lg p-2 text-forest/50 hover:bg-forest/5"><Eye size={16} /></Link>
                  {f.status === 'approved' ? <button type="button" onClick={() => setConfirm({ id: f.id, name: f.name, action: 'suspend' })} className="rounded-lg p-2 text-forest/50 hover:bg-red-50 hover:text-red-700"><Ban size={16} /></button>
                  : f.status === 'suspended' ? <button type="button" onClick={() => setConfirm({ id: f.id, name: f.name, action: 'activate' })} className="rounded-lg p-2 text-forest/50 hover:bg-sage/10 hover:text-sage"><CheckCircle size={16} /></button> : null}
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="px-4 border-t border-forest/6"><TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} /></div>
        </div>
      )}
      <ConfirmModal open={!!confirm} title={confirm?.action === 'suspend' ? 'Suspend farmer?' : 'Activate farmer?'} message={confirm ? `${confirm.action} ${confirm.name}?` : ''} confirmLabel={confirm?.action === 'suspend' ? 'Suspend' : 'Activate'} danger={confirm?.action === 'suspend'} onConfirm={() => { if (confirm?.action === 'suspend') suspendFarmer(confirm.id); else activateFarmer(confirm.id); setConfirm(null) }} onCancel={() => setConfirm(null)} />
    </div>
  )
}
