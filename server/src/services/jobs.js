import Order from '../models/Order.js'
import { notify } from './notify.js'

const todayStr = () => new Date().toISOString().slice(0, 10)
/** Sends one reminder on the day of pickup for orders that are still active. Safe to run repeatedly. */
export async function sendPickupReminders() {
  const due = await Order.find({ pickupDate: todayStr(), status: { $in: ['accepted', 'confirmed', 'preparing', 'ready'] }, pickupReminderSent: false })
  for (const o of due) {
    const claim = await Order.updateOne({ _id: o._id, pickupReminderSent: false }, { pickupReminderSent: true })
    if (claim.modifiedCount !== 1) continue
    await notify(o.customer, { title: 'Pickup today', message: `Order ${o.orderNumber} is due for pickup today${o.pickupTime ? ` at ${o.pickupTime}` : ''}.`, type: 'pickup', link: `/orders/${o._id}` })
  }
  return due.length
}
let timer = null
export function startJobs() {
  if (timer || process.env.DISABLE_JOBS === 'true') return
  const run = () => sendPickupReminders().catch((e) => console.error('[jobs] reminders failed:', e.message))
  timer = setInterval(run, 15 * 60 * 1000); timer.unref?.()
  setTimeout(run, 5000).unref?.()
}
