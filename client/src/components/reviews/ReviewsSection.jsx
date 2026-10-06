import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReviews } from '../../context/ReviewsContext.jsx'
import RatingBreakdown from './RatingBreakdown.jsx'
import ReviewCard from './ReviewCard.jsx'
import ReviewForm from './ReviewForm.jsx'

const PAGE = 4

/**
 * Reviews block used by Product Details and Farmer Details.
 * kind="product": reviews of that product + the write-a-review form.
 * kind="farmer":  reviews of all the farmer's products, with reply threads
 *                 (reply controls only for the logged-in owner farmer).
 */
export default function ReviewsSection({ kind, product, farmer }) {
  const { user } = useAuth()
  const { getReviewsForProduct, getReviewsForFarmer, getSummary, loadProductReviews, loadFarmerReviews, isLoaded } = useReviews()
  const [visible, setVisible] = useState(PAGE)
  const [writing, setWriting] = useState(false)

  const isProduct = kind === 'product'
  const targetId = isProduct ? product?.id : farmer?.id
  useEffect(() => { if (targetId) (isProduct ? loadProductReviews : loadFarmerReviews)(targetId) }, [targetId, isProduct, loadProductReviews, loadFarmerReviews])
  const loaded = isLoaded(isProduct ? 'product' : 'farmer', targetId)
  const reviews = useMemo(
    () => (isProduct ? getReviewsForProduct(product.id) : getReviewsForFarmer(farmer.id)),
    [isProduct, product?.id, farmer?.id, getReviewsForProduct, getReviewsForFarmer]
  )

  const summary = useMemo(() => getSummary(0, 0, reviews), [reviews, getSummary])

  const farmName = isProduct ? product.farmer.name : farmer.farm
  const ownerFarmerId = isProduct ? product.farmerId : farmer.id
  const canReply = user?.role === 'farmer' && user.farmerId === ownerFarmerId

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-28">
      <span className="block text-olive text-xs tracking-widest2 uppercase mb-3">{isProduct ? 'What shoppers say' : 'From the community'}</span>
      <h2 id="reviews-heading" className="font-display text-3xl text-forest-deep mb-8">
        Customer Reviews
      </h2>

      <div className="border border-forest/10 bg-cream-soft p-6 md:p-10 mb-8">
        <RatingBreakdown summary={summary} />
      </div>

      {isProduct && (
        <div className="mb-10">
          {writing ? (
            <ReviewForm productId={product.id} onDone={() => setWriting(false)} onCancel={() => setWriting(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setWriting(true)}
              className="px-7 py-3 text-sm border border-forest-deep/40 text-forest-deep hover:bg-forest-deep hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {!loaded ? (
        <p role="status" className="py-10 text-center text-sm text-forest-deep/55">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div className="border border-dashed border-forest/15 py-14 text-center">
          <p className="font-display text-xl text-forest-deep">No reviews yet</p>
          <p className="text-sm text-forest-deep/55 mt-1">{isProduct ? 'Be the first to share your experience.' : 'Reviews will appear here after customers pick up their orders.'}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {reviews.slice(0, visible).map((r) => (
              <ReviewCard key={r.id} review={r} product={isProduct || !r.productName ? undefined : { id: r.productId, name: r.productName }} farmName={farmName} canReply={canReply} />
            ))}
          </div>
          {reviews.length > visible && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              className="mt-6 text-sm text-forest-deep hover:text-olive underline-offset-4 hover:underline"
            >
              Show more reviews ({reviews.length - visible} more)
            </button>
          )}
        </>
      )}
    </section>
  )
}
