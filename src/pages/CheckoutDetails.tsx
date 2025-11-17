import { ArrowLeft, User, MapPin, DollarSign, Calendar, ShoppingBag, CreditCard } from 'lucide-react'
import type { CheckoutItem } from '../types/checkout'

interface Props {
  checkout: CheckoutItem
  onBack: () => void
}

export default function CheckoutDetails({ checkout, onBack }: Props) {
  const getStatusBadge = (status: 'paid' | 'unpaid') => {
    let className = ''
    switch (status) {
      case 'paid': className = 'bg-green-100 text-green-800'; break
      case 'unpaid': className = 'bg-red-100 text-red-800'; break
    }
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${className}`}>{status === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}</span>
  }

  const getStatusColor = (status: 'paid' | 'unpaid') => {
    return status === 'paid' ? 'from-green-50 to-emerald-50' : 'from-red-50 to-rose-50'
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Header dengan Back Button */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detail Checkout</h1>
          <p className="text-gray-600 text-sm mt-1">Lihat rincian transaksi checkout</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header dengan Status */}
        <div className={`bg-gradient-to-r ${getStatusColor(checkout.status)} p-6 border-b border-gray-200`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{checkout.user_name}</h2>
                <p className="text-gray-600 text-sm">{checkout.destination_name}</p>
              </div>
            </div>
            <div>{getStatusBadge(checkout.status)}</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-8 space-y-8">
          {/* Row 1: User & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Nama User</h3>
              </div>
              <p className="text-gray-900 font-medium text-lg ml-13">{checkout.user_name}</p>
            </div>

            {/* Destination Info */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Destinasi</h3>
              </div>
              <p className="text-gray-900 font-medium text-lg ml-13">{checkout.destination_name}</p>
            </div>
          </div>

          {/* Row 2: Price & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Price */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Total Harga</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">Rp {checkout.total_price.toLocaleString('id-ID')}</p>
            </div>

            {/* Payment Status */}
            <div className={`bg-gradient-to-br ${checkout.status === 'paid' ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200'} p-6 rounded-xl border`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${checkout.status === 'paid' ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                  <CreditCard size={18} className={checkout.status === 'paid' ? 'text-green-600' : 'text-red-600'} />
                </div>
                <h3 className="font-semibold text-gray-900">Status Pembayaran</h3>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(checkout.status)}
                <span className={`text-sm font-medium ${checkout.status === 'paid' ? 'text-green-700' : 'text-red-700'}`}>
                  {checkout.status === 'paid' ? 'Pembayaran diterima' : 'Menunggu pembayaran'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Date Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Waktu Transaksi</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-13">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Tanggal</p>
                <p className="text-gray-900 font-medium">
                  {new Date(checkout.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Waktu</p>
                <p className="text-gray-900 font-medium">
                  {new Date(checkout.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <ShoppingBag size={18} className="text-orange-600" />
              Ringkasan Transaksi
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-3 border-b border-orange-200">
                <span className="text-gray-600">Nama Pengguna</span>
                <span className="font-semibold text-gray-900">{checkout.user_name}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-orange-200">
                <span className="text-gray-600">Tujuan</span>
                <span className="font-semibold text-gray-900">{checkout.destination_name}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-orange-200">
                <span className="text-gray-600">Total Biaya</span>
                <span className="font-semibold text-orange-600">Rp {checkout.total_price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${checkout.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                  {checkout.status === 'paid' ? '✓ Sudah Bayar' : '⏳ Belum Bayar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
