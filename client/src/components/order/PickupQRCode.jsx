import { useEffect, useState } from 'react'
import { getPickupCode } from '../../services/orderService.js'

/** Fetches the order's secret pickup payload (customer only) and renders it as a QR code. */
export default function PickupQRCode({ orderId, orderNumber }) {
  const [state, setState] = useState({ loading: true, img: '', code: '', error: '' })
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getPickupCode(orderId)
        const { default: QR } = await import('qrcode')
        const img = await QR.toDataURL(res.data.payload, { margin: 1, width: 220, color: { dark: '#122A20', light: '#FFFFFF' } })
        if (!cancelled) setState({ loading: false, img, code: res.data.payload, error: '' })
      } catch (e) { if (!cancelled) setState({ loading: false, img: '', code: '', error: e.message || 'Could not load the pickup code.' }) }
    })()
    return () => { cancelled = true }
  }, [orderId])
  if (state.loading) return <p className="text-sm text-forest-deep/55" role="status">Preparing your pickup code…</p>
  if (state.error) return <p className="text-sm text-red-700" role="alert">{state.error}</p>
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <img src={state.img} alt={`Pickup QR code for order ${orderNumber || ''}`} width="220" height="220" className="border border-forest/10 bg-white p-2" />
      <p className="text-xs text-forest-deep/55">Show this code to the farmer at pickup. Keep it private.</p>
      <details className="text-xs text-forest-deep/50"><summary className="cursor-pointer">Can&apos;t scan? Show the code text</summary><code className="mt-1 block break-all">{state.code}</code></details>
    </div>
  )
}
