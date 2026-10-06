export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-forest/8 ${className}`} aria-hidden />
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-forest/8 bg-cream-soft overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}
