import { Link } from 'react-router-dom'
import { FALLBACK_ICON, NOTIFICATION_ICONS } from './notificationIcons.js'
import { useNotifications } from '../../context/NotificationContext.jsx'
import { timeAgo } from '../../utils/time.js'

/** Desktop preview panel: latest 5 notifications + "View All". */
export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const latest = notifications.slice(0, 5)

  return (
    <div role="dialog" aria-label="Notifications" className="absolute right-0 top-full mt-3 w-[22rem] bg-cream text-forest-deep border border-forest/15 shadow-[0_24px_50px_-20px_rgba(11,29,21,0.55)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-forest/10">
        <p className="font-display text-lg">Notifications</p>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllAsRead} className="text-xs text-forest-deep/60 hover:text-olive focus:outline-none focus-visible:underline">
            Mark all as read
          </button>
        )}
      </div>

      {latest.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-forest-deep/55">You&apos;re all caught up.</p>
      ) : (
        <ul className="max-h-[22rem] overflow-y-auto divide-y divide-forest/10">
          {latest.map((n) => {
            const { Icon, tint } = NOTIFICATION_ICONS[n.type] ?? FALLBACK_ICON
            return (
              <li key={n.id}>
                <Link
                  to={n.link ?? '/notifications'}
                  onClick={() => {
                    markAsRead(n.id)
                    onClose()
                  }}
                  className={`flex items-start gap-3 px-5 py-3.5 hover:bg-olive/10 transition-colors focus:outline-none focus-visible:bg-olive/15 ${n.read ? '' : 'bg-white'}`}
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tint}`} aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${n.read ? '' : 'font-medium'}`}>
                      {!n.read && <span className="sr-only">Unread: </span>}
                      {n.title}
                    </span>
                    <span className="block text-xs text-forest-deep/60 truncate">{n.message}</span>
                    <span className="block text-[11px] text-forest-deep/40 mt-0.5">{timeAgo(n.timestamp)}</span>
                  </span>
                  {!n.read && <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-olive" />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Link to="/notifications" onClick={onClose} className="block px-5 py-3.5 text-sm text-center border-t border-forest/10 text-forest-deep hover:text-olive transition-colors focus:outline-none focus-visible:bg-olive/10">
        View All Notifications →
      </Link>
    </div>
  )
}
