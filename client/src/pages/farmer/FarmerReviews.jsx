import { useMemo } from 'react'
import { useFarmer } from '../../context/FarmerContext.jsx'
import ReviewCard from '../../components/farmer/ReviewCard.jsx'

export default function FarmerReviews() {
  const { getReviews } = useFarmer()
  const reviews = getReviews()

  const { average, distribution } = useMemo(() => {
    const total = reviews.length
    const sum = reviews.reduce((s, r) => s + r.rating, 0)
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length
    }))
    return { average: total ? sum / total : 0, distribution: dist }
  }, [reviews])

  const maxCount = Math.max(...distribution.map((d) => d.count), 1)

  return (
    <div>
      <h1 className="font-display text-3xl text-forest-deep mb-8">Customer Reviews</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
        <div className="border border-forest/10 bg-cream-soft p-6 flex flex-col items-center justify-center text-center">
          <p className="font-display text-5xl text-forest-deep">{average.toFixed(1)}</p>
          <p className="text-olive mt-2" aria-hidden="true">
            {'★'.repeat(Math.round(average))}
            {'☆'.repeat(5 - Math.round(average))}
          </p>
          <p className="text-forest-deep/55 text-sm mt-2">{reviews.length} Reviews</p>
        </div>

        <div className="border border-forest/10 bg-cream-soft p-6 flex flex-col justify-center gap-2">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-sm">
              <span className="w-10 text-forest-deep/60">{d.star} ★</span>
              <div className="flex-1 h-2 bg-forest/10">
                <div className="h-full bg-olive" style={{ width: `${(d.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-forest-deep/60">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
