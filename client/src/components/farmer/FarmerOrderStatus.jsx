const STATUS_STYLES = {
  New: 'border-olive text-olive bg-transparent',
  Accepted: 'border-sage text-sage bg-transparent',
  Preparing: 'border-sage text-sage bg-sage/10',
  'Ready for Pickup': 'bg-forest-deep text-cream border-forest-deep',
  Completed: 'bg-forest/5 text-forest-deep/60 border-forest/15',
  Cancelled: 'border-red-300 text-red-700 bg-red-50'
}

export default function FarmerOrderStatus({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.New
  return <span className={`inline-flex items-center px-3 py-1 text-[11px] tracking-wide uppercase border ${style}`}>{status}</span>
}
