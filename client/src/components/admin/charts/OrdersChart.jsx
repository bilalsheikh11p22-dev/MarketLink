import { motion } from 'framer-motion'

export default function OrdersChart({ data = [], ariaLabel = 'Orders chart' }) {
  const values = data.map((d) => d.orders ?? d.value ?? 0)
  const max = Math.max(...values, 1)
  const w = 560
  const h = 200
  const pad = 28
  const gap = 10
  const bw = data.length ? (w - pad * 2 - gap * (data.length - 1)) / data.length : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full min-w-[300px]" role="img" aria-label={ariaLabel}>
        {data.map((d, i) => {
          const val = d.orders ?? d.value ?? 0
          const bh = (val / max) * (h - pad * 2)
          const x = pad + i * (bw + gap)
          const y = h - pad - bh
          const label = d.month || d.label || ''
          return (
            <g key={`${label}-${i}`}>
              <title>{`${label}: ${val}`}</title>
              <rect x={x} y={y} width={bw} height={Math.max(0, bh)} fill="#122A20" rx="3" />
              <rect x={x} y={y} width={bw} height={Math.min(5, Math.max(0, bh))} fill="#A98B4F" rx="3" />
              <text x={x + bw / 2} y={h + 14} textAnchor="middle" fontSize="11" fill="#6B4F3B">{label}</text>
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}
