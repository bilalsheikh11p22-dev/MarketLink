import { useState } from 'react'
import { ClipboardCheck, Check, X } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import AdminModal from '../../components/admin/AdminModal.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
export default function FarmerApprovals() {
  const { applications, approveFarmer, rejectFarmer } = useAdmin()
  const pending = applications.filter((a) => a.status === 'pending')
  const [rejectId, setRejectId] = useState(null)
  const [reason, setReason] = useState('')
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-forest-deep">Farmer Approvals</h1><p className="text-sm text-forest/55 mt-1">Review pending applications.</p></div>
      {pending.length === 0 ? <EmptyState icon={ClipboardCheck} title="No pending applications" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pending.map((app) => (
            <article key={app.id} className="rounded-2xl border border-forest/8 bg-cream-soft p-5 flex flex-col">
              <div className="flex justify-between"><div><h2 className="font-display text-lg">{app.name}</h2><p className="text-sm text-forest/60">{app.farm}</p></div><StatusBadge status={app.status} /></div>
              <dl className="mt-3 space-y-1 text-sm flex-1">
                <div><span className="text-forest/45">Email </span>{app.email}</div>
                <div><span className="text-forest/45">Phone </span>{app.phone}</div>
                <div><span className="text-forest/45">Location </span>{app.location}</div>
                <div><span className="text-forest/45">Categories </span>{(app.categories || []).join(', ')}</div>
                <div><span className="text-forest/45">Submitted </span>{app.submittedAt}</div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => approveFarmer(app.id)} className="inline-flex items-center gap-1 rounded-xl bg-forest px-3 py-2 text-xs font-medium text-cream"><Check size={14} /> Approve</button>
                <button type="button" onClick={() => { setRejectId(app.id); setReason('') }} className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"><X size={14} /> Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <AdminModal open={!!rejectId} title="Reason for rejection" onClose={() => setRejectId(null)} size="sm">
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Reason…" className="w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm mb-3" />
        <button type="button" disabled={!reason.trim()} onClick={() => { rejectFarmer(rejectId, reason.trim()); setRejectId(null) }} className="w-full rounded-xl bg-red-700 py-2.5 text-sm text-cream disabled:opacity-40">Reject</button>
      </AdminModal>
    </div>
  )
}
