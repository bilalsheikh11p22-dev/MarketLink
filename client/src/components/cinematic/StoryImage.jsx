import { AnimatePresence, motion } from 'framer-motion'
import SceneArt from './SceneArt.jsx'

export default function StoryImage({
  src,
  icon,
  tone = 0,
  alt,
  floatingProduct,
}) {
  return (
    <div className="relative aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-2xl border border-cream/15 bg-forest-deep">
      <AnimatePresence mode="sync">
        <motion.div
          key={src || alt}
          initial={{ opacity: 0, scale: 1.06, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.03, y: -20 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              draggable="false"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <SceneArt icon={icon} tone={tone} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/45 via-transparent to-transparent pointer-events-none" />

      {floatingProduct && (
        <motion.div
          key={floatingProduct.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-56 bg-cream/95 backdrop-blur-sm p-4 shadow-lg"
        >
          <p className="text-[10px] tracking-widest2 uppercase text-olive mb-1">
            Fresh Today
          </p>

          <p className="font-display text-lg text-forest-deep leading-snug">
            {floatingProduct.name}
          </p>

          <p className="text-forest-deep/70 text-sm mt-0.5">
            Rs. {floatingProduct.price} / {floatingProduct.unit}
          </p>

          <div className="flex items-center gap-1.5 mt-2 text-xs text-sage">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            Available
          </div>

          <p className="text-[11px] text-forest-deep/50 mt-2">
            From: {floatingProduct.farmer.name}
          </p>
        </motion.div>
      )}
    </div>
  )
}