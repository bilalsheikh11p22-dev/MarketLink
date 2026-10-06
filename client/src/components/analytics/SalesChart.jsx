import { motion } from 'framer-motion'
export default function SalesChart({ data = [], ariaLabel = 'Sales chart' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const w = 560, h = 200, pad = 28
  const gap = (w - pad * 2) / Math.max(data.length - 1, 1)
  const pts = data.map((d, i) => `${pad + i * gap},${h - pad - (d.value / max) * (h - pad * 2)}`).join(' ')
  const area = `M ${pad},${h - pad} L ${pts} L ${pad + (data.length - 1) * gap},${h - pad} Z`
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="w-full min-w-[300px]" role="img" aria-label={ariaLabel}>
        <path d={area} fill="#122A20" fillOpacity="0.08" />
        <polyline fill="none" stroke="#5B7A5E" strokeWidth="2.5" points={pts} strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + i * gap
          const y = h - pad - (d.value / max) * (h - pad * 2)
          return (
            <g key={d.label}>
              <circle cx={x} cy={y} r="3.5" fill="#A98B4F" />
              <text x={x} y={h + 14} textAnchor="middle" fontSize="11" fill="#6B4F3B">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}
