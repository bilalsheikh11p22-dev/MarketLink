import { useState } from 'react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.jsx'
import StatCard from '../../components/analytics/StatCard.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as svc from '../../services/insightService.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function AdminNotifications() {
  const { showToast } = useToast()
  const { data, loading, error, reload } = useFetch(() => svc.adminNotificationStats(), [])
  const [form, setForm] = useState({ title: '', message: '', audience: 'all' })
  const [busy, setBusy] = useState(false)
  const send = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { showToast('Add a title first'); return }
    setBusy(true)
    try { const r = await svc.adminBroadcast(form); showToast(`Sent to ${r.data.recipients} user(s)`); setForm({ title: '', message: '', audience: 'all' }); reload() }
    catch (err) { showToast(err.message) } finally { setBusy(false) }
  }
  const input = 'w-full border border-forest/15 bg-white px-3 py-2 text-sm focus:outline-none focus:border-olive'
  return (
    <div className="space-y-8">
      <AnalyticsHeader title="Notifications" subtitle="Broadcast an in-app announcement. Users who muted 'system' notifications are skipped." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><StatCard label="Total sent" value={data.total} /><StatCard label="Unread" value={data.unread} />{data.byType.map((b) => <StatCard key={b.type} label={`Type: ${b.type}`} value={b.count} />)}</div>}
      </DataState>
      <AnalyticsCard title="New broadcast">
        <form onSubmit={send} className="grid gap-3 max-w-xl">
          <label className="grid gap-1 text-sm">Title<input className={input} value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label className="grid gap-1 text-sm">Message<textarea className={input} rows={3} maxLength={500} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
          <label className="grid gap-1 text-sm">Audience<select className={input} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}><option value="all">Everyone</option><option value="customer">Customers</option><option value="farmer">Farmers</option></select></label>
          <button type="submit" disabled={busy} className="w-fit rounded-xl bg-forest px-5 py-2 text-sm text-cream disabled:opacity-60">{busy ? 'Sending…' : 'Send broadcast'}</button>
        </form>
      </AnalyticsCard>
    </div>
  )
}
