import { DollarSign, Ticket, Users, MapPin, ChevronRight, CheckCircle, Clock, XCircle, Inbox } from 'lucide-react'

interface Booking {
  id: number
  booking_code: string
  user: { name: string }
  destination: { name: string }
  total_price: number
  payment_status: 'paid' | 'pending' | 'cancelled'
}

export default function DashboardContent() {
  const stats = {
    total_revenue: 125000000,
    total_bookings: 45,
    total_users: 234,
    total_destinations: 12,
  }

  const recent_bookings: Booking[] = [
    {
      id: 1,
      booking_code: 'BK-2024-001',
      user: { name: 'John Doe' },
      destination: { name: 'Bali' },
      total_price: 5000000,
      payment_status: 'paid',
    },
    {
      id: 2,
      booking_code: 'BK-2024-002',
      user: { name: 'Jane Smith' },
      destination: { name: 'Lombok' },
      total_price: 4500000,
      payment_status: 'pending',
    },
    {
      id: 3,
      booking_code: 'BK-2024-003',
      user: { name: 'Bob Johnson' },
      destination: { name: 'Jakarta' },
      total_price: 3000000,
      payment_status: 'paid',
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1.5 w-fit border border-green-200">
            <CheckCircle size={14} />
            Paid
          </span>
        )
      case 'pending':
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1.5 w-fit border border-yellow-200">
            <Clock size={14} />
            Pending
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1.5 w-fit border border-red-200">
            <XCircle size={14} />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600 font-medium">Selamat datang kembali! Berikut ringkasan bisnis Anda</p>
      </div>

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

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 lg:px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">Pemesanan terbaru dari pelanggan</p>
          </div>
          <a
            href="/admin/bookings"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 font-medium text-sm hover:shadow-lg"
          >
            View All <ChevronRight size={18} />
          </a>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {recent_bookings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Booking Code
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="hidden md:table-cell px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Destination
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
                {recent_bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {booking.booking_code}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">{booking.user.name}</span>
                    </td>
                    <td className="hidden md:table-cell px-6 lg:px-8 py-4">
                      <span className="text-sm text-gray-700">{booking.destination.name}</span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-orange-600">{formatCurrency(booking.total_price)}</span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.payment_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 lg:px-8 py-16 text-center">
              <Inbox size={56} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-semibold">Belum ada pemesanan</p>
              <p className="text-sm text-gray-400 mt-1">Pemesanan akan tampil di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
