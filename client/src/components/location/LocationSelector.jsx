import { useEffect, useRef, useState } from 'react'
import { LOCATION_OPTIONS } from '../../data/markets.js'
import { PinIcon, ChevronIcon } from '../market/MarketIcons.jsx'

/**
 * Mock location dropdown (no browser geolocation). "Karachi" means the
 * whole city; any other option filters markets by market.location.
 * Later this can be fed by real geolocation without changing callers —
 * they only receive the selected string through onChange.
 */
export default function LocationSelector({ value = 'Karachi', onChange, options = LOCATION_OPTIONS, helperText = 'Showing markets near you' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (open) listRef.current?.querySelector('[aria-selected="true"]')?.focus()
  }, [open])

  const select = (opt) => {
    onChange?.(opt)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onListKey = (e) => {
    const items = [...listRef.current.querySelectorAll('[role="option"]')]
    const i = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(i + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      buttonRef.current?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Location: ${value}. ${helperText}. Change location`}
        className="flex w-full items-center gap-2.5 border border-forest/15 bg-white/80 px-4 py-2.5 text-left hover:border-olive/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-olive"
      >
        <PinIcon size={16} className="text-olive shrink-0" />
        <span className="flex flex-col leading-tight min-w-0">
          <span className="text-sm font-medium text-forest-deep">{value}</span>
          <span className="text-xs text-forest-deep/55">{helperText}</span>
        </span>
        <ChevronIcon className={`ml-auto text-forest-deep/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-label="Choose a location"
          onKeyDown={onListKey}
          className="absolute left-0 top-full z-30 mt-1 w-full min-w-[14rem] border border-forest/15 bg-cream shadow-[0_18px_40px_-20px_rgba(11,29,21,0.45)]"
        >
          {options.map((opt) => {
            const selected = opt === value
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => select(opt)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-sm text-left transition-colors focus:outline-none focus:bg-olive/15 hover:bg-olive/10 ${
                  selected ? 'text-forest-deep font-medium' : 'text-forest-deep/75'
                }`}
              >
                {opt}
                {selected && <span className="text-olive" aria-hidden="true">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
