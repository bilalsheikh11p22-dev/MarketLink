import { useEffect, useState } from 'react'

/**
 * Shows a skeleton for a very short moment (default 280 ms) whenever
 * `key` changes — long enough to feel like a page/section transition,
 * never an artificial wait. Timers are always cleaned up.
 */
export default function useBriefLoading(key, ms = 280) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [key, ms])

  return loading
}
