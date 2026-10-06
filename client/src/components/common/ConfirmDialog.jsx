import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Button from './Button.jsx'

export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel
}) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    ref.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="absolute inset-0 bg-forest-deep/50" onClick={onCancel} aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl border border-forest/10 bg-cream-soft p-6 shadow-xl">
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 rounded-lg p-1 text-forest/50 hover:bg-forest/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive" aria-label="Close">
          <X size={18} />
        </button>
        <h2 id="confirm-dialog-title" className="font-display text-xl text-forest-deep pr-8">{title}</h2>
        {message && <p className="mt-2 text-sm text-forest/70 leading-relaxed">{message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button ref={ref} variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
