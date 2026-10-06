import { WEEKDAYS } from '../../data/markets.js'
import { formatHours, getMarketStatus, getNow } from '../../utils/marketUtils.js'

const STATUS_DOT = { open: 'bg-sage', 'opens-later': 'bg-olive', closed: 'bg-forest-deep/30' }

/**
 * Weekly operating hours. Open days show the time range, other days say
 * "Closed". The current (mock) day is highlighted and carries the live
 * open/closed indicator.
 */
export default function MarketHours({ market }) {
  const { day: today } = getNow()
  const status = getMarketStatus(market)

  return (
    <section aria-labelledby="market-hours-title" className="border border-forest/10 bg-cream-soft p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 id="market-hours-title" className="font-display text-xl text-forest-deep">
          Operating Hours
        </h2>
        <span className="flex items-center gap-2 text-xs text-forest-deep/70" role="status">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status.state]}`} aria-hidden="true" />
          {status.label}
        </span>
      </div>

      <ul className="divide-y divide-forest/10">
        {WEEKDAYS.map((day) => {
          const open = (market.operatingDays || []).some((d) => String(d).slice(0, 3).toLowerCase() === day.slice(0, 3).toLowerCase())
          const isToday = day === today
          return (
            <li
              key={day}
              aria-current={isToday ? 'date' : undefined}
              className={`flex items-center justify-between gap-4 py-3 text-sm ${
                isToday ? 'bg-olive/10 -mx-3 px-3 border-l-2 border-olive' : ''
              }`}
            >
              <span className={`flex items-center gap-2 ${open ? 'text-forest-deep' : 'text-forest-deep/45'}`}>
                {day}
                {isToday && <span className="text-[10px] uppercase tracking-wide text-olive">Today</span>}
              </span>
              <span className={open ? 'text-forest-deep' : 'text-forest-deep/40'}>{open ? formatHours(market) : 'Closed'}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
