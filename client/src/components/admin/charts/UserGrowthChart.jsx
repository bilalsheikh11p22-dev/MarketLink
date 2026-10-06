import { motion } from 'framer-motion'

export default function UserGrowthChart({ data = [], ariaLabel = 'User growth' }) {
  const values = data.map((d) => d.users ?? d.value ?? 0)
  const max = Math.max(...values, 1)
  const w = 560
  const h = 200
  const pad = 28
  const gap = (w - pad * 2) / Math.max(data.length - 1, 1)
  const points = data.map((d, i) => {
    const val = d.users ?? d.value ?? 0
    return `${pad + i * gap},${h - pad - (val / max) * (h - pad * 2)}`
  }).join(' ')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full min-w-[300px]" role="img" aria-label={ariaLabel}>
        <polyline fill="none" stroke="#122A20" strokeWidth="2.5" points={points} strokeLinejoin="round" />
        {data.map((d, i) => {
          const val = d.users ?? d.value ?? 0
          const x = pad + i * gap
          const y = h - pad - (val / max) * (h - pad * 2)
          const label = d.month || d.label || ''
          return (
            <g key={`${label}-${i}`}>
              <circle cx={x} cy={y} r="4" fill="#A98B4F" stroke="#F6F1E7" strokeWidth="2" />
              <text x={x} y={h + 14} textAnchor="middle" fontSize="11" fill="#6B4F3B">{label}</text>
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}
