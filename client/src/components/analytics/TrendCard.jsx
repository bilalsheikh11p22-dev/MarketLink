export default function TrendCard({ title, trend, detail }) {
  const color = trend === 'increasing' ? 'text-sage' : trend === 'decreasing' ? 'text-red-700' : 'text-olive'
  return (
    <div className="rounded-xl border border-forest/8 bg-cream p-4">
      <p className="text-sm font-medium text-forest-deep">{title}</p>
      <p className={`mt-1 text-xs font-semibold capitalize ${color}`}>{trend}</p>
      {detail && <p className="mt-1 text-xs text-forest/55">{detail}</p>}
    </div>
  )
}
