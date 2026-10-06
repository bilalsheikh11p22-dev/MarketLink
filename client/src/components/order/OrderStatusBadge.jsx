import { STATUS_LABEL, STATUS_STYLE } from '../../utils/orderStatus.js'
export default function OrderStatusBadge({ status }) {
  return <span className={`inline-flex items-center px-3 py-1 text-[11px] tracking-wide uppercase border ${STATUS_STYLE[status] ?? STATUS_STYLE.pending}`}>{STATUS_LABEL[status] ?? status}</span>
}
