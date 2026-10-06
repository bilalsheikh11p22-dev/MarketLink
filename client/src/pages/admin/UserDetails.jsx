import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Ban, CheckCircle } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import AdminModal from '../../components/admin/AdminModal.jsx'
import AppImage from '../../components/image/AppImage.jsx'
export default function UserDetails() {
  const { id } = useParams()
  const { users, suspendUser, activateUser, changeUserRole } = useAdmin()
  const user = users.find((u) => u.id === id)
  const [confirm, setConfirm] = useState(null)
  const [roleOpen, setRoleOpen] = useState(false)
  const [role, setRole] = useState(user?.role || 'customer')
  if (!user) return <div className="text-center py-20 text-forest/60">User not found. <Link to="/admin/users" className="text-olive">Back</Link></div>
  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-forest/55 hover:text-forest"><ArrowLeft size={16} /> Back</Link>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6">
        <div className="flex gap-5 items-start">
          <div className="h-20 w-20 rounded-2xl bg-forest/10 overflow-hidden flex items-center justify-center text-2xl font-display shrink-0">{user.avatar ? <AppImage src={user.avatar} alt="" kind="avatar" /> : user.name.charAt(0)}</div>
          <div><h1 className="font-display text-2xl">{user.name}</h1><p className="text-sm text-forest/55">{user.email}</p><div className="mt-2 flex gap-2"><StatusBadge status={user.role} /><StatusBadge status={user.status} /></div></div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-xs text-forest/45 uppercase">Phone</dt><dd>{user.phone || '—'}</dd></div>
          <div><dt className="text-xs text-forest/45 uppercase">City</dt><dd>{user.city || '—'}</dd></div>
          <div><dt className="text-xs text-forest/45 uppercase">Joined</dt><dd>{user.joined}</dd></div>
          <div><dt className="text-xs text-forest/45 uppercase">ID</dt><dd className="font-mono text-xs">{user.id}</dd></div>
        </dl>
      </div>
      <div className="flex flex-wrap gap-3">
        {user.status === 'active' ? <button type="button" onClick={() => setConfirm('suspend')} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800"><Ban size={16} className="inline mr-1" />Suspend</button>
        : <button type="button" onClick={() => setConfirm('activate')} className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-2.5 text-sm text-sage"><CheckCircle size={16} className="inline mr-1" />Activate</button>}
        <button type="button" onClick={() => { setRole(user.role); setRoleOpen(true) }} className="rounded-xl border border-forest/15 px-4 py-2.5 text-sm">Change Role</button>
      </div>
      <ConfirmModal open={!!confirm} title={confirm === 'suspend' ? 'Suspend?' : 'Activate?'} message={`${confirm} ${user.name}?`} confirmLabel={confirm === 'suspend' ? 'Suspend' : 'Activate'} danger={confirm === 'suspend'} onConfirm={() => { if (confirm === 'suspend') suspendUser(user.id); else activateUser(user.id); setConfirm(null) }} onCancel={() => setConfirm(null)} />
      <AdminModal open={roleOpen} title="Change role" onClose={() => setRoleOpen(false)} size="sm">
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm mb-3"><option value="customer">Customer</option><option value="farmer">Farmer</option><option value="admin">Admin</option></select>
        <button type="button" onClick={() => { changeUserRole(user.id, role); setRoleOpen(false) }} className="w-full rounded-xl bg-forest py-2.5 text-sm text-cream">Save</button>
      </AdminModal>
    </div>
  )
}
