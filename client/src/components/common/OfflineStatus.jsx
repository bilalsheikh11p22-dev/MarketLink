import { useEffect, useState } from 'react'

/** Small banner shown while the device is offline. Live data (orders, stock) needs a connection. */
export default function OfflineStatus() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (online) return null
  return <div role="status" className="fixed inset-x-0 bottom-0 z-[100] bg-forest-deep px-4 py-2 text-center text-sm text-cream">You are offline. Orders and stock need a connection, so they will refresh once you are back online.</div>
}
