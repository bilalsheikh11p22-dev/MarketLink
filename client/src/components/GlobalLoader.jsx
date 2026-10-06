import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const MINIMUM_LOADING_TIME = 900

export default function GlobalLoader() {
  const shouldReduceMotion = useReducedMotion()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let progressFrame
    let finishTimer

    const startTime = performance.now()

    const animateProgress = (time) => {
      const elapsed = time - startTime

      const percentage = Math.min(
        94,
        Math.round((elapsed / MINIMUM_LOADING_TIME) * 94)
      )

      setProgress(percentage)

      if (percentage < 94) {
        progressFrame = requestAnimationFrame(animateProgress)
      }
    }

    progressFrame = requestAnimationFrame(animateProgress)

    finishTimer = window.setTimeout(() => {
      setProgress(100)

      window.setTimeout(() => {
        setLoading(false)
      }, shouldReduceMotion ? 0 : 350)
    }, MINIMUM_LOADING_TIME)

    return () => {
      cancelAnimationFrame(progressFrame)
      window.clearTimeout(finishTimer)
    }
  }, [shouldReduceMotion])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: shouldReduceMotion ? 0 : 0.55,
              ease: 'easeInOut',
            },
          }}
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            overflow-hidden
            bg-cream-soft
            text-forest
          "
          aria-label="Loading MarketLink"
          role="status"
          aria-live="polite"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="
                absolute
                -top-32
                -right-32
                h-80
                w-80
                rounded-full
                bg-leaf-light/30
                blur-3xl
              "
            />

            <div
              className="
                absolute
                -bottom-40
                -left-32
                h-96
                w-96
                rounded-full
                bg-olive-light/20
                blur-3xl
              "
            />

            <div className="absolute inset-0 marketlink-loader-grain" />
          </div>

          {/* Main loader */}
          <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">

            {/* Logo mark */}
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center">

              {/* Outer ring */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        rotate: 360,
                      }
                }
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="
                  absolute
                  inset-0
                  rounded-full
                  border
                  border-forest/10
                  border-t-olive
                  border-r-sage
                "
              />

              {/* MarketLink Basket Icon */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: [1, 1.06, 1],
                      }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="
                  relative
                  h-16
                  w-16
                  overflow-hidden
                  rounded-full
                  bg-forest
                  shadow-[0_12px_40px_rgba(35,70,51,0.18)]
                "
              >
                <img
                  src="/images/loader/marketlink-loader-icon.png"
                  alt=""
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                  draggable="false"
                />
              </motion.div>

              {/* Small orbit dot */}
              {!shouldReduceMotion && (
                <motion.span
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="
                    absolute
                    inset-[-5px]
                    rounded-full
                  "
                >
                  <span
                    className="
                      absolute
                      left-1/2
                      top-0
                      h-2
                      w-2
                      -translate-x-1/2
                      rounded-full
                      bg-olive
                    "
                  />
                </motion.span>
              )}
            </div>

            {/* Brand */}
            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 12,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
                delay: shouldReduceMotion ? 0 : 0.1,
              }}
              className="text-center"
            >
              <h1
                className="
                  font-display
                  text-4xl
                  sm:text-5xl
                  font-medium
                  tracking-[-0.035em]
                  text-forest-deep
                "
              >
                MarketLink
              </h1>

              <p
                className="
                  mt-2
                  text-[10px]
                  sm:text-xs
                  uppercase
                  tracking-[0.28em]
                  text-forest/55
                  font-body
                "
              >
                Local • Fresh • Connected
              </p>
            </motion.div>

            {/* Progress */}
            <div className="mt-10 w-full max-w-xs">

              <div className="mb-3 flex items-center justify-between">
                <span
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    text-forest/45
                  "
                >
                  Preparing
                </span>

                <span
                  className="
                    font-body
                    text-xs
                    tabular-nums
                    text-forest/60
                  "
                >
                  {progress}%
                </span>
              </div>

              <div
                className="
                  h-[2px]
                  w-full
                  overflow-hidden
                  rounded-full
                  bg-forest/10
                "
              >
                <motion.div
                  className="h-full rounded-full bg-olive"
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.15,
                    ease: 'linear',
                  }}
                />
              </div>
            </div>

            {/* Bottom message */}
            <motion.p
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      opacity: [0.45, 0.8, 0.45],
                    }
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="
                mt-6
                text-center
                text-xs
                text-forest/45
                font-body
              "
            >
              Bringing local markets closer to you
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}