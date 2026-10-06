import { motion } from 'framer-motion'
export default function DemandChart({ data = [], ariaLabel = 'Demand chart' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const w = 480, h = 180, pad = 24
  const gap = (w - pad * 2) / Math.max(data.length - 1, 1)
  const pts = data.map((d, i) => `${pad + i * gap},${h - pad - (d.value / max) * (h - pad * 2)}`).join(' ')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full min-w-[260px]" role="img" aria-label={ariaLabel}>
        <polyline fill="none" stroke="#122A20" strokeWidth="2.5" points={pts} strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + i * gap
          const y = h - pad - (d.value / max) * (h - pad * 2)
          return (
            <g key={d.label}>
              <circle cx={x} cy={y} r="4" fill="#A98B4F" />
              <text x={x} y={h + 12} textAnchor="middle" fontSize="11" fill="#6B4F3B">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}
