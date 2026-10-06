import { useState } from 'react'
import { useFarmer } from '../../context/FarmerContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function ReviewCard({ review }) {
  const { replyToReview } = useFarmer()
  const { showToast } = useToast()
  const [replying, setReplying] = useState(false)
  const [draft, setDraft] = useState('')

  const dateLabel = new Date(`${review.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const handlePostReply = () => {
    if (!draft.trim()) return
    replyToReview(review.id, draft.trim())
    showToast('Reply posted')
    setReplying(false)
  }

  return (
    <div className="border border-forest/10 bg-cream-soft p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-olive" aria-label={`Rated ${review.rating} out of 5`}>
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
        </span>
        <span className="text-forest-deep/45 text-xs">{dateLabel}</span>
      </div>

      <p className="text-forest-deep leading-relaxed mb-3">&ldquo;{review.text}&rdquo;</p>

      <div className="flex items-center gap-3 text-xs text-forest-deep/55 mb-4">
        <span>{review.product}</span>
        <span>·</span>
        <span>{review.customer}</span>
      </div>

      {review.reply ? (
        <div className="border-l-2 border-olive pl-4 mt-3">
          <p className="text-xs text-olive uppercase tracking-wide mb-1">Your Reply</p>
          <p className="text-forest-deep/75 text-sm">{review.reply}</p>
        </div>
      ) : replying ? (
        <div className="flex flex-col gap-2 mt-3">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Thank you for supporting our farm!"
            className="bg-white border border-forest/15 px-3 py-2 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 resize-none"
          />
          <div className="flex items-center gap-2">
            <button type="button" onClick={handlePostReply} className="px-4 py-2 bg-forest-deep text-cream text-xs hover:bg-forest-light transition-colors">
              Post Reply
            </button>
            <button type="button" onClick={() => setReplying(false)} className="px-4 py-2 text-forest-deep/60 text-xs hover:text-forest-deep transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setReplying(true)} className="text-sm text-forest-deep hover:text-olive transition-colors">
          Reply
        </button>
      )}
    </div>
  )
}
