import { motion } from 'framer-motion'

export default function SalesOverviewChart({ data = [], ariaLabel = 'Sales overview' }) {
  const values = data.map((d) => d.value ?? 0)
  const max = Math.max(...values, 1)
  const w = 560
  const h = 200
  const pad = 28
  const gap = (w - pad * 2) / Math.max(data.length - 1, 1)
  const pts = data.map((d, i) => `${pad + i * gap},${h - pad - ((d.value ?? 0) / max) * (h - pad * 2)}`).join(' ')
  const area = data.length
    ? `M ${pad},${h - pad} L ${pts} L ${pad + (data.length - 1) * gap},${h - pad} Z`
    : ''

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full min-w-[300px]" role="img" aria-label={ariaLabel}>
        {area && <path d={area} fill="#122A20" fillOpacity="0.08" />}
        <polyline fill="none" stroke="#5B7A5E" strokeWidth="2.5" points={pts} strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + i * gap
          const y = h - pad - ((d.value ?? 0) / max) * (h - pad * 2)
          const label = d.month || d.label || ''
          return (
            <g key={`${label}-${i}`}>
              <circle cx={x} cy={y} r="3.5" fill="#A98B4F" />
              <text x={x} y={h + 14} textAnchor="middle" fontSize="11" fill="#6B4F3B">{label}</text>
            </g>
          )
        })}
      </svg>
      <p className="mt-1 text-xs text-forest/45 px-1">Mock order value (customers pay farmers at pickup)</p>
    </motion.div>
  )
}
