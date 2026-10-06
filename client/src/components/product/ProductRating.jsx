export default function ProductRating({ rating, reviewCount }) {
  const fullStars = Math.round(rating)
  return (
    <div className="flex items-center gap-2 text-sm text-forest-deep/75" aria-label={`Rated ${rating} out of 5`}>
      <span className="text-olive" aria-hidden="true">
        {'★'.repeat(fullStars)}
        {'☆'.repeat(5 - fullStars)}
      </span>
      <span>{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && <span className="text-forest-deep/45">({reviewCount} reviews)</span>}
    </div>
  )
}
