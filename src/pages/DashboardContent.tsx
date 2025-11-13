import { useEffect, useState } from 'react'
import { DollarSign, Ticket, Users, MapPin, ChevronRight, CheckCircle, Clock, XCircle, Inbox } from 'lucide-react'
import { getCheckoutsWithFallback } from '../utils/checkoutAPI'
import type { Checkout } from '../utils/checkoutAPI'

export default function DashboardContent() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_bookings: 0,
    total_users: 0,
    total_destinations: 12,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get checkouts data
      const response = await getCheckoutsWithFallback(1, 10)
      
      if (response.data && response.data.items) {
        setCheckouts(response.data.items)

        // Calculate stats from checkouts
        let totalRevenue = 0
        let totalBookings = 0

        response.data.items.forEach((checkout) => {
          if (checkout.bookings) {
            totalBookings += checkout.bookings.length
            checkout.bookings.forEach((booking) => {
              if (booking.checkout_data) {
                totalRevenue += Number(booking.checkout_data.total_amount || 0)
              }
            })
          }
        })

        setStats({
          total_revenue: totalRevenue,
          total_bookings: totalBookings,
          total_users: response.data.total,
          total_destinations: 12,
        })
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

  const getPaymentStatusBadge = (status: number | string) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status
    
    if (statusNum === 1) {
      return (
        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1.5 w-fit border border-green-200">
          <CheckCircle size={14} />
          Paid
        </span>
      )
    } else if (statusNum === 0) {
      return (
        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1.5 w-fit border border-yellow-200">
          <Clock size={14} />
          Pending
        </span>
      )
    } else {
      return (
        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1.5 w-fit border border-red-200">
          <XCircle size={14} />
          Cancelled
        </span>
      )
    }
  }

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
          value={formatCurrency(stats.total_revenue)}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <StatCard
          title="Total Bookings"
          value={stats.total_bookings}
          icon={Ticket}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Users"
          value={stats.total_users}
          icon={Users}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Destinations"
          value={stats.total_destinations}
          icon={MapPin}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      {/* Recent Checkouts Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 lg:px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
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
          ) : checkouts && checkouts.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="hidden md:table-cell px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {checkouts.map((checkout) => (
                  <tr key={checkout.uuid} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {checkout.order_id}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">{checkout.user?.name || 'N/A'}</span>
                    </td>
                    <td className="hidden md:table-cell px-6 lg:px-8 py-4">
                      <span className="text-sm text-gray-700">{checkout.bookings?.length || 0} item(s)</span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-orange-600">
                        {checkout.bookings
                          ? formatCurrency(
                              checkout.bookings.reduce((sum, b) => sum + (Number(b.checkout_data?.total_amount) || 0), 0)
                            )
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(checkout.payment_status)}
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
