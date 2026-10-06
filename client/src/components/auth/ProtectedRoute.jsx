import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Requires any logged-in user. Guests are sent to /login and returned to
 * the page they wanted afterwards (state.from). Use as a wrapper
 * (<ProtectedRoute><Page/></ProtectedRoute>) or as a layout route (renders <Outlet/>).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children ?? <Outlet />
}
