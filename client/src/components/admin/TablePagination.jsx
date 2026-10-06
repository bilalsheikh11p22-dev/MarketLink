import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TablePagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pages = []
  const window = 2
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) pages.push(i)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-3">
      <p className="text-xs text-forest/50">
        Showing <span className="font-medium text-forest/70">{start}–{end}</span> of{' '}
        <span className="font-medium text-forest/70">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg p-2 text-forest/60 hover:bg-forest/5 disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-forest/40">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] rounded-lg px-2 py-1.5 text-xs font-medium ${p === page ? 'bg-forest text-cream' : 'text-forest/70 hover:bg-forest/5'}`}
            >
              {p}
            </button>
          )
        )}
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-lg p-2 text-forest/60 hover:bg-forest/5 disabled:opacity-40" aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
