import PillTabs from '../common/PillTabs.jsx'
import { NOTIFICATION_TABS } from '../../data/notifications.js'

export default function NotificationTabs({ value, onChange, counts }) {
  const tabs = NOTIFICATION_TABS.map((t) => ({ ...t, count: counts[t.id] }))
  return <PillTabs tabs={tabs} value={value} onChange={onChange} label="Notification categories" idPrefix="notif-tab" />
}
