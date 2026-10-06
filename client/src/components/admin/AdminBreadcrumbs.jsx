import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const LABELS = {
  admin: 'Dashboard',
  users: 'Users',
  farmers: 'Farmers',
  approvals: 'Approvals',
  markets: 'Markets',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  reviews: 'Reviews',
  moderation: 'Moderation',
  notifications: 'Notifications',
  reports: 'Reports',
  analytics: 'Analytics',
  profile: 'Profile',
  settings: 'Settings'
}

export default function AdminBreadcrumbs() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = parts.map((part, i) => {
    const to = '/' + parts.slice(0, i + 1).join('/')
    const isId = /^(ord-|user-|farmer-|market-|product-|cat-|app-|rep-|an-)/.test(part) || /^\d+$/.test(part)
    return { to, label: LABELS[part] || (isId ? 'Details' : part), last: i === parts.length - 1 }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-forest/50 overflow-x-auto">
      <Link to="/admin" className="hover:text-forest shrink-0">
        <Home size={14} />
        <span className="sr-only">Admin home</span>
      </Link>
      {crumbs.map((c) => (
        <span key={c.to} className="flex items-center gap-1 shrink-0">
          <ChevronRight size={12} className="text-forest/30" />
          {c.last ? (
            <span className="font-medium text-forest/70">{c.label}</span>
          ) : (
            <Link to={c.to} className="hover:text-forest">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}
