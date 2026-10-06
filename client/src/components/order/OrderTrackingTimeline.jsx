import { STATUS_LABEL, TIMELINE_STEPS } from '../../utils/orderStatus.js'

/** Order status timeline driven by the server's statusHistory (timestamps shown when known). */
export default function OrderTimeline({ status, history = [] }) {
  const when = (s) => { const h = [...history].reverse().find((x) => x.status === s || (s === 'accepted' && x.status === 'confirmed')); return h ? new Date(h.at).toLocaleString() : '' }
  if (status === 'cancelled') {
    return (
      <ol className="flex flex-col gap-4" aria-label="Order progress">
        <Step label="Order placed" state="done" time={when('pending')} />
        <Step label="Order cancelled" state="cancelled" time={when('cancelled')} isLast />
      </ol>
    )
  }
  const current = TIMELINE_STEPS.indexOf(status === 'confirmed' ? 'accepted' : status)
  return (
    <ol className="flex flex-col gap-4" aria-label="Order progress">
      {TIMELINE_STEPS.map((s, i) => (
        <Step key={s} label={s === 'pending' ? 'Order placed' : STATUS_LABEL[s]} time={when(s)} state={i < current || status === 'completed' ? 'done' : i === current ? 'active' : 'upcoming'} isLast={i === TIMELINE_STEPS.length - 1} />
      ))}
    </ol>
  )
}

function Step({ label, state, time, isLast }) {
  const dot = state === 'cancelled' ? 'bg-red-700 border-red-700' : state === 'done' || state === 'active' ? 'bg-forest-deep border-forest-deep' : 'bg-transparent border-forest/25'
  return (
    <li className="relative flex gap-4" aria-current={state === 'active' ? 'step' : undefined}>
      {!isLast && <span className="absolute left-[7px] top-5 h-full w-px bg-forest/15" aria-hidden="true" />}
      <span className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${dot} ${state === 'active' ? 'ring-4 ring-olive/25' : ''}`} aria-hidden="true" />
      <div>
        <p className={`text-sm ${state === 'upcoming' ? 'text-forest-deep/40' : 'text-forest-deep'}`}>{label}<span className="sr-only"> — {state}</span></p>
        {time && state !== 'upcoming' && <p className="text-xs text-forest-deep/45">{time}</p>}
      </div>
    </li>
  )
}
