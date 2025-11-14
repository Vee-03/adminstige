import { useEffect, useMemo, useState } from 'react'
import { DollarSign, Ticket, Users, MapPin, ChevronRight, Inbox } from 'lucide-react'
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
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Get dashboard stats from admin endpoint
      const response = await getAdminDashboard()
      if (response?.data?.stats) {
        setStats(response.data.stats)
        setRecentTransactions(response.data.stats.recent_transactions || [])
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numValue || 0)
  }

  // Build a small revenue-by-day dataset from recentTransactions (last 7 days)
  const revenueChart = useMemo(() => {
    const days = 7
    const labels: string[] = []
    const totals: number[] = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      labels.push(d.toLocaleDateString('id-ID'))
      totals.push(0)
    }

    recentTransactions.forEach((tx) => {
      const txDate = new Date(tx.created_at).toLocaleDateString('id-ID')
      const idx = labels.indexOf(txDate)
      if (idx >= 0) {
        const amt = typeof tx.total_amount === 'string' ? parseFloat(tx.total_amount) : tx.total_amount
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

    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Revenue (last 7 days)' },
      },
      scales: {
        y: { ticks: { callback: (val: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val)) } },
      },
    }

    return { data, options }
  }, [recentTransactions])

  // Payment badge not available from dashboard endpoint; transactions show basic info

  const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6">
          <Line data={revenueChart.data} options={revenueChart.options as any} />
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
          ) : recentTransactions && recentTransactions.length > 0 ? (
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
                {recentTransactions.map((tx) => (
                  <tr key={tx.order_id} className="hover:bg-gray-50 transition-colors duration-150">
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
    </div>
  )
}
