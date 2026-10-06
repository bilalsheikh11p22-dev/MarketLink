import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Ban, CheckCircle, Users as UsersIcon } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import SearchFilterBar from '../../components/admin/SearchFilterBar.jsx'
import TablePagination from '../../components/admin/TablePagination.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'
import AppImage from '../../components/image/AppImage.jsx'
const PAGE_SIZE = 10
export default function Users() {
  const { users, suspendUser, activateUser } = useAdmin()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ role: 'all', status: 'all' })
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (filters.role !== 'all' && u.role !== filters.role) return false
      if (filters.status !== 'all' && u.status !== filters.status) return false
      if (!q) return true
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || '').includes(q)
    })
  }, [users, search, filters])
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-forest-deep">Users</h1><p className="text-sm text-forest/55 mt-1">Manage customer, farmer and admin accounts.</p></div>
      <SearchFilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search name, email or phone…"
        filters={[
          { key: 'role', label: 'Role', options: [{ value: 'customer', label: 'Customer' }, { value: 'farmer', label: 'Farmer' }, { value: 'admin', label: 'Admin' }] },
          { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }, { value: 'pending', label: 'Pending' }] }
        ]}
        activeFilters={filters} onFilterChange={(k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1) }}
        onClear={() => { setFilters({ role: 'all', status: 'all' }); setSearch(''); setPage(1) }} />
      {filtered.length === 0 ? <EmptyState icon={UsersIcon} title="No users found" /> : (
        <div className="rounded-2xl border border-forest/8 bg-cream-soft overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm text-left">
            <thead className="bg-forest/5 text-forest/60 text-xs uppercase"><tr>
              <th className="px-4 py-3">User</th><th className="px-4 py-3 hidden md:table-cell">Email</th><th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3 hidden sm:table-cell">Joined</th><th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-forest/6">{pageData.map((u) => (
              <tr key={u.id} className="hover:bg-forest/[0.03]">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-forest/10 overflow-hidden flex items-center justify-center text-xs font-semibold shrink-0">{u.avatar ? <AppImage src={u.avatar} alt="" kind="avatar" /> : u.name.charAt(0)}</div><span className="font-medium">{u.name}</span></div></td>
                <td className="px-4 py-3 text-forest/70 hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-forest/55 hidden sm:table-cell">{u.joined}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">
                  <Link to={`/admin/users/${u.id}`} className="rounded-lg p-2 text-forest/50 hover:bg-forest/5" aria-label="View"><Eye size={16} /></Link>
                  {u.status === 'active'
                    ? <button type="button" onClick={() => setConfirm({ id: u.id, name: u.name, action: 'suspend' })} className="rounded-lg p-2 text-forest/50 hover:bg-red-50 hover:text-red-700" aria-label="Suspend"><Ban size={16} /></button>
                    : <button type="button" onClick={() => setConfirm({ id: u.id, name: u.name, action: 'activate' })} className="rounded-lg p-2 text-forest/50 hover:bg-sage/10 hover:text-sage" aria-label="Activate"><CheckCircle size={16} /></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="px-4 border-t border-forest/6"><TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} /></div>
        </div>
      )}
      <ConfirmModal open={!!confirm} title={confirm?.action === 'suspend' ? 'Suspend user?' : 'Activate user?'}
        message={confirm ? `${confirm.action === 'suspend' ? 'Suspend' : 'Activate'} ${confirm.name}?` : ''}
        confirmLabel={confirm?.action === 'suspend' ? 'Suspend' : 'Activate'} danger={confirm?.action === 'suspend'}
        onConfirm={() => { if (confirm?.action === 'suspend') suspendUser(confirm.id); else activateUser(confirm.id); setConfirm(null) }}
        onCancel={() => setConfirm(null)} />
    </div>
  )
}
