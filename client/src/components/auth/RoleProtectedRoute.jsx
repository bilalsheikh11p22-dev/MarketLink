import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ENFORCE_ROLE_GUARDS } from '../../config/auth.js'
import AccessDenied from './AccessDenied.jsx'

/**
 * Requires a login AND one of `roles` (e.g. ['farmer']).
 *  guest      -> /login (then back here)
 *  wrong role -> a friendly "not available" page (no silent redirect)
 * Set ENFORCE_ROLE_GUARDS=false in config/auth.js to open the guarded
 * areas during development.
 */
export default function RoleProtectedRoute({ roles, children }) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!ENFORCE_ROLE_GUARDS) return children ?? <Outlet />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (!hasRole(roles)) return <AccessDenied roles={roles} />
  return children ?? <Outlet />
}
