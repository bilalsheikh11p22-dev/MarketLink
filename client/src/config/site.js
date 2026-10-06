// Site-level details shown on About/Contact. Nothing here is invented: leave values empty and the UI hides them.
export const SITE = {
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || '',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '',
  supportHours: import.meta.env.VITE_SUPPORT_HOURS || '',
  address: import.meta.env.VITE_SUPPORT_ADDRESS || '',
  // Add team members here: { name: 'Full name', role: 'Role', image: '/images/about/name.jpg' }
  team: []
}
