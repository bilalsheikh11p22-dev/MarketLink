import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SceneContent from './SceneContent.jsx'
import SceneArt, { sceneIcons } from './cinematic/SceneArt.jsx'

/**
 * One full-screen cinematic scene.
 *
 * IMPORTANT:
 * The scene animation does NOT begin while the scene is
 * still approaching the viewport.
 *
 * It begins when the scene reaches the top of the viewport.
 */
export default function ScrollScene({ scene, index }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,

    /*
     * FIX:
     *
     * start start
     * = scene reaches the top of viewport
     *
     * end start
     * = scene bottom reaches the top of viewport
     *
     * This prevents the animation from beginning too early.
     */
    offset: ['start start', 'end start'],
  })

  /*
   * Text fade.
   *
   * Keep the first part of the scene visible
   * instead of making it disappear immediately.
   */
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.78, 1],
    [1, 1, 1, 0]
  )

  /*
   * Text movement.
   */
  const y = useTransform(
    scrollYProgress,
    [0, 0.15, 0.8, 1],
    [0, 0, 0, -40]
  )

  /*
   * Cinematic image scale.
   */
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.03, 1, 1.06]
  )

  /*
   * Subtle image parallax.
   */
  const imageParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    ['2%', '-5%']
  )

  const imageOnRight = scene.align === 'left'

  return (
    <section
      ref={ref}
      id={index === 0 ? 'home' : undefined}
      className="
        relative
        h-screen
        min-h-screen
        w-full
        flex
        items-center
        overflow-hidden
      "
    >
      <div className="container-page w-full">
        <div
          className={`
            grid
            grid-cols-1
            md:grid-cols-2
            gap-10
            md:gap-16
            items-center
            ${
              imageOnRight
                ? ''
                : 'md:[&>*:first-child]:order-2'
            }
          `}
        >
          {/* TEXT */}
          <motion.div
            style={{
              opacity,
              y,
            }}
          >
            <SceneContent
              eyebrow={scene.eyebrow}
              title={scene.title}
              description={scene.description}
              cta={scene.cta}
              align={imageOnRight ? 'left' : 'right'}
            />
          </motion.div>

          {/* IMAGE / ART */}
         <motion.div
  style={{ opacity }}
  className="relative aspect-[4/5] w-full max-w-md mx-auto overflow-hidden"
>
  <motion.div
    style={{ scale: imageScale, y: imageParallaxY }}
    className="absolute inset-0"
  >
    <img
      src={scene.image}
      alt={scene.title}
      className="h-full w-full object-cover"
      draggable="false"
      onError={() => console.error('Image failed:', scene.image)}
    />
  </motion.div>

  <div className="absolute inset-0 border border-cream/15 pointer-events-none" />
</motion.div>
        </div>
      </div>
    </section>
  )
}