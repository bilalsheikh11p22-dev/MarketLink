import { useCallback, useEffect, useState } from 'react'

/** Small data hook: { data, loading, error, reload }. Cancels stale responses. */
export default function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: '' }))
    Promise.resolve()
      .then(fn)
      .then((res) => { if (!cancelled) setState({ data: res?.data ?? res, loading: false, error: '' }) })
      .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: err.message || 'Something went wrong' }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}
