const styles = {
  default: 'bg-forest/8 text-forest border-forest/15',
  success: 'bg-sage/15 text-sage border-sage/30',
  warning: 'bg-olive/15 text-olive border-olive/30',
  danger: 'bg-red-50 text-red-800 border-red-200',
  muted: 'bg-gray-100 text-gray-600 border-gray-200',
  olive: 'bg-olive/15 text-olive border-olive/25'
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant] || styles.default} ${className}`}>
      {children}
    </span>
  )
}
