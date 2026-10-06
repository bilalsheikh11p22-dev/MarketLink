import { useState } from 'react'
import { MessageSquareReply, Pencil, Trash2 } from 'lucide-react'
import { useReviews } from '../../context/ReviewsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { formatDate } from '../../utils/time.js'

/**
 * Farmer reply block. Everyone sees the reply (or "hasn't replied yet");
 * `canManage` (mock role === 'farmer' AND it's their own product) unlocks
 * reply / edit / delete. Replies persist in marketlink_farmer_replies.
 */
export default function FarmerReply({ reviewId, farmName, canManage = false }) {
  const { getReply, saveReply, deleteReply } = useReviews()
  const { showToast } = useToast()
  const reply = getReply(reviewId)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const startEdit = () => {
    setDraft(reply?.text ?? '')
    setError('')
    setEditing(true)
    setConfirmDelete(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (draft.trim().length < 3) {
      setError('Write at least a few words before posting.')
      return
    }
    try {
      await saveReply(reviewId, draft.trim())
      showToast(reply ? 'Reply updated' : 'Reply posted')
      setEditing(false)
    } catch (err) { setError(err.message || 'Could not save the reply.') }
  }

  const btn = 'inline-flex items-center gap-1.5 text-xs text-forest-deep/70 hover:text-olive transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive px-1 py-0.5'

  return (
    <div className="mt-4">
      {editing ? (
        <form onSubmit={submit} className="flex flex-col gap-2 border-l-2 border-olive pl-4">
          <label htmlFor={`reply-${reviewId}`} className="text-xs text-olive uppercase tracking-wide">
            {reply ? 'Edit your reply' : 'Reply to this review'}
          </label>
          <textarea
            id={`reply-${reviewId}`}
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `reply-err-${reviewId}` : undefined}
            className="bg-white border border-forest/15 px-3 py-2 text-sm text-forest-deep focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/40 resize-none"
            placeholder="Thank you for supporting our farm!"
          />
          {error && (
            <p id={`reply-err-${reviewId}`} role="alert" className="text-xs text-red-700">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-forest-deep text-cream text-xs hover:bg-forest-light transition-colors">
              {reply ? 'Save Reply' : 'Post Reply'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-xs text-forest-deep/60 hover:text-forest-deep">
              Cancel
            </button>
          </div>
        </form>
      ) : reply ? (
        <div className="border-l-2 border-olive pl-4">
          <p className="text-xs text-olive uppercase tracking-wide mb-1">
            Reply from {farmName ?? 'the farmer'} · {formatDate(reply.date)}
            {reply.edited && ' · edited'}
          </p>
          <p className="text-forest-deep/80 text-sm leading-relaxed">{reply.text}</p>
          {canManage && (
            <div className="mt-2 flex items-center gap-3">
              <button type="button" onClick={startEdit} className={btn} aria-label="Edit reply">
                <Pencil size={13} /> Edit
              </button>
              {confirmDelete ? (
                <span className="inline-flex items-center gap-2 text-xs text-forest-deep/70">
                  Delete this reply?
                  <button
                    type="button"
                    onClick={() => {
                      Promise.resolve(deleteReply(reviewId)).catch((err) => showToast(err.message || 'Could not delete the reply'))
                      setConfirmDelete(false)
                      showToast('Reply deleted')
                    }}
                    className="text-red-700 hover:underline"
                  >
                    Yes, delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="hover:underline">
                    Keep
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className={btn} aria-label="Delete reply">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-xs text-forest-deep/45 italic">Farmer hasn&apos;t replied yet.</p>
          {canManage && (
            <button type="button" onClick={startEdit} className={btn}>
              <MessageSquareReply size={13} /> Reply
            </button>
          )}
        </div>
      )}
    </div>
  )
}
