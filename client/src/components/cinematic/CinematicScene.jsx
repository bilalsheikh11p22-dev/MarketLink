import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StoryImage from './StoryImage.jsx'
import { sceneIcons, GRAIN_URL } from './SceneArt.jsx'
import SceneProgress from './SceneProgress.jsx'
import CTAButton from '../CTAButton.jsx'

gsap.registerPlugin(ScrollTrigger)

/**
 * Cinematic product story.
 *
 * IMPORTANT:
 * The cinematic animation only begins when the TOP of this section
 * reaches the TOP of the viewport.
 *
 * Before that point:
 * - activeIndex stays at 0
 * - no scene progression happens
 *
 * During the section:
 * - 01/05
 * - 02/05
 * - 03/05
 * - 04/05
 * - 05/05
 *
 * After the section:
 * - cinematic section ends normally
 */
export default function CinematicScene({ scenes, onExploreProducts }) {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !scenes?.length) return

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,

        // DO NOT start before the cinematic section reaches the viewport top.
        start: 'top top',

        // The entire cinematic section is the scroll range.
        end: 'bottom bottom',

        scrub: true,

        onUpdate: (self) => {
          const progress = gsap.utils.clamp(0, 1, self.progress)

          // Divide the cinematic scroll area into equal scene sections.
          const index = Math.min(
            scenes.length - 1,
            Math.floor(progress * scenes.length)
          )

          setActiveIndex(index)
        },

        onLeave: () => {
          // Keep the final scene visible while leaving the section.
          setActiveIndex(scenes.length - 1)
        },

        onEnterBack: () => {
          // Re-entering from below should restore the correct scene.
          ScrollTrigger.refresh()
        },
      })

      return () => trigger.kill()
    }, containerRef)

    return () => ctx.revert()
  }, [scenes])

  const active = scenes?.[activeIndex]

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        height: `${scenes.length * 100}vh`,
      }}
    >
      {/* 
        Sticky cinematic viewport.
        It only becomes sticky when this section reaches the top.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-forest-deep">
        {/* Background video */}
        {!videoFailed ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
          >
            <source
              src="/videos/marketlink-products.mp4"
              type="video/mp4"
            />
          </video>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, #7FA98D 0%, #4C7A62 45%, #2F4B3B 100%)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
              style={{
                backgroundImage: GRAIN_URL,
              }}
            />
          </div>
        )}

        {/* Cinematic readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/55 via-forest-deep/30 to-forest-deep/60" />

        {/* Content */}
        <div className="relative h-full container-page flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-8 md:gap-14 items-center w-full">
            {/* Text */}
            <div className="order-2 md:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: 'easeOut',
                  }}
                  className="max-w-lg"
                >
                  <span className="block text-olive-light text-xs md:text-sm tracking-widest2 uppercase font-body mb-4">
                    {active.eyebrow}
                  </span>

                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.08]">
                    {active.title}
                  </h2>

                  <p className="mt-5 text-cream/80 text-base md:text-lg leading-relaxed">
                    {active.description}
                  </p>

                  {active.cta && (
                    <CTAButton
                      variant="outline"
                      className="mt-7"
                      onClick={onExploreProducts}
                    >
                      {active.cta}
                    </CTAButton>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Image */}
            <div className="order-1 md:order-2">
             <StoryImage
  src={active.image}
  icon={sceneIcons[active.icon]}
  tone={activeIndex}
  alt={active.title}
  floatingProduct={active.floatingProduct}
/>
            </div>
          </div>
        </div>

        {/* 01/05 → 05/05 */}
        <SceneProgress
          scenes={scenes}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  )
}