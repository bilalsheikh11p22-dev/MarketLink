import { useAuth } from '../../context/AuthContext.jsx'
export default function Profile() {
  const { user } = useAuth()
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-display text-2xl text-forest-deep">Admin Profile</h1>
      <div className="rounded-2xl border border-forest/8 bg-cream-soft p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-cream text-xl font-display mb-4">{(user?.name || 'A').charAt(0)}</div>
        <dl className="space-y-3 text-sm">
          <div><dt className="text-xs text-forest/45 uppercase">Name</dt><dd className="font-medium">{user?.name}</dd></div>
          <div><dt className="text-xs text-forest/45 uppercase">Email</dt><dd>{user?.email}</dd></div>
          <div><dt className="text-xs text-forest/45 uppercase">Role</dt><dd className="capitalize">{user?.role}</dd></div>
          <div><dt className="text-xs text-forest/45 uppercase">Phone</dt><dd>{user?.phone || '—'}</dd></div>
        </dl>
        <p className="mt-6 text-xs text-forest/45">Profile editing is frontend-only until Step 11.</p>
      </div>
    </div>
  )
}
