import { useState } from 'react'
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader.jsx'
import AnalyticsCard from '../../components/analytics/AnalyticsCard.jsx'
import StatCard from '../../components/analytics/StatCard.jsx'
import DataState from '../../components/common/DataState.jsx'
import useFetch from '../../hooks/useFetch.js'
import * as svc from '../../services/insightService.js'
import * as api from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const REPORTS = [['orders', 'Orders', 'Up to 5,000 most recent orders'], ['products', 'Products', 'Active catalogue with stock and units sold'], ['users', 'Users', 'Name, email, role, status']]

export default function Reports() {
  const { showToast } = useToast()
  const [busy, setBusy] = useState('')
  const { data, loading, error, reload } = useFetch(() => api.api('/admin/dashboard'), [])
  const run = async (type) => { setBusy(type); try { await svc.downloadReport(type); showToast('Report downloaded') } catch (e) { showToast(e.message) } finally { setBusy('') } }
  return (
    <div className="space-y-8">
      <AnalyticsHeader title="Reports &amp; exports" subtitle="CSV exports of live data. Every export is recorded in the audit log." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">{Object.entries(data.stats).map(([k, v]) => <StatCard key={k} label={k.replace(/([A-Z])/g, ' $1')} value={v} />)}</div>}
      </DataState>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPORTS.map(([type, label, hint]) => (
          <AnalyticsCard key={type} title={`${label} (CSV)`}>
            <p className="text-sm text-forest/60 mb-4">{hint}</p>
            <button type="button" disabled={busy === type} onClick={() => run(type)} className="rounded-xl bg-forest px-4 py-2 text-sm text-cream disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-olive">{busy === type ? 'Preparing…' : 'Download CSV'}</button>
          </AnalyticsCard>
        ))}
      </div>
    </div>
  )
}
