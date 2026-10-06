/**
 * Lightweight inline SVG bar chart — no charting library added, per the
 * Step 5 spec ("use one only if it already exists"). Takes the last 7
 * entries of {date, sales} and draws proportional bars with weekday labels
 * derived from each entry's own date, so labels are always correct
 * regardless of which 7 days are passed in.
 */
export default function SalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.sales), 1)
  const width = 700
  const height = 220
  const barGap = 18
  const barWidth = (width - barGap * (data.length - 1)) / data.length

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 40}`} className="w-full min-w-[420px]" role="img" aria-label="Sales over the last 7 days">
        {data.map((d, i) => {
          const barHeight = (d.sales / max) * height
          const x = i * (barWidth + barGap)
          const y = height - barHeight
          const label = new Date(`${d.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
          return (
            <g key={d.date}>
              <title>
                {label}: Rs. {d.sales.toLocaleString()}
              </title>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#122A20" rx="2" />
              <rect x={x} y={y} width={barWidth} height={Math.min(6, barHeight)} fill="#A98B4F" rx="2" />
              <text x={x + barWidth / 2} y={height + 22} textAnchor="middle" fontSize="12" fill="#6B4F3B" fontFamily="Work Sans, sans-serif">
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
