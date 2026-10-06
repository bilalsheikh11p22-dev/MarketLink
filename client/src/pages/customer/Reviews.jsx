import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Star, Trash2 } from 'lucide-react'
import PageLayout from '../../components/PageLayout.jsx'
import ReviewForm from '../../components/reviews/ReviewForm.jsx'
import { RatingStars } from '../../components/reviews/RatingStars.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReviews } from '../../context/ReviewsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { formatDate } from '../../utils/time.js'


export default function Reviews() {
  const { user } = useAuth()
  const { getReviewsByCustomer, deleteReview, loadMine } = useReviews()
  useEffect(() => { loadMine() }, [loadMine])
  const { showToast } = useToast()
  const [editingId, setEditingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const reviews = useMemo(() => getReviewsByCustomer(user.id), [getReviewsByCustomer, user.id])

  const remove = async (id) => {
    try { await deleteReview(id); showToast('Review deleted') } catch (e) { showToast(e.message || 'Could not delete') }
    setConfirmId(null)
  }

  return (
    <PageLayout eyebrow="Your voice" title="My Reviews" subtitle="Reviews you've written for products and the farmers behind them.">
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20 px-6 border border-dashed border-forest/15 bg-cream-soft/60">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-deep/5 text-olive mb-5">
            <Star size={26} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h2 className="font-display text-2xl text-forest-deep mb-2">You haven&apos;t reviewed anything yet</h2>
          <p className="text-forest-deep/60 text-sm max-w-sm mb-8">Bought something recently? Share what you thought.</p>
          <Link to="/products" className="inline-flex px-6 py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {reviews.map((review) => {
            const product = review.productName ? { id: review.productId, name: review.productName } : undefined
            if (editingId === review.id)
              return (
                <ReviewForm key={review.id} productId={review.productId} existing={review} onDone={() => setEditingId(null)} onCancel={() => setEditingId(null)} />
              )
            return (
              <article key={review.id} className="border border-forest/10 bg-cream-soft p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {product && (
                      <p className="text-xs text-forest-deep/55 mb-1">
                        <Link to={`/products/${product.id}`} className="text-forest-deep hover:text-olive underline-offset-4 hover:underline">
                          {product.name}
                        </Link>{' '}
                        · {product.farmer?.name}
                      </p>
                    )}
                    <RatingStars value={review.rating} size={14} />
                  </div>
                  <time dateTime={review.date} className="text-xs text-forest-deep/45">
                    {formatDate(review.date)}
                    {review.edited && ' · edited'}
                  </time>
                </div>
                <h3 className="mt-3 font-display text-lg text-forest-deep">{review.title}</h3>
                <p className="mt-1 text-forest-deep/75 leading-relaxed">{review.text}</p>

                <div className="mt-4 pt-4 border-t border-forest/10 flex items-center gap-5">
                  <button type="button" onClick={() => setEditingId(review.id)} className="inline-flex items-center gap-1.5 text-xs text-forest-deep/70 hover:text-olive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive">
                    <Pencil size={13} aria-hidden="true" /> Edit
                  </button>
                  {confirmId === review.id ? (
                    <span className="inline-flex items-center gap-2 text-xs text-forest-deep/70">
                      Delete this review?
                      <button type="button" onClick={() => remove(review.id)} className="text-red-700 hover:underline">
                        Yes, delete
                      </button>
                      <button type="button" onClick={() => setConfirmId(null)} className="hover:underline">
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setConfirmId(review.id)} className="inline-flex items-center gap-1.5 text-xs text-forest-deep/70 hover:text-[#A9482F] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive">
                      <Trash2 size={13} aria-hidden="true" /> Delete
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}
