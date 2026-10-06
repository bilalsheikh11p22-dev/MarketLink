const STYLES = {
  active: 'bg-sage/15 text-sage border-sage/30',
  approved: 'bg-sage/15 text-sage border-sage/30',
  published: 'bg-sage/15 text-sage border-sage/30',
  open: 'bg-sage/15 text-sage border-sage/30',
  completed: 'bg-sage/15 text-sage border-sage/30',
  resolved: 'bg-sage/15 text-sage border-sage/30',
  pending: 'bg-olive/15 text-olive border-olive/30',
  preparing: 'bg-olive/15 text-olive border-olive/30',
  draft: 'bg-olive/10 text-olive border-olive/20',
  accepted: 'bg-forest/10 text-forest border-forest/20',
  ready: 'bg-forest/10 text-forest border-forest/20',
  customer: 'bg-forest/10 text-forest border-forest/20',
  farmer: 'bg-sage/15 text-sage border-sage/30',
  admin: 'bg-olive/15 text-olive border-olive/30',
  suspended: 'bg-earth/15 text-earth border-earth/30',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  reported: 'bg-red-50 text-red-700 border-red-200',
  hidden: 'bg-gray-100 text-gray-600 border-gray-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  dismissed: 'bg-gray-100 text-gray-500 border-gray-200',
  in_stock: 'bg-sage/15 text-sage border-sage/30',
  low_stock: 'bg-olive/15 text-olive border-olive/30',
  out_of_stock: 'bg-red-50 text-red-700 border-red-200'
}

export default function StatusBadge({ status, className = '' }) {
  const key = String(status || '').toLowerCase().replace(/\s+/g, '_')
  const style = STYLES[key] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style} ${className}`}>
      {String(status || '—').replace(/_/g, ' ')}
    </span>
  )
}
