import { motion } from 'framer-motion'

/**
 * Text content block for a single cinematic scene.
 * Pure presentation — animation timing is driven by the parent ScrollScene.
 */
export default function SceneContent({ eyebrow, title, description, cta, align = 'left', progress }) {
  const alignment = align === 'right' ? 'items-end text-right ml-auto' : 'items-start text-left'

  return (
    <motion.div
      style={{
        opacity: progress,
        y: progress ? undefined : 0
      }}
      className={`flex flex-col ${alignment} max-w-xl gap-5`}
    >
      <span className="text-olive-light text-xs md:text-sm tracking-widest2 uppercase font-body">
        {eyebrow}
      </span>

      <h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-cream">
        {title}
      </h2>

      <p className="font-body text-base md:text-lg text-cream/80 leading-relaxed max-w-md">
        {description}
      </p>

      {cta && (
        <a
          href="#markets"
          className="mt-2 inline-flex w-fit items-center gap-3 border-b border-olive-light/70 pb-1 text-cream text-sm tracking-wide hover:gap-4 hover:border-cream transition-all duration-300"
        >
          {cta}
        </a>
      )}
    </motion.div>
  )
}
