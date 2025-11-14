import { useState, useEffect, useRef, useCallback } from 'react'
import { Eye, Search } from 'lucide-react'
import CheckoutDetails from './CheckoutDetails'
import { getAdminCheckouts } from '../utils/api'
import type { CheckoutItem } from '../types/checkout'

export default function Checkout() {
  const [checkouts, setCheckouts] = useState<CheckoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutItem | null>(null)
  const pollingRef = useRef<number | null>(null)

  const fetchCheckouts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminCheckouts({ page: 1, perPage: 100 })
      const items = res.data.items || []
      const mapped: CheckoutItem[] = items.map((it) => {
        const anyIt = it as any
        // Try to read total_price directly, otherwise compute from bookings (quantity * destination.price)
        const directPrice = anyIt.total_price
        let total = Number(directPrice)
        if (!Number.isFinite(total) || total === 0) {
          const bookings = Array.isArray(anyIt.bookings) ? anyIt.bookings : []
          total = bookings.reduce((sum: number, b: any) => {
            const price = Number(b?.destination?.price ?? b?.price ?? 0)
            const qty = Number(b?.quantity ?? 1)
            return sum + (Number.isFinite(price) ? price * (Number.isFinite(qty) ? qty : 1) : 0)
          }, 0)
        }

        // user_name: prefer explicit user_name, then nested user.name
        const userName = anyIt.user_name || anyIt.user?.name || anyIt.user?.full_name || ''

        // destination_name: prefer explicit, otherwise the first booking's destination name
        let destName = anyIt.destination_name || ''
        if (!destName) {
          const firstBooking = Array.isArray(anyIt.bookings) && anyIt.bookings.length > 0 ? anyIt.bookings[0] : null
          destName = firstBooking?.destination?.name || firstBooking?.destination_name || ''
        }

        // payment_status is numeric (0/1) in the API sample: 1 -> paid
        const status = (Number(anyIt.payment_status) === 1) ? 'paid' : 'unpaid'

        return {
          id: it.uuid,
          user_name: userName,
          destination_name: destName,
          total_price: Number.isFinite(total) ? total : 0,
          status: status as 'paid' | 'unpaid',
          created_at: it.created_at,
        }
      })
      setCheckouts(mapped)
    } catch (err: any) {
      setError(err?.message || 'Gagal mengambil data checkout')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCheckouts()
    pollingRef.current = window.setInterval(() => fetchCheckouts(), 10000)
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current)
    }
  }, [fetchCheckouts])

  const filtered = checkouts.filter((c) => {
    const term = searchTerm.toLowerCase()
    return (
      (c.user_name || '').toLowerCase().includes(term) ||
      (c.destination_name || '').toLowerCase().includes(term)
    )
  })

  const getStatusBadge = (status: 'paid' | 'unpaid') => {
    let className = ''
    switch (status) {
      case 'paid': className = 'bg-green-100 text-green-800'; break
      case 'unpaid': className = 'bg-red-100 text-red-800'; break
    }
    return <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${className}`}>{status.toUpperCase()}</span>
  }

  if (selectedCheckout) {
    return <CheckoutDetails checkout={selectedCheckout} onBack={() => setSelectedCheckout(null)} />
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Checkout Management</h2>
        <p className="text-gray-600 font-medium">Kelola data transaksi checkout pengguna</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari user atau destinasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {loading ? (
          <div className="px-6 py-16 text-center text-gray-500 font-semibold">Memuat data checkout...</div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-red-500 font-semibold">{error}</div>
        ) : filtered.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-700">Destination</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.id} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4 text-sm font-semibold">{c.user_name}</td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-700">{c.destination_name}</td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-orange-600 font-bold">Rp {c.total_price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(c.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedCheckout(c)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-16 text-center text-gray-500 font-semibold">
            Tidak ada data checkout ditemukan
          </div>
        )}
      </div>
    </div>
  )
}
