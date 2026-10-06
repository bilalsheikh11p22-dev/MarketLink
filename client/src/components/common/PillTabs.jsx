import { useRef } from 'react'

/**
 * Accessible tab strip (role=tablist) with horizontal scroll on mobile and
 * ←/→ keyboard support. `tabs`: [{ id, label, count? }].
 */
export default function PillTabs({ tabs, value, onChange, label, idPrefix = 'tab' }) {
  const listRef = useRef(null)

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const i = tabs.findIndex((t) => t.id === value)
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
    onChange(next.id)
    listRef.current?.querySelector(`#${idPrefix}-${next.id}`)?.focus()
  }

  return (
    <div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 border-b border-forest/10">
      {tabs.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            id={`${idPrefix}-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={`relative shrink-0 flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:bg-olive/10 ${
              active ? 'text-forest-deep font-medium' : 'text-forest-deep/60 hover:text-forest-deep'
            }`}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className={`text-[11px] min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full ${active ? 'bg-olive/25 text-forest-deep' : 'bg-forest/10 text-forest-deep/60'}`}>
                {t.count}
              </span>
            )}
            <span aria-hidden="true" className={`absolute inset-x-3 -bottom-px h-0.5 ${active ? 'bg-olive' : 'bg-transparent'}`} />
          </button>
        )
      })}
    </div>
  )
}
