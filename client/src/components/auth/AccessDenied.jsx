import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import PageLayout from '../PageLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AccessDenied({ roles = [] }) {
  const { user, logout } = useAuth()
  return (
    <PageLayout eyebrow="Restricted" title="This area isn't available to your account">
      <div className="max-w-lg mx-auto text-center py-6">
        <ShieldAlert className="mx-auto text-olive mb-5" size={40} strokeWidth={1.4} aria-hidden="true" />
        <p className="text-forest-deep/70">
          This section is for <strong>{roles.join(' / ')}</strong> accounts. You&apos;re signed in as a <strong>{user?.role}</strong>.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="px-6 py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors">
            Back to Home
          </Link>
          <button type="button" onClick={logout} className="px-6 py-3 text-sm border border-forest-deep/30 text-forest-deep hover:border-olive hover:text-olive transition-colors">
            Switch account
          </button>
        </div>
      </div>
    </PageLayout>
  )
}
