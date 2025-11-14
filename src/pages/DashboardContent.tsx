import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ComponentType } from 'react'
import { DollarSign, Ticket, Users, MapPin, ChevronRight, Inbox, X } from 'lucide-react'
import { getAdminDashboard } from '../utils/api'
import type { DashboardStats, RecentTransaction } from '../utils/api'

// Chart.js + react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { ChartOptions } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

type StatCardProps = {
  title: string
  value: string | number
  icon: ComponentType<{ size?: number; className?: string }>
  gradient?: string
}

const StatCard = ({ title, value, icon: Icon, gradient = '' }: StatCardProps) => (
  <div className={`${gradient} rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold mb-2 opacity-90">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
      <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
        <Icon size={32} className="text-white" />
      </div>
    </div>
  </div>
)

export default function DashboardContent() {
  // dashboard response derived values
  // stats/loading/error are derived from the react-query response below

  // Date range state: presets (7,30,90) or custom
  const [rangeDays, setRangeDays] = useState<number>(7)
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [selectedTx, setSelectedTx] = useState<RecentTransaction | null>(null)

  // Fetch dashboard once; we'll filter recent transactions client-side by selected range.
  const { data: dashboardResp, isFetching, refetch } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => await getAdminDashboard(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // derive simple locals from the fetched response
  const stats: DashboardStats | null = dashboardResp?.data?.stats ?? null
  const loading = isFetching
  const error: string | null = dashboardResp && !dashboardResp.data?.stats ? 'No dashboard data available' : null
  // Compute filter window (source fetched from dashboard response)
  const filteredTransactions = useMemo(() => {
    const source: RecentTransaction[] = (dashboardResp?.data?.stats?.recent_transactions) || []
    let fromDate: Date | null = null
    let toDate: Date | null = null
    if (customFrom && customTo) {
      fromDate = new Date(customFrom)
      toDate = new Date(customTo)
    } else {
      const now = new Date()
      toDate = new Date(now)
      const from = new Date(now)
      from.setDate(now.getDate() - (rangeDays - 1))
      fromDate = from
    }

    if (!fromDate || !toDate) return source

    // normalize time to start/end of day
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    return source.filter((tx) => {
      const t = new Date(tx.created_at)
      return t >= fromDate! && t <= toDate!
    })
  }, [dashboardResp?.data?.stats?.recent_transactions, rangeDays, customFrom, customTo])

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numValue || 0)
  }

  // Build a small revenue-by-day dataset from filteredTransactions
  const revenueChart = useMemo(() => {
    const days = customFrom && customTo ? Math.max(1, Math.ceil((new Date(customTo).getTime() - new Date(customFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1) : Math.max(1, rangeDays)
    const labels: string[] = []
    const totals: number[] = []
    const now = new Date()
    // Build label list based on days ending today or based on customFrom/customTo
    if (customFrom && customTo) {
      const start = new Date(customFrom)
      for (let i = 0; i < days; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        labels.push(d.toLocaleDateString('id-ID'))
        totals.push(0)
      }
    } else {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        labels.push(d.toLocaleDateString('id-ID'))
        totals.push(0)
      }
    }

    filteredTransactions.forEach((tx: RecentTransaction) => {
      const txDate = new Date(tx.created_at).toLocaleDateString('id-ID')
      const idx = labels.indexOf(txDate)
      if (idx >= 0) {
        const amt = typeof tx.total_amount === 'string' ? parseFloat(String(tx.total_amount)) : (tx.total_amount as number)
        totals[idx] = (totals[idx] || 0) + (Number.isFinite(amt) ? amt : 0)
      }
    })

    const data = {
      labels,
      datasets: [
        {
          label: 'Revenue (IDR)',
          data: totals,
          borderColor: '#f97316', // orange-500
          backgroundColor: 'rgba(249,115,22,0.08)',
          tension: 0.3,
          fill: true,
        },
      ],
    }

    const options: ChartOptions<'line'> = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Revenue (last 7 days)' },
      },
      scales: {
        y: {
          ticks: {
            callback: (val: unknown) => {
              // val can be number|string depending on chart internals; coerce safely
              const n = Number(String(val ?? 0))
              return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
            },
          },
        },
      },
    }

    return { data, options }
  }, [filteredTransactions, rangeDays, customFrom, customTo])

  // Payment badge not available from dashboard endpoint; transactions show basic info

  return (
    <div className="w-full">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600 font-medium">Selamat datang kembali! Berikut ringkasan bisnis Anda</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.revenue?.total ?? 0)}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.bookings?.total ?? 0}
          icon={Ticket}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Users"
          value={stats?.users?.total ?? 0}
          icon={Users}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Destinations"
          value={stats?.destinations?.total ?? 0}
          icon={MapPin}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => { setRangeDays(7); setCustomFrom(''); setCustomTo('') }} className={`px-3 py-2 rounded ${rangeDays === 7 ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>7d</button>
            <button onClick={() => { setRangeDays(30); setCustomFrom(''); setCustomTo('') }} className={`px-3 py-2 rounded ${rangeDays === 30 ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>30d</button>
            <button onClick={() => { setRangeDays(90); setCustomFrom(''); setCustomTo('') }} className={`px-3 py-2 rounded ${rangeDays === 90 ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>90d</button>
            <button onClick={() => setRangeDays(0)} className={`px-3 py-2 rounded ${rangeDays === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>Custom</button>
            {rangeDays === 0 && (
              <div className="flex items-center gap-2 ml-3">
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="px-3 py-2 border rounded" />
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="px-3 py-2 border rounded" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isFetching} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Refresh</button>
            <button onClick={() => {
              // export CSV
              try {
                const rows = filteredTransactions.map((tx) => ([
                  tx.order_id,
                  tx.user?.name || '',
                  tx.user?.email || '',
                  String(tx.total_amount),
                  tx.created_at,
                ]))
                const header = ['order_id', 'user_name', 'user_email', 'total_amount', 'created_at']
                const csv = [header.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              } catch (err) {
                console.error('Failed to export CSV', err)
              }
            }} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm">Export CSV</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">
          <Line data={revenueChart.data} options={revenueChart.options} />
        </div>
      </div>

      {/* Recent Checkouts Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 lg:px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">Pesanan terbaru dari pelanggan</p>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium text-sm hover:shadow-lg"
          >
            View All <ChevronRight size={18} />
          </a>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 lg:px-8 py-16 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
              <p className="text-gray-500 font-semibold mt-4">Loading data...</p>
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((tx: RecentTransaction) => (
                  <tr key={tx.order_id} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => setSelectedTx(tx)}>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">{tx.order_id}</span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">{tx.user?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-orange-600">{formatCurrency(tx.total_amount)}</span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 lg:px-8 py-16 text-center">
              <Inbox size={56} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-semibold">Belum ada pesanan</p>
              <p className="text-sm text-gray-400 mt-1">Pesanan akan tampil di sini</p>
            </div>
          )}
        </div>
      </div>
      {/* Transaction details modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="p-2 text-gray-600 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div><strong>Order ID:</strong> {selectedTx.order_id}</div>
              <div><strong>User:</strong> {selectedTx.user?.name || '—'} {selectedTx.user?.email ? `(${selectedTx.user.email})` : ''}</div>
              <div><strong>Amount:</strong> {formatCurrency(selectedTx.total_amount)}</div>
              <div><strong>Created:</strong> {new Date(selectedTx.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
