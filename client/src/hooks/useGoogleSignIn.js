import { useEffect, useRef, useState } from 'react'

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptPromise = null

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
  return scriptPromise
}

/**
 * Renders Google's own "Sign in with Google" button into `buttonRef` and
 * calls `onCredential(idToken)` when the user completes the flow.
 * No-ops (and reports `available: false`) when VITE_GOOGLE_CLIENT_ID isn't set,
 * so the rest of the page can show a helpful fallback instead of a dead button.
 */
export function useGoogleSignIn(onCredential) {
  const buttonRef = useRef(null)
  const [available, setAvailable] = useState(false)
  const [error, setError] = useState('')
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const configured = Boolean(clientId && !clientId.includes('your_google_oauth_client_id'))

  useEffect(() => {
    if (!configured) return
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        // Wait one frame so buttonRef's container has real layout (it's
        // rendered unconditionally now, so this is just for width) before
        // asking Google to measure/render into it.
        requestAnimationFrame(() => {
          if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => onCredential(response.credential)
          })
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: buttonRef.current.offsetWidth || 320,
            text: 'continue_with'
          })
          setAvailable(true)
        })
      })
      .catch(() => { if (!cancelled) setError('Could not load Google Sign-In.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, configured])

  return { buttonRef, available: configured, error }
}

export default useGoogleSignIn
