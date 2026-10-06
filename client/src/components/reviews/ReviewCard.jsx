import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BadgeCheck } from 'lucide-react'
import Avatar from '../common/Avatar.jsx'
import { RatingStars } from './RatingStars.jsx'
import FarmerReply from './FarmerReply.jsx'
import { formatDate } from '../../utils/time.js'

/**
 * One review. Optional pieces: product link (farmer page / reviews page),
 * the farmer reply thread, and an `actions` slot (edit/delete on /reviews).
 */
export default function ReviewCard({ review, product, farmName, showReply = true, canReply = false, actions }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border border-forest/10 bg-cream-soft p-6"
    >
      <div className="flex items-start gap-4">
        <Avatar src={review.customerAvatar} name={review.customerName} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-medium text-forest-deep">{review.customerName}</p>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs text-sage">
                <BadgeCheck size={14} aria-hidden="true" /> Verified purchase
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-deep/50">
            <RatingStars value={review.rating} size={14} />
            <time dateTime={review.date}>{formatDate(review.date)}</time>
            {review.edited && <span>· edited</span>}
          </div>
        </div>
      </div>

      {product && (
        <p className="mt-4 text-xs text-forest-deep/55">
          Reviewed{' '}
          <Link to={`/products/${product.id}`} className="text-forest-deep hover:text-olive underline-offset-4 hover:underline">
            {product.name}
          </Link>
          {product.farmer?.name && <span> · {product.farmer.name}</span>}
        </p>
      )}

      {review.title && <h3 className="mt-4 font-display text-lg text-forest-deep">{review.title}</h3>}
      <p className={`${review.title ? 'mt-1' : 'mt-4'} text-forest-deep/80 leading-relaxed`}>{review.text}</p>

      {showReply && <FarmerReply reviewId={review.id} farmName={farmName ?? product?.farmer?.name} canManage={canReply} />}

      {actions && <div className="mt-4 pt-4 border-t border-forest/10 flex flex-wrap items-center gap-4">{actions}</div>}
    </motion.article>
  )
}
