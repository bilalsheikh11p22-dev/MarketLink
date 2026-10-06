import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ShoppingBag } from 'lucide-react'

import { useAdmin } from '../../context/AdminContext.jsx'
import SearchFilterBar from '../../components/admin/SearchFilterBar.jsx'
import TablePagination from '../../components/admin/TablePagination.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'

const PAGE_SIZE = 10

export default function Orders() {
  const { orders = [] } = useAdmin()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
  })
  const [page, setPage] = useState(1)

  // ----------------------------------------
  // Safe currency formatter
  // ----------------------------------------
  const formatCurrency = (value) => {
    const amount = Number(value ?? 0)

    if (Number.isNaN(amount)) {
      return '0'
    }

    return amount.toLocaleString()
  }

  // ----------------------------------------
  // Filter orders
  // ----------------------------------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return orders.filter((o) => {
      if (!o) return false

      // Status filter
      if (
        filters.status !== 'all' &&
        o.status !== filters.status
      ) {
        return false
      }

      // Search
      if (!q) {
        return true
      }

      const orderId = String(o.id ?? '').toLowerCase()
      const customerName = String(
        o.customerName ?? ''
      ).toLowerCase()
      const farmerName = String(
        o.farmerName ?? ''
      ).toLowerCase()

      return (
        orderId.includes(q) ||
        customerName.includes(q) ||
        farmerName.includes(q)
      )
    })
  }, [orders, search, filters])

  // ----------------------------------------
  // Pagination
  // ----------------------------------------
  const pageData = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl text-forest-deep">
          Orders
        </h1>

        <p className="mt-1 text-sm text-forest/55">
          Manage and review marketplace orders.
        </p>
      </div>

      {/* Search + Filters */}
      <SearchFilterBar
        search={search}
        onSearch={(value) => {
          setSearch(value)
          setPage(1)
        }}
        placeholder="Search orders…"
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              'pending',
              'accepted',
              'preparing',
              'ready',
              'completed',
              'cancelled',
            ].map((status) => ({
              value: status,
              label: status,
            })),
          },
        ]}
        activeFilters={filters}
        onFilterChange={(key, value) => {
          setFilters((current) => ({
            ...current,
            [key]: value,
          }))

          setPage(1)
        }}
        onClear={() => {
          setFilters({
            status: 'all',
          })

          setSearch('')
          setPage(1)
        }}
      />

      {/* Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
        />
      ) : (
        <div className="rounded-2xl border border-forest/8 bg-cream-soft overflow-hidden">

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">

              {/* Header */}
              <thead className="bg-forest/5 text-xs uppercase text-forest/60">
                <tr>
                  <th className="px-4 py-3">
                    Order
                  </th>

                  <th className="px-4 py-3">
                    Customer
                  </th>

                  <th className="px-4 py-3 hidden md:table-cell">
                    Farmer
                  </th>

                  <th className="px-4 py-3">
                    Amount
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-forest/6">

                {pageData.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-forest/[0.03]"
                  >

                    {/* Order ID */}
                    <td className="px-4 py-3 font-medium">
                      {o.id ?? 'N/A'}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      {o.customerName ?? 'Unknown Customer'}
                    </td>

                    {/* Farmer */}
                    <td className="px-4 py-3 text-forest/70 hidden md:table-cell">
                      {o.farmerName ?? 'Unknown Farmer'}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 tabular-nums">
                      Rs. {formatCurrency(o.amount)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={o.status ?? 'pending'}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="rounded-lg p-2 text-forest/50 hover:bg-forest/5 inline-flex"
                        aria-label={`View order ${o.id}`}
                      >
                        <Eye size={16} />
                      </Link>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 border-t border-forest/6">
            <TablePagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>

        </div>
      )}
    </div>
  )
}