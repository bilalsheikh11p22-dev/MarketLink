import { motion } from 'framer-motion'

export default function CategoryDistributionChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 70
  const cx = 90
  const cy = 90
  let angle = -90
  const slices = data.map((d) => {
    const sweep = (d.value / total) * 360
    const start = angle
    angle += sweep
    const a1 = (start * Math.PI) / 180
    const a2 = ((start + sweep) * Math.PI) / 180
    const large = sweep > 180 ? 1 : 0
    const path = `M ${cx} ${cy} L ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)} Z`
    return { ...d, path }
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 180 180" className="w-40 h-40 shrink-0" role="img" aria-label="Category distribution">
        {slices.map((s) => (
          <path key={s.name} d={s.path} fill={s.color || '#122A20'} stroke="#FBF8F1" strokeWidth="2" />
        ))}
        <circle cx={cx} cy={cy} r={36} fill="#FBF8F1" />
      </svg>
      <ul className="space-y-2 text-sm w-full">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color || '#122A20' }} />
            <span className="text-forest/80">{d.name}</span>
            <span className="ml-auto tabular-nums text-forest/50">{d.value}%</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
