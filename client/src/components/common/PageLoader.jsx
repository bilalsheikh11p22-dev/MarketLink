export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream/90 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-forest/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-olive border-r-sage animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-forest/60 tracking-wide">{label}</p>
    </div>
  )
}

export function InlineLoader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`} role="status">
      <div className="h-10 w-10 rounded-full border-4 border-forest/10 border-t-olive animate-spin" />
    </div>
  )
}
