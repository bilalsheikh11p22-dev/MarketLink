// Weekly pickup schedule helpers. Slots come from the API: { id, day: 'Mon'..'Sun', start: 'HH:mm', end: 'HH:mm', capacity, active }.
export const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }
export const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export function getSlotStatus(slot) { return slot.active === false ? 'Disabled' : 'Available' }
