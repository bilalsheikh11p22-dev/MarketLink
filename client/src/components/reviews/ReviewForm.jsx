import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Camera, CheckCircle2 } from 'lucide-react'
import { StarRatingInput } from './RatingStars.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useReviews } from '../../context/ReviewsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const field =
  'w-full bg-white border px-4 py-3 text-sm text-forest-deep placeholder:text-forest-deep/35 focus:outline-none focus:ring-1 transition-colors'

/**
 * Write / edit a review. Saves to localStorage through ReviewsContext.
 * `existing` switches to edit mode. Guests are asked to log in first.
 */
export default function ReviewForm({ productId, existing, onDone, onCancel }) {
  const { user, isAuthenticated } = useAuth()
  const { addReview, updateReview } = useReviews()
  const { showToast } = useToast()
  const location = useLocation()

  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [text, setText] = useState(existing?.text ?? '')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [outcome, setOutcome] = useState({ flagged: false, verified: false })
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')

  if (!isAuthenticated) {
    return (
      <div className="border border-dashed border-forest/20 bg-cream-soft p-6 text-center">
        <p className="text-forest-deep mb-1 font-display text-lg">Share your experience</p>
        <p className="text-sm text-forest-deep/60 mb-4">Log in to write a review.</p>
        <Link
          to="/login"
          state={{ from: location }}
          className="inline-flex px-6 py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
        >
          Log in to review
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div role="status" className="border border-olive/40 bg-olive/10 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-sage" size={32} aria-hidden="true" />
        <p className="font-display text-xl text-forest-deep">Thank you for sharing your experience.</p>
        <p className="text-sm text-forest-deep/60 mt-1">{outcome.flagged ? 'Your review is awaiting moderation before it appears.' : outcome.verified ? 'Your review is live and marked as a verified purchase.' : 'Your review is live. It is not marked verified because there is no completed order for this product.'}</p>
        <button type="button" onClick={() => onDone?.()} className="mt-5 text-sm text-forest-deep hover:text-olive underline-offset-4 hover:underline">
          Done
        </button>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!rating) e.rating = 'Please choose a star rating.'
    if (title.trim().length < 3) e.title = 'Add a short title (at least 3 characters).'
    if (text.trim().length < 10) e.text = 'Tell us a little more (at least 10 characters).'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    setServerError('')
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      if (existing) {
        const r = await updateReview(existing.id, { rating, title: title.trim(), text: text.trim() })
        showToast(r.flagged ? 'Review updated and held for moderation' : 'Review updated')
        onDone?.()
        return
      }
      const r = await addReview({ productId, rating, title: title.trim(), text: text.trim() })
      setOutcome({ flagged: r.flagged, verified: r.verified })
      showToast(r.flagged ? 'Review submitted for moderation' : 'Review submitted')
      setSubmitted(true)
    } catch (err) {
      setServerError(err.message || 'Could not save your review.')
    } finally { setBusy(false) }
  }

  const border = (k) => (errors[k] ? 'border-red-600/60 focus:border-red-600 focus:ring-red-600/30' : 'border-forest/15 focus:border-olive focus:ring-olive/40')

  return (
    <form onSubmit={handleSubmit} noValidate className="border border-forest/10 bg-cream-soft p-6 md:p-8 flex flex-col gap-5">
      <h3 className="font-display text-xl text-forest-deep">{existing ? 'Edit your review' : 'Write a review'}</h3>

      <div>
        <p id="rating-label" className="text-sm text-forest-deep mb-2">
          Your rating
        </p>
        <StarRatingInput value={rating} onChange={setRating} labelledBy="rating-label" invalid={Boolean(errors.rating)} />
        {errors.rating && (
          <p role="alert" className="mt-1.5 text-xs text-red-700">
            {errors.rating}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm text-forest-deep mb-2">
          Review title
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Sum it up in a few words"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'review-title-err' : undefined}
          className={`${field} ${border('title')}`}
        />
        {errors.title && (
          <p id="review-title-err" role="alert" className="mt-1.5 text-xs text-red-700">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="review-text" className="block text-sm text-forest-deep mb-2">
          Your review
        </label>
        <textarea
          id="review-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={800}
          placeholder="How was the freshness, quality and pickup?"
          aria-invalid={Boolean(errors.text)}
          aria-describedby={errors.text ? 'review-text-err' : undefined}
          className={`${field} ${border('text')} resize-none`}
        />
        <div className="mt-1.5 flex justify-between text-xs">
          {errors.text ? (
            <p id="review-text-err" role="alert" className="text-red-700">
              {errors.text}
            </p>
          ) : (
            <span />
          )}
          <span className="text-forest-deep/40">{text.length}/800</span>
        </div>
      </div>

      {/* Photo upload placeholder (optional) — wired up with the backend in Step 11. */}
      <button
        type="button"
        disabled
        className="flex items-center justify-center gap-2 border border-dashed border-forest/20 py-4 text-sm text-forest-deep/45 cursor-not-allowed"
      >
        <Camera size={16} aria-hidden="true" /> Add a photo (coming soon)
      </button>

      {serverError && <p role="alert" className="text-sm text-red-700">{serverError}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="disabled:opacity-60 px-7 py-3 text-sm bg-forest-deep text-cream hover:bg-forest-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream-soft">
          {busy ? 'Saving…' : existing ? 'Save Changes' : 'Submit Review'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-3 text-sm text-forest-deep/60 hover:text-forest-deep">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
