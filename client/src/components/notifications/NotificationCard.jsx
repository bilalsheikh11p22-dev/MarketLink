import { Link } from 'react-router-dom'
import { Check, Trash2 } from 'lucide-react'
import { FALLBACK_ICON, NOTIFICATION_ICONS } from './notificationIcons.js'
import { timeAgo } from '../../utils/time.js'

export default function NotificationCard({ notification: n, onRead, onDelete }) {
  const { Icon, tint } = NOTIFICATION_ICONS[n.type] ?? FALLBACK_ICON

  const body = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tint}`} aria-hidden="true">
        <Icon size={20} strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className={`text-forest-deep ${n.read ? '' : 'font-medium'}`}>
            {!n.read && <span className="sr-only">Unread: </span>}
            {n.title}
          </span>
          <time dateTime={n.timestamp} className="shrink-0 text-xs text-forest-deep/45 pt-0.5">
            {timeAgo(n.timestamp)}
          </time>
        </span>
        <span className="mt-0.5 block text-sm text-forest-deep/65 leading-relaxed">{n.message}</span>
      </span>
    </>
  )

  return (
    <li className={`relative border transition-colors ${n.read ? 'border-forest/10 bg-cream-soft' : 'border-olive/40 bg-white'}`}>
      {!n.read && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-olive" />}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 pl-5">
        {n.link ? (
          <Link to={n.link} onClick={() => onRead(n.id)} className="flex flex-1 items-start gap-4 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive">
            {body}
          </Link>
        ) : (
          <div className="flex flex-1 items-start gap-4 min-w-0">{body}</div>
        )}

        <div className="flex items-center gap-1 sm:flex-col sm:items-end sm:gap-0.5 self-end sm:self-center">
          {!n.read && (
            <button
              type="button"
              onClick={() => onRead(n.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs text-forest-deep/65 hover:text-olive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
              aria-label={`Mark "${n.title}" as read`}
            >
              <Check size={14} aria-hidden="true" /> Mark as read
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(n.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs text-forest-deep/65 hover:text-[#A9482F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
            aria-label={`Delete notification "${n.title}"`}
          >
            <Trash2 size={14} aria-hidden="true" /> Delete
          </button>
        </div>
      </div>
    </li>
  )
}
