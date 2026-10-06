export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/5 text-forest/40">
          <Icon size={28} strokeWidth={1.5} aria-hidden />
        </div>
      )}
      <h3 className="font-display text-lg text-forest-deep">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-forest/60">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
