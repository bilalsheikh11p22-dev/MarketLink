export default function LoadingSpinner({ size = 'md', label = 'Loading' }) {
  const s = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <div className={`animate-spin rounded-full border-forest/20 border-t-forest ${s[size] || s.md}`} aria-hidden />
      <span className="sr-only">{label}</span>
      <p className="text-sm text-forest/50">{label}…</p>
    </div>
  )
}
