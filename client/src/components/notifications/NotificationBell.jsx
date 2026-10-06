import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'

const DESKTOP = '(min-width: 768px)'

/**
 * Navbar bell. Desktop: opens a preview dropdown. Mobile: goes straight to
 * /notifications. The bell wiggles once when a NEW unread notification
 * arrives (not on every render) and the badge is announced to screen readers.
 */
export default function NotificationBell() {
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [wiggle, setWiggle] = useState(0)
  const rootRef = useRef(null)
  const prevCount = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevCount.current) setWiggle((w) => w + 1)
    prevCount.current = unreadCount
  }, [unreadCount])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleClick = () => {
    if (window.matchMedia(DESKTOP).matches) setOpen((o) => !o)
    else navigate('/notifications')
  }

  return (
    <div ref={rootRef} className="relative">
      <button
  type="button"
  onClick={handleClick}
  aria-label={
    unreadCount
      ? `Notifications, ${unreadCount} unread`
      : 'Notifications'
  }
  aria-haspopup="dialog"
  aria-expanded={open}
  className="
    relative
    flex h-10 w-10
    items-center justify-center
    text-olive-light
    hover:text-[#E6C978]
    transition-all duration-300
    hover:drop-shadow-[0_0_10px_rgba(230,201,120,0.45)]
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-olive-light
  "
>
  <motion.span
    key={wiggle}
    animate={
      wiggle
        ? { rotate: [0, -14, 12, -8, 0] }
        : {}
    }
    transition={{ duration: 0.6 }}
    className="inline-flex"
  >
    <Bell
      size={20}
      strokeWidth={1.6}
      aria-hidden="true"
    />
  </motion.span>

  {unreadCount > 0 && (
    <span
      aria-hidden="true"
      className="
        absolute
        top-1
        right-0.5
        min-w-[18px]
        h-[18px]
        px-1
        rounded-full
        bg-[#D6B85C]
        text-[#173326]
        text-[10px]
        font-semibold
        flex
        items-center
        justify-center
        shadow-[0_0_10px_rgba(214,184,92,0.35)]
      "
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  )
}
