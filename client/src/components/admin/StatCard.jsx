import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, change, description, delay = 0 }) {
  const pos = typeof change === 'number' ? change >= 0 : true
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-forest/8 bg-cream-soft p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/8 text-forest">
          {Icon && <Icon size={20} strokeWidth={1.75} />}
        </div>
        {typeof change === 'number' && (
          <span className={`text-xs font-semibold tabular-nums ${pos ? 'text-sage' : 'text-red-600'}`}>
            {pos ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl tabular-nums text-forest-deep">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 text-sm font-medium text-forest/80">{label}</p>
      {description && <p className="mt-1 text-xs text-forest/50">{description}</p>}
    </motion.div>
  )
}
