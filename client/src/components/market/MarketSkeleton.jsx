// Reusable loading skeletons: image, title, metadata and button blocks.
// aria-hidden — the surrounding page announces results, not placeholders.

export default function MarketSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col overflow-hidden border border-forest/10 bg-cream-soft animate-pulse">
      <div className="aspect-[4/3] bg-forest/10" />
      <div className="flex flex-col gap-3 p-6">
        <div className="h-5 w-3/4 bg-forest/10" />
        <div className="h-3 w-1/2 bg-forest/10" />
        <div className="h-3 w-2/3 bg-forest/10" />
        <div className="h-3 w-1/3 bg-forest/10" />
        <div className="mt-3 flex items-center justify-between">
          <div className="h-8 w-28 bg-forest/10" />
          <div className="h-8 w-24 bg-forest/10" />
        </div>
      </div>
    </div>
  )
}

export function MarketSkeletonGrid({ count = 6, className = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <MarketSkeleton key={i} />
      ))}
    </div>
  )
}
