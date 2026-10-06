import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Heart, LayoutDashboard, LogOut, Package, Star, User } from 'lucide-react'
import Avatar from '../common/Avatar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export function getUserLinks(role) {
  const base = [
    { to: '/favorites', label: 'Favorites', Icon: Heart },
    { to: '/notifications', label: 'Notifications', Icon: Bell },
    { to: '/orders', label: 'Orders', Icon: Package },
    { to: '/reviews', label: 'My Reviews', Icon: Star },
    { to: '/profile', label: 'Profile', Icon: User }
  ]
  if (role === 'farmer') return [{ to: '/farmer', label: 'Farmer Portal', Icon: LayoutDashboard }, ...base]
  if (role === 'admin') return [{ to: '/admin', label: 'Admin', Icon: LayoutDashboard }, ...base]
  return base
}

/** Avatar dropdown shown in the Navbar when logged in. */
export default function UserMenu() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleLogout = () => {
    logout()
    setOpen(false)
    showToast('Logged out')
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-light rounded-full"
      >
        <Avatar src={user.avatar} name={user.name} size={34} />
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-3 w-64 bg-cream text-forest-deep border border-forest/15 shadow-[0_24px_50px_-20px_rgba(11,29,21,0.55)]">
          <div className="px-5 py-4 border-b border-forest/10">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-forest-deep/55 truncate">{user.email}</p>
            <span className="inline-block mt-2 text-[10px] uppercase tracking-widest2 text-olive">{user.role}</span>
          </div>
          <ul className="py-2">
            {getUserLinks(user.role).map(({ to, label, Icon }) => (
              <li key={to} role="none">
                <Link role="menuitem" to={to} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-olive/10 focus:outline-none focus-visible:bg-olive/15">
                  <Icon size={16} strokeWidth={1.6} aria-hidden="true" /> {label}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-3 px-5 py-3 text-sm border-t border-forest/10 hover:bg-olive/10 focus:outline-none focus-visible:bg-olive/15">
            <LogOut size={16} strokeWidth={1.6} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
