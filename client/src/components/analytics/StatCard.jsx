import { motion } from 'framer-motion'
export default function StatCard({ icon: Icon, label, value, change, prefix = '', suffix = '', delay = 0 }) {
  const pos = typeof change === 'number' ? change >= 0 : true
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-forest/8 bg-cream-soft p-5">
      <div className="flex items-start justify-between">
        {Icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/8 text-forest"><Icon size={20} strokeWidth={1.75} /></div>}
        {typeof change === 'number' && (
          <span className={`text-xs font-semibold tabular-nums ${pos ? 'text-sage' : 'text-red-600'}`}>{pos ? '+' : ''}{change}%</span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl tabular-nums text-forest-deep">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      <p className="mt-0.5 text-sm text-forest/70">{label}</p>
    </motion.div>
  )
}
