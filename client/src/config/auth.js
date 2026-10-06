// Guard switches. With the flag on, /farmer/* needs a farmer login and
// /admin needs an admin login. Turn it off to browse the portal freely
// during development — nothing else changes.
export const ENFORCE_ROLE_GUARDS = true

export const ROLES = { customer: 'customer', farmer: 'farmer', admin: 'admin' }

export function defaultRouteForRole(role) {
  if (role === 'farmer') return '/farmer'
  return '/'
}
