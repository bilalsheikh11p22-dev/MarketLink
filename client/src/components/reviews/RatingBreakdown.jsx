import { motion } from 'framer-motion'
import { RatingStars } from './RatingStars.jsx'

/** Big average + 5→1 star distribution bars. */
export default function RatingBreakdown({ summary }) {
  const { average, count, percentages, distribution } = summary
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 sm:gap-12 items-center">
      <div className="text-center sm:text-left">
        <p className="font-display text-6xl text-forest-deep leading-none">{count ? average.toFixed(1) : '–'}</p>
        <div className="mt-3 flex justify-center sm:justify-start">
          <RatingStars value={average} size={20} />
        </div>
        <p className="mt-2 text-sm text-forest-deep/60">
          {count} {count === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      <ul className="flex flex-col gap-2.5" aria-label="Rating breakdown">
        {[5, 4, 3, 2, 1].map((star) => (
          <li key={star} className="flex items-center gap-3 text-sm">
            <span className="w-14 shrink-0 text-forest-deep/70">
              {star} {star === 1 ? 'star' : 'stars'}
            </span>
            <div className="h-2 flex-1 bg-forest/10 overflow-hidden" role="presentation">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percentages[star]}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full bg-olive"
              />
            </div>
            <span className="w-10 shrink-0 text-right text-forest-deep/60" title={`${distribution[star]} reviews`}>
              {percentages[star]}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
