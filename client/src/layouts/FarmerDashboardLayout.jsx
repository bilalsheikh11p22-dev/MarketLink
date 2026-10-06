import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useFarmer } from '../context/FarmerContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from '../components/notifications/NotificationBell.jsx'
import AppImage from '../components/image/AppImage.jsx'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/farmer', end: true, icon: 'grid' },
  { label: 'Profile', to: '/farmer/profile', icon: 'user' },
  { label: 'My Farm', to: '/farmer/farm', icon: 'leaf' },
  { label: 'Products', to: '/farmer/products', icon: 'box' },
  { label: 'Inventory', to: '/farmer/inventory', icon: 'list' },
  { label: 'Orders', to: '/farmer/orders', icon: 'bag' },
  { label: 'Pickup Slots', to: '/farmer/pickup-slots', icon: 'clock' },
  { label: 'Pickup Queue', to: '/farmer/pickup-queue', icon: 'clock' },
  { label: 'Sales', to: '/farmer/sales', icon: 'chart' },
  { label: 'Analytics', to: '/farmer/analytics', icon: 'chart' },
  { label: 'Waste', to: '/farmer/waste', icon: 'leaf' },
  { label: 'Assistant', to: '/farmer/assistant', icon: 'user' },
  { label: 'Reviews', to: '/farmer/reviews', icon: 'star' }
]

function NavIcon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }
  switch (name) {
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" />
          <rect x="13" y="3" width="8" height="8" />
          <rect x="3" y="13" width="8" height="8" />
          <rect x="13" y="13" width="8" height="8" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M20 4C10 4 4 10 4 19c8 0 15-5 16-15Z" />
          <path d="M6 18c3-3 7-6 13-13" />
        </svg>
      )
    case 'box':
      return (
        <svg {...common}>
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </svg>
      )
    case 'list':
      return (
        <svg {...common}>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      )
    case 'bag':
      return (
        <svg {...common}>
          <path d="M6 8h12l1 13H5L6 8Z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common}>
          <line x1="4" y1="20" x2="4" y2="12" />
          <line x1="12" y1="20" x2="12" y2="6" />
          <line x1="20" y1="20" x2="20" y2="14" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2.5l2.9 6.1 6.6.7-5 4.6 1.4 6.6L12 17l-5.9 3.5L7.5 14l-5-4.6 6.6-.7L12 2.5Z" />
        </svg>
      )
    default:
      return null
  }
}

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    showToast('Logged out')
    onNavigate?.()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-7">
        <Link to="/farmer" className="font-display text-xl text-cream tracking-wide">
          MarketLink
        </Link>
        <p className="text-cream/45 text-[11px] tracking-widest2 uppercase mt-1">Farmer Portal</p>
      </div>

      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-cream/10 text-cream border-l-2 border-olive-light' : 'text-cream/65 hover:text-cream border-l-2 border-transparent'
                  }`
                }
              >
                <NavIcon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 pb-6 pt-4 border-t border-cream/10 flex flex-col gap-1">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-cream/65 hover:text-cream transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 12 12 4l9 8" />
            <path d="M5 10v10h14V10" />
          </svg>
          View Marketplace
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-cream/65 hover:text-cream transition-colors text-left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

export default function FarmerDashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { getFarmerProfile } = useFarmer()
  const profile = getFarmerProfile()
  const location = useLocation()

  useEffect(() => setDrawerOpen(false), [location.pathname])

  const currentLabel = NAV_ITEMS.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))?.label ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-forest-deep">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-forest-deep/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 w-72 bg-forest-deep z-50 lg:hidden"
            >
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-forest/10 px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden text-forest-deep"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <p className="font-display text-lg text-forest-deep">{currentLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="hidden sm:block text-sm text-forest-deep/60">{profile.farmName}</span>
            <AppImage src={profile.avatar} alt={profile.name} kind="avatar" wrapperClassName="!h-9 !w-9 shrink-0 rounded-full border border-forest/15" />
          </div>
        </header>

        <main className="flex-1 min-w-0 px-5 md:px-8 py-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
