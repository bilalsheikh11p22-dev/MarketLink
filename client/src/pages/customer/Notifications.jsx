import { useMemo, useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import PageLayout from '../../components/PageLayout.jsx'
import NotificationTabs from '../../components/notifications/NotificationTabs.jsx'
import NotificationCard from '../../components/notifications/NotificationCard.jsx'
import NotificationPreferences from '../../components/notifications/NotificationPreferences.jsx'
import { categoryOf } from '../../data/notifications.js'
import { useNotifications } from '../../context/NotificationContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const { showToast } = useToast()
  const [tab, setTab] = useState('all')

  const counts = useMemo(() => {
    const c = { all: notifications.length, orders: 0, farmers: 0, markets: 0, updates: 0 }
    notifications.forEach((n) => {
      c[categoryOf(n.type)] = (c[categoryOf(n.type)] ?? 0) + 1
    })
    return c
  }, [notifications])

  const visible = tab === 'all' ? notifications : notifications.filter((n) => categoryOf(n.type) === tab)

  const handleDelete = (id) => {
    deleteNotification(id)
    showToast('Notification deleted')
  }

  return (
    <PageLayout
      eyebrow="Stay in the loop"
      title="Notifications"
      subtitle="Orders, farmer updates and market news, all in one place."
      actions={
        unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm border border-cream/40 text-cream hover:bg-cream hover:text-forest-deep transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
          >
            <CheckCheck size={15} aria-hidden="true" /> Mark all as read
          </button>
        )
      }
    >
      <NotificationTabs value={tab} onChange={setTab} counts={counts} />
      <div className="pt-8">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 px-6 border border-dashed border-forest/15 bg-cream-soft/60">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-deep/5 text-olive mb-5">
              <BellOff size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h2 className="font-display text-2xl text-forest-deep">You&apos;re all caught up</h2>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 px-6 border border-dashed border-forest/15 bg-cream-soft/60">
            <h2 className="font-display text-2xl text-forest-deep">Nothing here</h2>
            <p className="text-forest-deep/55 text-sm mt-1">No notifications in this category.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((n) => (
              <NotificationCard key={n.id} notification={n} onRead={markAsRead} onDelete={handleDelete} />
            ))}
          </ul>
        )}
      </div>
      <NotificationPreferences />
    </PageLayout>
  )
}
