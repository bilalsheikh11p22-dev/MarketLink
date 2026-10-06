import { motion } from 'framer-motion'
export default function OrdersChart({ data = [], ariaLabel = 'Orders chart' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const w = 560, h = 200, pad = 28, gap = 10
  const bw = (w - pad * 2 - gap * (data.length - 1)) / data.length
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full min-w-[300px]" role="img" aria-label={ariaLabel}>
        {data.map((d, i) => {
          const bh = (d.value / max) * (h - pad * 2)
          const x = pad + i * (bw + gap)
          const y = h - pad - bh
          return (
            <g key={d.label}>
              <title>{`${d.label}: ${d.value}`}</title>
              <rect x={x} y={y} width={bw} height={bh} fill="#122A20" rx="3" />
              <rect x={x} y={y} width={bw} height={Math.min(5, bh)} fill="#A98B4F" rx="3" />
              <text x={x + bw / 2} y={h + 14} textAnchor="middle" fontSize="11" fill="#6B4F3B">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}
