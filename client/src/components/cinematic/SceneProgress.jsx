import { motion } from 'framer-motion'

/**
 * Scene progress indicator for the cinematic product story.
 * Desktop: vertical dots + labels on the right, with a scene counter
 * top-right. Mobile: a horizontal dash indicator along the bottom.
 */
export default function SceneProgress({ scenes, activeIndex }) {
  const total = scenes.length

  return (
    <>
      <div className="hidden md:flex flex-col items-end gap-5 absolute right-8 top-1/2 -translate-y-1/2 z-10">
        {scenes.map((scene, i) => (
          <div key={scene.id} className="flex items-center gap-3">
            <span
              className={`text-xs tracking-wide font-body transition-colors duration-300 ${
                i === activeIndex ? 'text-cream' : 'text-cream/40'
              }`}
            >
              {scene.progressLabel}
            </span>
            <span
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex ? 'h-2.5 w-2.5 bg-olive-light' : 'h-1.5 w-1.5 bg-cream/40'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="hidden md:block absolute top-8 right-8 z-10 text-cream/60 text-xs font-body tabular-nums">
        <motion.span
          key={activeIndex}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-cream text-sm"
        >
          {String(activeIndex + 1).padStart(2, '0')}
        </motion.span>{' '}
        / {String(total).padStart(2, '0')}
      </div>

      <div className="md:hidden absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 z-10">
        {scenes.map((scene, i) => (
          <span
            key={scene.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-6 bg-olive-light' : 'w-1.5 bg-cream/40'
            }`}
          />
        ))}
        <span className="ml-2 text-cream/70 text-xs tabular-nums">
          {String(activeIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
      </div>
    </>
  )
}
